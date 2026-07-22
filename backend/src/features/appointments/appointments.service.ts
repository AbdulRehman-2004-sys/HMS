import { AppointmentRepository } from './appointments.repository';
import { DoctorService } from '../doctors/doctors.service';
import { PatientService } from '../patients/patients.service';
import { VisitService } from '../visits/visits.service';
import { CreateAppointmentDTO, CheckinResultDTO, AppointmentDTO } from './appointments.types';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';

export class AppointmentService {
  /**
   * Public Online Booking: Create Appointment with PENDING_CHECKIN status
   */
  public static async createAppointment(data: CreateAppointmentDTO): Promise<AppointmentDTO> {
    // 1. Verify doctor exists & is active
    const doctor = await DoctorService.getDoctorById(data.doctorId);
    if (!doctor || !doctor.isActive || doctor.isDeleted) {
      throw new BadRequestError('The selected doctor is currently inactive or unavailable for appointments');
    }

    // 2. Generate Appointment Number (e.g. APT-20260722-0001)
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await AppointmentRepository.countForToday();
    const sequence = String(count + 1).padStart(4, '0');
    const appointmentNumber = `APT-${todayStr}-${sequence}`;

    // 3. Save Appointment in HMS DB
    const appointment = await AppointmentRepository.create(data, appointmentNumber);

    return appointment;
  }

  /**
   * Receptionist: Get Pending Check-in Online Appointments
   */
  public static async getPendingAppointments(search?: string): Promise<AppointmentDTO[]> {
    return AppointmentRepository.findPending(search);
  }

  /**
   * Receptionist: Check In Online Patient
   * - Searches for existing patient by phone
   * - Reuses existing MR Number OR creates new patient with MRN-YYYYMMDD-XXXX
   * - Creates Patient Visit entry (patient_visits) with Queue Token (Q-XXX)
   * - Updates Appointment status to CHECKED_IN and links patientId & visitId
   */
  public static async checkinAppointment(
    appointmentId: string,
    creatorId: string,
    ipAddress?: string
  ): Promise<CheckinResultDTO> {
    // 1. Find Appointment
    const apt = await AppointmentRepository.findById(appointmentId);
    if (!apt) {
      throw new NotFoundError('Appointment record not found');
    }

    if (apt.status !== 'PENDING_CHECKIN') {
      throw new BadRequestError(`Appointment is already ${apt.status.replace(/_/g, ' ').toLowerCase()}`);
    }

    // 2. Search for existing patient by phone number
    const searchResults = await PatientService.getPatients({ search: apt.phone });
    let targetPatient: any = searchResults.patients.find(
      (p) => p.mobileNumber === apt.phone || p.mobileNumber?.replace(/[^0-9]/g, '') === apt.phone.replace(/[^0-9]/g, '')
    );
    let isNewPatient = false;

    // 3. Create new patient if no matching phone found
    if (!targetPatient) {
      isNewPatient = true;
      const nameParts = apt.patientName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Patient';

      targetPatient = await PatientService.registerPatient(
        {
          firstName,
          lastName,
          fatherHusbandName: apt.fatherHusbandName,
          gender: apt.gender as any,
          dateOfBirth: new Date(Date.now() - apt.age * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mobileNumber: apt.phone,
          address: apt.address,
        },
        creatorId,
        ipAddress
      );
    }

    // 4. Create Patient Visit & Queue Entry in HMS Doctor Queue
    const visitPayload = {
      patientId: targetPatient.id,
      doctorId: apt.doctorId,
      department: apt.department,
      chiefComplaint: apt.reasonForVisit || `Online Appointment Check-in (${apt.appointmentNumber})`,
      vitalBpSystolic: 120,
      vitalBpDiastolic: 80,
      vitalPulseRate: 72,
      vitalTemperature: 98.6,
      vitalWeight: 65,
    };

    const visit = await VisitService.createVisit(visitPayload, creatorId, ipAddress);

    // 5. Update Appointment status to CHECKED_IN and link patientId / visitId
    const updatedApt = await AppointmentRepository.updateStatus(
      appointmentId,
      'CHECKED_IN',
      targetPatient.id,
      visit.id
    );

    // 6. Audit Trail Logging
    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED',
      module: 'APPOINTMENTS',
      details: `Checked in online appointment ${apt.appointmentNumber} for patient ${targetPatient.fullName} (MRN: ${targetPatient.mrNumber}). Assigned queue token ${visit.tokenNumber}`,
      ipAddress,
    });

    return {
      appointment: updatedApt || { ...apt, status: 'CHECKED_IN', patientId: targetPatient.id, visitId: visit.id },
      patient: {
        id: targetPatient.id,
        mrNumber: targetPatient.mrNumber,
        fullName: targetPatient.fullName || `Patient ${targetPatient.firstName} ${targetPatient.lastName}`,
        phone: targetPatient.mobileNumber || apt.phone,
        isNew: isNewPatient,
      },
      visit: {
        id: visit.id,
        tokenNumber: String(visit.tokenNumber || '1'),
        status: visit.status,
        queueNumber: Number(visit.tokenNumber) || 1,
      },
    };
  }
}
