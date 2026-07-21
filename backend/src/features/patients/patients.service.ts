import { PatientRepository } from './patients.repository';
import { CreatePatientDTO, PatientQueryDTO, UpdatePatientDTO } from './patients.types';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';

export class PatientService {
  /**
   * Helper to calculate age from Date of Birth string (YYYY-MM-DD)
   */
  private static calculateAgeFromDob(dobString?: string): number | undefined {
    if (!dobString) return undefined;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return undefined;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }

  /**
   * Register a new patient with MRN generation and duplicate checking
   */
  public static async registerPatient(
    data: CreatePatientDTO,
    creatorId: string,
    ipAddress?: string
  ) {
    // 1. Check duplicate CNIC if provided
    if (data.cnic && data.cnic.trim() !== '') {
      const existingCnic = await PatientRepository.findByCnic(data.cnic);
      if (existingCnic) {
        throw new ConflictError(
          `A patient with CNIC "${data.cnic}" is already registered (MRN: ${existingCnic.mrNumber}).`
        );
      }
    }

    // 2. Check duplicate Mobile Number + Full Name
    const existingPatient = await PatientRepository.findByPhoneAndName(
      data.mobileNumber,
      data.firstName,
      data.lastName
    );

    if (existingPatient) {
      throw new ConflictError(
        `A patient named "${data.firstName} ${data.lastName}" with phone number "${data.mobileNumber}" is already registered (MRN: ${existingPatient.mrNumber}).`
      );
    }

    // 3. Auto-calculate age if DOB is provided
    let finalAge = data.age;
    if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
      const calcAge = this.calculateAgeFromDob(data.dateOfBirth);
      if (calcAge !== undefined) {
        finalAge = calcAge;
      }
    }

    // 4. Generate unique MR Number
    const mrNumber = await PatientRepository.generateNextMrNumber();

    // 5. Save Patient
    const patient = await PatientRepository.create(
      {
        ...data,
        age: finalAge,
      },
      mrNumber
    );

    // 6. Audit Log
    await logAudit({
      userId: creatorId,
      action: 'PATIENT_REGISTERED',
      module: 'Patient Management',
      details: `Registered new patient ${patient.fullName} (MRN: ${patient.mrNumber})`,
      ipAddress,
    });

    return patient;
  }

  /**
   * Get list of patients with search and pagination
   */
  public static async getPatients(query: PatientQueryDTO) {
    return await PatientRepository.findMany(query);
  }

  /**
   * Get patient details by ID
   */
  public static async getPatientById(id: string) {
    const patient = await PatientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient record not found');
    }
    return patient;
  }

  /**
   * Get patient details by MR Number
   */
  public static async getPatientByMrNumber(mrNumber: string) {
    const patient = await PatientRepository.findByMrNumber(mrNumber);
    if (!patient) {
      throw new NotFoundError(`Patient with MRN "${mrNumber}" not found`);
    }
    return patient;
  }

  /**
   * Update patient demographics and medical information
   */
  public static async updatePatient(
    id: string,
    data: UpdatePatientDTO,
    updaterId: string,
    ipAddress?: string
  ) {
    const existing = await PatientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient record not found');
    }

    // Check CNIC duplicate if updating CNIC
    if (data.cnic && data.cnic !== existing.cnic) {
      const existingCnic = await PatientRepository.findByCnic(data.cnic);
      if (existingCnic && existingCnic.id !== id) {
        throw new ConflictError(`Another patient with CNIC "${data.cnic}" already exists.`);
      }
    }

    // Calculate age if DOB changed
    let finalAge = data.age;
    if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
      const calcAge = this.calculateAgeFromDob(data.dateOfBirth);
      if (calcAge !== undefined) {
        finalAge = calcAge;
      }
    }

    const updated = await PatientRepository.update(id, {
      ...data,
      age: finalAge,
    });

    await logAudit({
      userId: updaterId,
      action: 'PATIENT_UPDATED',
      module: 'Patient Management',
      details: `Updated profile for patient ${updated?.fullName || id} (MRN: ${existing.mrNumber})`,
      ipAddress,
    });

    return updated;
  }

  /**
   * Soft-delete patient profile
   */
  public static async softDeletePatient(id: string, deleterId: string, ipAddress?: string) {
    const existing = await PatientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient record not found');
    }

    const success = await PatientRepository.softDelete(id);

    await logAudit({
      userId: deleterId,
      action: 'PATIENT_DELETED',
      module: 'Patient Management',
      details: `Soft-deleted patient ${existing.fullName} (MRN: ${existing.mrNumber})`,
      ipAddress,
    });

    return success;
  }
}
