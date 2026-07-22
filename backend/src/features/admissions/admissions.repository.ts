import { db } from '../../db/connection';
import { patientAdmissions, billingCharges } from './admissions.schema';
import { admissionOrders } from '../orders/orders.schema';
import { patientVisits, patients } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import {
  AdmitPatientDTO,
  AdmissionRecordDTO,
  AdmissionStatus,
  AdmissionsSummaryDTO,
  PendingAdmissionOrderDTO,
} from './admissions.types';

export class AdmissionsRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateAdmissionNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ admissionNumber: patientAdmissions.admissionNumber })
        .from(patientAdmissions)
        .orderBy(desc(patientAdmissions.createdAt))
        .limit(1);

      if (!latest || !latest.admissionNumber) {
        return `ADM-${todayStr}-0001`;
      }

      const parts = latest.admissionNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `ADM-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockAdmissions.length + 1;
      return `ADM-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  // 1. Get Admissions Summary (Pending Orders, Active Admissions, Discharged Patients)
  public static async getAdmissionsSummary(search?: string): Promise<AdmissionsSummaryDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const searchCondition = search && search.trim().length > 0
        ? or(
            ilike(patients.firstName, `%${search.trim()}%`),
            ilike(patients.lastName, `%${search.trim()}%`),
            ilike(patients.mrNumber, `%${search.trim()}%`)
          )
        : undefined;

      // Pending Orders
      const pendingRows = await db
        .select({
          id: admissionOrders.id,
          visitId: admissionOrders.visitId,
          patientId: admissionOrders.patientId,
          doctorId: admissionOrders.doctorId,
          admissionType: admissionOrders.admissionType,
          recommendedWard: admissionOrders.recommendedWard,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
          status: admissionOrders.status,
          createdAt: admissionOrders.createdAt,
          visitNumber: patientVisits.visitNumber,
          tokenNumber: patientVisits.tokenNumber,
          visitDate: patientVisits.visitDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
        })
        .from(admissionOrders)
        .innerJoin(patientVisits, eq(admissionOrders.visitId, patientVisits.id))
        .innerJoin(patients, eq(admissionOrders.patientId, patients.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(searchCondition ? and(eq(admissionOrders.status, 'PENDING'), searchCondition) : eq(admissionOrders.status, 'PENDING'))
        .orderBy(desc(admissionOrders.createdAt));

      // Active Admissions
      const activeRows = await db
        .select({
          id: patientAdmissions.id,
          admissionOrderId: patientAdmissions.admissionOrderId,
          visitId: patientAdmissions.visitId,
          patientId: patientAdmissions.patientId,
          admittedById: patientAdmissions.admittedById,
          admittedByName: patientAdmissions.admittedByName,
          admissionNumber: patientAdmissions.admissionNumber,
          roomName: patientAdmissions.roomName,
          roomCharges: patientAdmissions.roomCharges,
          status: patientAdmissions.status,
          notes: patientAdmissions.notes,
          admissionDate: patientAdmissions.admissionDate,
          dischargeDate: patientAdmissions.dischargeDate,
          dischargedById: patientAdmissions.dischargedById,
          dischargedByName: patientAdmissions.dischargedByName,
          createdAt: patientAdmissions.createdAt,
          updatedAt: patientAdmissions.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          recommendedWard: admissionOrders.recommendedWard,
          admissionType: admissionOrders.admissionType,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
        })
        .from(patientAdmissions)
        .innerJoin(patientVisits, eq(patientAdmissions.visitId, patientVisits.id))
        .innerJoin(patients, eq(patientAdmissions.patientId, patients.id))
        .innerJoin(admissionOrders, eq(patientAdmissions.admissionOrderId, admissionOrders.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(searchCondition ? and(eq(patientAdmissions.status, 'ADMITTED'), searchCondition) : eq(patientAdmissions.status, 'ADMITTED'))
        .orderBy(desc(patientAdmissions.admissionDate));

      // Discharged Patients
      const dischargedRows = await db
        .select({
          id: patientAdmissions.id,
          admissionOrderId: patientAdmissions.admissionOrderId,
          visitId: patientAdmissions.visitId,
          patientId: patientAdmissions.patientId,
          admittedById: patientAdmissions.admittedById,
          admittedByName: patientAdmissions.admittedByName,
          admissionNumber: patientAdmissions.admissionNumber,
          roomName: patientAdmissions.roomName,
          roomCharges: patientAdmissions.roomCharges,
          status: patientAdmissions.status,
          notes: patientAdmissions.notes,
          admissionDate: patientAdmissions.admissionDate,
          dischargeDate: patientAdmissions.dischargeDate,
          dischargedById: patientAdmissions.dischargedById,
          dischargedByName: patientAdmissions.dischargedByName,
          createdAt: patientAdmissions.createdAt,
          updatedAt: patientAdmissions.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          recommendedWard: admissionOrders.recommendedWard,
          admissionType: admissionOrders.admissionType,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
        })
        .from(patientAdmissions)
        .innerJoin(patientVisits, eq(patientAdmissions.visitId, patientVisits.id))
        .innerJoin(patients, eq(patientAdmissions.patientId, patients.id))
        .innerJoin(admissionOrders, eq(patientAdmissions.admissionOrderId, admissionOrders.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(searchCondition ? and(eq(patientAdmissions.status, 'DISCHARGED'), searchCondition) : eq(patientAdmissions.status, 'DISCHARGED'))
        .orderBy(desc(patientAdmissions.dischargeDate));

      const pendingOrders: PendingAdmissionOrderDTO[] = pendingRows.map((r) => ({
        id: r.id,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        admissionType: r.admissionType,
        recommendedWard: r.recommendedWard,
        provisionalDiagnosis: r.provisionalDiagnosis,
        status: r.status,
        visitNumber: r.visitNumber,
        tokenNumber: r.tokenNumber,
        visitDate: r.visitDate,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        patientMobile: r.patientMobile,
        doctorName: `${r.doctorFirstName} ${r.doctorLastName}`,
        createdAt: r.createdAt,
      }));

      const activeAdmissions: AdmissionRecordDTO[] = activeRows.map((r) => ({
        id: r.id,
        admissionOrderId: r.admissionOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        admittedById: r.admittedById,
        admittedByName: r.admittedByName,
        admissionNumber: r.admissionNumber,
        roomName: r.roomName,
        roomCharges: Number(r.roomCharges),
        status: r.status as AdmissionStatus,
        notes: r.notes,
        admissionDate: r.admissionDate,
        dischargeDate: r.dischargeDate,
        dischargedById: r.dischargedById,
        dischargedByName: r.dischargedByName,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        patientMobile: r.patientMobile,
        doctorName: `${r.doctorFirstName} ${r.doctorLastName}`,
        recommendedWard: r.recommendedWard,
        admissionType: r.admissionType,
        provisionalDiagnosis: r.provisionalDiagnosis,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      const dischargedAdmissions: AdmissionRecordDTO[] = dischargedRows.map((r) => ({
        id: r.id,
        admissionOrderId: r.admissionOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        admittedById: r.admittedById,
        admittedByName: r.admittedByName,
        admissionNumber: r.admissionNumber,
        roomName: r.roomName,
        roomCharges: Number(r.roomCharges),
        status: r.status as AdmissionStatus,
        notes: r.notes,
        admissionDate: r.admissionDate,
        dischargeDate: r.dischargeDate,
        dischargedById: r.dischargedById,
        dischargedByName: r.dischargedByName,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        patientMobile: r.patientMobile,
        doctorName: `${r.doctorFirstName} ${r.doctorLastName}`,
        recommendedWard: r.recommendedWard,
        admissionType: r.admissionType,
        provisionalDiagnosis: r.provisionalDiagnosis,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      return {
        pendingOrdersCount: pendingOrders.length,
        activeAdmissionsCount: activeAdmissions.length,
        dischargedCount: dischargedAdmissions.length,
        pendingOrders,
        activeAdmissions,
        dischargedAdmissions,
      };
    } else {
      return {
        pendingOrdersCount: mockPendingOrders.length,
        activeAdmissionsCount: mockAdmissions.filter((a) => a.status === AdmissionStatus.ADMITTED).length,
        dischargedCount: mockAdmissions.filter((a) => a.status === AdmissionStatus.DISCHARGED).length,
        pendingOrders: mockPendingOrders,
        activeAdmissions: mockAdmissions.filter((a) => a.status === AdmissionStatus.ADMITTED),
        dischargedAdmissions: mockAdmissions.filter((a) => a.status === AdmissionStatus.DISCHARGED),
      };
    }
  }

  // 2. Admit Patient & Post Billing Entry
  public static async admitPatient(
    data: AdmitPatientDTO,
    staffId: string,
    staffName: string
  ): Promise<AdmissionRecordDTO> {
    const isDb = this.checkDb();
    const roomChargesValue = data.roomCharges !== undefined ? data.roomCharges : 5000;

    if (isDb) {
      const admissionNumber = await this.generateAdmissionNumber();

      const [inserted] = await db
        .insert(patientAdmissions)
        .values({
          admissionOrderId: data.admissionOrderId,
          visitId: data.visitId,
          patientId: data.patientId,
          admittedById: staffId,
          admittedByName: staffName,
          admissionNumber,
          roomName: data.roomName,
          roomCharges: String(roomChargesValue),
          status: 'ADMITTED',
          notes: data.notes || null,
          admissionDate: new Date(),
        })
        .returning();

      // Post Billing Charge Entry (once)
      const [charge] = await db
        .insert(billingCharges)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          sourceModule: 'ADMISSION',
          sourceId: inserted.id,
          itemDescription: `Inpatient Admission Room Charges (${data.roomName})`,
          amount: String(roomChargesValue),
          isPaid: false,
        })
        .returning();

      // Set parent admission_order status to COMPLETED
      await db
        .update(admissionOrders)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(eq(admissionOrders.id, data.admissionOrderId));

      // Fetch patient & doctor info for response DTO
      const [orderInfo] = await db
        .select({
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          recommendedWard: admissionOrders.recommendedWard,
          admissionType: admissionOrders.admissionType,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
        })
        .from(admissionOrders)
        .innerJoin(patients, eq(admissionOrders.patientId, patients.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(eq(admissionOrders.id, data.admissionOrderId))
        .limit(1);

      return {
        id: inserted.id,
        admissionOrderId: inserted.admissionOrderId,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        admittedById: staffId,
        admittedByName: staffName,
        admissionNumber,
        roomName: inserted.roomName,
        roomCharges: Number(inserted.roomCharges),
        status: AdmissionStatus.ADMITTED,
        notes: inserted.notes,
        admissionDate: inserted.admissionDate,
        dischargeDate: null,
        dischargedById: null,
        dischargedByName: null,
        patientName: orderInfo ? `${orderInfo.patientFirstName} ${orderInfo.patientLastName}` : 'Patient',
        patientMrNumber: orderInfo?.patientMrNumber || '',
        patientAge: orderInfo?.patientAge,
        patientGender: orderInfo?.patientGender || '',
        patientMobile: orderInfo?.patientMobile || '',
        doctorName: orderInfo ? `${orderInfo.doctorFirstName} ${orderInfo.doctorLastName}` : 'Doctor',
        recommendedWard: orderInfo?.recommendedWard || 'Ward',
        admissionType: orderInfo?.admissionType || 'EMERGENCY',
        provisionalDiagnosis: orderInfo?.provisionalDiagnosis,
        billingChargeId: charge.id,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const admissionNumber = await this.generateAdmissionNumber();
      const rec: AdmissionRecordDTO = {
        id: `adm-${Date.now()}`,
        admissionOrderId: data.admissionOrderId,
        visitId: data.visitId,
        patientId: data.patientId,
        admittedById: staffId,
        admittedByName: staffName,
        admissionNumber,
        roomName: data.roomName,
        roomCharges: roomChargesValue,
        status: AdmissionStatus.ADMITTED,
        notes: data.notes || null,
        admissionDate: new Date(),
        dischargeDate: null,
        dischargedById: null,
        dischargedByName: null,
        patientName: 'Mock Patient',
        patientMrNumber: 'MRN-MOCK',
        patientAge: 30,
        patientGender: 'Male',
        patientMobile: '03001234567',
        doctorName: 'Dr. Zafar Iqbal',
        recommendedWard: 'GENERAL_WARD',
        admissionType: 'EMERGENCY',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAdmissions.push(rec);

      // Remove from mock pending
      const pIdx = mockPendingOrders.findIndex((p) => p.id === data.admissionOrderId);
      if (pIdx !== -1) mockPendingOrders.splice(pIdx, 1);

      return rec;
    }
  }

  // 3. Discharge Patient
  public static async dischargePatient(
    admissionId: string,
    staffId: string,
    staffName: string,
    notes?: string
  ): Promise<AdmissionRecordDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      await db
        .update(patientAdmissions)
        .set({
          status: 'DISCHARGED',
          dischargeDate: new Date(),
          dischargedById: staffId,
          dischargedByName: staffName,
          notes: notes ? sql`concat(coalesce(${patientAdmissions.notes}, ''), ' | Discharge note: ', ${notes})` : undefined,

          updatedAt: new Date(),
        })
        .where(eq(patientAdmissions.id, admissionId));

      const [r] = await db
        .select({
          id: patientAdmissions.id,
          admissionOrderId: patientAdmissions.admissionOrderId,
          visitId: patientAdmissions.visitId,
          patientId: patientAdmissions.patientId,
          admittedById: patientAdmissions.admittedById,
          admittedByName: patientAdmissions.admittedByName,
          admissionNumber: patientAdmissions.admissionNumber,
          roomName: patientAdmissions.roomName,
          roomCharges: patientAdmissions.roomCharges,
          status: patientAdmissions.status,
          notes: patientAdmissions.notes,
          admissionDate: patientAdmissions.admissionDate,
          dischargeDate: patientAdmissions.dischargeDate,
          dischargedById: patientAdmissions.dischargedById,
          dischargedByName: patientAdmissions.dischargedByName,
          createdAt: patientAdmissions.createdAt,
          updatedAt: patientAdmissions.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          recommendedWard: admissionOrders.recommendedWard,
          admissionType: admissionOrders.admissionType,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
        })
        .from(patientAdmissions)
        .innerJoin(patientVisits, eq(patientAdmissions.visitId, patientVisits.id))
        .innerJoin(patients, eq(patientAdmissions.patientId, patients.id))
        .innerJoin(admissionOrders, eq(patientAdmissions.admissionOrderId, admissionOrders.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(eq(patientAdmissions.id, admissionId))
        .limit(1);

      return {
        id: r.id,
        admissionOrderId: r.admissionOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        admittedById: r.admittedById,
        admittedByName: r.admittedByName,
        admissionNumber: r.admissionNumber,
        roomName: r.roomName,
        roomCharges: Number(r.roomCharges),
        status: r.status as AdmissionStatus,
        notes: r.notes,
        admissionDate: r.admissionDate,
        dischargeDate: r.dischargeDate,
        dischargedById: r.dischargedById,
        dischargedByName: r.dischargedByName,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        patientMobile: r.patientMobile,
        doctorName: `${r.doctorFirstName} ${r.doctorLastName}`,
        recommendedWard: r.recommendedWard,
        admissionType: r.admissionType,
        provisionalDiagnosis: r.provisionalDiagnosis,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      const rec = mockAdmissions.find((a) => a.id === admissionId);
      if (rec) {
        rec.status = AdmissionStatus.DISCHARGED;
        rec.dischargeDate = new Date();
        rec.dischargedById = staffId;
        rec.dischargedByName = staffName;
      }
      return rec!;
    }
  }

  // 4. Get Active Admission By Visit ID
  public static async getAdmissionByVisitId(visitId: string): Promise<AdmissionRecordDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [r] = await db
        .select({
          id: patientAdmissions.id,
          admissionOrderId: patientAdmissions.admissionOrderId,
          visitId: patientAdmissions.visitId,
          patientId: patientAdmissions.patientId,
          admittedById: patientAdmissions.admittedById,
          admittedByName: patientAdmissions.admittedByName,
          admissionNumber: patientAdmissions.admissionNumber,
          roomName: patientAdmissions.roomName,
          roomCharges: patientAdmissions.roomCharges,
          status: patientAdmissions.status,
          notes: patientAdmissions.notes,
          admissionDate: patientAdmissions.admissionDate,
          dischargeDate: patientAdmissions.dischargeDate,
          dischargedById: patientAdmissions.dischargedById,
          dischargedByName: patientAdmissions.dischargedByName,
          createdAt: patientAdmissions.createdAt,
          updatedAt: patientAdmissions.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          recommendedWard: admissionOrders.recommendedWard,
          admissionType: admissionOrders.admissionType,
          provisionalDiagnosis: admissionOrders.provisionalDiagnosis,
        })
        .from(patientAdmissions)
        .innerJoin(patientVisits, eq(patientAdmissions.visitId, patientVisits.id))
        .innerJoin(patients, eq(patientAdmissions.patientId, patients.id))
        .innerJoin(admissionOrders, eq(patientAdmissions.admissionOrderId, admissionOrders.id))
        .innerJoin(doctors, eq(admissionOrders.doctorId, doctors.id))
        .where(eq(patientAdmissions.visitId, visitId))
        .limit(1);

      if (!r) return null;

      return {
        id: r.id,
        admissionOrderId: r.admissionOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        admittedById: r.admittedById,
        admittedByName: r.admittedByName,
        admissionNumber: r.admissionNumber,
        roomName: r.roomName,
        roomCharges: Number(r.roomCharges),
        status: r.status as AdmissionStatus,
        notes: r.notes,
        admissionDate: r.admissionDate,
        dischargeDate: r.dischargeDate,
        dischargedById: r.dischargedById,
        dischargedByName: r.dischargedByName,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        patientMobile: r.patientMobile,
        doctorName: `${r.doctorFirstName} ${r.doctorLastName}`,
        recommendedWard: r.recommendedWard,
        admissionType: r.admissionType,
        provisionalDiagnosis: r.provisionalDiagnosis,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      return mockAdmissions.find((a) => a.visitId === visitId) || null;
    }
  }
}

export const mockAdmissions: AdmissionRecordDTO[] = [];
export const mockPendingOrders: PendingAdmissionOrderDTO[] = [];
