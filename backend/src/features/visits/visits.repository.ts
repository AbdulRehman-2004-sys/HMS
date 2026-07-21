import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { patientVisits, patients } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, or, ilike, count, desc, gte, lte, sql } from 'drizzle-orm';

import {
  CreateVisitDTO,
  EMRDetailsResponseDTO,
  PastVisitSummary,
  QueueSummaryDTO,
  UpdateVisitStatusDTO,
  VisitQueryDTO,
  VisitResponseDTO,
  VisitStatus,
} from './visits.types';

export class VisitRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  /**
   * Auto-generate unique visit number: VN-YYYYMMDD-XXXX
   */
  public static async generateNextVisitNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20260721

    if (isDb) {
      const [latest] = await db
        .select({ visitNumber: patientVisits.visitNumber })
        .from(patientVisits)
        .orderBy(desc(patientVisits.createdAt))
        .limit(1);

      if (!latest || !latest.visitNumber) {
        return `VN-${todayStr}-0001`;
      }

      const parts = latest.visitNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `VN-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockVisits.length + 1;
      return `VN-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  /**
   * Calculate next token number for today for a specific doctor
   */
  public static async getNextTokenNumber(doctorId: string): Promise<number> {
    const isDb = this.checkDb();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (isDb) {
      const [result] = await db
        .select({ count: count() })
        .from(patientVisits)
        .where(
          and(
            eq(patientVisits.doctorId, doctorId),
            gte(patientVisits.visitDate, todayStart),
            lte(patientVisits.visitDate, todayEnd)
          )
        );

      return Number(result?.count || 0) + 1;
    } else {
      const todayCount = mockVisits.filter(
        (v) =>
          v.doctorId === doctorId &&
          new Date(v.visitDate) >= todayStart &&
          new Date(v.visitDate) <= todayEnd
      ).length;
      return todayCount + 1;
    }
  }

  /**
   * Create Patient Visit & Queue Patient
   */
  public static async create(data: CreateVisitDTO): Promise<VisitResponseDTO> {
    const isDb = this.checkDb();
    const visitNumber = await this.generateNextVisitNumber();
    const tokenNumber = await this.getNextTokenNumber(data.doctorId);

    if (isDb) {
      const [inserted] = await db
        .insert(patientVisits)
        .values({
          patientId: data.patientId,
          doctorId: data.doctorId,
          visitNumber,
          tokenNumber,
          visitDate: new Date(),
          status: VisitStatus.WAITING,
          chiefComplaint: data.chiefComplaint || null,
          temperature: data.temperature || null,
          pulse: data.pulse || null,
          bloodPressure: data.bloodPressure || null,
          weight: data.weight || null,
          clinicalNotes: data.clinicalNotes || null,
        })
        .returning();

      const details = await this.findById(inserted.id);
      if (!details) {
        throw new Error('Failed to retrieve newly created visit');
      }
      return details.visit;
    } else {
      const mockPatient = mockPatients.find((p) => p.id === data.patientId);
      const mockDoctor = mockDoctors.find((d) => d.id === data.doctorId);

      const newVisit: VisitResponseDTO = {
        id: `vis-${Date.now()}`,
        visitNumber,
        tokenNumber,
        visitDate: new Date(),
        status: VisitStatus.WAITING,
        chiefComplaint: data.chiefComplaint || null,
        temperature: data.temperature || null,
        pulse: data.pulse || null,
        bloodPressure: data.bloodPressure || null,
        weight: data.weight || null,
        clinicalNotes: data.clinicalNotes || null,
        patientId: data.patientId,
        patientName: mockPatient ? `${mockPatient.firstName} ${mockPatient.lastName}` : 'Unknown Patient',
        patientMrNumber: mockPatient ? mockPatient.mrNumber : 'MRN-000000',
        patientAge: mockPatient ? mockPatient.age : 30,
        patientGender: mockPatient ? mockPatient.gender : 'Male',
        patientPhone: mockPatient ? mockPatient.mobileNumber : '03000000000',
        patientFatherHusbandName: mockPatient ? mockPatient.fatherHusbandName : null,
        patientCnic: mockPatient ? mockPatient.cnic : null,
        patientAllergies: mockPatient ? mockPatient.allergies : null,
        patientChronicDiseases: mockPatient ? mockPatient.chronicDiseases : null,
        doctorId: data.doctorId,
        doctorName: mockDoctor ? `Dr. ${mockDoctor.firstName} ${mockDoctor.lastName}` : 'Dr. Assigned',
        doctorSpecialization: mockDoctor ? mockDoctor.specialization : 'General OPD',
        doctorQualification: mockDoctor ? mockDoctor.qualification : 'MBBS',
        doctorRegistrationNumber: mockDoctor ? mockDoctor.registrationNumber : 'PMDC-000',
        doctorSignatureText: mockDoctor ? mockDoctor.signatureText : null,
        doctorHeaderText: mockDoctor ? mockDoctor.headerText : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockVisits.push(newVisit);
      return newVisit;
    }
  }

  /**
   * Get Today's Queue with counters and filters
   */
  public static async findQueue(query: VisitQueryDTO) {
    const isDb = this.checkDb();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const targetDateStr = query.date || new Date().toISOString().slice(0, 10);
    const dateStart = new Date(targetDateStr);
    dateStart.setHours(0, 0, 0, 0);

    const dateEnd = new Date(targetDateStr);
    dateEnd.setHours(23, 59, 59, 999);

    if (isDb) {
      const conditions = [
        gte(patientVisits.visitDate, dateStart),
        lte(patientVisits.visitDate, dateEnd),
      ];

      if (query.doctorId && query.doctorId !== 'all') {
        conditions.push(eq(patientVisits.doctorId, query.doctorId));
      }

      if (query.status) {
        conditions.push(eq(patientVisits.status, query.status));
      }

      if (query.search) {
        const searchPattern = `%${query.search}%`;
        conditions.push(
          or(
            ilike(patientVisits.visitNumber, searchPattern),
            ilike(patients.mrNumber, searchPattern),
            ilike(patients.firstName, searchPattern),
            ilike(patients.lastName, searchPattern),
            ilike(patients.mobileNumber, searchPattern)
          )!
        );
      }

      const whereClause = and(...conditions);

      const [totalRes] = await db
        .select({ count: count() })
        .from(patientVisits)
        .innerJoin(patients, eq(patientVisits.patientId, patients.id))
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(whereClause);

      const total = Number(totalRes?.count || 0);

      const rows = await db
        .select({
          visit: patientVisits,
          patient: patients,
          doctor: doctors,
        })
        .from(patientVisits)
        .innerJoin(patients, eq(patientVisits.patientId, patients.id))
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(whereClause)
        .orderBy(patientVisits.tokenNumber)
        .limit(limit)
        .offset(offset);

      const queueList: VisitResponseDTO[] = rows.map((r) => ({
        id: r.visit.id,
        visitNumber: r.visit.visitNumber,
        tokenNumber: r.visit.tokenNumber,
        visitDate: r.visit.visitDate,
        status: r.visit.status as VisitStatus,
        chiefComplaint: r.visit.chiefComplaint,
        temperature: r.visit.temperature,
        pulse: r.visit.pulse,
        bloodPressure: r.visit.bloodPressure,
        weight: r.visit.weight,
        clinicalNotes: r.visit.clinicalNotes,
        patientId: r.patient.id,
        patientName: `${r.patient.firstName} ${r.patient.lastName}`,
        patientMrNumber: r.patient.mrNumber,
        patientAge: r.patient.age,
        patientGender: r.patient.gender,
        patientPhone: r.patient.mobileNumber,
        patientFatherHusbandName: r.patient.fatherHusbandName,
        patientCnic: r.patient.cnic,
        patientAllergies: r.patient.allergies,
        patientChronicDiseases: r.patient.chronicDiseases,
        doctorId: r.doctor.id,
        doctorName: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
        doctorSpecialization: r.doctor.specialization,
        doctorQualification: r.doctor.qualification,
        doctorRegistrationNumber: r.doctor.registrationNumber,
        doctorSignatureText: r.doctor.signatureText,
        doctorHeaderText: r.doctor.headerText,
        createdAt: r.visit.createdAt,
        updatedAt: r.visit.updatedAt,
      }));

      // Calculate Summary Counters for specified doctor / date
      const summaryConditions = [
        gte(patientVisits.visitDate, dateStart),
        lte(patientVisits.visitDate, dateEnd),
      ];
      if (query.doctorId && query.doctorId !== 'all') {
        summaryConditions.push(eq(patientVisits.doctorId, query.doctorId));
      }

      const summaryRows = await db
        .select({
          status: patientVisits.status,
          count: count(),
        })
        .from(patientVisits)
        .where(and(...summaryConditions))
        .groupBy(patientVisits.status);

      const summary: QueueSummaryDTO = {
        total: 0,
        waiting: 0,
        withDoctor: 0,
        completed: 0,
        cancelled: 0,
      };

      summaryRows.forEach((s) => {
        const c = Number(s.count);
        summary.total += c;
        if (s.status === VisitStatus.WAITING) summary.waiting = c;
        if (s.status === VisitStatus.WITH_DOCTOR) summary.withDoctor = c;
        if (s.status === VisitStatus.COMPLETED) summary.completed = c;
        if (s.status === VisitStatus.CANCELLED) summary.cancelled = c;
      });

      return {
        queue: queueList,
        summary,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    } else {
      let filtered = mockVisits.filter((v) => {
        const vDate = new Date(v.visitDate);
        return vDate >= dateStart && vDate <= dateEnd;
      });

      if (query.doctorId && query.doctorId !== 'all') {
        filtered = filtered.filter((v) => v.doctorId === query.doctorId);
      }

      if (query.status) {
        filtered = filtered.filter((v) => v.status === query.status);
      }

      if (query.search) {
        const term = query.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.visitNumber.toLowerCase().includes(term) ||
            v.patientMrNumber.toLowerCase().includes(term) ||
            v.patientName.toLowerCase().includes(term) ||
            v.patientPhone.toLowerCase().includes(term)
        );
      }

      const summary: QueueSummaryDTO = {
        total: filtered.length,
        waiting: filtered.filter((v) => v.status === VisitStatus.WAITING).length,
        withDoctor: filtered.filter((v) => v.status === VisitStatus.WITH_DOCTOR).length,
        completed: filtered.filter((v) => v.status === VisitStatus.COMPLETED).length,
        cancelled: filtered.filter((v) => v.status === VisitStatus.CANCELLED).length,
      };

      const paginated = filtered.slice(offset, offset + limit);

      return {
        queue: paginated,
        summary,
        pagination: {
          total: filtered.length,
          page,
          limit,
          pages: Math.ceil(filtered.length / limit) || 1,
        },
      };
    }
  }

  /**
   * Get Single Visit Details & EMR Information
   */
  public static async findById(visitId: string): Promise<EMRDetailsResponseDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [r] = await db
        .select({
          visit: patientVisits,
          patient: patients,
          doctor: doctors,
        })
        .from(patientVisits)
        .innerJoin(patients, eq(patientVisits.patientId, patients.id))
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(eq(patientVisits.id, visitId))
        .limit(1);

      if (!r) return null;

      const visitDTO: VisitResponseDTO = {
        id: r.visit.id,
        visitNumber: r.visit.visitNumber,
        tokenNumber: r.visit.tokenNumber,
        visitDate: r.visit.visitDate,
        status: r.visit.status as VisitStatus,
        chiefComplaint: r.visit.chiefComplaint,
        temperature: r.visit.temperature,
        pulse: r.visit.pulse,
        bloodPressure: r.visit.bloodPressure,
        weight: r.visit.weight,
        clinicalNotes: r.visit.clinicalNotes,
        patientId: r.patient.id,
        patientName: `${r.patient.firstName} ${r.patient.lastName}`,
        patientMrNumber: r.patient.mrNumber,
        patientAge: r.patient.age,
        patientGender: r.patient.gender,
        patientPhone: r.patient.mobileNumber,
        patientFatherHusbandName: r.patient.fatherHusbandName,
        patientCnic: r.patient.cnic,
        patientAllergies: r.patient.allergies,
        patientChronicDiseases: r.patient.chronicDiseases,
        doctorId: r.doctor.id,
        doctorName: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
        doctorSpecialization: r.doctor.specialization,
        doctorQualification: r.doctor.qualification,
        doctorRegistrationNumber: r.doctor.registrationNumber,
        doctorSignatureText: r.doctor.signatureText,
        doctorHeaderText: r.doctor.headerText,
        createdAt: r.visit.createdAt,
        updatedAt: r.visit.updatedAt,
      };

      // Query past visits for this patient (excluding current visit)
      const pastRows = await db
        .select({
          visit: patientVisits,
          doctor: doctors,
        })
        .from(patientVisits)
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(
          and(
            eq(patientVisits.patientId, r.patient.id),
            sql`${patientVisits.id} != ${visitId}`
          )
        )
        .orderBy(desc(patientVisits.visitDate))
        .limit(10);

      const pastVisits: PastVisitSummary[] = pastRows.map((pr) => ({
        id: pr.visit.id,
        visitNumber: pr.visit.visitNumber,
        visitDate: pr.visit.visitDate,
        doctorName: `Dr. ${pr.doctor.firstName} ${pr.doctor.lastName}`,
        chiefComplaint: pr.visit.chiefComplaint,
        clinicalNotes: pr.visit.clinicalNotes,
        status: pr.visit.status as VisitStatus,
      }));

      return {
        visit: visitDTO,
        pastVisits,
        previousPrescriptions: [],
        previousLabReports: [],
        previousRadiologyReports: [],
      };
    } else {
      const v = mockVisits.find((vis) => vis.id === visitId);
      if (!v) return null;

      const pastVisits = mockVisits
        .filter((vis) => vis.patientId === v.patientId && vis.id !== visitId)
        .map((p) => ({
          id: p.id,
          visitNumber: p.visitNumber,
          visitDate: p.visitDate,
          doctorName: p.doctorName,
          chiefComplaint: p.chiefComplaint,
          clinicalNotes: p.clinicalNotes,
          status: p.status,
        }));

      return {
        visit: v,
        pastVisits,
        previousPrescriptions: [],
        previousLabReports: [],
        previousRadiologyReports: [],
      };
    }
  }

  /**
   * Update Visit Status and Clinical Notes
   */
  public static async updateStatus(
    visitId: string,
    data: UpdateVisitStatusDTO
  ): Promise<VisitResponseDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const updatePayload: Record<string, any> = {
        status: data.status,
        updatedAt: new Date(),
      };

      if (data.clinicalNotes !== undefined) {
        updatePayload.clinicalNotes = data.clinicalNotes;
      }

      await db
        .update(patientVisits)
        .set(updatePayload)
        .where(eq(patientVisits.id, visitId));

      const details = await this.findById(visitId);
      return details ? details.visit : null;
    } else {
      const idx = mockVisits.findIndex((v) => v.id === visitId);
      if (idx !== -1) {
        mockVisits[idx].status = data.status;
        if (data.clinicalNotes !== undefined) {
          mockVisits[idx].clinicalNotes = data.clinicalNotes;
        }
        mockVisits[idx].updatedAt = new Date();
        return mockVisits[idx];
      }
      return null;
    }
  }

  /**
   * Find doctor record by userId
   */
  public static async findDoctorByUserId(userId: string) {
    const isDb = this.checkDb();
    if (isDb) {
      const [doc] = await db.select().from(doctors).where(eq(doctors.userId, userId)).limit(1);
      if (doc) return doc;

      // Fallback: If logged in as Super Admin / admin account, link to Prof. Dr. M Zafar Iqbal profile
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user && (user.email.includes('admin') || user.email.includes('zafar'))) {
        const [zafarDoc] = await db.select().from(doctors).where(ilike(doctors.lastName, '%Iqbal%')).limit(1);
        if (zafarDoc) return zafarDoc;
      }
      return null;
    } else {
      return mockDoctors.find((d) => d.userId === userId || d.lastName.includes('Iqbal')) || mockDoctors[0];
    }
  }

}

