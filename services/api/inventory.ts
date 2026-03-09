import { get, post, put, patch, del } from "@/lib/axios-setup";
import { InventoryItemResponse, InventoryItemCreate, InventoryItemUpdate, InventoryAdjustRequest } from "../types/openapi";

// List Inventory
export async function listInventory(): Promise<InventoryItemResponse[]> {
  return await get<InventoryItemResponse[]>(`/api/admin/inventory`);
}

// Create Inventory Item
export async function createInventoryItem(data: InventoryItemCreate): Promise<InventoryItemResponse> {
  return await post<InventoryItemResponse>(`/api/admin/inventory`, data);
}

// Update Inventory Item
export async function updateInventoryItem(item_id: string, data: InventoryItemUpdate): Promise<InventoryItemResponse> {
  return await patch<InventoryItemResponse>(`/api/admin/inventory/${item_id}`, data);
}

// Delete Inventory Item
export async function deleteInventoryItem(item_id: string): Promise<any> {
  return await del<any>(`/api/admin/inventory/${item_id}`);
}

// Adjust Inventory Item
export async function adjustInventoryItem(item_id: string, data: InventoryAdjustRequest): Promise<InventoryItemResponse> {
  return await patch<InventoryItemResponse>(`/api/admin/inventory/${item_id}/adjust`, data);
}

