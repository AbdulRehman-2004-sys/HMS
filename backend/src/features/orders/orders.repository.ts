import { db } from '../../db/connection';
import { labOrders, radiologyOrders, admissionOrders, operationOrders } from './orders.schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import {
  AdmissionOrderResponseDTO,
  AdmissionType,
  AnesthesiaType,
  CreateAdmissionOrderDTO,
  CreateLabOrderDTO,
  CreateOperationOrderDTO,
  CreateRadiologyOrderDTO,
  LabOrderResponseDTO,
  OperationOrderResponseDTO,
  OrderStatus,
  OrderUrgency,
  RadiologyModality,
  RadiologyOrderResponseDTO,
  RecommendedWard,
  VisitOrdersSummaryDTO,
} from './orders.types';

export class OrderRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  // 1. Lab Orders
  public static async createLabOrder(data: CreateLabOrderDTO): Promise<LabOrderResponseDTO> {
    const isDb = this.checkDb();
    if (isDb) {
      const [inserted] = await db
        .insert(labOrders)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          testName: data.testName,
          category: data.category || 'General',
          urgency: data.urgency || OrderUrgency.ROUTINE,
          clinicalNotes: data.clinicalNotes || null,
          status: OrderStatus.PENDING,
        })
        .returning();

      return {
        id: inserted.id,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        doctorId: inserted.doctorId,
        testName: inserted.testName,
        category: inserted.category,
        urgency: inserted.urgency as OrderUrgency,
        clinicalNotes: inserted.clinicalNotes,
        status: inserted.status as OrderStatus,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const newOrder: LabOrderResponseDTO = {
        id: `lab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        testName: data.testName,
        category: data.category || 'General',
        urgency: data.urgency || OrderUrgency.ROUTINE,
        clinicalNotes: data.clinicalNotes || null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockLabOrders.push(newOrder);
      return newOrder;
    }
  }

  // 2. Radiology Orders
  public static async createRadiologyOrder(data: CreateRadiologyOrderDTO): Promise<RadiologyOrderResponseDTO> {
    const isDb = this.checkDb();
    if (isDb) {
      const [inserted] = await db
        .insert(radiologyOrders)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          modality: data.modality,
          procedureName: data.procedureName,
          bodyPart: data.bodyPart || null,
          urgency: data.urgency || OrderUrgency.ROUTINE,
          clinicalNotes: data.clinicalNotes || null,
          status: OrderStatus.PENDING,
        })
        .returning();

      return {
        id: inserted.id,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        doctorId: inserted.doctorId,
        modality: inserted.modality as RadiologyModality,
        procedureName: inserted.procedureName,
        bodyPart: inserted.bodyPart,
        urgency: inserted.urgency as OrderUrgency,
        clinicalNotes: inserted.clinicalNotes,
        status: inserted.status as OrderStatus,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const newOrder: RadiologyOrderResponseDTO = {
        id: `rad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        modality: data.modality,
        procedureName: data.procedureName,
        bodyPart: data.bodyPart || null,
        urgency: data.urgency || OrderUrgency.ROUTINE,
        clinicalNotes: data.clinicalNotes || null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRadiologyOrders.push(newOrder);
      return newOrder;
    }
  }

  // 3. Admission Orders
  public static async findActiveAdmissionOrderByVisit(visitId: string): Promise<AdmissionOrderResponseDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [order] = await db
        .select()
        .from(admissionOrders)
        .where(
          and(
            eq(admissionOrders.visitId, visitId),
            inArray(admissionOrders.status, [OrderStatus.PENDING, OrderStatus.IN_PROGRESS])
          )
        )
        .limit(1);

      if (!order) return null;
      return {
        id: order.id,
        visitId: order.visitId,
        patientId: order.patientId,
        doctorId: order.doctorId,
        admissionType: order.admissionType as AdmissionType,
        priority: order.priority as OrderUrgency,
        recommendedWard: order.recommendedWard as RecommendedWard,
        provisionalDiagnosis: order.provisionalDiagnosis,
        specialInstructions: order.specialInstructions,
        status: order.status as OrderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    } else {
      return (
        mockAdmissionOrders.find(
          (o) => o.visitId === visitId && (o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS)
        ) || null
      );
    }
  }

  public static async createAdmissionOrder(data: CreateAdmissionOrderDTO): Promise<AdmissionOrderResponseDTO> {
    const isDb = this.checkDb();
    if (isDb) {
      const [inserted] = await db
        .insert(admissionOrders)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          admissionType: data.admissionType || AdmissionType.EMERGENCY,
          priority: data.priority || OrderUrgency.ROUTINE,
          recommendedWard: data.recommendedWard || RecommendedWard.GENERAL_WARD,
          provisionalDiagnosis: data.provisionalDiagnosis || null,
          specialInstructions: data.specialInstructions || null,
          status: OrderStatus.PENDING,
        })
        .returning();

      return {
        id: inserted.id,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        doctorId: inserted.doctorId,
        admissionType: inserted.admissionType as AdmissionType,
        priority: inserted.priority as OrderUrgency,
        recommendedWard: inserted.recommendedWard as RecommendedWard,
        provisionalDiagnosis: inserted.provisionalDiagnosis,
        specialInstructions: inserted.specialInstructions,
        status: inserted.status as OrderStatus,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const newOrder: AdmissionOrderResponseDTO = {
        id: `adm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        admissionType: data.admissionType || AdmissionType.EMERGENCY,
        priority: data.priority || OrderUrgency.ROUTINE,
        recommendedWard: data.recommendedWard || RecommendedWard.GENERAL_WARD,
        provisionalDiagnosis: data.provisionalDiagnosis || null,
        specialInstructions: data.specialInstructions || null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAdmissionOrders.push(newOrder);
      return newOrder;
    }
  }

  // 4. Operation Orders
  public static async findActiveOperationOrderByVisit(visitId: string): Promise<OperationOrderResponseDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [order] = await db
        .select()
        .from(operationOrders)
        .where(
          and(
            eq(operationOrders.visitId, visitId),
            inArray(operationOrders.status, [OrderStatus.PENDING, OrderStatus.IN_PROGRESS])
          )
        )
        .limit(1);

      if (!order) return null;
      return {
        id: order.id,
        visitId: order.visitId,
        patientId: order.patientId,
        doctorId: order.doctorId,
        procedureName: order.procedureName,
        proposedDate: order.proposedDate,
        urgency: order.urgency as OrderUrgency,
        anesthesiaType: order.anesthesiaType as AnesthesiaType,
        specialNotes: order.specialNotes,
        status: order.status as OrderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    } else {
      return (
        mockOperationOrders.find(
          (o) => o.visitId === visitId && (o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS)
        ) || null
      );
    }
  }

  public static async createOperationOrder(data: CreateOperationOrderDTO): Promise<OperationOrderResponseDTO> {
    const isDb = this.checkDb();
    const proposedDate = data.proposedDate ? new Date(data.proposedDate) : null;

    if (isDb) {
      const [inserted] = await db
        .insert(operationOrders)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          procedureName: data.procedureName,
          proposedDate,
          urgency: data.urgency || OrderUrgency.ELECTIVE,
          anesthesiaType: data.anesthesiaType || AnesthesiaType.GENERAL,
          specialNotes: data.specialNotes || null,
          status: OrderStatus.PENDING,
        })
        .returning();

      return {
        id: inserted.id,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        doctorId: inserted.doctorId,
        procedureName: inserted.procedureName,
        proposedDate: inserted.proposedDate,
        urgency: inserted.urgency as OrderUrgency,
        anesthesiaType: inserted.anesthesiaType as AnesthesiaType,
        specialNotes: inserted.specialNotes,
        status: inserted.status as OrderStatus,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const newOrder: OperationOrderResponseDTO = {
        id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        procedureName: data.procedureName,
        proposedDate,
        urgency: data.urgency || OrderUrgency.ELECTIVE,
        anesthesiaType: data.anesthesiaType || AnesthesiaType.GENERAL,
        specialNotes: data.specialNotes || null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOperationOrders.push(newOrder);
      return newOrder;
    }
  }

  // 5. Get All Orders By Visit
  public static async findAllOrdersByVisit(visitId: string): Promise<VisitOrdersSummaryDTO> {
    const isDb = this.checkDb();
    if (isDb) {
      const labs = await db
        .select()
        .from(labOrders)
        .where(eq(labOrders.visitId, visitId))
        .orderBy(desc(labOrders.createdAt));

      const rads = await db
        .select()
        .from(radiologyOrders)
        .where(eq(radiologyOrders.visitId, visitId))
        .orderBy(desc(radiologyOrders.createdAt));

      const adms = await db
        .select()
        .from(admissionOrders)
        .where(eq(admissionOrders.visitId, visitId))
        .orderBy(desc(admissionOrders.createdAt));

      const ops = await db
        .select()
        .from(operationOrders)
        .where(eq(operationOrders.visitId, visitId))
        .orderBy(desc(operationOrders.createdAt));

      return {
        labOrders: labs.map((l) => ({ ...l, urgency: l.urgency as OrderUrgency, status: l.status as OrderStatus })),
        radiologyOrders: rads.map((r) => ({
          ...r,
          modality: r.modality as RadiologyModality,
          urgency: r.urgency as OrderUrgency,
          status: r.status as OrderStatus,
        })),
        admissionOrders: adms.map((a) => ({
          ...a,
          admissionType: a.admissionType as AdmissionType,
          priority: a.priority as OrderUrgency,
          recommendedWard: a.recommendedWard as RecommendedWard,
          status: a.status as OrderStatus,
        })),
        operationOrders: ops.map((o) => ({
          ...o,
          urgency: o.urgency as OrderUrgency,
          anesthesiaType: o.anesthesiaType as AnesthesiaType,
          status: o.status as OrderStatus,
        })),
      };
    } else {
      return {
        labOrders: mockLabOrders.filter((l) => l.visitId === visitId),
        radiologyOrders: mockRadiologyOrders.filter((r) => r.visitId === visitId),
        admissionOrders: mockAdmissionOrders.filter((a) => a.visitId === visitId),
        operationOrders: mockOperationOrders.filter((o) => o.visitId === visitId),
      };
    }
  }

  // 6. Update Order Status
  public static async updateOrderStatus(
    orderType: 'lab' | 'radiology' | 'admission' | 'operation',
    orderId: string,
    newStatus: OrderStatus
  ): Promise<boolean> {
    const isDb = this.checkDb();
    const now = new Date();

    if (isDb) {
      if (orderType === 'lab') {
        const [updated] = await db
          .update(labOrders)
          .set({ status: newStatus, updatedAt: now })
          .where(eq(labOrders.id, orderId))
          .returning();
        return !!updated;
      } else if (orderType === 'radiology') {
        const [updated] = await db
          .update(radiologyOrders)
          .set({ status: newStatus, updatedAt: now })
          .where(eq(radiologyOrders.id, orderId))
          .returning();
        return !!updated;
      } else if (orderType === 'admission') {
        const [updated] = await db
          .update(admissionOrders)
          .set({ status: newStatus, updatedAt: now })
          .where(eq(admissionOrders.id, orderId))
          .returning();
        return !!updated;
      } else if (orderType === 'operation') {
        const [updated] = await db
          .update(operationOrders)
          .set({ status: newStatus, updatedAt: now })
          .where(eq(operationOrders.id, orderId))
          .returning();
        return !!updated;
      }
      return false;
    } else {
      let target: any = null;
      if (orderType === 'lab') target = mockLabOrders.find((o) => o.id === orderId);
      else if (orderType === 'radiology') target = mockRadiologyOrders.find((o) => o.id === orderId);
      else if (orderType === 'admission') target = mockAdmissionOrders.find((o) => o.id === orderId);
      else if (orderType === 'operation') target = mockOperationOrders.find((o) => o.id === orderId);

      if (target) {
        target.status = newStatus;
        target.updatedAt = now;
        return true;
      }
      return false;
    }
  }
}

export const mockLabOrders: LabOrderResponseDTO[] = [];
export const mockRadiologyOrders: RadiologyOrderResponseDTO[] = [];
export const mockAdmissionOrders: AdmissionOrderResponseDTO[] = [];
export const mockOperationOrders: OperationOrderResponseDTO[] = [];