// In-Memory Mocks for Resilient Offline Testing
export const mockPatients = [
  {
    id: 'pat-1001',
    mrNumber: 'MRN-202607-0001',
    firstName: 'Muhammad',
    lastName: 'Ali',
    fatherHusbandName: 'Tariq Mahmood',
    gender: 'Male',
    age: 38,
    mobileNumber: '03001234567',
    cnic: '38403-1234567-1',
    allergies: 'Penicillin',
    chronicDiseases: 'Hypertension',
  },
  {
    id: 'pat-1002',
    mrNumber: 'MRN-202607-0002',
    firstName: 'Fatima',
    lastName: 'Noor',
    fatherHusbandName: 'Ahmed Raza',
    gender: 'Female',
    age: 30,
    mobileNumber: '03129876543',
    cnic: '38403-9876543-2',
    allergies: null,
    chronicDiseases: null,
  },
];

export const mockDoctors = [
  {
    id: 'doc-1001',
    userId: 'usr-zafar',
    firstName: 'M Zafar',
    lastName: 'Iqbal',
    specialization: 'Pediatric Surgeon / CEO',
    qualification: 'MBBS (PB), FCPS (Paediatric Surgery), MME (UOL)',
    registrationNumber: '33791-P',
    signatureText: 'Prof Dr. M Zafar Iqbal - Pediatric Surgeon',
    headerText: 'Ex-Head Dept of Paediatric Surgery, Nishtar Medical University Multan',
  },
  {
    id: 'doc-1002',
    userId: 'usr-shumaila',
    firstName: 'Shumaila',
    lastName: 'Irum',
    specialization: 'APWMO / MS',
    qualification: 'MBBS, MME (UOL), M.Phil (Physiology)',
    registrationNumber: '41229-P',
    signatureText: 'Dr. Shumaila Irum - APWMO / MS',
    headerText: 'Assistant Director Medical Education, Sheikh Zayed Medical College/Hospital',
  },
];

