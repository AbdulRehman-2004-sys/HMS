import { db } from '../../db/connection';
import { eq, desc, ilike } from 'drizzle-orm';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { prescriptions, prescriptionItems } from '../patients/prescriptions.schema';
import { labOrders, radiologyOrders, admissionOrders, operationOrders } from '../orders/orders.schema';
import { labReports, labReportItems } from '../lab/lab.schema';
import { radiologyReports } from '../radiology/radiology.schema';
import { patientAdmissions } from '../admissions/admissions.schema';
import { patientOperations } from '../operations/operations.schema';
import { invoices, invoiceItems } from '../billing/billing.schema';

import {
  PatientSummaryDTO,
  VisitInfoDTO,
  PrescriptionHistoryDTO,
  LabHistoryDTO,
  RadiologyHistoryDTO,
  AdmissionHistoryDTO,
  OperationHistoryDTO,
  BillingHistoryDTO,
  VisitEncounterHistoryDTO,
  CompletePatientHistoryDTO,
  PrescriptionItemDTO,
  LabOrderItemDTO,
  LabReportItemDTO,
  RadiologyOrderItemDTO,
  RadiologyReportItemDTO,
  InvoiceLineItemDTO,
} from './history.types';

import { mockPatients } from '../patients/patients.repository';
import { mockVisits } from '../visits/visits.repository';
import { mockPrescriptions } from '../prescriptions/prescriptions.repository';
import { mockLabOrders, mockRadiologyOrders, mockAdmissionOrders, mockOperationOrders } from '../orders/orders.repository';
import { mockLabReports } from '../lab/lab.repository';
import { mockRadiologyReports } from '../radiology/radiology.repository';
import { mockAdmissions } from '../admissions/admissions.repository';
import { mockOperations } from '../operations/operations.repository';
import { mockInvoices } from '../billing/billing.repository';

