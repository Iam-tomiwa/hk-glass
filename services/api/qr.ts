import { get } from "@/lib/axios-setup";
import { OrderResponse } from "../types/openapi";

// Get Order By Qr
export async function getOrderByQr(token: string): Promise<OrderResponse> {
  return await get<OrderResponse>(`/api/qr/${token}`);
}

