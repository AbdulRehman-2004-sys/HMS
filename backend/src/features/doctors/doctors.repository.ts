import { db } from '../../db/connection';
import { doctors, doctorAvailabilities } from './doctors.schema';
import { eq, and, or, ilike, count } from 'drizzle-orm';
import { 
  CreateDoctorDTO, 
  DoctorDTO, 
  DoctorQueryDTO, 
  UpdateDoctorDTO, 
  DoctorAvailabilityDTO, 
  CreateAvailabilityDTO, 
  UpdateAvailabilityDTO 
} from './doctors.types';

export interface MockDoctor extends DoctorDTO {}
export interface MockAvailability extends DoctorAvailabilityDTO {}

export const mockDoctors: MockDoctor[] = [
  {
    id: 'doc-zafar-iqbal',
    userId: null,
    email: 'zafar.iqbal@lalamedical.com',
    firstName: 'M Zafar',
    lastName: 'Iqbal',
    fullName: 'Prof Dr. M Zafar Iqbal',
    phone: '+92 300 0000001',
    qualification: 'MBBS, FCPS, MME',
    specialization: 'Pediatric Surgeon / CEO',
    experience: 20,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '33791-P',
    signatureText: 'Prof Dr. M Zafar Iqbal - Pediatric Surgeon / CEO',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-shumaila-irum',
    userId: null,
    email: 'shumaila.irum@lalamedical.com',
    firstName: 'Shumaila',
    lastName: 'Irum',
    fullName: 'Dr. Shumaila Irum',
    phone: '+92 300 0000002',
    qualification: 'MBBS, MME, M Phil (Physiology)',
    specialization: 'APWMO / MS',
    experience: 12,
    gender: 'Female',
    consultationFee: 500,
    registrationNumber: '41229-P',
    signatureText: 'Dr. Shumaila Irum - APWMO / MS',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-noor-niazi',
    userId: null,
    email: 'noor.niazi@lalamedical.com',
    firstName: 'Noor Ahmed',
    lastName: 'Niazi',
    fullName: 'Dr. Noor Ahmed Niazi',
    phone: '+92 300 0000003',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Surgeon',
    experience: 15,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '15228–P',
    signatureText: 'Dr. Noor Ahmed Niazi - Consultant Surgeon',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-afsheen-asif',
    userId: null,
    email: 'afsheen.asif@lalamedical.com',
    firstName: 'Afsheen',
    lastName: 'Asif',
    fullName: 'Dr. Afsheen Asif',
    phone: '+92 300 0000004',
    qualification: 'MBBS, MCPS',
    specialization: 'Consultant Gynecologist',
    experience: 10,
    gender: 'Female',
    consultationFee: 1000,
    registrationNumber: '50192-S',
    signatureText: 'Dr. Afsheen Asif - Consultant Gynecologist',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-mohtmam-nazir',
    userId: null,
    email: 'mohtmam.nazir@lalamedical.com',
    firstName: 'Mohtmam',
    lastName: 'Nazir',
    fullName: 'Dr. Mohtmam Nazir',
    phone: '+92 300 0000005',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant General & Laparoscopic Surgeon',
    experience: 14,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '53225-P',
    signatureText: 'Dr. Mohtmam Nazir - Consultant Surgeon',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-tahir-mehmood',
    userId: null,
    email: 'tahir.mehmood@lalamedical.com',
    firstName: 'Tahir',
    lastName: 'Mehmood',
    fullName: 'Dr. Tahir Mehmood',
    phone: '+92 300 0000006',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Surgeon',
    experience: 16,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '29761-S',
    signatureText: 'Dr. Tahir Mehmood - Consultant Surgeon',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-anees-rehman',
    userId: null,
    email: 'anees.rehman@lalamedical.com',
    firstName: 'Anees Ur',
    lastName: 'Rehman',
    fullName: 'Dr. Anees Ur Rehman',
    phone: '+92 300 0000007',
    qualification: 'MBBS, DLO, FCPS',
    specialization: 'Consultant ENT Surgeon',
    experience: 11,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '32011-P',
    signatureText: 'Dr. Anees Ur Rehman - Consultant ENT Surgeon',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-amir-hameed',
    userId: null,
    email: 'amir.hameed@lalamedical.com',
    firstName: 'Amir',
    lastName: 'Hameed',
    fullName: 'Dr. Amir Hameed',
    phone: '+92 300 0000008',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Orthopedic Surgeon',
    experience: 13,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '49132-P',
    signatureText: 'Dr. Amir Hameed - Consultant Orthopedic Surgeon',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-sajid-ghafoor',
    userId: null,
    email: 'sajid.ghafoor@lalamedical.com',
    firstName: 'Sajid',
    lastName: 'Ghafoor',
    fullName: 'Dr. Sajid Ghafoor',
    phone: '+92 300 0000009',
    qualification: 'MBBS, DMRT',
    specialization: 'Consultant Oncologist',
    experience: 15,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '42801-P',
    signatureText: 'Dr. Sajid Ghafoor - Consultant Oncologist',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-abbas-rasool',
    userId: null,
    email: 'abbas.rasool@lalamedical.com',
    firstName: 'Syed Abbas',
    lastName: 'Rasool',
    fullName: 'Dr. Syed Abbas Rasool',
    phone: '+92 300 0000010',
    qualification: 'MBBS, DIP CARD (NICVD)',
    specialization: 'Consultant Cardiologist',
    experience: 18,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '80232-P',
    signatureText: 'Dr. Syed Abbas Rasool - Consultant Cardiologist',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-asif-hussain',
    userId: null,
    email: 'asif.hussain@lalamedical.com',
    firstName: 'Asif',
    lastName: 'Hussain',
    fullName: 'Dr. Asif Hussain',
    phone: '+92 300 0000011',
    qualification: 'MBBS, MCPS',
    specialization: 'Consultant Anesthetist',
    experience: 9,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '46493-S',
    signatureText: 'Dr. Asif Hussain - Consultant Anesthetist',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockAvailabilities: MockAvailability[] = [
  {
    id: 'slot-mon-zafar',
    doctorId: 'doc-zafar-iqbal',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'slot-tue-zafar',
    doctorId: 'doc-zafar-iqbal',
    dayOfWeek: 'Tuesday',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class DoctorRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async findMany(query: DoctorQueryDTO) {
    const isDb = this.checkDb();
    const page = query.page || 1;
    const limit = query.limit || 8;
    const offset = (page - 1) * limit;

    if (isDb) {
      const conditions = [eq(doctors.isDeleted, false)];

      if (query.specialization) {
        conditions.push(eq(doctors.specialization, query.specialization));
      }

      if (query.isActive !== undefined) {
        conditions.push(eq(doctors.isActive, query.isActive));
      }

      if (query.search) {
        const searchPattern = `%${query.search}%`;
        conditions.push(
          or(
            ilike(doctors.firstName, searchPattern),
            ilike(doctors.lastName, searchPattern),
            ilike(doctors.specialization, searchPattern),
            ilike(doctors.qualification, searchPattern),
            ilike(doctors.email, searchPattern)
          )!
        );
      }

      const whereClause = and(...conditions);

      const [totalResult] = await db
        .select({ count: count() })
        .from(doctors)
        .where(whereClause);

      const total = Number(totalResult?.count || 0);

      const rows = await db
        .select()
        .from(doctors)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      const doctorList: DoctorDTO[] = rows.map((d) => ({
        ...d,
        fullName: d.firstName.startsWith('Prof') ? `${d.firstName} ${d.lastName}` : `Dr. ${d.firstName} ${d.lastName}`,
      }));

      return {
        doctors: doctorList,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    } else {
      // In-memory mock filtering
      let filtered = mockDoctors.filter((d) => !d.isDeleted);

      if (query.specialization) {
        filtered = filtered.filter((d) => d.specialization === query.specialization);
      }

      if (query.isActive !== undefined) {
        filtered = filtered.filter((d) => d.isActive === query.isActive);
      }

      if (query.search) {
        const term = query.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.firstName.toLowerCase().includes(term) ||
            d.lastName.toLowerCase().includes(term) ||
            d.specialization.toLowerCase().includes(term) ||
            d.qualification.toLowerCase().includes(term) ||
            d.email.toLowerCase().includes(term)
        );
      }

      const total = filtered.length;
      const paginatedRows = filtered.slice(offset, offset + limit);

      return {
        doctors: paginatedRows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    }
  }

  public static async findById(id: string): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [d] = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.id, id), eq(doctors.isDeleted, false)))
        .limit(1);

      if (!d) return null;
      return {
        ...d,
        fullName: d.firstName.startsWith('Prof') ? `${d.firstName} ${d.lastName}` : `Dr. ${d.firstName} ${d.lastName}`,
      };
    } else {
      const d = mockDoctors.find((doc) => doc.id === id && !doc.isDeleted);
      return d || null;
    }
  }

  public static async findByUserId(userId: string): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [d] = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.userId, userId), eq(doctors.isDeleted, false)))
        .limit(1);

      if (!d) return null;
      return {
        ...d,
        fullName: d.firstName.startsWith('Prof') ? `${d.firstName} ${d.lastName}` : `Dr. ${d.firstName} ${d.lastName}`,
      };
    } else {
      const d = mockDoctors.find((doc) => doc.userId === userId && !doc.isDeleted);
      return d || null;
    }
  }

  public static async findByEmail(email: string): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [d] = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.email, email), eq(doctors.isDeleted, false)))
        .limit(1);

      if (!d) return null;
      return {
        ...d,
        fullName: d.firstName.startsWith('Prof') ? `${d.firstName} ${d.lastName}` : `Dr. ${d.firstName} ${d.lastName}`,
      };
    } else {
      const d = mockDoctors.find((doc) => doc.email === email && !doc.isDeleted);
      return d || null;
    }
  }

  public static async findByName(firstName: string, lastName: string): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [d] = await db
        .select()
        .from(doctors)
        .where(
          and(
            ilike(doctors.firstName, firstName),
            ilike(doctors.lastName, lastName),
            eq(doctors.isDeleted, false)
          )
        )
        .limit(1);

      if (!d) return null;
      return {
        ...d,
        fullName: d.firstName.startsWith('Prof') ? `${d.firstName} ${d.lastName}` : `Dr. ${d.firstName} ${d.lastName}`,
      };
    } else {
      const d = mockDoctors.find(
        (doc) =>
          doc.firstName.toLowerCase() === firstName.toLowerCase() &&
          doc.lastName.toLowerCase() === lastName.toLowerCase() &&
          !doc.isDeleted
      );
      return d || null;
    }
  }

  public static async create(data: CreateDoctorDTO): Promise<DoctorDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const [newDoctor] = await db
        .insert(doctors)
        .values({
          userId: data.userId || null,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          qualification: data.qualification,
          specialization: data.specialization,
          experience: data.experience,
          gender: data.gender,
          consultationFee: data.consultationFee || 500,
          registrationNumber: data.registrationNumber || null,
          signatureText: data.signatureText || null,
          isActive: true,
          isDeleted: false,
        })
        .returning();

      return {
        ...newDoctor,
        fullName: newDoctor.firstName.startsWith('Prof') ? `${newDoctor.firstName} ${newDoctor.lastName}` : `Dr. ${newDoctor.firstName} ${newDoctor.lastName}`,
      };
    } else {
      const id = `doc-${Date.now()}`;
      const newDoctor: MockDoctor = {
        id,
        userId: data.userId || null,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.firstName.startsWith('Prof') ? `${data.firstName} ${data.lastName}` : `Dr. ${data.firstName} ${data.lastName}`,
        phone: data.phone,
        qualification: data.qualification,
        specialization: data.specialization,
        experience: data.experience,
        gender: data.gender,
        consultationFee: data.consultationFee || 500,
        registrationNumber: data.registrationNumber || null,
        signatureText: data.signatureText || null,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDoctors.push(newDoctor);
      return newDoctor;
    }
  }

  public static async update(id: string, data: UpdateDoctorDTO): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [updated] = await db
        .update(doctors)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(and(eq(doctors.id, id), eq(doctors.isDeleted, false)))
        .returning();

      if (!updated) return null;
      return {
        ...updated,
        fullName: updated.firstName.startsWith('Prof') ? `${updated.firstName} ${updated.lastName}` : `Dr. ${updated.firstName} ${updated.lastName}`,
      };
    } else {
      const idx = mockDoctors.findIndex((d) => d.id === id && !d.isDeleted);
      if (idx !== -1) {
        const fn = data.firstName || mockDoctors[idx].firstName;
        const ln = data.lastName || mockDoctors[idx].lastName;
        mockDoctors[idx] = {
          ...mockDoctors[idx],
          ...data,
          fullName: fn.startsWith('Prof') ? `${fn} ${ln}` : `Dr. ${fn} ${ln}`,
          updatedAt: new Date(),
        };
        return mockDoctors[idx];
      }
      return null;
    }
  }

  public static async updateStatus(id: string, isActive: boolean): Promise<DoctorDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [updated] = await db
        .update(doctors)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(and(eq(doctors.id, id), eq(doctors.isDeleted, false)))
        .returning();

      if (!updated) return null;
      return {
        ...updated,
        fullName: updated.firstName.startsWith('Prof') ? `${updated.firstName} ${updated.lastName}` : `Dr. ${updated.firstName} ${updated.lastName}`,
      };
    } else {
      const idx = mockDoctors.findIndex((d) => d.id === id && !d.isDeleted);
      if (idx !== -1) {
        mockDoctors[idx].isActive = isActive;
        mockDoctors[idx].updatedAt = new Date();
        return mockDoctors[idx];
      }
      return null;
    }
  }

  public static async softDelete(id: string): Promise<boolean> {
    const isDb = this.checkDb();

    if (isDb) {
      const [deleted] = await db
        .update(doctors)
        .set({
          isDeleted: true,
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(doctors.id, id))
        .returning();

      return !!deleted;
    } else {
      const idx = mockDoctors.findIndex((d) => d.id === id);
      if (idx !== -1) {
        mockDoctors[idx].isDeleted = true;
        mockDoctors[idx].isActive = false;
        return true;
      }
      return false;
    }
  }

  // =========================================================================
  // DOCTOR AVAILABILITY METHODS
  // =========================================================================

  public static async findAvailabilitiesByDoctorId(doctorId: string): Promise<DoctorAvailabilityDTO[]> {
    const isDb = this.checkDb();

    if (isDb) {
      const rows = await db
        .select()
        .from(doctorAvailabilities)
        .where(eq(doctorAvailabilities.doctorId, doctorId));

      return rows;
    } else {
      return mockAvailabilities.filter((a) => a.doctorId === doctorId);
    }
  }

  public static async findAvailabilityById(id: string): Promise<DoctorAvailabilityDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [slot] = await db
        .select()
        .from(doctorAvailabilities)
        .where(eq(doctorAvailabilities.id, id))
        .limit(1);

      return slot || null;
    } else {
      const slot = mockAvailabilities.find((a) => a.id === id);
      return slot || null;
    }
  }

  public static async createAvailability(doctorId: string, data: CreateAvailabilityDTO): Promise<DoctorAvailabilityDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const [newSlot] = await db
        .insert(doctorAvailabilities)
        .values({
          doctorId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive !== undefined ? data.isActive : true,
        })
        .returning();

      return newSlot;
    } else {
      const id = `slot-${Date.now()}`;
      const newSlot: MockAvailability = {
        id,
        doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAvailabilities.push(newSlot);
      return newSlot;
    }
  }

  public static async updateAvailability(id: string, data: UpdateAvailabilityDTO): Promise<DoctorAvailabilityDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [updated] = await db
        .update(doctorAvailabilities)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(doctorAvailabilities.id, id))
        .returning();

      return updated || null;
    } else {
      const idx = mockAvailabilities.findIndex((a) => a.id === id);
      if (idx !== -1) {
        mockAvailabilities[idx] = {
          ...mockAvailabilities[idx],
          ...data,
          updatedAt: new Date(),
        };
        return mockAvailabilities[idx];
      }
      return null;
    }
  }

  public static async deleteAvailability(id: string): Promise<boolean> {
    const isDb = this.checkDb();

    if (isDb) {
      const [deleted] = await db
        .delete(doctorAvailabilities)
        .where(eq(doctorAvailabilities.id, id))
        .returning();

      return !!deleted;
    } else {
      const idx = mockAvailabilities.findIndex((a) => a.id === id);
      if (idx !== -1) {
        mockAvailabilities.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
}