export class HistoryRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  // 1. Find Patient Summary by MR Number
  public static async getPatientByMrNumber(mrNumber: string): Promise<PatientSummaryDTO | null> {
    const isDb = this.checkDb();
    const cleanMr = mrNumber.trim();

    if (isDb) {
      const [pat] = await db
        .select()
        .from(patients)
        .where(ilike(patients.mrNumber, cleanMr))
        .limit(1);

      if (!pat) return null;

      return {
        id: pat.id,
        mrNumber: pat.mrNumber,
        firstName: pat.firstName,
        lastName: pat.lastName,
        fullName: `${pat.firstName} ${pat.lastName}`,
        fatherHusbandName: pat.fatherHusbandName,
        age: pat.age ?? null,
        gender: pat.gender,
        mobileNumber: pat.mobileNumber,
        bloodGroup: pat.bloodGroup ?? null,
        cnic: pat.cnic ?? null,
        allergies: pat.allergies ?? null,
        chronicDiseases: pat.chronicDiseases ?? null,
        city: pat.city,
      };
    } else {
      const pat = mockPatients.find((p: any) => p.mrNumber.toLowerCase() === cleanMr.toLowerCase());
      if (!pat) return null;

      return {
        id: pat.id,
        mrNumber: pat.mrNumber,
        firstName: pat.firstName,
        lastName: pat.lastName,
        fullName: `${pat.firstName} ${pat.lastName}`,
        fatherHusbandName: pat.fatherHusbandName,
        age: pat.age ?? null,
        gender: pat.gender,
        mobileNumber: pat.mobileNumber,
        bloodGroup: pat.bloodGroup ?? null,
        cnic: pat.cnic ?? null,
        allergies: pat.allergies ?? null,
        chronicDiseases: pat.chronicDiseases ?? null,
        city: pat.city,
      };
    }
  }

  // 2. Get Patient Summary by Patient ID
  public static async getPatientSummary(patientId: string): Promise<PatientSummaryDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [pat] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);

      if (!pat) return null;

      return {
        id: pat.id,
        mrNumber: pat.mrNumber,
        firstName: pat.firstName,
        lastName: pat.lastName,
        fullName: `${pat.firstName} ${pat.lastName}`,
        fatherHusbandName: pat.fatherHusbandName,
        age: pat.age ?? null,
        gender: pat.gender,
        mobileNumber: pat.mobileNumber,
        bloodGroup: pat.bloodGroup ?? null,
        cnic: pat.cnic ?? null,
        allergies: pat.allergies ?? null,
        chronicDiseases: pat.chronicDiseases ?? null,
        city: pat.city,
      };
    } else {
      const pat = mockPatients.find((p: any) => p.id === patientId);
      if (!pat) return null;

      return {
        id: pat.id,
        mrNumber: pat.mrNumber,
        firstName: pat.firstName,
        lastName: pat.lastName,
        fullName: `${pat.firstName} ${pat.lastName}`,
        fatherHusbandName: pat.fatherHusbandName,
        age: pat.age ?? null,
        gender: pat.gender,
        mobileNumber: pat.mobileNumber,
        bloodGroup: pat.bloodGroup ?? null,
        cnic: pat.cnic ?? null,
        allergies: pat.allergies ?? null,
        chronicDiseases: pat.chronicDiseases ?? null,
        city: pat.city,
      };
    }
  }

  // 3. Get Complete Visit Encounter Details for a Visit
  public static async getVisitEncounter(
    visitId: string,
    roleScope: 'FULL' | 'LAB_ONLY' | 'RAD_ONLY' = 'FULL'
  ): Promise<VisitEncounterHistoryDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [vInfo] = await db
        .select({
          visitId: patientVisits.id,
          visitNumber: patientVisits.visitNumber,
          visitDate: patientVisits.visitDate,
          status: patientVisits.status,
          tokenNumber: patientVisits.tokenNumber,
          doctorId: patientVisits.doctorId,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          doctorSpecialization: doctors.specialization,
          chiefComplaint: patientVisits.chiefComplaint,
          temperature: patientVisits.temperature,
          pulse: patientVisits.pulse,
          bloodPressure: patientVisits.bloodPressure,
          weight: patientVisits.weight,
          clinicalNotes: patientVisits.clinicalNotes,
        })
        .from(patientVisits)
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(eq(patientVisits.id, visitId))
        .limit(1);

      if (!vInfo) return null;

      // 1. Prescription
      let prescriptionDTO: PrescriptionHistoryDTO | null = null;
      if (roleScope === 'FULL') {
        const [rx] = await db
          .select()
          .from(prescriptions)
          .where(eq(prescriptions.visitId, visitId))
          .limit(1);

        if (rx) {
          const items = await db
            .select()
            .from(prescriptionItems)
            .where(eq(prescriptionItems.prescriptionId, rx.id));

          prescriptionDTO = {
            prescriptionId: rx.id,
            prescriptionNumber: rx.prescriptionNumber,
            diagnosis: rx.diagnosis ?? null,
            advice: rx.advice ?? null,
            followUpDate: rx.followUpDate ?? null,
            status: rx.status,
            createdAt: rx.createdAt,
            items: items.map((i) => ({
              id: i.id,
              medicineName: i.medicineName,
              dosage: i.dosage,
              frequency: i.frequency,
              duration: i.duration,
              instructions: i.instructions ?? null,
            })),
          };
        }
      }

      // 2. Laboratory
      let labDTO: LabHistoryDTO | null = null;
      if (roleScope === 'FULL' || roleScope === 'LAB_ONLY') {
        const lOrders = await db
          .select()
          .from(labOrders)
          .where(eq(labOrders.visitId, visitId));

        const lReports = await db
          .select()
          .from(labReports)
          .where(eq(labReports.visitId, visitId));

        const reportsList: LabReportItemDTO[] = [];
        for (const rep of lReports) {
          const pItems = await db
            .select()
            .from(labReportItems)
            .where(eq(labReportItems.reportId, rep.id));

          reportsList.push({
            id: rep.id,
            reportNumber: rep.reportNumber,
            technicianName: rep.technicianName,
            status: rep.status,
            overallRemarks: rep.overallRemarks ?? null,
            technicianNotes: rep.technicianNotes ?? null,
            resultDate: rep.resultDate,
            items: pItems.map((p) => ({
              id: p.id,
              parameterName: p.parameterName,
              resultValue: p.resultValue,
              unit: p.unit ?? null,
              referenceRange: p.referenceRange ?? null,
              isAbnormal: p.isAbnormal,
              remarks: p.remarks ?? null,
            })),
          });
        }

        if (lOrders.length > 0 || reportsList.length > 0) {
          labDTO = {
            orders: lOrders.map((o): LabOrderItemDTO => ({
              id: o.id,
              testName: o.testName,
              category: o.category,
              urgency: o.urgency,
              clinicalNotes: o.clinicalNotes ?? null,
              status: o.status,
              createdAt: o.createdAt,
            })),
            reports: reportsList,
          };
        }
      }

      // 3. Radiology
      let radDTO: RadiologyHistoryDTO | null = null;
      if (roleScope === 'FULL' || roleScope === 'RAD_ONLY') {
        const rOrders = await db
          .select()
          .from(radiologyOrders)
          .where(eq(radiologyOrders.visitId, visitId));

        const rReports = await db
          .select()
          .from(radiologyReports)
          .where(eq(radiologyReports.visitId, visitId));

        if (rOrders.length > 0 || rReports.length > 0) {
          radDTO = {
            orders: rOrders.map((o): RadiologyOrderItemDTO => ({
              id: o.id,
              modality: o.modality,
              procedureName: o.procedureName,
              bodyPart: o.bodyPart ?? null,
              urgency: o.urgency,
              clinicalNotes: o.clinicalNotes ?? null,
              status: o.status,
              createdAt: o.createdAt,
            })),
            reports: rReports.map((r): RadiologyReportItemDTO => ({
              id: r.id,
              reportNumber: r.reportNumber,
              serviceType: r.serviceType,
              examination: r.examination,
              status: r.status,
              clinicalFindings: r.clinicalFindings,
              impression: r.impression,
              recommendation: r.recommendation ?? null,
              technicianNotes: r.technicianNotes ?? null,
              technicianName: r.technicianName,
              reportDate: r.reportDate,
            })),
          };
        }
      }

      // 4. Admission
      let admDTO: AdmissionHistoryDTO | null = null;
      if (roleScope === 'FULL') {
        const [aOrder] = await db
          .select()
          .from(admissionOrders)
          .where(eq(admissionOrders.visitId, visitId))
          .limit(1);

        const [aAdm] = await db
          .select()
          .from(patientAdmissions)
          .where(eq(patientAdmissions.visitId, visitId))
          .limit(1);

        if (aOrder || aAdm) {
          admDTO = {
            orderId: aOrder?.id ?? null,
            admissionType: aOrder?.admissionType ?? null,
            priority: aOrder?.priority ?? null,
            recommendedWard: aOrder?.recommendedWard ?? null,
            provisionalDiagnosis: aOrder?.provisionalDiagnosis ?? null,
            admissionId: aAdm?.id ?? null,
            admissionNumber: aAdm?.admissionNumber ?? null,
            roomName: aAdm?.roomName ?? null,
            roomCharges: aAdm ? Number(aAdm.roomCharges) : null,
            status: aAdm?.status ?? aOrder?.status ?? null,
            notes: aAdm?.notes ?? null,
            admissionDate: aAdm?.admissionDate ?? null,
            dischargeDate: aAdm?.dischargeDate ?? null,
            admittedByName: aAdm?.admittedByName ?? null,
            dischargedByName: aAdm?.dischargedByName ?? null,
          };
        }
      }

      // 5. Operation
      let optDTO: OperationHistoryDTO | null = null;
      if (roleScope === 'FULL') {
        const [oOrder] = await db
          .select()
          .from(operationOrders)
          .where(eq(operationOrders.visitId, visitId))
          .limit(1);

        const [oOpt] = await db
          .select()
          .from(patientOperations)
          .where(eq(patientOperations.visitId, visitId))
          .limit(1);

        if (oOrder || oOpt) {
          optDTO = {
            orderId: oOrder?.id ?? null,
            proposedProcedure: oOrder?.procedureName ?? null,
            proposedDate: oOrder?.proposedDate ?? null,
            anesthesiaType: oOrder?.anesthesiaType ?? null,
            operationId: oOpt?.id ?? null,
            operationNumber: oOpt?.operationNumber ?? null,
            operationName: oOpt?.operationName ?? oOrder?.procedureName ?? null,
            operationCharges: oOpt ? Number(oOpt.operationCharges) : null,
            urgency: oOpt?.urgency ?? oOrder?.urgency ?? null,
            status: oOpt?.status ?? oOrder?.status ?? null,
            notes: oOpt?.notes ?? null,
            operationDate: oOpt?.operationDate ?? null,
            doctorName: oOpt?.doctorName ?? `${vInfo.doctorFirstName} ${vInfo.doctorLastName}`,
          };
        }
      }

      // 6. Billing
      let billDTO: BillingHistoryDTO | null = null;
      if (roleScope === 'FULL') {
        const [inv] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.visitId, visitId))
          .limit(1);

        if (inv) {
          const invLineItems = await db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, inv.id));

          billDTO = {
            invoiceId: inv.id,
            billNumber: inv.billNumber,
            subtotal: Number(inv.subtotal),
            totalAmount: Number(inv.totalAmount),
            paidAmount: Number(inv.paidAmount),
            remainingAmount: Number(inv.remainingAmount),
            paymentStatus: inv.paymentStatus,
            paymentMethod: inv.paymentMethod ?? null,
            paymentDate: inv.paymentDate ?? null,
            receptionistName: inv.receptionistName ?? null,
            items: invLineItems.map((i): InvoiceLineItemDTO => ({
              id: i.id,
              serviceCategory: i.serviceCategory,
              itemDescription: i.itemDescription,
              unitPrice: Number(i.unitPrice),
              quantity: i.quantity,
              totalPrice: Number(i.totalPrice),
            })),
          };
        }
      }

      const visitInfoDTO: VisitInfoDTO = {
        visitId: vInfo.visitId,
        visitNumber: vInfo.visitNumber,
        visitDate: vInfo.visitDate,
        status: vInfo.status,
        tokenNumber: vInfo.tokenNumber,
        doctorId: vInfo.doctorId,
        doctorName: `${vInfo.doctorFirstName} ${vInfo.doctorLastName}`,
        doctorDepartment: vInfo.doctorSpecialization || 'General Medicine',
        chiefComplaint: vInfo.chiefComplaint ?? null,
        temperature: vInfo.temperature ?? null,
        pulse: vInfo.pulse ?? null,
        bloodPressure: vInfo.bloodPressure ?? null,
        weight: vInfo.weight ?? null,
        clinicalNotes: vInfo.clinicalNotes ?? null,
        diagnosis: prescriptionDTO?.diagnosis ?? null,
      };

      return {
        visit: visitInfoDTO,
        prescription: prescriptionDTO,
        laboratory: labDTO,
        radiology: radDTO,
        admission: admDTO,
        operation: optDTO,
        billing: billDTO,
      };
    } else {
      // Mock Fallback
      const v = mockVisits.find((pv: any) => pv.id === visitId);
      if (!v) return null;

      const rx = mockPrescriptions.find((r: any) => r.visitId === visitId);
      const rxItems = rx && (rx as any).items ? (rx as any).items : [];

      const lOrds = mockLabOrders.filter((l: any) => l.visitId === visitId);
      const lReps = mockLabReports.filter((l: any) => l.visitId === visitId);

      const rOrds = mockRadiologyOrders.filter((r: any) => r.visitId === visitId);
      const rReps = mockRadiologyReports.filter((r: any) => r.visitId === visitId);

      const aOrd = mockAdmissionOrders.find((a: any) => a.visitId === visitId);
      const aAdm = mockAdmissions.find((a: any) => a.visitId === visitId);

      const oOrd = mockOperationOrders.find((o: any) => o.visitId === visitId);
      const oOpt = mockOperations.find((o: any) => o.visitId === visitId);

      const inv = mockInvoices.find((i: any) => i.visitId === visitId);

      const visitInfoDTO: VisitInfoDTO = {
        visitId: v.id,
        visitNumber: v.visitNumber,
        visitDate: v.visitDate,
        status: v.status,
        tokenNumber: v.tokenNumber,
        doctorId: v.doctorId,
        doctorName: v.doctorName || 'Dr. Zafar Iqbal',
        doctorDepartment: v.doctorSpecialization || 'Cardiology',
        chiefComplaint: v.chiefComplaint ?? 'Chest pain and fatigue',
        temperature: v.temperature ?? '98.6 °F',
        pulse: v.pulse ?? '72 bpm',
        bloodPressure: v.bloodPressure ?? '120/80 mmHg',
        weight: v.weight ?? '70 kg',
        clinicalNotes: v.clinicalNotes ?? 'Patient stable.',
        diagnosis: rx?.diagnosis ?? 'Essential Hypertension',
      };

      return {
        visit: visitInfoDTO,
        prescription: (roleScope === 'FULL' && rx) ? {
          prescriptionId: rx.id,
          prescriptionNumber: rx.prescriptionNumber,
          diagnosis: rx.diagnosis ?? 'General checkup',
          advice: rx.advice ?? 'Drink plenty of water.',
          followUpDate: rx.followUpDate ?? null,
          status: rx.status,
          createdAt: rx.createdAt,
          items: rxItems.map((i: any): PrescriptionItemDTO => ({
            id: i.id,
            medicineName: i.medicineName,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions ?? null,
          })),
        } : null,
        laboratory: (roleScope === 'FULL' || roleScope === 'LAB_ONLY') ? {
          orders: lOrds.map((o: any): LabOrderItemDTO => ({
            id: o.id,
            testName: o.testName,
            category: o.category,
            urgency: o.urgency,
            clinicalNotes: o.clinicalNotes ?? null,
            status: o.status,
            createdAt: o.createdAt,
          })),
          reports: lReps.map((r: any): LabReportItemDTO => {
            const pItems = (r as any).items || [];
            return {
              id: r.id,
              reportNumber: r.reportNumber,
              technicianName: r.technicianName,
              status: r.status,
              overallRemarks: r.overallRemarks ?? null,
              technicianNotes: r.technicianNotes ?? null,
              resultDate: r.resultDate,
              items: pItems.map((p: any) => ({
                id: p.id,
                parameterName: p.parameterName,
                resultValue: p.resultValue,
                unit: p.unit ?? null,
                referenceRange: p.referenceRange ?? null,
                isAbnormal: p.isAbnormal,
                remarks: p.remarks ?? null,
              })),
            };
          }),
        } : null,
        radiology: (roleScope === 'FULL' || roleScope === 'RAD_ONLY') ? {
          orders: rOrds.map((o: any): RadiologyOrderItemDTO => ({
            id: o.id,
            modality: o.modality,
            procedureName: o.procedureName,
            bodyPart: o.bodyPart ?? null,
            urgency: o.urgency,
            clinicalNotes: o.clinicalNotes ?? null,
            status: o.status,
            createdAt: o.createdAt,
          })),
          reports: rReps.map((r: any): RadiologyReportItemDTO => ({
            id: r.id,
            reportNumber: r.reportNumber,
            serviceType: r.serviceType,
            examination: r.examination,
            status: r.status,
            clinicalFindings: r.clinicalFindings,
            impression: r.impression,
            recommendation: r.recommendation ?? null,
            technicianNotes: r.technicianNotes ?? null,
            technicianName: r.technicianName,
            reportDate: r.reportDate,
          })),
        } : null,
        admission: (roleScope === 'FULL' && (aOrd || aAdm)) ? {
          orderId: aOrd?.id ?? null,
          admissionType: aOrd?.admissionType ?? null,
          priority: aOrd?.priority ?? null,
          recommendedWard: aOrd?.recommendedWard ?? null,
          provisionalDiagnosis: aOrd?.provisionalDiagnosis ?? null,
          admissionId: aAdm?.id ?? null,
          admissionNumber: aAdm?.admissionNumber ?? null,
          roomName: aAdm?.roomName ?? null,
          roomCharges: aAdm ? Number(aAdm.roomCharges) : null,
          status: aAdm?.status ?? aOrd?.status ?? null,
          notes: aAdm?.notes ?? null,
          admissionDate: aAdm?.admissionDate ?? null,
          dischargeDate: aAdm?.dischargeDate ?? null,
          admittedByName: aAdm?.admittedByName ?? null,
          dischargedByName: aAdm?.dischargedByName ?? null,
        } : null,
        operation: (roleScope === 'FULL' && (oOrd || oOpt)) ? {
          orderId: oOrd?.id ?? null,
          proposedProcedure: oOrd?.procedureName ?? null,
          proposedDate: oOrd?.proposedDate ?? null,
          anesthesiaType: oOrd?.anesthesiaType ?? null,
          operationId: oOpt?.id ?? null,
          operationNumber: oOpt?.operationNumber ?? null,
          operationName: oOpt?.operationName ?? oOrd?.procedureName ?? null,
          operationCharges: oOpt ? Number(oOpt.operationCharges) : null,
          urgency: oOpt?.urgency ?? oOrd?.urgency ?? null,
          status: oOpt?.status ?? oOrd?.status ?? null,
          notes: oOpt?.notes ?? null,
          operationDate: oOpt?.operationDate ?? null,
          doctorName: oOpt?.doctorName ?? 'Dr. Zafar Iqbal',
        } : null,
        billing: (roleScope === 'FULL' && inv) ? {
          invoiceId: inv.id,
          billNumber: inv.billNumber,
          subtotal: inv.subtotal,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          remainingAmount: inv.remainingAmount,
          paymentStatus: inv.paymentStatus,
          paymentMethod: inv.paymentMethod ?? null,
          paymentDate: inv.paymentDate ?? null,
          receptionistName: inv.receptionistName ?? null,
          items: (inv.items || []).map((i: any): InvoiceLineItemDTO => ({
            id: i.id,
            serviceCategory: i.serviceCategory,
            itemDescription: i.itemDescription,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          })),
        } : null,
      };
    }
  }

  // 4. Get Complete Patient History Timeline
  public static async getCompletePatientHistory(
    patientId: string,
    roleScope: 'FULL' | 'LAB_ONLY' | 'RAD_ONLY' = 'FULL'
  ): Promise<CompletePatientHistoryDTO | null> {
    const isDb = this.checkDb();
    const patientSummary = await this.getPatientSummary(patientId);

    if (!patientSummary) return null;

    let visitIds: string[] = [];

    if (isDb) {
      const visitsList = await db
        .select({ id: patientVisits.id })
        .from(patientVisits)
        .where(eq(patientVisits.patientId, patientId))
        .orderBy(desc(patientVisits.visitDate));

      visitIds = visitsList.map((v) => v.id);
    } else {
      const visitsList = mockVisits
        .filter((v: any) => v.patientId === patientId)
        .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

      visitIds = visitsList.map((v: any) => v.id);
    }

    const visitsHistory: VisitEncounterHistoryDTO[] = [];
    for (const vId of visitIds) {
      const vEnc = await this.getVisitEncounter(vId, roleScope);
      if (vEnc) {
        visitsHistory.push(vEnc);
      }
    }

    return {
      patient: patientSummary,
      roleScope,
      visits: visitsHistory,
    };
  }
}
