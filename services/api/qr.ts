import { get, post, put, patch, del } from "@/lib/axios-setup";
import { OrderPublicDetailResponse } from "../types/openapi";

// Get Order By Qr
export async function getOrderByQr(token: string): Promise<OrderPublicDetailResponse> {
  return await get<OrderPublicDetailResponse>(`/api/qr/${token}`);
}

