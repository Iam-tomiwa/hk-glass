import { get, post, put, patch, del } from "@/lib/axios-setup";

// Setup Device
export async function setupDevice(params?: { token?: string | any | null; code?: string | any | null }): Promise<any> {
  return await get<any>(`/api/setup-device`, { params });
}

