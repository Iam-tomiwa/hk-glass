import { get, post, patch, del } from "@/lib/axios-setup";
import {
  InventoryItemResponse,
  InventoryItemCreate,
  InventoryItemUpdate,
  InventoryAdjustRequest,
  InventoryItemType,
  GlassSheetResponse,
  InventorySerialScanResponse,
} from "../types/openapi";

export interface InventoryItemPriceUpdate {
  price?: number | string | null;
  unit_price?: number | string | null;
  price_per_unit?: number | string | null;
  price_per_sqm?: number | string | null;
}

// List Inventory
export async function listInventory(
  type?: InventoryItemType,
  isSales?: boolean,
): Promise<InventoryItemResponse[]> {
  const params = type ? `?type=${type}` : "";
  return await get<InventoryItemResponse[]>(
    isSales ? `/api/inventory${params}` : `/api/admin/inventory${params}`,
  );
}

// Create Inventory Item
export async function createInventoryItem(
  data: InventoryItemCreate,
): Promise<InventoryItemResponse> {
  return await post<InventoryItemResponse>(`/api/admin/inventory`, data);
}

// Update Inventory Item
export async function updateInventoryItem(
  item_id: string,
  data: InventoryItemUpdate,
): Promise<InventoryItemResponse> {
  return await patch<InventoryItemResponse>(
    `/api/admin/inventory/${item_id}`,
    data,
  );
}

// Delete Inventory Item
export async function deleteInventoryItem(item_id: string): Promise<unknown> {
  return await del<unknown>(`/api/admin/inventory/${item_id}`);
}

// Adjust Inventory Item
export async function adjustInventoryItem(
  item_id: string,
  data: InventoryAdjustRequest,
): Promise<InventoryItemResponse> {
  return await patch<InventoryItemResponse>(
    `/api/admin/inventory/${item_id}/adjust`,
    data,
  );
}

// Update Inventory Item Price
export async function updateInventoryItemPrice(
  item_id: string,
  data: InventoryItemPriceUpdate,
): Promise<InventoryItemResponse> {
  return await patch<InventoryItemResponse>(
    `/api/admin/inventory/${item_id}/price`,
    data,
  );
}

// Get Inventory Item (via scan/item endpoint)
export async function getInventoryItem(
  item_id: string,
): Promise<InventoryItemResponse> {
  return await get<InventoryItemResponse>(
    `/api/admin/inventory/scan/item/${item_id}`,
  );
}

// Public scan by serial code
export async function scanBySerialCode(
  serial_code: string,
): Promise<InventorySerialScanResponse> {
  return await get<InventorySerialScanResponse>(
    `/api/inventory/scan/${serial_code}`,
  );
}

// List Glass Sheets for an inventory item
// Admin: GET /api/admin/inventory/{item_id}/glass-sheets
// Staff: GET /api/inventory/items/{item_id}/sheets
export async function listGlassSheets(
  item_id: string,
  isAdmin = true,
): Promise<GlassSheetResponse[]> {
  const url = isAdmin
    ? `/api/admin/inventory/${item_id}/glass-sheets`
    : `/api/inventory/items/${item_id}/glass-sheets`;
  return await get<GlassSheetResponse[]>(url);
}
