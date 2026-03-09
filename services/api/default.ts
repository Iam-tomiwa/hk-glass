import { get, post, put, patch, del } from "@/lib/axios-setup";

// Health Check
export async function healthCheck(): Promise<any> {
  return await get<any>(`/health`);
}

