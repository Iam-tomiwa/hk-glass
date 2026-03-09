import { get, post, put, patch, del } from "@/lib/axios-setup";
import { OrderCreate, OrderResponse, GlassTypeResponse, AddonResponse, PaymentStatus, OrderStatus, OrderUpdate } from "../types/openapi";

// Create Order
export async function createOrder(data: OrderCreate): Promise<OrderResponse> {
  return await post<OrderResponse>(`/api/orders`, data);
}

// List Glass Types
export async function listGlassTypes(): Promise<GlassTypeResponse[]> {
  return await get<GlassTypeResponse[]>(`/api/orders/glass-types`);
}

// List Addons
export async function listAddons(): Promise<AddonResponse[]> {
  return await get<AddonResponse[]>(`/api/orders/addons`);
}

// Search Orders
export async function searchOrders(params?: { customer_name?: string | any | null; customer_email?: string | any | null; customer_phone?: string | any | null; reference?: string | any | null; glass_type_id?: string | any | null; payment_status?: PaymentStatus | any | null; order_status?: OrderStatus | any | null; min_width?: number | string | any | null; max_width?: number | string | any | null; min_height?: number | string | any | null; max_height?: number | string | any | null; min_area?: number | string | any | null; max_area?: number | string | any | null; min_total?: number | string | any | null; max_total?: number | string | any | null; created_from?: string | any | null; created_to?: string | any | null }): Promise<OrderResponse[]> {
  return await get<OrderResponse[]>(`/api/orders/search`, { params });
}

// Get Order
export async function getOrder(order_id: string): Promise<OrderResponse> {
  return await get<OrderResponse>(`/api/orders/${order_id}`);
}

// Update Order
export async function updateOrder(order_id: string, data: OrderUpdate): Promise<OrderResponse> {
  return await put<OrderResponse>(`/api/orders/${order_id}`, data);
}

// Delete Order
export async function deleteOrder(order_id: string): Promise<OrderResponse> {
  return await del<OrderResponse>(`/api/orders/${order_id}`);
}

