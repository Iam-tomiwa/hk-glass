import { get, post, put, patch, del } from "@/lib/axios-setup";
import { PaymentInitialize, PaymentInitResponse, PaystackCallback, PaymentResponse } from "../types/openapi";

// Initialize Payment
export async function initializePayment(data: PaymentInitialize): Promise<PaymentInitResponse> {
  return await post<PaymentInitResponse>(`/api/payments/initialize`, data);
}

// Paystack Callback
export async function paystackCallback(data: PaystackCallback): Promise<PaymentResponse> {
  return await post<PaymentResponse>(`/api/payments/callback`, data);
}

// Paystack Callback Redirect
export async function paystackCallbackRedirect(params?: { reference?: string | any | null; trxref?: string | any | null }): Promise<PaymentResponse> {
  return await get<PaymentResponse>(`/api/payments/callback`, { params });
}

