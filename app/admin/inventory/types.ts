export type StockStatus = "In Stock" | "Low Stock";

export interface InventoryItem {
  id: string;
  material: string;
  size: string;
  thicknessType: string;
  stockLevel: string;
  minStock: string;
  status: StockStatus;
}
