import { get, post, put, patch, del } from "@/lib/axios-setup";
import {
  GlassTypeCreate,
  GlassTypeResponse,
  GlassTypeUpdate,
  AddonCreate,
  AddonResponse,
  AddonUpdate,
  PricingSettingsResponse,
  PricingSettingsUpdate,
  AdminDeviceCreate,
  DeviceSetupResponse,
  DeviceResponse,
  StaffDeviceCreate,
  CombinedDeviceResponse,
  UserResponse,
  OrderResponse,
  PaymentResponse,
  DashboardSummaryResponse,
  DashboardOrderResponse,
} from "../types/openapi";

// Create Glass Type
export async function createGlassType(
  data: GlassTypeCreate,
): Promise<GlassTypeResponse> {
  return await post<GlassTypeResponse>(`/api/admin/glass-types`, data);
}

// List Glass Types
export async function listGlassTypes(): Promise<GlassTypeResponse[]> {
  return await get<GlassTypeResponse[]>(`/api/admin/glass-types`);
}

// Update Glass Type
export async function updateGlassType(
  glass_type_id: string,
  data: GlassTypeUpdate,
): Promise<GlassTypeResponse> {
  return await patch<GlassTypeResponse>(
    `/api/admin/glass-types/${glass_type_id}`,
    data,
  );
}

// Create Addon
export async function createAddon(data: AddonCreate): Promise<AddonResponse> {
  return await post<AddonResponse>(`/api/admin/addons`, data);
}

// List Addons
export async function listAddons(): Promise<AddonResponse[]> {
  return await get<AddonResponse[]>(`/api/admin/addons`);
}

// Update Addon
export async function updateAddon(
  addon_id: string,
  data: AddonUpdate,
): Promise<AddonResponse> {
  return await patch<AddonResponse>(`/api/admin/addons/${addon_id}`, data);
}

// Get Pricing Settings
export async function getPricingSettings(): Promise<PricingSettingsResponse> {
  return await get<PricingSettingsResponse>(`/api/admin/pricing-settings`);
}

// Update Pricing Settings
export async function updatePricingSettings(
  data: PricingSettingsUpdate,
): Promise<PricingSettingsResponse> {
  return await put<PricingSettingsResponse>(
    `/api/admin/pricing-settings`,
    data,
  );
}

// Register Admin Device
export async function registerAdminDevice(
  data: AdminDeviceCreate,
): Promise<DeviceSetupResponse> {
  return await post<DeviceSetupResponse>(`/api/admin/devices`, data);
}

// List Admin Devices
export async function listAdminDevices(): Promise<DeviceResponse[]> {
  return await get<DeviceResponse[]>(`/api/admin/devices`);
}

// Deactivate Admin Device
export async function deactivateAdminDevice(
  device_id: string,
  data?: any,
): Promise<DeviceResponse> {
  return await patch<DeviceResponse>(
    `/api/admin/devices/${device_id}/deactivate`,
    data,
  );
}

// Register Staff Device
export async function registerStaffDevice(
  data: StaffDeviceCreate,
): Promise<DeviceSetupResponse> {
  return await post<DeviceSetupResponse>(`/api/admin/staff-devices`, data);
}

// List Staff Devices
export async function listStaffDevices(): Promise<DeviceResponse[]> {
  return await get<DeviceResponse[]>(`/api/admin/staff-devices`);
}

// List Combined Devices
export async function listCombinedDevices(): Promise<CombinedDeviceResponse[]> {
  return await get<CombinedDeviceResponse[]>(`/api/admin/devices/combined`);
}

// Deactivate Staff Device
export async function deactivateStaffDevice(
  device_id: string,
  data?: any,
): Promise<DeviceResponse> {
  return await patch<DeviceResponse>(
    `/api/admin/staff-devices/${device_id}/deactivate`,
    data,
  );
}

// List Staff
export async function listStaff(): Promise<UserResponse[]> {
  return await get<UserResponse[]>(`/api/admin/staff`);
}

// List Orders
export async function listOrders(): Promise<OrderResponse[]> {
  return await get<OrderResponse[]>(`/api/admin/orders`);
}

// List Payments
export async function listPayments(): Promise<PaymentResponse[]> {
  return await get<PaymentResponse[]>(`/api/admin/payments`);
}

// Get Summary
export async function getSummary(): Promise<DashboardSummaryResponse> {
  return await get<DashboardSummaryResponse>(`/api/admin/summary`);
}

// List Recent Orders
export async function listRecentOrders(params?: {
  limit?: number;
}): Promise<DashboardOrderResponse[]> {
  return await get<DashboardOrderResponse[]>(`/api/admin/recent-orders`, {
    params,
  });
}

// Setup Admin Device
export async function setupDevice(params?: {
  token?: string | any | null;
  code?: string | any | null;
}): Promise<any> {
  return await get<any>(`/api/setup-device`, { params });
}
