import { db } from '../../db/connection';
import { count, eq, and, gte, desc, ne } from 'drizzle-orm';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { labOrders, radiologyOrders } from '../orders/orders.schema';
import { labReports } from '../lab/lab.schema';
import { radiologyReports } from '../radiology/radiology.schema';
import { patientAdmissions } from '../admissions/admissions.schema';
import { invoices } from '../billing/billing.schema';

import {
  KPICardsDTO,
  WeeklyChartDataDTO,
  RecentActivityDTO,
  DailySeriesItemDTO,
  DailyRevenueSeriesItemDTO,
  DoctorPatientCountItemDTO,
} from './dashboard.types';

import { mockPatients } from '../patients/patients.repository';
import { mockVisits } from '../visits/visits.repository';
import { mockLabOrders, mockRadiologyOrders } from '../orders/orders.repository';
import { mockAdmissions } from '../admissions/admissions.repository';
import { mockInvoices } from '../billing/billing.repository';
import { mockDoctors } from '../doctors/doctors.repository';

export class DashboardRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  private static getStartOfToday(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  // 1. Get KPI Cards Data
  public static async getKPICards(doctorIdFilter?: string): Promise<KPICardsDTO> {
    const isDb = this.checkDb();
    const todayMidnight = this.getStartOfToday();

    if (isDb) {
      // Total Patients
      const [pTot] = await db
        .select({ value: count(patients.id) })
        .from(patients)
        .where(eq(patients.isDeleted, false));

      // Today Patients
      const [pTod] = await db
        .select({ value: count(patients.id) })
        .from(patients)
        .where(and(eq(patients.isDeleted, false), gte(patients.createdAt, todayMidnight)));

      // Revenue
      const allInvoices = await db.select().from(invoices);
      const totalRevenue = allInvoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
      const todayRevenue = allInvoices
        .filter((inv) => inv.paymentDate && new Date(inv.paymentDate) >= todayMidnight)
        .reduce((acc, inv) => acc + Number(inv.paidAmount), 0);

      // Pending Bills
      const pendingBills = allInvoices.filter((inv) => inv.paymentStatus === 'PENDING').length;

      // Today Visits / Appointments
      const [vTod] = await db
        .select({ value: count(patientVisits.id) })
        .from(patientVisits)
        .where(
          doctorIdFilter
            ? and(eq(patientVisits.doctorId, doctorIdFilter), gte(patientVisits.visitDate, todayMidnight))
            : gte(patientVisits.visitDate, todayMidnight)
        );

      // Lab Tests Today
      const [lTod] = await db
        .select({ value: count(labOrders.id) })
        .from(labOrders)
        .where(and(gte(labOrders.createdAt, todayMidnight), ne(labOrders.status, 'CANCELLED')));

      // X-Ray Today
      const [xTod] = await db
        .select({ value: count(radiologyOrders.id) })
        .from(radiologyOrders)
        .where(
          and(
            gte(radiologyOrders.createdAt, todayMidnight),
            eq(radiologyOrders.modality, 'X_RAY'),
            ne(radiologyOrders.status, 'CANCELLED')
          )
        );

      // Ultrasound Today
      const [uTod] = await db
        .select({ value: count(radiologyOrders.id) })
        .from(radiologyOrders)
        .where(
          and(
            gte(radiologyOrders.createdAt, todayMidnight),
            eq(radiologyOrders.modality, 'ULTRASOUND'),
            ne(radiologyOrders.status, 'CANCELLED')
          )
        );

      // Active Admissions
      const [aAct] = await db
        .select({ value: count(patientAdmissions.id) })
        .from(patientAdmissions)
        .where(eq(patientAdmissions.status, 'ADMITTED'));

      // Total Doctors
      const [dTot] = await db
        .select({ value: count(doctors.id) })
        .from(doctors)
        .where(eq(doctors.isActive, true));

      return {
        totalPatients: Number(pTot?.value || 0),
        todayPatients: Number(pTod?.value || 0),
        totalRevenue,
        todayRevenue,
        pendingBills,
        todayAppointments: Number(vTod?.value || 0),
        labTestsToday: Number(lTod?.value || 0),
        xrayToday: Number(xTod?.value || 0),
        ultrasoundToday: Number(uTod?.value || 0),
        activeAdmissions: Number(aAct?.value || 0),
        totalDoctors: Number(dTot?.value || 0),
      };
    } else {
      // Mock Fallback
      return {
        totalPatients: mockPatients.length || 24,
        todayPatients: 6,
        totalRevenue: mockInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0) || 45000,
        todayRevenue: 12500,
        pendingBills: mockInvoices.filter((inv) => inv.paymentStatus === 'PENDING').length || 3,
        todayAppointments: mockVisits.length || 8,
        labTestsToday: mockLabOrders.length || 5,
        xrayToday: mockRadiologyOrders.filter((r: any) => r.modality === 'X_RAY').length || 3,
        ultrasoundToday: mockRadiologyOrders.filter((r: any) => r.modality === 'ULTRASOUND').length || 2,
        activeAdmissions: mockAdmissions.filter((a: any) => a.status === 'ADMITTED').length || 4,
        totalDoctors: mockDoctors.length || 4,
      };
    }
  }

  // 2. Get Weekly Chart Series Data
  public static async getWeeklyCharts(doctorIdFilter?: string): Promise<WeeklyChartDataDTO> {
    const isDb = this.checkDb();
    const days: { dayName: string; dateStr: string; dateObj: Date }[] = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ dayName, dateStr, dateObj: d });
    }

    if (isDb) {
      const patientsSeries: DailySeriesItemDTO[] = [];
      const revenueSeries: DailyRevenueSeriesItemDTO[] = [];
      const labSeries: DailySeriesItemDTO[] = [];

      const allPatients = await db.select().from(patients);
      const allInvoices = await db.select().from(invoices);
      const allLabOrders = await db.select().from(labOrders);

      for (const day of days) {
        const nextDay = new Date(day.dateObj);
        nextDay.setDate(nextDay.getDate() + 1);

        const pCount = allPatients.filter(
          (p) => new Date(p.createdAt) >= day.dateObj && new Date(p.createdAt) < nextDay
        ).length;

        const revAmount = allInvoices
          .filter((inv) => inv.paymentDate && new Date(inv.paymentDate) >= day.dateObj && new Date(inv.paymentDate) < nextDay)
          .reduce((acc, inv) => acc + Number(inv.paidAmount), 0);

        const lCount = allLabOrders.filter(
          (l) => new Date(l.createdAt) >= day.dateObj && new Date(l.createdAt) < nextDay
        ).length;

        patientsSeries.push({ day: day.dayName, dateStr: day.dateStr, count: pCount });
        revenueSeries.push({ day: day.dayName, dateStr: day.dateStr, amount: revAmount });
        labSeries.push({ day: day.dayName, dateStr: day.dateStr, count: lCount });
      }

      // Doctor-wise patient count
      const doctorList = await db.select().from(doctors);
      const doctorPatientCounts: DoctorPatientCountItemDTO[] = [];

      for (const doc of doctorList) {
        if (doctorIdFilter && doc.id !== doctorIdFilter) continue;

        const visits = await db
          .select({ id: patientVisits.id })
          .from(patientVisits)
          .where(eq(patientVisits.doctorId, doc.id));

        doctorPatientCounts.push({
          doctorId: doc.id,
          doctorName: `${doc.firstName} ${doc.lastName}`,
          specialization: doc.specialization,
          count: visits.length,
        });
      }

      return {
        patientsThisWeek: patientsSeries,
        revenueThisWeek: revenueSeries,
        labTestsThisWeek: labSeries,
        doctorPatientCount: doctorPatientCounts,
      };
    } else {
      // Mock Fallback
      return {
        patientsThisWeek: days.map((d, idx) => ({ day: d.dayName, dateStr: d.dateStr, count: (idx + 1) * 3 + 2 })),
        revenueThisWeek: days.map((d, idx) => ({ day: d.dayName, dateStr: d.dateStr, amount: (idx + 1) * 4500 + 3000 })),
        labTestsThisWeek: days.map((d, idx) => ({ day: d.dayName, dateStr: d.dateStr, count: (idx % 3) + 2 })),
        doctorPatientCount: mockDoctors.map((doc: any) => ({
          doctorId: doc.id,
          doctorName: `${doc.firstName} ${doc.lastName}`,
          specialization: doc.specialization || 'Consultant',
          count: Math.floor(Math.random() * 10) + 5,
        })),
      };
    }
  }

  // 3. Get Top 10 Recent Activities
  public static async getRecentActivities(): Promise<RecentActivityDTO[]> {
    const isDb = this.checkDb();

    const activities: RecentActivityDTO[] = [];

    if (isDb) {
      // New Patient Registrations
      const recentPats = await db
        .select()
        .from(patients)
        .orderBy(desc(patients.createdAt))
        .limit(5);

      recentPats.forEach((p) => {
        activities.push({
          id: `p-${p.id}`,
          timestamp: p.createdAt,
          type: 'PATIENT_REGISTRATION',
          title: 'New Patient Registered',
          details: `${p.firstName} ${p.lastName} (MRN: ${p.mrNumber})`,
          operatorName: 'Receptionist Staff',
        });
      });

      // Lab Reports
      const recentLabs = await db
        .select()
        .from(labReports)
        .orderBy(desc(labReports.resultDate))
        .limit(5);

      recentLabs.forEach((l) => {
        activities.push({
          id: `l-${l.id}`,
          timestamp: l.resultDate,
          type: 'LAB_REPORT',
          title: 'Laboratory Report Released',
          details: `Report #${l.reportNumber} (${l.status})`,
          operatorName: l.technicianName || 'Lab Technician',
        });
      });

      // Radiology Reports
      const recentRads = await db
        .select()
        .from(radiologyReports)
        .orderBy(desc(radiologyReports.reportDate))
        .limit(5);

      recentRads.forEach((r) => {
        activities.push({
          id: `r-${r.id}`,
          timestamp: r.reportDate,
          type: 'RADIOLOGY_REPORT',
          title: `${r.serviceType} Diagnostic Scan Complete`,
          details: `Report #${r.reportNumber} - ${r.examination}`,
          operatorName: r.technicianName || 'Radiologist',
        });
      });

      // Admissions
      const recentAdms = await db
        .select()
        .from(patientAdmissions)
        .orderBy(desc(patientAdmissions.admissionDate))
        .limit(5);

      recentAdms.forEach((a) => {
        activities.push({
          id: `a-${a.id}`,
          timestamp: a.admissionDate,
          type: 'ADMISSION',
          title: 'Patient Room Admission',
          details: `${a.roomName} (Adm #${a.admissionNumber})`,
          operatorName: a.admittedByName || 'Reception Staff',
        });
      });

      // Payments
      const recentInvs = await db
        .select()
        .from(invoices)
        .where(eq(invoices.paymentStatus, 'PAID'))
        .orderBy(desc(invoices.updatedAt))
        .limit(5);

      recentInvs.forEach((inv) => {
        activities.push({
          id: `inv-${inv.id}`,
          timestamp: inv.paymentDate || inv.updatedAt,
          type: 'PAYMENT',
          title: 'Bill Payment Collected',
          details: `Bill #${inv.billNumber} - Rs. ${Number(inv.paidAmount).toLocaleString()}`,
          operatorName: inv.receptionistName || 'Cashier',
        });
      });

      // Sort by timestamp DESC and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } else {
      // Mock Fallback Activities
      const now = new Date();
      return [
        {
          id: 'act-1',
          timestamp: new Date(now.getTime() - 10 * 60000),
          type: 'PATIENT_REGISTRATION',
          title: 'New Patient Registered',
          details: 'Muhammad Ali (MRN: MRN-202607-0001)',
          operatorName: 'Receptionist Staff',
        },
        {
          id: 'act-2',
          timestamp: new Date(now.getTime() - 25 * 60000),
          type: 'PAYMENT',
          title: 'Bill Payment Collected',
          details: 'Bill #INV-20260721-0001 - Rs. 4,000',
          operatorName: 'Cashier Staff',
        },
        {
          id: 'act-3',
          timestamp: new Date(now.getTime() - 40 * 60000),
          type: 'LAB_REPORT',
          title: 'Laboratory Report Released',
          details: 'Report #LR-20260721-0001 (Complete Blood Count)',
          operatorName: 'Lab Technician',
        },
        {
          id: 'act-4',
          timestamp: new Date(now.getTime() - 60 * 60000),
          type: 'RADIOLOGY_REPORT',
          title: 'X-Ray Diagnostic Scan Complete',
          details: 'Report #RR-20260721-0001 - Chest X-Ray PA View',
          operatorName: 'Radiologist Staff',
        },
        {
          id: 'act-5',
          timestamp: new Date(now.getTime() - 90 * 60000),
          type: 'ADMISSION',
          title: 'Patient Room Admission',
          details: 'Private Room 101 (Adm #ADM-20260721-0001)',
          operatorName: 'Reception Staff',
        },
      ];
    }
  }
}
