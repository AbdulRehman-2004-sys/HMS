import { db } from '../../db/connection';
import { prescriptions, prescriptionItems } from '../patients/prescriptions.schema';
import { eq, desc } from 'drizzle-orm';
import {
  CreatePrescriptionDTO,
  MedicineOptionDTO,
  PrescriptionResponseDTO,
} from './prescriptions.types';


export const COMMON_HOSPITAL_DRUGS: MedicineOptionDTO[] = [
  { id: 'm-1', name: 'Tab. Panadol Extra 500mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-0-1' },
  { id: 'm-2', name: 'Tab. Augmentin 625mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-0-1' },
  { id: 'm-3', name: 'Syr. Rigix 120ml', category: 'Syrup', defaultDosage: '2 Teaspoons', defaultFrequency: '0-0-1' },
  { id: 'm-4', name: 'Tab. Softin 10mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '0-0-1' },
  { id: 'm-5', name: 'Tab. Brufen 400mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-1-1' },
  { id: 'm-6', name: 'Tab. Gravinate 50mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: 'SOS' },
  { id: 'm-7', name: 'Cap. Risek 20mg', category: 'Capsule', defaultDosage: '1 Capsule', defaultFrequency: '1-0-0 (Before Meal)' },
  { id: 'm-8', name: 'Tab. Flagyl 400mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-1-1' },
  { id: 'm-9', name: 'Tab. Ponstan 500mg', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-0-1' },
  { id: 'm-10', name: 'Syr. Hydryllin 120ml', category: 'Syrup', defaultDosage: '2 Teaspoons', defaultFrequency: '1-1-1' },
  { id: 'm-11', name: 'Tab. Arinac Forte', category: 'Tablet', defaultDosage: '1 Tablet', defaultFrequency: '1-0-1' },
  { id: 'm-12', name: 'Cap. Cefspan 400mg', category: 'Capsule', defaultDosage: '1 Capsule', defaultFrequency: 'Once daily' },
  { id: 'm-13', name: 'Inj. Rocephin 1g', category: 'Injection', defaultDosage: '1 Vial', defaultFrequency: 'Once daily' },
  { id: 'm-14', name: 'Eye Drop Tobradex', category: 'Drop', defaultDosage: '2 Drops', defaultFrequency: '1-1-1' },
];

export class PrescriptionRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generatePrescriptionNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ prescriptionNumber: prescriptions.prescriptionNumber })
        .from(prescriptions)
        .orderBy(desc(prescriptions.createdAt))
        .limit(1);

      if (!latest || !latest.prescriptionNumber) {
        return `RX-${todayStr}-0001`;
      }

      const parts = latest.prescriptionNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `RX-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockPrescriptions.length + 1;
      return `RX-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  public static async create(data: CreatePrescriptionDTO): Promise<PrescriptionResponseDTO> {
    const isDb = this.checkDb();
    const prescriptionNumber = await this.generatePrescriptionNumber();
    const followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;

    if (isDb) {
      const [insertedRx] = await db
        .insert(prescriptions)
        .values({
          visitId: data.visitId || null,
          patientId: data.patientId,
          doctorId: data.doctorId,
          prescriptionNumber,
          diagnosis: data.diagnosis || null,
          advice: data.advice || null,
          followUpDate,
          status: 'ACTIVE',
        })
        .returning();

      const itemsToInsert = data.items.map((it, idx) => ({
        prescriptionId: insertedRx.id,
        medicineName: it.medicineName,
        dosage: it.dosage,
        frequency: it.frequency,
        duration: it.duration,
        instructions: it.instructions || null,
        sequence: idx + 1,
      }));

      const insertedItems = await db
        .insert(prescriptionItems)
        .values(itemsToInsert)
        .returning();

      return {
        id: insertedRx.id,
        prescriptionNumber: insertedRx.prescriptionNumber,
        visitId: insertedRx.visitId,
        patientId: insertedRx.patientId,
        doctorId: insertedRx.doctorId,
        diagnosis: insertedRx.diagnosis,
        advice: insertedRx.advice,
        followUpDate: insertedRx.followUpDate,
        status: insertedRx.status,
        items: insertedItems.map((item) => ({
          id: item.id,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          sequence: item.sequence,
        })),
        createdAt: insertedRx.createdAt,
        updatedAt: insertedRx.updatedAt,
      };
    } else {
      const newRx: PrescriptionResponseDTO = {
        id: `rx-${Date.now()}`,
        prescriptionNumber,
        visitId: data.visitId || null,
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis || null,
        advice: data.advice || null,
        followUpDate,
        status: 'ACTIVE',
        items: data.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          medicineName: it.medicineName,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions || null,
          sequence: idx + 1,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrescriptions.push(newRx);
      return newRx;
    }
  }

  public static async findByVisitId(visitId: string): Promise<PrescriptionResponseDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [rx] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.visitId, visitId))
        .orderBy(desc(prescriptions.createdAt))
        .limit(1);

      if (!rx) return null;

      const items = await db
        .select()
        .from(prescriptionItems)
        .where(eq(prescriptionItems.prescriptionId, rx.id))
        .orderBy(prescriptionItems.sequence);

      return {
        id: rx.id,
        prescriptionNumber: rx.prescriptionNumber,
        visitId: rx.visitId,
        patientId: rx.patientId,
        doctorId: rx.doctorId,
        diagnosis: rx.diagnosis,
        advice: rx.advice,
        followUpDate: rx.followUpDate,
        status: rx.status,
        items: items.map((i) => ({
          id: i.id,
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions,
          sequence: i.sequence,
        })),
        createdAt: rx.createdAt,
        updatedAt: rx.updatedAt,
      };
    } else {
      return mockPrescriptions.find((r) => r.visitId === visitId) || null;
    }
  }

  public static async findByPatientId(patientId: string): Promise<PrescriptionResponseDTO[]> {
    const isDb = this.checkDb();
    if (isDb) {
      const rxList = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.patientId, patientId))
        .orderBy(desc(prescriptions.createdAt));

      const result: PrescriptionResponseDTO[] = [];
      for (const rx of rxList) {
        const items = await db
          .select()
          .from(prescriptionItems)
          .where(eq(prescriptionItems.prescriptionId, rx.id))
          .orderBy(prescriptionItems.sequence);

        result.push({
          id: rx.id,
          prescriptionNumber: rx.prescriptionNumber,
          visitId: rx.visitId,
          patientId: rx.patientId,
          doctorId: rx.doctorId,
          diagnosis: rx.diagnosis,
          advice: rx.advice,
          followUpDate: rx.followUpDate,
          status: rx.status,
          items: items.map((i) => ({
            id: i.id,
            medicineName: i.medicineName,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions,
            sequence: i.sequence,
          })),
          createdAt: rx.createdAt,
          updatedAt: rx.updatedAt,
        });
      }
      return result;
    } else {
      return mockPrescriptions.filter((r) => r.patientId === patientId);
    }
  }

  public static async searchMedicines(query: string): Promise<MedicineOptionDTO[]> {
    const q = query.toLowerCase().trim();
    if (!q) return COMMON_HOSPITAL_DRUGS.slice(0, 10);

    return COMMON_HOSPITAL_DRUGS.filter((d) => d.name.toLowerCase().includes(q));
  }
}

export const mockPrescriptions: PrescriptionResponseDTO[] = [];
