import { get, post, put, patch, del } from "@/lib/axios-setup";
import {
  OrderCreate,
  OrderResponse,
  OrderReviewRequest,
  OrderReviewResponse,
  GlassTypeResponse,
  AddonResponse,
  PaymentStatus,
  OrderStatus,
  OrderUpdate,
  PaginatedResponse,
  OrderFileUploadResponse,
  OrderFileLinksResponse,
  NotificationListResponse,
  NotificationMarkReadResponse,
} from "../types/openapi";

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
export async function searchOrders(params?: {
  customer_name?: string | any | null;
  customer_email?: string | any | null;
  customer_phone?: string | any | null;
  reference?: string | any | null;
  glass_type_id?: string | any | null;
  payment_status?: PaymentStatus | any | null;
  order_status?: OrderStatus | any | null;
  min_width?: number | string | any | null;
  max_width?: number | string | any | null;
  min_height?: number | string | any | null;
  max_height?: number | string | any | null;
  min_area?: number | string | any | null;
  max_area?: number | string | any | null;
  min_total?: number | string | any | null;
  max_total?: number | string | any | null;
  created_from?: string | any | null;
  created_to?: string | any | null;
}): Promise<PaginatedResponse<OrderResponse>> {
  return await get<PaginatedResponse<OrderResponse>>(`/api/orders/search`, {
    params,
  });
}

// Get Order by Reference
export async function getOrderByReference(
  order_reference: string,
): Promise<OrderResponse> {
  return await get<OrderResponse>(`/api/orders/reference/${order_reference}`);
}

// Get Order by ID
export async function getOrderById(
  order_id: string,
): Promise<OrderResponse> {
  return await get<OrderResponse>(`/api/orders/${order_id}`);
}

// Get Order Files
export async function getOrderFiles(
  order_id: string,
): Promise<OrderFileLinksResponse> {
  return await get<OrderFileLinksResponse>(`/api/orders/${order_id}/files`);
}

// Update Order
export async function updateOrder(
  order_id: string,
  data: OrderUpdate,
): Promise<OrderResponse> {
  return await put<OrderResponse>(`/api/orders/${order_id}`, data);
}

// Delete Order
export async function deleteOrder(order_id: string): Promise<OrderResponse> {
  return await del<OrderResponse>(`/api/orders/${order_id}`);
}

// Review Order Price
export async function reviewOrder(
  data: OrderReviewRequest,
): Promise<OrderReviewResponse> {
  return await post<OrderReviewResponse>(`/api/orders/review`, data);
}

// Upload Specification File
export async function uploadSpecification(
  order_id: string,
  file: File,
): Promise<OrderFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await post<OrderFileUploadResponse>(
    `/api/orders/${order_id}/upload-specification`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}

// Upload Engraving Image
export async function uploadEngravingImage(
  order_id: string,
  file: File,
): Promise<OrderFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await post<OrderFileUploadResponse>(
    `/api/orders/${order_id}/upload-engraving-image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}

// Upload Signature
export async function uploadSignature(
  order_id: string,
  file: File,
): Promise<OrderFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return await post<OrderFileUploadResponse>(
    `/api/orders/${order_id}/upload-signature`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}

// Staff Notifications
export async function listStaffNotifications(
  limit = 20,
): Promise<NotificationListResponse> {
  return await get<NotificationListResponse>(
    `/api/orders/notifications?limit=${limit}`,
  );
}

export async function markStaffNotificationRead(
  notification_id: string,
): Promise<NotificationMarkReadResponse> {
  return await patch<NotificationMarkReadResponse>(
    `/api/orders/notifications/${notification_id}/read`,
    {},
  );
}
