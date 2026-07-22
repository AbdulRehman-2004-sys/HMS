import { db } from '../../db/connection';
import { appointments } from './appointments.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { AppointmentDTO, CreateAppointmentDTO } from './appointments.types';
import { mockDoctors } from '../doctors/doctors.repository';

export interface MockAppointment extends AppointmentDTO {}

export const mockAppointments: MockAppointment[] = [];

export class AppointmentRepository {
  /**
   * Create a new appointment
   */
  public static async create(data: CreateAppointmentDTO, appointmentNumber: string): Promise<AppointmentDTO> {
    try {
      const [newApt] = await db
        .insert(appointments)
        .values({
          appointmentNumber,
          doctorId: data.doctorId,
          department: data.department,
          appointmentDate: data.appointmentDate,
          patientName: data.patientName,
          fatherHusbandName: data.fatherHusbandName,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          reasonForVisit: data.reasonForVisit || null,
          status: 'PENDING_CHECKIN',
        })
        .returning();

      return newApt as unknown as AppointmentDTO;
    } catch {
      // In-memory mock fallback
      const doc = mockDoctors.find((d) => d.id === data.doctorId);
      const mock: MockAppointment = {
        id: `apt-mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        appointmentNumber,
        patientId: null,
        visitId: null,
        doctorId: data.doctorId,
        doctorName: doc ? doc.fullName : 'Specialist Doctor',
        doctorSpecialization: doc ? doc.specialization : data.department,
        department: data.department,
        appointmentDate: data.appointmentDate,
        patientName: data.patientName,
        fatherHusbandName: data.fatherHusbandName,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        reasonForVisit: data.reasonForVisit || null,
        status: 'PENDING_CHECKIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAppointments.unshift(mock);
      return mock;
    }
  }

  /**
   * Find appointment by ID
   */
  public static async findById(id: string): Promise<AppointmentDTO | null> {
    try {
      const [apt] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);

      if (!apt) return null;
      return apt as unknown as AppointmentDTO;
    } catch {
      const mock = mockAppointments.find((a) => a.id === id);
      return mock || null;
    }
  }

  /**
   * Get pending check-in appointments for reception (status = 'PENDING_CHECKIN')
   */
  public static async findPending(search?: string): Promise<AppointmentDTO[]> {
    try {
      const conditions = [eq(appointments.status, 'PENDING_CHECKIN')];
      if (search && search.trim() !== '') {
        const pattern = `%${search.trim()}%`;
        conditions.push(
          ilike(appointments.appointmentNumber, pattern) ||
          ilike(appointments.patientName, pattern) ||
          ilike(appointments.phone, pattern)
        );
      }

      const rows = await db
        .select({
          appointment: appointments,
          doctor: doctors,
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .where(and(...conditions))
        .orderBy(desc(appointments.createdAt));

      return rows.map((r) => ({
        ...(r.appointment as unknown as AppointmentDTO),
        doctorName: r.doctor ? `Dr. ${r.doctor.firstName} ${r.doctor.lastName}` : 'Consultant Doctor',
        doctorSpecialization: r.doctor ? r.doctor.specialization : r.appointment.department,
      }));
    } catch {
      let filtered = mockAppointments.filter((a) => a.status === 'PENDING_CHECKIN');
      if (search && search.trim() !== '') {
        const s = search.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.appointmentNumber.toLowerCase().includes(s) ||
            a.patientName.toLowerCase().includes(s) ||
            a.phone.toLowerCase().includes(s)
        );
      }
      return filtered;
    }
  }

  /**
   * Update appointment status & link patientId / visitId
   */
  public static async updateStatus(
    id: string,
    status: 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED',
    patientId?: string,
    visitId?: string
  ): Promise<AppointmentDTO | null> {
    try {
      const updatePayload: any = {
        status,
        updatedAt: new Date(),
      };
      if (patientId) updatePayload.patientId = patientId;
      if (visitId) updatePayload.visitId = visitId;

      const [updated] = await db
        .update(appointments)
        .set(updatePayload)
        .where(eq(appointments.id, id))
        .returning();

      return updated as unknown as AppointmentDTO;
    } catch {
      const mock = mockAppointments.find((a) => a.id === id);
      if (mock) {
        mock.status = status;
        if (patientId) mock.patientId = patientId;
        if (visitId) mock.visitId = visitId;
        mock.updatedAt = new Date();
        return mock;
      }
      return null;
    }
  }

  /**
   * Count total appointments for today for number sequence generation
   */
  public static async countForToday(): Promise<number> {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const rows = await db
        .select()
        .from(appointments)
        .where(ilike(appointments.appointmentNumber, `APT-${todayStr.replace(/-/g, '')}%`));
      return rows.length;
    } catch {
      return mockAppointments.length;
    }
  }
}
