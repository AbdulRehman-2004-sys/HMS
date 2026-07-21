import { db } from '../../db/connection';
import { labReports, labReportItems } from './lab.schema';
import { labOrders } from '../orders/orders.schema';
import { patientVisits, patients } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';

import {
  LabOrderQueueItemDTO,
  LabQueueSummaryDTO,
  LabReportResponseDTO,
  LabReportStatus,
  SaveLabReportDTO,
} from './lab.types';

export class LabRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateReportNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ reportNumber: labReports.reportNumber })
        .from(labReports)
        .orderBy(desc(labReports.createdAt))
        .limit(1);

      if (!latest || !latest.reportNumber) {
        return `LR-${todayStr}-0001`;
      }

      const parts = latest.reportNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `LR-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockLabReports.length + 1;
      return `LR-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  // 1. Get Lab Queue with Metrics & Patient Info
  public static async getLabQueue(statusFilter?: string, search?: string): Promise<LabQueueSummaryDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const conditions = [];
      if (statusFilter && statusFilter !== 'ALL') {
        conditions.push(eq(labOrders.status, statusFilter));
      }

      if (search && search.trim().length > 0) {
        const q = `%${search.trim()}%`;
        conditions.push(
          or(
            ilike(patients.firstName, q),
            ilike(patients.lastName, q),
            ilike(patients.mrNumber, q),
            ilike(labOrders.testName, q)
          )
        );
      }

      const rows = await db
        .select({
          id: labOrders.id,
          visitId: labOrders.visitId,
          patientId: labOrders.patientId,
          doctorId: labOrders.doctorId,
          testName: labOrders.testName,
          category: labOrders.category,
          urgency: labOrders.urgency,
          clinicalNotes: labOrders.clinicalNotes,
          status: labOrders.status,
          createdAt: labOrders.createdAt,
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
        .from(labOrders)
        .innerJoin(patientVisits, eq(labOrders.visitId, patientVisits.id))
        .innerJoin(patients, eq(labOrders.patientId, patients.id))
        .innerJoin(doctors, eq(labOrders.doctorId, doctors.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(labOrders.createdAt));

      // Calculate Metrics
      const [pendingRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(labOrders)
        .where(eq(labOrders.status, 'PENDING'));

      const [inProgressRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(labOrders)
        .where(eq(labOrders.status, 'IN_PROGRESS'));

      const [completedTodayRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(labOrders)
        .where(eq(labOrders.status, 'COMPLETED'));

      const orders: LabOrderQueueItemDTO[] = rows.map((r) => ({
        id: r.id,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        testName: r.testName,
        category: r.category,
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
      let filtered = mockLabOrdersQueue;
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (search && search.trim().length > 0) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.patientName.toLowerCase().includes(q) ||
            o.patientMrNumber.toLowerCase().includes(q) ||
            o.testName.toLowerCase().includes(q)
        );
      }

      return {
        pendingCount: mockLabOrdersQueue.filter((o) => o.status === 'PENDING').length,
        inProgressCount: mockLabOrdersQueue.filter((o) => o.status === 'IN_PROGRESS').length,
        completedTodayCount: mockLabOrdersQueue.filter((o) => o.status === 'COMPLETED').length,
        orders: filtered,
      };
    }
  }

  // 2. Save or Finalize Lab Report
  public static async saveLabReport(
    data: SaveLabReportDTO,
    technicianId: string,
    technicianName: string
  ): Promise<LabReportResponseDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      // Check if report already exists for this order
      const [existingReport] = await db
        .select()
        .from(labReports)
        .where(eq(labReports.labOrderId, data.labOrderId))
        .limit(1);

      let reportId: string;
      let reportNumber: string;

      if (existingReport) {
        reportId = existingReport.id;
        reportNumber = existingReport.reportNumber;

        await db
          .update(labReports)
          .set({
            status: data.status,
            technicianId,
            technicianName,
            overallRemarks: data.overallRemarks || null,
            technicianNotes: data.technicianNotes || null,
            resultDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(labReports.id, reportId));

        // Delete existing items to re-insert updated parameter rows
        await db.delete(labReportItems).where(eq(labReportItems.reportId, reportId));
      } else {
        reportNumber = await this.generateReportNumber();
        const [inserted] = await db
          .insert(labReports)
          .values({
            labOrderId: data.labOrderId,
            visitId: data.visitId,
            patientId: data.patientId,
            technicianId,
            technicianName,
            reportNumber,
            status: data.status,
            overallRemarks: data.overallRemarks || null,
            technicianNotes: data.technicianNotes || null,
            resultDate: new Date(),
          })
          .returning();

        reportId = inserted.id;
      }

      // Insert Report Items
      const itemsToInsert = data.items.map((it, idx) => ({
        reportId,
        parameterName: it.parameterName,
        resultValue: it.resultValue,
        unit: it.unit || null,
        referenceRange: it.referenceRange || null,
        isAbnormal: it.isAbnormal || false,
        remarks: it.remarks || null,
        sequence: idx + 1,
      }));

      const insertedItems = await db.insert(labReportItems).values(itemsToInsert).returning();

      // Update parent lab_order status (PENDING -> IN_PROGRESS or COMPLETED)
      const orderNewStatus = data.status === LabReportStatus.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS';
      await db.update(labOrders).set({ status: orderNewStatus, updatedAt: new Date() }).where(eq(labOrders.id, data.labOrderId));

      return {
        id: reportId,
        labOrderId: data.labOrderId,
        visitId: data.visitId,
        patientId: data.patientId,
        technicianId,
        technicianName,
        reportNumber,
        status: data.status,
        overallRemarks: data.overallRemarks || null,
        technicianNotes: data.technicianNotes || null,
        resultDate: new Date(),
        items: insertedItems.map((i) => ({
          id: i.id,
          parameterName: i.parameterName,
          resultValue: i.resultValue,
          unit: i.unit,
          referenceRange: i.referenceRange,
          isAbnormal: i.isAbnormal,
          remarks: i.remarks,
          sequence: i.sequence,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      let report = mockLabReports.find((r) => r.labOrderId === data.labOrderId);
      if (report) {
        report.status = data.status;
        report.overallRemarks = data.overallRemarks || null;
        report.technicianNotes = data.technicianNotes || null;
        report.items = data.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          parameterName: it.parameterName,
          resultValue: it.resultValue,
          unit: it.unit || null,
          referenceRange: it.referenceRange || null,
          isAbnormal: it.isAbnormal || false,
          remarks: it.remarks || null,
          sequence: idx + 1,
        }));
      } else {
        const reportNumber = await this.generateReportNumber();
        report = {
          id: `lr-${Date.now()}`,
          labOrderId: data.labOrderId,
          visitId: data.visitId,
          patientId: data.patientId,
          technicianId,
          technicianName,
          reportNumber,
          status: data.status,
          overallRemarks: data.overallRemarks || null,
          technicianNotes: data.technicianNotes || null,
          resultDate: new Date(),
          items: data.items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            parameterName: it.parameterName,
            resultValue: it.resultValue,
            unit: it.unit || null,
            referenceRange: it.referenceRange || null,
            isAbnormal: it.isAbnormal || false,
            remarks: it.remarks || null,
            sequence: idx + 1,
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockLabReports.push(report);
      }

      // Update mock order queue status
      const mockOrder = mockLabOrdersQueue.find((o) => o.id === data.labOrderId);
      if (mockOrder) {
        mockOrder.status = data.status === LabReportStatus.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS';
      }

      return report;
    }
  }

  // 3. Get Lab Reports By Visit ID (For Doctor EMR View)
  public static async getLabReportsByVisit(visitId: string): Promise<LabReportResponseDTO[]> {
    const isDb = this.checkDb();
    if (isDb) {
      const reports = await db
        .select()
        .from(labReports)
        .where(eq(labReports.visitId, visitId))
        .orderBy(desc(labReports.createdAt));

      const result: LabReportResponseDTO[] = [];
      for (const r of reports) {
        const items = await db
          .select()
          .from(labReportItems)
          .where(eq(labReportItems.reportId, r.id))
          .orderBy(labReportItems.sequence);

        result.push({
          id: r.id,
          labOrderId: r.labOrderId,
          visitId: r.visitId,
          patientId: r.patientId,
          technicianId: r.technicianId,
          technicianName: r.technicianName,
          reportNumber: r.reportNumber,
          status: r.status as LabReportStatus,
          overallRemarks: r.overallRemarks,
          technicianNotes: r.technicianNotes,
          resultDate: r.resultDate,
          items: items.map((i) => ({
            id: i.id,
            parameterName: i.parameterName,
            resultValue: i.resultValue,
            unit: i.unit,
            referenceRange: i.referenceRange,
            isAbnormal: i.isAbnormal,
            remarks: i.remarks,
            sequence: i.sequence,
          })),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }

      return result;
    } else {
      return mockLabReports.filter((r) => r.visitId === visitId);
    }
  }

  // 4. Get Report By Lab Order ID
  public static async getReportByOrderId(labOrderId: string): Promise<LabReportResponseDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [r] = await db
        .select()
        .from(labReports)
        .where(eq(labReports.labOrderId, labOrderId))
        .limit(1);

      if (!r) return null;

      const items = await db
        .select()
        .from(labReportItems)
        .where(eq(labReportItems.reportId, r.id))
        .orderBy(labReportItems.sequence);

      return {
        id: r.id,
        labOrderId: r.labOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        technicianId: r.technicianId,
        technicianName: r.technicianName,
        reportNumber: r.reportNumber,
        status: r.status as LabReportStatus,
        overallRemarks: r.overallRemarks,
        technicianNotes: r.technicianNotes,
        resultDate: r.resultDate,
        items: items.map((i) => ({
          id: i.id,
          parameterName: i.parameterName,
          resultValue: i.resultValue,
          unit: i.unit,
          referenceRange: i.referenceRange,
          isAbnormal: i.isAbnormal,
          remarks: i.remarks,
          sequence: i.sequence,
        })),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      return mockLabReports.find((r) => r.labOrderId === labOrderId) || null;
    }
  }
}

export const mockLabReports: LabReportResponseDTO[] = [];
export const mockLabOrdersQueue: LabOrderQueueItemDTO[] = [];
