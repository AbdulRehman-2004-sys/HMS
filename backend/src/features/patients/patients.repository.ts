import { db } from '../../db/connection';
import { patients } from './patients.schema';
import { eq, and, or, ilike, count, desc } from 'drizzle-orm';
import { 
  CreatePatientDTO, 
  PatientDTO, 
  PatientQueryDTO, 
  UpdatePatientDTO 
} from './patients.types';

export interface MockPatient extends PatientDTO {}

export const mockPatients: MockPatient[] = [
  {
    id: 'pat-1001',
    mrNumber: 'MRN-202607-0001',
    firstName: 'Muhammad',
    lastName: 'Ali',
    fullName: 'Muhammad Ali',
    fatherHusbandName: 'Tariq Mahmood',
    gender: 'Male',
    dateOfBirth: '1988-04-12',
    age: 38,
    maritalStatus: 'Married',
    mobileNumber: '03001234567',
    alternateMobileNumber: '03217654321',
    address: 'House #45, Street 4, Satellite Town',
    city: 'Sargodha',
    cnic: '38403-1234567-1',
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    chronicDiseases: 'Hypertension',
    remarks: 'VIP Patient',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pat-1002',
    mrNumber: 'MRN-202607-0002',
    firstName: 'Fatima',
    lastName: 'Noor',
    fullName: 'Fatima Noor',
    fatherHusbandName: 'Ahmed Raza',
    gender: 'Female',
    dateOfBirth: '1995-09-25',
    age: 30,
    maritalStatus: 'Single',
    mobileNumber: '03129876543',
    alternateMobileNumber: null,
    address: 'Plot 12, Block B, University Road',
    city: 'Sargodha',
    cnic: '38403-9876543-2',
    bloodGroup: 'O+',
    allergies: null,
    chronicDiseases: null,
    remarks: null,
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class PatientRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateNextMrNumber(): Promise<string> {
    const isDb = this.checkDb();
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', ''); // e.g. 202607

    if (isDb) {
      const [latest] = await db
        .select({ mrNumber: patients.mrNumber })
        .from(patients)
        .orderBy(desc(patients.createdAt))
        .limit(1);

      if (!latest || !latest.mrNumber) {
        return `MRN-${datePrefix}-0001`;
      }

      const parts = latest.mrNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `MRN-${datePrefix}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockPatients.length + 1;
      return `MRN-${datePrefix}-${String(count).padStart(4, '0')}`;
    }
  }

  public static async findMany(query: PatientQueryDTO) {
    const isDb = this.checkDb();
    const page = query.page || 1;
    const limit = query.limit || 8;
    const offset = (page - 1) * limit;

    if (isDb) {
      const conditions = [eq(patients.isDeleted, false)];

      if (query.gender) {
        conditions.push(eq(patients.gender, query.gender));
      }

      if (query.city) {
        conditions.push(ilike(patients.city, `%${query.city}%`));
      }

      if (query.isActive !== undefined) {
        conditions.push(eq(patients.isActive, query.isActive));
      }

      if (query.search) {
        const searchPattern = `%${query.search}%`;
        conditions.push(
          or(
            ilike(patients.mrNumber, searchPattern),
            ilike(patients.firstName, searchPattern),
            ilike(patients.lastName, searchPattern),
            ilike(patients.mobileNumber, searchPattern),
            ilike(patients.cnic, searchPattern),
            ilike(patients.fatherHusbandName, searchPattern)
          )!
        );
      }

      const whereClause = and(...conditions);

      const [totalResult] = await db
        .select({ count: count() })
        .from(patients)
        .where(whereClause);

      const total = Number(totalResult?.count || 0);

      const rows = await db
        .select()
        .from(patients)
        .where(whereClause)
        .orderBy(desc(patients.createdAt))
        .limit(limit)
        .offset(offset);

      const patientList: PatientDTO[] = rows.map((p) => ({
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      }));

      return {
        patients: patientList,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    } else {
      let filtered = mockPatients.filter((p) => !p.isDeleted);

      if (query.gender) {
        filtered = filtered.filter((p) => p.gender === query.gender);
      }

      if (query.city) {
        filtered = filtered.filter((p) => p.city.toLowerCase().includes(query.city!.toLowerCase()));
      }

      if (query.isActive !== undefined) {
        filtered = filtered.filter((p) => p.isActive === query.isActive);
      }

      if (query.search) {
        const term = query.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.mrNumber.toLowerCase().includes(term) ||
            p.firstName.toLowerCase().includes(term) ||
            p.lastName.toLowerCase().includes(term) ||
            p.fullName.toLowerCase().includes(term) ||
            p.mobileNumber.toLowerCase().includes(term) ||
            (p.cnic && p.cnic.toLowerCase().includes(term))
        );
      }

      const total = filtered.length;
      const paginatedRows = filtered.slice(offset, offset + limit);

      return {
        patients: paginatedRows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    }
  }

  public static async findById(id: string): Promise<PatientDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [p] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.id, id), eq(patients.isDeleted, false)))
        .limit(1);

      if (!p) return null;
      return {
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      };
    } else {
      const p = mockPatients.find((pat) => pat.id === id && !pat.isDeleted);
      return p || null;
    }
  }

  public static async findByMrNumber(mrNumber: string): Promise<PatientDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [p] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.mrNumber, mrNumber), eq(patients.isDeleted, false)))
        .limit(1);

      if (!p) return null;
      return {
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      };
    } else {
      const p = mockPatients.find((pat) => pat.mrNumber === mrNumber && !pat.isDeleted);
      return p || null;
    }
  }

  public static async findByCnic(cnic: string): Promise<PatientDTO | null> {
    const isDb = this.checkDb();
    const cleanCnic = cnic.replace(/\s|-/g, '');

    if (isDb) {
      const [p] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.cnic, cleanCnic), eq(patients.isDeleted, false)))
        .limit(1);

      if (!p) return null;
      return {
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      };
    } else {
      const p = mockPatients.find(
        (pat) => pat.cnic && pat.cnic.replace(/\s|-/g, '') === cleanCnic && !pat.isDeleted
      );
      return p || null;
    }
  }

  public static async findByPhoneAndName(
    mobileNumber: string,
    firstName: string,
    lastName: string
  ): Promise<PatientDTO | null> {
    const isDb = this.checkDb();
    const cleanPhone = mobileNumber.replace(/\s|-/g, '');

    if (isDb) {
      const [p] = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.mobileNumber, cleanPhone),
            ilike(patients.firstName, firstName),
            ilike(patients.lastName, lastName),
            eq(patients.isDeleted, false)
          )
        )
        .limit(1);

      if (!p) return null;
      return {
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      };
    } else {
      const p = mockPatients.find(
        (pat) =>
          pat.mobileNumber.replace(/\s|-/g, '') === cleanPhone &&
          pat.firstName.toLowerCase() === firstName.toLowerCase() &&
          pat.lastName.toLowerCase() === lastName.toLowerCase() &&
          !pat.isDeleted
      );
      return p || null;
    }
  }

  public static async create(data: CreatePatientDTO, mrNumber: string): Promise<PatientDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const [newPatient] = await db
        .insert(patients)
        .values({
          mrNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          fatherHusbandName: data.fatherHusbandName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth || null,
          age: data.age || null,
          maritalStatus: data.maritalStatus || null,
          mobileNumber: data.mobileNumber.replace(/\s|-/g, ''),
          alternateMobileNumber: data.alternateMobileNumber || null,
          address: data.address,
          city: data.city || 'Sargodha',
          cnic: data.cnic ? data.cnic.replace(/\s|-/g, '') : null,
          bloodGroup: data.bloodGroup || null,
          allergies: data.allergies || null,
          chronicDiseases: data.chronicDiseases || null,
          remarks: data.remarks || null,
          isActive: true,
          isDeleted: false,
        })
        .returning();

      return {
        ...newPatient,
        fullName: `${newPatient.firstName} ${newPatient.lastName}`,
      };
    } else {
      const id = `pat-${Date.now()}`;
      const newPatient: MockPatient = {
        id,
        mrNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        fatherHusbandName: data.fatherHusbandName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
        age: data.age || null,
        maritalStatus: data.maritalStatus || null,
        mobileNumber: data.mobileNumber,
        alternateMobileNumber: data.alternateMobileNumber || null,
        address: data.address,
        city: data.city || 'Sargodha',
        cnic: data.cnic || null,
        bloodGroup: data.bloodGroup || null,
        allergies: data.allergies || null,
        chronicDiseases: data.chronicDiseases || null,
        remarks: data.remarks || null,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPatients.push(newPatient);
      return newPatient;
    }
  }

  public static async update(id: string, data: UpdatePatientDTO): Promise<PatientDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const updatePayload: any = { ...data, updatedAt: new Date() };
      if (data.mobileNumber) {
        updatePayload.mobileNumber = data.mobileNumber.replace(/\s|-/g, '');
      }
      if (data.cnic) {
        updatePayload.cnic = data.cnic.replace(/\s|-/g, '');
      }

      const [updated] = await db
        .update(patients)
        .set(updatePayload)
        .where(and(eq(patients.id, id), eq(patients.isDeleted, false)))
        .returning();

      if (!updated) return null;
      return {
        ...updated,
        fullName: `${updated.firstName} ${updated.lastName}`,
      };
    } else {
      const idx = mockPatients.findIndex((p) => p.id === id && !p.isDeleted);
      if (idx !== -1) {
        const fn = data.firstName || mockPatients[idx].firstName;
        const ln = data.lastName || mockPatients[idx].lastName;
        mockPatients[idx] = {
          ...mockPatients[idx],
          ...data,
          fullName: `${fn} ${ln}`,
          updatedAt: new Date(),
        };
        return mockPatients[idx];
      }
      return null;
    }
  }

  public static async softDelete(id: string): Promise<boolean> {
    const isDb = this.checkDb();

    if (isDb) {
      const [deleted] = await db
        .update(patients)
        .set({
          isDeleted: true,
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, id))
        .returning();

      return !!deleted;
    } else {
      const idx = mockPatients.findIndex((p) => p.id === id);
      if (idx !== -1) {
        mockPatients[idx].isDeleted = true;
        mockPatients[idx].isActive = false;
        return true;
      }
      return false;
    }
  }
}