export const mockVisits: VisitResponseDTO[] = [
  {
    id: 'vis-1001',
    visitNumber: 'VN-20260721-0001',
    tokenNumber: 1,
    visitDate: new Date(),
    status: VisitStatus.WAITING,
    chiefComplaint: 'Severe abdominal pain and vomiting since morning',
    temperature: '99.2 F',
    pulse: '84 bpm',
    bloodPressure: '120/80 mmHg',
    weight: '68 kg',
    clinicalNotes: null,
    patientId: 'pat-1001',
    patientName: 'Muhammad Ali',
    patientMrNumber: 'MRN-202607-0001',
    patientAge: 38,
    patientGender: 'Male',
    patientPhone: '03001234567',
    patientFatherHusbandName: 'Tariq Mahmood',
    patientCnic: '38403-1234567-1',
    patientAllergies: 'Penicillin',
    patientChronicDiseases: 'Hypertension',
    doctorId: 'doc-1001',
    doctorName: 'Prof. Dr. M Zafar Iqbal',
    doctorSpecialization: 'Pediatric Surgeon / CEO',
    doctorQualification: 'MBBS (PB), FCPS (Paediatric Surgery), MME (UOL)',
    doctorRegistrationNumber: '33791-P',
    doctorSignatureText: 'Prof Dr. M Zafar Iqbal - Pediatric Surgeon',
    doctorHeaderText: 'Ex-Head Dept of Paediatric Surgery, Nishtar Medical University Multan',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'vis-1002',
    visitNumber: 'VN-20260721-0002',
    tokenNumber: 2,
    visitDate: new Date(),
    status: VisitStatus.WITH_DOCTOR,
    chiefComplaint: 'High fever and dry cough for 3 days',
    temperature: '101.5 F',
    pulse: '92 bpm',
    bloodPressure: '115/75 mmHg',
    weight: '54 kg',
    clinicalNotes: 'Patient presents with acute onset fever. Chest clear on auscultation.',
    patientId: 'pat-1002',
    patientName: 'Fatima Noor',
    patientMrNumber: 'MRN-202607-0002',
    patientAge: 30,
    patientGender: 'Female',
    patientPhone: '03129876543',
    patientFatherHusbandName: 'Ahmed Raza',
    patientCnic: '38403-9876543-2',
    patientAllergies: null,
    patientChronicDiseases: null,
    doctorId: 'doc-1002',
    doctorName: 'Dr. Shumaila Irum',
    doctorSpecialization: 'APWMO / MS',
    doctorQualification: 'MBBS, MME (UOL), M.Phil (Physiology)',
    doctorRegistrationNumber: '41229-P',
    doctorSignatureText: 'Dr. Shumaila Irum - APWMO / MS',
    doctorHeaderText: 'Assistant Director Medical Education, Sheikh Zayed Medical College/Hospital',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
