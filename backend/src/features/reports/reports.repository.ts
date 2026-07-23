import { db } from '../../db/connection';
import { eq, desc } from 'drizzle-orm';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { labReports, labReportItems } from '../lab/lab.schema';
import { radiologyReports } from '../radiology/radiology.schema';
import { patientAdmissions } from '../admissions/admissions.schema';
import { invoices, invoiceItems } from '../billing/billing.schema';

import {
  ReportFilterDTO,
  ReportDataResponseDTO,
  PatientReportRowDTO,
  DoctorReportRowDTO,
  LabReportRowDTO,
  RadiologyReportRowDTO,
  AdmissionReportRowDTO,
  BillingReportRowDTO,
  RevenueReportRowDTO,
  ReportType,
} from './reports.types';

import { mockPatients } from '../patients/patients.repository';
import { mockDoctors } from '../doctors/doctors.repository';
import { mockLabReports } from '../lab/lab.repository';
import { mockRadiologyReports } from '../radiology/radiology.repository';
import { mockAdmissions } from '../admissions/admissions.repository';
import { mockInvoices } from '../billing/billing.repository';
import { mockVisits } from '../visits/visits.repository';

export class ReportsRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  // 1. Patient Report
  public static async getPatientReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: PatientReportRowDTO[] = [];

    if (isDb) {
      const pats = await db
        .select()
        .from(patients)
        .where(eq(patients.isDeleted, false))
        .orderBy(desc(patients.createdAt));

      pats.forEach((p) => {
        if (filters.startDate && new Date(p.createdAt) < new Date(filters.startDate)) return;
        if (filters.endDate && new Date(p.createdAt) > new Date(filters.endDate)) return;

        rows.push({
          id: p.id,
          mrNumber: p.mrNumber,
          fullName: `${p.firstName} ${p.lastName}`,
          age: p.age ?? null,
          gender: p.gender,
          mobileNumber: p.mobileNumber,
          city: p.city,
          createdAt: p.createdAt,
        });
      });
    } else {
      mockPatients.forEach((p: any) => {
        rows.push({
          id: p.id,
          mrNumber: p.mrNumber,
          fullName: `${p.firstName} ${p.lastName}`,
          age: p.age ?? null,
          gender: p.gender,
          mobileNumber: p.mobileNumber,
          city: p.city || 'Rahim Yar Khan',
          createdAt: p.createdAt || new Date(),
        });
      });
    }

    return {
      reportType: 'patient',
      totalRecords: rows.length,
      summaryMetrics: {
        totalPatients: rows.length,
        malePatients: rows.filter((r) => r.gender === 'Male').length,
        femalePatients: rows.filter((r) => r.gender === 'Female').length,
      },
      rows,
    };
  }

  // 2. Doctor Report
  public static async getDoctorReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: DoctorReportRowDTO[] = [];

    if (isDb) {
      const docs = await db.select().from(doctors).where(eq(doctors.isActive, true));

      for (const d of docs) {
        if (filters.doctorId && d.id !== filters.doctorId) continue;
        if (filters.department && !d.specialization.toLowerCase().includes(filters.department.toLowerCase())) continue;

        const visits = await db
          .select({ id: patientVisits.id })
          .from(patientVisits)
          .where(eq(patientVisits.doctorId, d.id));

        const invs = await db
          .select()
          .from(invoices)
          .where(eq(invoices.doctorId, d.id));

        const revenue = invs.reduce((acc, i) => acc + Number(i.paidAmount), 0);

        rows.push({
          id: d.id,
          doctorName: `${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          qualification: d.qualification,
          totalVisits: visits.length,
          totalRevenue: revenue,
        });
      }
    } else {
      mockDoctors.forEach((d: any) => {
        if (filters.doctorId && d.id !== filters.doctorId) return;
        rows.push({
          id: d.id,
          doctorName: `${d.firstName} ${d.lastName}`,
          specialization: d.specialization || 'Consultant',
          qualification: d.qualification || 'MBBS',
          totalVisits: mockVisits.filter((v: any) => v.doctorId === d.id).length || 5,
          totalRevenue: 15000,
        });
      });
    }

    const totalRevenue = rows.reduce((acc, r) => acc + r.totalRevenue, 0);

    return {
      reportType: 'doctor',
      totalRecords: rows.length,
      summaryMetrics: {
        totalDoctors: rows.length,
        totalVisitsHandled: rows.reduce((acc, r) => acc + r.totalVisits, 0),
        totalDoctorRevenue: totalRevenue,
      },
      rows,
    };
  }

  // 3. Laboratory Report
  public static async getLabReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: LabReportRowDTO[] = [];

    if (isDb) {
      const reps = await db
        .select({
          id: labReports.id,
          reportNumber: labReports.reportNumber,
          technicianName: labReports.technicianName,
          status: labReports.status,
          resultDate: labReports.resultDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
        })
        .from(labReports)
        .innerJoin(patients, eq(labReports.patientId, patients.id))
        .orderBy(desc(labReports.resultDate));

      for (const r of reps) {
        if (filters.startDate && new Date(r.resultDate) < new Date(filters.startDate)) continue;
        if (filters.endDate && new Date(r.resultDate) > new Date(filters.endDate)) continue;

        const pItems = await db
          .select({ id: labReportItems.id })
          .from(labReportItems)
          .where(eq(labReportItems.reportId, r.id));

        rows.push({
          id: r.id,
          reportNumber: r.reportNumber,
          patientName: `${r.patientFirstName} ${r.patientLastName}`,
          mrNumber: r.patientMrNumber,
          testCount: pItems.length,
          technicianName: r.technicianName,
          status: r.status,
          resultDate: r.resultDate,
        });
      }
    } else {
      mockLabReports.forEach((r: any) => {
        const p = mockPatients.find((pt: any) => pt.id === r.patientId);

        rows.push({
          id: r.id,
          reportNumber: r.reportNumber,
          patientName: p ? `${p.firstName} ${p.lastName}` : 'Muhammad Ali',
          mrNumber: p ? p.mrNumber : 'MRN-202607-0001',
          testCount: r.items ? r.items.length : 1,
          technicianName: r.technicianName || 'Lab Technician',
          status: r.status,
          resultDate: r.resultDate || new Date(),
        });
      });
    }

    return {
      reportType: 'lab',
      totalRecords: rows.length,
      summaryMetrics: {
        totalReports: rows.length,
        completedReports: rows.filter((r) => r.status === 'COMPLETED').length,
        inProgressReports: rows.filter((r) => r.status === 'IN_PROGRESS').length,
      },
      rows,
    };
  }

  // 4. Radiology Report
  public static async getRadiologyReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: RadiologyReportRowDTO[] = [];

    if (isDb) {
      const reps = await db
        .select({
          id: radiologyReports.id,
          reportNumber: radiologyReports.reportNumber,
          serviceType: radiologyReports.serviceType,
          examination: radiologyReports.examination,
          status: radiologyReports.status,
          reportDate: radiologyReports.reportDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
        })
        .from(radiologyReports)
        .innerJoin(patients, eq(radiologyReports.patientId, patients.id))
        .orderBy(desc(radiologyReports.reportDate));

      for (const r of reps) {
        if (filters.startDate && new Date(r.reportDate) < new Date(filters.startDate)) continue;
        if (filters.endDate && new Date(r.reportDate) > new Date(filters.endDate)) continue;

        rows.push({
          id: r.id,
          reportNumber: r.reportNumber,
          patientName: `${r.patientFirstName} ${r.patientLastName}`,
          mrNumber: r.patientMrNumber,
          serviceType: r.serviceType,
          examination: r.examination,
          status: r.status,
          reportDate: r.reportDate,
        });
      }
    } else {
      mockRadiologyReports.forEach((r: any) => {
        const p = mockPatients.find((pt: any) => pt.id === r.patientId);

        rows.push({
          id: r.id,
          reportNumber: r.reportNumber,
          patientName: p ? `${p.firstName} ${p.lastName}` : 'Muhammad Ali',
          mrNumber: p ? p.mrNumber : 'MRN-202607-0001',
          serviceType: r.serviceType,
          examination: r.examination,
          status: r.status,
          reportDate: r.reportDate || new Date(),
        });
      });
    }

    return {
      reportType: 'radiology',
      totalRecords: rows.length,
      summaryMetrics: {
        totalScans: rows.length,
        xrayScans: rows.filter((r) => r.serviceType === 'XRAY').length,
        ultrasoundScans: rows.filter((r) => r.serviceType === 'ULTRASOUND').length,
      },
      rows,
    };
  }

  // 5. Admission Report
  public static async getAdmissionReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: AdmissionReportRowDTO[] = [];

    if (isDb) {
      const adms = await db
        .select({
          id: patientAdmissions.id,
          admissionNumber: patientAdmissions.admissionNumber,
          roomName: patientAdmissions.roomName,
          roomCharges: patientAdmissions.roomCharges,
          status: patientAdmissions.status,
          admissionDate: patientAdmissions.admissionDate,
          dischargeDate: patientAdmissions.dischargeDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
        })
        .from(patientAdmissions)
        .innerJoin(patients, eq(patientAdmissions.patientId, patients.id))
        .orderBy(desc(patientAdmissions.admissionDate));

      for (const a of adms) {
        if (filters.startDate && new Date(a.admissionDate) < new Date(filters.startDate)) continue;
        if (filters.endDate && new Date(a.admissionDate) > new Date(filters.endDate)) continue;

        rows.push({
          id: a.id,
          admissionNumber: a.admissionNumber,
          patientName: `${a.patientFirstName} ${a.patientLastName}`,
          mrNumber: a.patientMrNumber,
          roomName: a.roomName,
          roomCharges: Number(a.roomCharges),
          status: a.status,
          admissionDate: a.admissionDate,
          dischargeDate: a.dischargeDate ?? null,
        });
      }
    } else {
      mockAdmissions.forEach((a: any) => {
        const p = mockPatients.find((pt: any) => pt.id === a.patientId);

        rows.push({
          id: a.id,
          admissionNumber: a.admissionNumber,
          patientName: p ? `${p.firstName} ${p.lastName}` : 'Muhammad Ali',
          mrNumber: p ? p.mrNumber : 'MRN-202607-0001',
          roomName: a.roomName,
          roomCharges: Number(a.roomCharges) || 5000,
          status: a.status,
          admissionDate: a.admissionDate || new Date(),
          dischargeDate: a.dischargeDate ?? null,
        });
      });
    }

    return {
      reportType: 'admission',
      totalRecords: rows.length,
      summaryMetrics: {
        totalAdmissions: rows.length,
        activeAdmitted: rows.filter((r) => r.status === 'ADMITTED').length,
        discharged: rows.filter((r) => r.status === 'DISCHARGED').length,
      },
      rows,
    };
  }

  // 6. Billing Report
  public static async getBillingReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: BillingReportRowDTO[] = [];

    if (isDb) {
      const invs = await db
        .select({
          id: invoices.id,
          billNumber: invoices.billNumber,
          totalAmount: invoices.totalAmount,
          paidAmount: invoices.paidAmount,
          remainingAmount: invoices.remainingAmount,
          paymentStatus: invoices.paymentStatus,
          paymentMethod: invoices.paymentMethod,
          paymentDate: invoices.paymentDate,
          createdAt: invoices.createdAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
        })
        .from(invoices)
        .innerJoin(patients, eq(invoices.patientId, patients.id))
        .orderBy(desc(invoices.createdAt));

      for (const i of invs) {
        if (filters.startDate && new Date(i.createdAt) < new Date(filters.startDate)) continue;
        if (filters.endDate && new Date(i.createdAt) > new Date(filters.endDate)) continue;

        rows.push({
          id: i.id,
          billNumber: i.billNumber,
          patientName: `${i.patientFirstName} ${i.patientLastName}`,
          mrNumber: i.patientMrNumber,
          totalAmount: Number(i.totalAmount),
          paidAmount: Number(i.paidAmount),
          remainingAmount: Number(i.remainingAmount),
          paymentStatus: i.paymentStatus,
          paymentMethod: i.paymentMethod ?? null,
          paymentDate: i.paymentDate ?? null,
        });
      }
    } else {
      mockInvoices.forEach((i: any) => {
        rows.push({
          id: i.id,
          billNumber: i.billNumber,
          patientName: i.patientName || 'Muhammad Ali',
          mrNumber: i.patientMrNumber || 'MRN-202607-0001',
          totalAmount: i.totalAmount,
          paidAmount: i.paidAmount,
          remainingAmount: i.remainingAmount,
          paymentStatus: i.paymentStatus,
          paymentMethod: i.paymentMethod ?? 'CASH',
          paymentDate: i.paymentDate ?? null,
        });
      });
    }

    const totalBilled = rows.reduce((acc, r) => acc + r.totalAmount, 0);
    const totalCollected = rows.reduce((acc, r) => acc + r.paidAmount, 0);

    return {
      reportType: 'billing',
      totalRecords: rows.length,
      summaryMetrics: {
        totalInvoices: rows.length,
        totalInvoicedAmount: totalBilled,
        totalRevenueCollected: totalCollected,
        pendingCount: rows.filter((r) => r.paymentStatus === 'PENDING').length,
      },
      rows,
    };
  }

  // 7. Revenue Breakdown Report
  public static async getRevenueReport(filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    const isDb = this.checkDb();
    const rows: RevenueReportRowDTO[] = [];

    const daysMap = new Map<string, RevenueReportRowDTO>();

    if (isDb) {
      const invItems = await db
        .select({
          serviceCategory: invoiceItems.serviceCategory,
          totalPrice: invoiceItems.totalPrice,
          createdAt: invoiceItems.createdAt,
        })
        .from(invoiceItems);

      invItems.forEach((item) => {
        const dateStr = new Date(item.createdAt).toISOString().slice(0, 10);
        if (filters.startDate && dateStr < filters.startDate) return;
        if (filters.endDate && dateStr > filters.endDate) return;

        if (!daysMap.has(dateStr)) {
          daysMap.set(dateStr, {
            id: `rev-${dateStr}`,
            dateStr,
            consultationRevenue: 0,
            labRevenue: 0,
            radiologyRevenue: 0,
            admissionRevenue: 0,
            operationRevenue: 0,
            totalDailyRevenue: 0,
          });
        }

        const rec = daysMap.get(dateStr)!;
        const val = Number(item.totalPrice);

        if (item.serviceCategory === 'CONSULTATION') rec.consultationRevenue += val;
        else if (item.serviceCategory === 'LAB') rec.labRevenue += val;
        else if (item.serviceCategory === 'RADIOLOGY') rec.radiologyRevenue += val;
        else if (item.serviceCategory === 'ADMISSION') rec.admissionRevenue += val;
        else if (item.serviceCategory === 'OPERATION') rec.operationRevenue += val;

        rec.totalDailyRevenue += val;
      });

      daysMap.forEach((val) => rows.push(val));
      rows.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      rows.push({
        id: `rev-${todayStr}`,
        dateStr: todayStr,
        consultationRevenue: 15000,
        labRevenue: 8000,
        radiologyRevenue: 5000,
        admissionRevenue: 10000,
        operationRevenue: 20000,
        totalDailyRevenue: 58000,
      });
    }

    const grandTotal = rows.reduce((acc, r) => acc + r.totalDailyRevenue, 0);

    return {
      reportType: 'revenue',
      totalRecords: rows.length,
      summaryMetrics: {
        totalRevenue: grandTotal,
        totalConsultationRevenue: rows.reduce((acc, r) => acc + r.consultationRevenue, 0),
        totalLabRevenue: rows.reduce((acc, r) => acc + r.labRevenue, 0),
        totalRadiologyRevenue: rows.reduce((acc, r) => acc + r.radiologyRevenue, 0),
        totalAdmissionRevenue: rows.reduce((acc, r) => acc + r.admissionRevenue, 0),
        totalOperationRevenue: rows.reduce((acc, r) => acc + r.operationRevenue, 0),
      },
      rows,
    };
  }

  // Unified Dispatcher
  public static async getReportData(reportType: ReportType, filters: ReportFilterDTO): Promise<ReportDataResponseDTO> {
    switch (reportType) {
      case 'patient':
        return this.getPatientReport(filters);
      case 'doctor':
        return this.getDoctorReport(filters);
      case 'lab':
        return this.getLabReport(filters);
      case 'radiology':
        return this.getRadiologyReport(filters);
      case 'admission':
        return this.getAdmissionReport(filters);
      case 'billing':
        return this.getBillingReport(filters);
      case 'revenue':
        return this.getRevenueReport(filters);
      default:
        return this.getPatientReport(filters);
    }
  }
}
