"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItem, StockStatus } from "./types";
import { AddMaterialModal } from "./widgets/add-material-modal";
import { AdjustStockModal } from "./widgets/adjust-stock-modal";

// ─── Seed data ───────────────────────────────────────────────────────────────

const INITIAL_DATA: InventoryItem[] = [
  {
    id: "1",
    material: "Glass Sheet",
    size: "3m × 2m",
    thicknessType: "10mm",
    stockLevel: "42 sheets",
    minStock: "20 sheets",
    status: "In Stock",
  },
  {
    id: "2",
    material: "Glass Sheet",
    size: "2m × 1m",
    thicknessType: "6mm",
    stockLevel: "30 sheets",
    minStock: "20 sheets",
    status: "Low Stock",
  },
  {
    id: "3",
    material: "Glass Sheet",
    size: "2m × 1m",
    thicknessType: "8mm",
    stockLevel: "25 sheets",
    minStock: "20 sheets",
    status: "Low Stock",
  },
  {
    id: "4",
    material: "Tint Film",
    size: "Roll",
    thicknessType: "2mm",
    stockLevel: "12 rolls",
    minStock: "5 rolls",
    status: "In Stock",
  },
  {
    id: "5",
    material: "Tint Film",
    size: "Roll",
    thicknessType: "4mm",
    stockLevel: "8 rolls",
    minStock: "10 rolls",
    status: "Low Stock",
  },
  {
    id: "6",
    material: "Tint Film",
    size: "Roll",
    thicknessType: "2mm",
    stockLevel: "15 rolls",
    minStock: "5 rolls",
    status: "In Stock",
  },
  {
    id: "7",
    material: "Edging Material",
    size: "Standard",
    thicknessType: "–",
    stockLevel: "50 meters",
    minStock: "20 meters",
    status: "Low Stock",
  },
  {
    id: "8",
    material: "Glazing Compound",
    size: "Container",
    thicknessType: "–",
    stockLevel: "18 units",
    minStock: "5 units",
    status: "In Stock",
  },
  {
    id: "9",
    material: "Glass Sheet",
    size: "3m × 2m",
    thicknessType: "8mm",
    stockLevel: "42 sheets",
    minStock: "20 sheets",
    status: "In Stock",
  },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

function StockBadge({ status }: { status: StockStatus }) {
  const isInStock = status === "In Stock";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full text-[12px]",
        isInStock
          ? "bg-[#D1FAE5] text-[#065F46]"
          : "bg-[#FEF3C7] text-[#92400E]",
      )}
    >
      {status}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InventoryItem[]>(INITIAL_DATA);
  const [addOpen, setAddOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);

  const handleAddMaterial = (item: Omit<InventoryItem, "id" | "status">) => {
    setData((prev) => [
      { ...item, id: String(Date.now()), status: "In Stock" },
      ...prev,
    ]);
  };

  const handleAdjust = (id: string, delta: number) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentMatch = item.stockLevel.match(/^(\d+)/);
        const current = currentMatch ? parseInt(currentMatch[1], 10) : 0;
        const minMatch = item.minStock.match(/^(\d+)/);
        const min = minMatch ? parseInt(minMatch[1], 10) : 0;
        const unit = item.stockLevel.replace(/^\d+\s*/, "");
        const newVal = Math.max(0, current + delta);
        return {
          ...item,
          stockLevel: `${newVal} ${unit}`,
          status: newVal <= min ? "Low Stock" : "In Stock",
        };
      }),
    );
  };

  const columns: ColumnDef[] = [
    {
      field: "material",
      headerName: "Material",
      renderCell: (row) => (
        <span className="font-medium text-[#111827]">{row.material}</span>
      ),
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.size}</span>
      ),
    },
    {
      field: "thicknessType",
      headerName: "Thickness/Type",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.thicknessType}</span>
      ),
    },
    {
      field: "stockLevel",
      headerName: "Stock Level",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.stockLevel}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => <StockBadge status={row.status as StockStatus} />,
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: (row) => (
        <div className="flex justify-end pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdjustTarget(row as InventoryItem)}
          >
            Adjust Stock
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-0 bg-[#F8F9FA] min-h-screen">
      <Header
        title="Inventory Overview"
        description="Manage materials and stock levels"
      >
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add material
        </Button>
      </Header>

      <div className="container">
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <DataGrid
            isPaginated
            tableHeader={
              <div className="flex w-full items-center py-4 justify-between gap-4 flex-wrap">
                <h2 className="font-bold text-[#1E202E]">Inventory</h2>
                <div className="flex gap-2">
                  <SearchInput
                    placeholder="Search by name or reference"
                    containerClass="w-[280px]"
                  />
                  <div className="w-[150px] shrink-0">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full h-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
            rows={data}
            columns={columns}
            page={page}
            setPage={setPage}
            bordered={false}
            className="w-full"
          />
        </div>
      </div>

      <AddMaterialModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddMaterial}
      />
      <AdjustStockModal
        item={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onAdjust={handleAdjust}
      />
    </div>
  );
}
