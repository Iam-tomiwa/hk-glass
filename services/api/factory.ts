import { get, post, put, patch, del } from "@/lib/axios-setup";
import { OrderResponse, OrderStatus, OrderStatusUpdate } from "../types/openapi";

// List Factory Queue
export async function listFactoryQueue(params?: { order_status?: OrderStatus | any | null }): Promise<OrderResponse[]> {
  return await get<OrderResponse[]>(`/api/factory/orders/queue`, { params });
}

// Update Factory Order Status
export async function updateFactoryOrderStatus(order_id: string, data: OrderStatusUpdate): Promise<OrderResponse> {
  return await patch<OrderResponse>(`/api/factory/orders/${order_id}/status`, data);
}

