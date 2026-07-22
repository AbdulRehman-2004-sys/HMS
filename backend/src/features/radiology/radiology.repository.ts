import { db } from '../../db/connection';
import { radiologyReports } from './radiology.schema';
import { radiologyOrders } from '../orders/orders.schema';
import { patientVisits, patients } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import {
  RadiologyOrderQueueItemDTO,
  RadiologyQueueSummaryDTO,
  RadiologyReportResponseDTO,
  RadiologyReportStatus,
  RadiologyServiceType,
  SaveRadiologyReportDTO,
} from './radiology.types';

export class RadiologyRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateReportNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ reportNumber: radiologyReports.reportNumber })
        .from(radiologyReports)
        .orderBy(desc(radiologyReports.createdAt))
        .limit(1);

      if (!latest || !latest.reportNumber) {
        return `RR-${todayStr}-0001`;
      }

      const parts = latest.reportNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `RR-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockRadiologyReports.length + 1;
      return `RR-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  // 1. Get Radiology Queue with Metrics & Patient Info
  public static async getRadiologyQueue(
    statusFilter?: string,
    serviceTypeFilter?: string,
    search?: string
  ): Promise<RadiologyQueueSummaryDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const conditions = [];
      if (statusFilter && statusFilter !== 'ALL') {
        conditions.push(eq(radiologyOrders.status, statusFilter));
      }
      if (serviceTypeFilter && serviceTypeFilter !== 'ALL') {
        conditions.push(eq(radiologyOrders.modality, serviceTypeFilter));
      }

      if (search && search.trim().length > 0) {
        const q = `%${search.trim()}%`;
        conditions.push(
          or(
            ilike(patients.firstName, q),
            ilike(patients.lastName, q),
            ilike(patients.mrNumber, q),
            ilike(radiologyOrders.procedureName, q)
          )
        );
      }

      const rows = await db
        .select({
          id: radiologyOrders.id,
          visitId: radiologyOrders.visitId,
          patientId: radiologyOrders.patientId,
          doctorId: radiologyOrders.doctorId,
          modality: radiologyOrders.modality,
          procedureName: radiologyOrders.procedureName,
          urgency: radiologyOrders.urgency,
          clinicalNotes: radiologyOrders.clinicalNotes,
          status: radiologyOrders.status,
          createdAt: radiologyOrders.createdAt,
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
        .from(radiologyOrders)
        .innerJoin(patientVisits, eq(radiologyOrders.visitId, patientVisits.id))
        .innerJoin(patients, eq(radiologyOrders.patientId, patients.id))
        .innerJoin(doctors, eq(radiologyOrders.doctorId, doctors.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(radiologyOrders.createdAt));

      // Calculate Metrics
      const [pendingRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(radiologyOrders)
        .where(eq(radiologyOrders.status, 'PENDING'));

      const [inProgressRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(radiologyOrders)
        .where(eq(radiologyOrders.status, 'IN_PROGRESS'));

      const [completedTodayRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(radiologyOrders)
        .where(eq(radiologyOrders.status, 'COMPLETED'));

      const orders: RadiologyOrderQueueItemDTO[] = rows.map((r) => ({
        id: r.id,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        modality: r.modality,
        procedureName: r.procedureName,
        urgency: r.urgency,
        clinicalNotes: r.clinicalNotes,
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

      return {
        pendingCount: Number(pendingRes?.count || 0),
        inProgressCount: Number(inProgressRes?.count || 0),
        completedTodayCount: Number(completedTodayRes?.count || 0),
        orders,
      };
    } else {
      let filtered = mockRadiologyOrdersQueue;
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (serviceTypeFilter && serviceTypeFilter !== 'ALL') {
        filtered = filtered.filter((o) => o.modality === serviceTypeFilter);
      }
      if (search && search.trim().length > 0) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.patientName.toLowerCase().includes(q) ||
            o.patientMrNumber.toLowerCase().includes(q) ||
            o.procedureName.toLowerCase().includes(q)
        );
      }

      return {
        pendingCount: mockRadiologyOrdersQueue.filter((o) => o.status === 'PENDING').length,
        inProgressCount: mockRadiologyOrdersQueue.filter((o) => o.status === 'IN_PROGRESS').length,
        completedTodayCount: mockRadiologyOrdersQueue.filter((o) => o.status === 'COMPLETED').length,
        orders: filtered,
      };
    }
  }

  // 2. Save or Finalize Radiology Report
  public static async saveRadiologyReport(
    data: SaveRadiologyReportDTO,
    technicianId: string,
    technicianName: string
  ): Promise<RadiologyReportResponseDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const [existingReport] = await db
        .select()
        .from(radiologyReports)
        .where(eq(radiologyReports.radiologyOrderId, data.radiologyOrderId))
        .limit(1);

      let reportId: string;
      let reportNumber: string;

      if (existingReport) {
        reportId = existingReport.id;
        reportNumber = existingReport.reportNumber;

        await db
          .update(radiologyReports)
          .set({
            status: data.status,
            technicianId,
            technicianName,
            serviceType: data.serviceType,
            examination: data.examination,
            clinicalFindings: data.clinicalFindings,
            impression: data.impression,
            recommendation: data.recommendation || null,
            technicianNotes: data.technicianNotes || null,
            reportDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(radiologyReports.id, reportId));
      } else {
        reportNumber = await this.generateReportNumber();
        const [inserted] = await db
          .insert(radiologyReports)
          .values({
            radiologyOrderId: data.radiologyOrderId,
            visitId: data.visitId,
            patientId: data.patientId,
            technicianId,
            technicianName,
            reportNumber,
            serviceType: data.serviceType,
            examination: data.examination,
            status: data.status,
            clinicalFindings: data.clinicalFindings,
            impression: data.impression,
            recommendation: data.recommendation || null,
            technicianNotes: data.technicianNotes || null,
            reportDate: new Date(),
          })
          .returning();

        reportId = inserted.id;
      }

      // Update parent radiology_order status
      const orderNewStatus = data.status === RadiologyReportStatus.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS';
      await db
        .update(radiologyOrders)
        .set({ status: orderNewStatus, updatedAt: new Date() })
        .where(eq(radiologyOrders.id, data.radiologyOrderId));

      return {
        id: reportId,
        radiologyOrderId: data.radiologyOrderId,
        visitId: data.visitId,
        patientId: data.patientId,
        technicianId,
        technicianName,
        reportNumber,
        serviceType: data.serviceType,
        examination: data.examination,
        status: data.status,
        clinicalFindings: data.clinicalFindings,
        impression: data.impression,
        recommendation: data.recommendation || null,
        technicianNotes: data.technicianNotes || null,
        reportDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      let report = mockRadiologyReports.find((r) => r.radiologyOrderId === data.radiologyOrderId);
      if (report) {
        report.status = data.status;
        report.serviceType = data.serviceType;
        report.examination = data.examination;
        report.clinicalFindings = data.clinicalFindings;
        report.impression = data.impression;
        report.recommendation = data.recommendation || null;
        report.technicianNotes = data.technicianNotes || null;
      } else {
        const reportNumber = await this.generateReportNumber();
        report = {
          id: `rr-${Date.now()}`,
          radiologyOrderId: data.radiologyOrderId,
          visitId: data.visitId,
          patientId: data.patientId,
          technicianId,
          technicianName,
          reportNumber,
          serviceType: data.serviceType,
          examination: data.examination,
          status: data.status,
          clinicalFindings: data.clinicalFindings,
          impression: data.impression,
          recommendation: data.recommendation || null,
          technicianNotes: data.technicianNotes || null,
          reportDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockRadiologyReports.push(report);
      }

      const mockOrder = mockRadiologyOrdersQueue.find((o) => o.id === data.radiologyOrderId);
      if (mockOrder) {
        mockOrder.status = data.status === RadiologyReportStatus.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS';
      }

      return report;
    }
  }

  // 3. Get Radiology Reports By Visit ID (Doctor EMR View)
  public static async getRadiologyReportsByVisit(visitId: string): Promise<RadiologyReportResponseDTO[]> {
    const isDb = this.checkDb();
    if (isDb) {
      const reports = await db
        .select()
        .from(radiologyReports)
        .where(eq(radiologyReports.visitId, visitId))
        .orderBy(desc(radiologyReports.createdAt));

      return reports.map((r) => ({
        id: r.id,
        radiologyOrderId: r.radiologyOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        technicianId: r.technicianId,
        technicianName: r.technicianName,
        reportNumber: r.reportNumber,
        serviceType: r.serviceType as RadiologyServiceType,
        examination: r.examination,
        status: r.status as RadiologyReportStatus,
        clinicalFindings: r.clinicalFindings,
        impression: r.impression,
        recommendation: r.recommendation,
        technicianNotes: r.technicianNotes,
        reportDate: r.reportDate,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    } else {
      return mockRadiologyReports.filter((r) => r.visitId === visitId);
    }
  }

  // 4. Get Report By Radiology Order ID
  public static async getReportByOrderId(radiologyOrderId: string): Promise<RadiologyReportResponseDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [r] = await db
        .select()
        .from(radiologyReports)
        .where(eq(radiologyReports.radiologyOrderId, radiologyOrderId))
        .limit(1);

      if (!r) return null;

      return {
        id: r.id,
        radiologyOrderId: r.radiologyOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        technicianId: r.technicianId,
        technicianName: r.technicianName,
        reportNumber: r.reportNumber,
        serviceType: r.serviceType as RadiologyServiceType,
        examination: r.examination,
        status: r.status as RadiologyReportStatus,
        clinicalFindings: r.clinicalFindings,
        impression: r.impression,
        recommendation: r.recommendation,
        technicianNotes: r.technicianNotes,
        reportDate: r.reportDate,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      return mockRadiologyReports.find((r) => r.radiologyOrderId === radiologyOrderId) || null;
    }
  }
}

export const mockRadiologyReports: RadiologyReportResponseDTO[] = [];
export const mockRadiologyOrdersQueue: RadiologyOrderQueueItemDTO[] = [];
