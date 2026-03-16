import { get, post, put, patch, del } from "@/lib/axios-setup";
import {
  OrderResponse,
  OrderStats,
  OrderStatus,
  OrderStatusUpdate,
  OrderDamageReport,
  OrderFileUploadResponse,
  PaginatedResponse,
} from "../types/openapi";

// List Factory Queue
export async function listFactoryQueue(params?: {
  order_status?: OrderStatus | any | null;
}): Promise<PaginatedResponse<OrderResponse>> {
  return await get<PaginatedResponse<OrderResponse>>(
    `/api/factory/orders/queue`,
    { params },
  );
}

// Get Factory Stats
export async function getFactoryStats(): Promise<OrderStats> {
  return await get<OrderStats>(`/api/factory/stats`);
}

// Update Factory Order Status
export async function updateFactoryOrderStatus(
  order_id: string,
  data: OrderStatusUpdate,
): Promise<OrderResponse> {
  return await patch<OrderResponse>(
    `/api/factory/orders/${order_id}/status`,
    data,
  );
}

// Report Factory Order Damage
export async function reportFactoryOrderDamage(
  order_id: string,
  data: OrderDamageReport,
): Promise<OrderResponse> {
  return await patch<OrderResponse>(
    `/api/factory/orders/${order_id}/damage`,
    data,
  );
}

// Upload Factory Damage File
export async function uploadFactoryDamageFile(
  order_id: string,
  file: File,
): Promise<OrderFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await post<OrderFileUploadResponse>(
    `/api/factory/orders/${order_id}/upload-damage-file`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}
