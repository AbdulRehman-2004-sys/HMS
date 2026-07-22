import { DoctorRepository } from './doctors.repository';
import { 
  CreateDoctorDTO, 
  DoctorQueryDTO, 
  UpdateDoctorDTO, 
  CreateAvailabilityDTO, 
  UpdateAvailabilityDTO 
} from './doctors.types';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';

export class DoctorService {
  public static async getDoctors(query: DoctorQueryDTO) {
    return DoctorRepository.findMany(query);
  }

  public static async getDoctorById(id: string) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }
    return doctor;
  }

  public static async getDoctorByUserId(userId: string) {
    const doctor = await DoctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundError('Doctor profile for this user account was not found');
    }
    return doctor;
  }

  public static async createDoctor(data: CreateDoctorDTO, creatorId: string, ipAddress?: string) {
    // 1. Business Rule: Unique Doctor Name
    const existingName = await DoctorRepository.findByName(data.firstName, data.lastName);
    if (existingName) {
      throw new BadRequestError(`A doctor named Dr. ${data.firstName} ${data.lastName} already exists`);
    }

    // 2. Business Rule: Unique Doctor Email
    const existingEmail = await DoctorRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new BadRequestError('Email address is already registered to another doctor profile');
    }

    // 3. Business Rule: Standard consultation fee fallback
    const doctorData: CreateDoctorDTO = {
      ...data,
      consultationFee: data.consultationFee || 1000,
    };

    const newDoctor = await DoctorRepository.create(doctorData);

    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED', // Using tracked critical action
      module: 'DOCTOR_MANAGEMENT',
      details: `Created doctor profile ${newDoctor.fullName} (${newDoctor.specialization})`,
      ipAddress,
    });

    return newDoctor;
  }

  public static async updateDoctor(id: string, data: UpdateDoctorDTO, creatorId: string, ipAddress?: string) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    // Uniqueness validation if name or email changed
    if (data.firstName && data.lastName && (data.firstName !== doctor.firstName || data.lastName !== doctor.lastName)) {
      const existingName = await DoctorRepository.findByName(data.firstName, data.lastName);
      if (existingName && existingName.id !== id) {
        throw new BadRequestError(`A doctor named Dr. ${data.firstName} ${data.lastName} already exists`);
      }
    }

    if (data.email && data.email !== doctor.email) {
      const existingEmail = await DoctorRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestError('Email address is already registered to another doctor profile');
      }
    }

    const updatedDoctor = await DoctorRepository.update(id, data);
    if (!updatedDoctor) {
      throw new BadRequestError('Failed to update doctor profile');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED', // critical audit event
      module: 'DOCTOR_MANAGEMENT',
      details: `Updated doctor profile details for ${updatedDoctor.fullName}`,
      ipAddress,
    });

    return updatedDoctor;
  }

  public static async toggleDoctorStatus(id: string, isActive: boolean, creatorId: string, ipAddress?: string) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    const updatedDoctor = await DoctorRepository.updateStatus(id, isActive);
    if (!updatedDoctor) {
      throw new BadRequestError('Failed to update doctor status');
    }

    const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    await logAudit({
      userId: creatorId,
      action,
      module: 'DOCTOR_MANAGEMENT',
      details: `${isActive ? 'Activated' : 'Deactivated'} doctor profile ${updatedDoctor.fullName}`,
      ipAddress,
    });

    return updatedDoctor;
  }

  public static async softDeleteDoctor(id: string, creatorId: string, ipAddress?: string) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    const deleted = await DoctorRepository.softDelete(id);
    if (!deleted) {
      throw new BadRequestError('Failed to soft-delete doctor profile');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_DELETED',
      module: 'DOCTOR_MANAGEMENT',
      details: `Soft-deleted doctor profile ${doctor.fullName}`,
      ipAddress,
    });

    return true;
  }

  // =========================================================================
  // DOCTOR AVAILABILITY METHODS
  // =========================================================================

  public static async getDoctorAvailabilities(doctorId: string) {
    const doctor = await DoctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }
    return DoctorRepository.findAvailabilitiesByDoctorId(doctorId);
  }

  public static async addDoctorAvailability(doctorId: string, data: CreateAvailabilityDTO, creatorId: string, ipAddress?: string) {
    const doctor = await DoctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    const slot = await DoctorRepository.createAvailability(doctorId, data);

    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED',
      module: 'DOCTOR_AVAILABILITY',
      details: `Added availability slot ${slot.dayOfWeek} (${slot.startTime} - ${slot.endTime}) for ${doctor.fullName}`,
      ipAddress,
    });

    return slot;
  }

  public static async updateDoctorAvailability(slotId: string, data: UpdateAvailabilityDTO, creatorId: string, ipAddress?: string) {
    const slot = await DoctorRepository.findAvailabilityById(slotId);
    if (!slot) {
      throw new NotFoundError('Availability slot not found');
    }

    const updatedSlot = await DoctorRepository.updateAvailability(slotId, data);
    if (!updatedSlot) {
      throw new BadRequestError('Failed to update availability slot');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_CREATED',
      module: 'DOCTOR_AVAILABILITY',
      details: `Updated availability slot ${updatedSlot.id} (${updatedSlot.dayOfWeek})`,
      ipAddress,
    });

    return updatedSlot;
  }

  public static async deleteDoctorAvailability(slotId: string, creatorId: string, ipAddress?: string) {
    const slot = await DoctorRepository.findAvailabilityById(slotId);
    if (!slot) {
      throw new NotFoundError('Availability slot not found');
    }

    const deleted = await DoctorRepository.deleteAvailability(slotId);
    if (!deleted) {
      throw new BadRequestError('Failed to delete availability slot');
    }

    await logAudit({
      userId: creatorId,
      action: 'USER_DELETED',
      module: 'DOCTOR_AVAILABILITY',
      details: `Deleted availability slot ${slot.id} (${slot.dayOfWeek} ${slot.startTime} - ${slot.endTime})`,
      ipAddress,
    });

    return true;
  }
}
