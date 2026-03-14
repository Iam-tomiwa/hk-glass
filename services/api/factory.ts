import { get, post, put, patch, del } from "@/lib/axios-setup";
import {
  OrderResponse,
  OrderStats,
  OrderStatus,
  OrderStatusUpdate,
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
