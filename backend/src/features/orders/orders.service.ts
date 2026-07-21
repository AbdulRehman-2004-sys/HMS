import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { OrderRepository } from './orders.repository';
import {
  AdmissionOrderResponseDTO,
  CreateAdmissionOrderDTO,
  CreateLabOrderDTO,
  CreateOperationOrderDTO,
  CreateRadiologyOrderDTO,
  LabOrderResponseDTO,
  OperationOrderResponseDTO,
  OrderStatus,
  RadiologyOrderResponseDTO,
  VisitOrdersSummaryDTO,
} from './orders.types';

export class OrderService {
  // 1. Create Lab Order
  public static async createLabOrder(
    data: CreateLabOrderDTO,
    userId: string,
    ipAddress?: string
  ): Promise<LabOrderResponseDTO> {
    const order = await OrderRepository.createLabOrder(data);

    await logAudit({
      userId,
      action: 'CREATE_LAB_ORDER',
      module: 'Clinical Orders',
      details: `Issued Lab Order (${order.testName}) for Visit: ${data.visitId}`,
      ipAddress,
    });

    return order;
  }

  // 2. Create Radiology Order
  public static async createRadiologyOrder(
    data: CreateRadiologyOrderDTO,
    userId: string,
    ipAddress?: string
  ): Promise<RadiologyOrderResponseDTO> {
    const order = await OrderRepository.createRadiologyOrder(data);

    await logAudit({
      userId,
      action: 'CREATE_RADIOLOGY_ORDER',
      module: 'Clinical Orders',
      details: `Issued Radiology Order (${order.modality} - ${order.procedureName}) for Visit: ${data.visitId}`,
      ipAddress,
    });

    return order;
  }

  // 3. Create Admission Order (Max 1 active per visit)
  public static async createAdmissionOrder(
    data: CreateAdmissionOrderDTO,
    userId: string,
    ipAddress?: string
  ): Promise<AdmissionOrderResponseDTO> {
    const existingActive = await OrderRepository.findActiveAdmissionOrderByVisit(data.visitId);
    if (existingActive) {
      throw new BadRequestError('An active pending or in-progress admission order already exists for this visit.');
    }

    const order = await OrderRepository.createAdmissionOrder(data);

    await logAudit({
      userId,
      action: 'CREATE_ADMISSION_ORDER',
      module: 'Clinical Orders',
      details: `Issued Admission Order (${order.recommendedWard}) for Visit: ${data.visitId}`,
      ipAddress,
    });

    return order;
  }

  // 4. Create Operation Order (Max 1 active per visit)
  public static async createOperationOrder(
    data: CreateOperationOrderDTO,
    userId: string,
    ipAddress?: string
  ): Promise<OperationOrderResponseDTO> {
    const existingActive = await OrderRepository.findActiveOperationOrderByVisit(data.visitId);
    if (existingActive) {
      throw new BadRequestError('An active pending or in-progress operation order already exists for this visit.');
    }

    const order = await OrderRepository.createOperationOrder(data);

    await logAudit({
      userId,
      action: 'CREATE_OPERATION_ORDER',
      module: 'Clinical Orders',
      details: `Issued Surgical Operation Order (${order.procedureName}) for Visit: ${data.visitId}`,
      ipAddress,
    });

    return order;
  }

  // 5. Get All Orders By Visit
  public static async getOrdersByVisit(visitId: string): Promise<VisitOrdersSummaryDTO> {
    return await OrderRepository.findAllOrdersByVisit(visitId);
  }

  // 6. Update Order Status / Cancel Order
  public static async updateOrderStatus(
    orderType: 'lab' | 'radiology' | 'admission' | 'operation',
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
    ipAddress?: string
  ): Promise<boolean> {
    const allOrders = await OrderRepository.findAllOrdersByVisit(orderId); // fallback lookup
    let currentStatus: OrderStatus | null = null;

    if (orderType === 'lab') {
      const order = allOrders.labOrders.find((o) => o.id === orderId);
      if (order) currentStatus = order.status;
    } else if (orderType === 'radiology') {
      const order = allOrders.radiologyOrders.find((o) => o.id === orderId);
      if (order) currentStatus = order.status;
    } else if (orderType === 'admission') {
      const order = allOrders.admissionOrders.find((o) => o.id === orderId);
      if (order) currentStatus = order.status;
    } else if (orderType === 'operation') {
      const order = allOrders.operationOrders.find((o) => o.id === orderId);
      if (order) currentStatus = order.status;
    }

    if (currentStatus === OrderStatus.COMPLETED) {
      throw new BadRequestError('Completed orders cannot be modified or cancelled.');
    }

    const updated = await OrderRepository.updateOrderStatus(orderType, orderId, newStatus);
    if (!updated) {
      throw new NotFoundError(`Order ${orderId} not found.`);
    }

    await logAudit({
      userId,
      action: 'UPDATE_ORDER_STATUS',
      module: 'Clinical Orders',
      details: `Updated ${orderType.toUpperCase()} Order ${orderId} status to ${newStatus}`,
      ipAddress,
    });

    return true;
  }
}
