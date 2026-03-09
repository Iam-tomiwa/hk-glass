import { get, post, put, patch, del } from "@/lib/axios-setup";
import { UserCreate, UserResponse, LoginRequest, TokenResponse, AdminRecoveryRequest, TotpSetupResponse, TotpConfirmRequest, RecoveryCodeGenerateResponse, RecoveryCodeStatusResponse } from "../types/openapi";

// Register
export async function register(data: UserCreate): Promise<UserResponse> {
  return await post<UserResponse>(`/api/auth/register`, data);
}

// Login
export async function login(data: LoginRequest): Promise<TokenResponse> {
  return await post<TokenResponse>(`/api/auth/login`, data);
}

// Recover Device
export async function recoverDevice(data: AdminRecoveryRequest): Promise<TokenResponse> {
  return await post<TokenResponse>(`/api/auth/recover-device`, data);
}

// Return otpauth URL for QR scan in Google Authenticator
export async function setupTotp(data?: any): Promise<TotpSetupResponse> {
  return await post<TotpSetupResponse>(`/api/auth/2fa/setup`, data);
}

// Confirm Totp
export async function confirmTotp(data: TotpConfirmRequest): Promise<any> {
  return await post<any>(`/api/auth/2fa/confirm`, data);
}

// Generate Recovery Codes
export async function generateRecoveryCodes(data?: any): Promise<RecoveryCodeGenerateResponse> {
  return await post<RecoveryCodeGenerateResponse>(`/api/auth/recovery-codes`, data);
}

// List Recovery Codes
export async function listRecoveryCodes(): Promise<RecoveryCodeStatusResponse> {
  return await get<RecoveryCodeStatusResponse>(`/api/auth/recovery-codes`);
}

