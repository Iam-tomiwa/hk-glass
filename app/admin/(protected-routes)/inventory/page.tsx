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
import { ComboBox } from "@/components/ui/combo-box-2";
import { AddMaterialModal } from "./widgets/add-material-modal";
import { AdjustStockModal } from "./widgets/adjust-stock-modal";
import { useListInventory } from "@/services/queries/inventory";
import { InventoryItemResponse } from "@/services/types/openapi";
import DeleteEntityButton from "@/components/delete-entity-button";
import Link from "next/link";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] =
    useState<InventoryItemResponse | null>(null);

  const { data, isLoading, error, isError } = useListInventory();

  const columns: ColumnDef[] = [
    {
      field: "material_name",
      headerName: "Material",
    },
    {
      field: "size",
      headerName: "Size",
    },
    {
      field: "thickness",
      headerName: "Thickness/Type",
      valueGetter: (row) => `${row.thickness}mm`,
    },
    {
      field: "stockLevel",
      headerName: "Stock Level",
      renderCell: (row) => (
        <span>
          {row.stock_count} {row.unit}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => (
        <Badge
          variant="secondary"
          className={cn(
            "capitalize",
            row.status === "in_stock"
              ? "bg-[#B8FAB2] text-[#327C3F]"
              : "bg-[#FAEEB2] text-[#7C3232]",
          )}
        >
          {row.status.split("_").join(" ")}
        </Badge>
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
            tableHeader={
              <div className="flex w-full items-center py-4 justify-between gap-4 flex-wrap">
                <h2 className="font-bold text-[#1E202E]">Inventory</h2>
                <div className="flex gap-2">
                  <SearchInput
                    placeholder="Search by name or reference"
                    containerClass="w-[280px]"
                  />
                  <ComboBox
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "in-stock", label: "In Stock" },
                      { value: "low-stock", label: "Low Stock" },
                    ]}
                    placeholder="All statuses"
                    className="w-[150px]"
                  />
                </div>
              </div>
            }
            rows={(data || []).map((el) => ({
              ...el,
              actions: (
                <div className="">
                  <Button
                    variant={"ghost"}
                    className={"w-full"}
                    onClick={() => setAdjustTarget(el)}
                  >
                    Adjust Stock
                  </Button>

                  <Button variant={"ghost"} className={"w-full"}>
                    <Link href={`/admin/inventory/${el.id}`}>View Details</Link>
                  </Button>

                  <DeleteEntityButton
                    btnProps={{ variant: "ghost", className: "w-full" }}
                    type="inventory-item"
                    id={el.id}
                    name={el.material_name}
                  >
                    Delete Item
                  </DeleteEntityButton>
                </div>
              ),
            }))}
            columns={columns}
            page={page}
            setPage={setPage}
            bordered={false}
            className="w-full"
            loading={isLoading}
            error={error}
            isError={isError}
          />
        </div>
      </div>

      <AddMaterialModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AdjustStockModal
        item={adjustTarget}
        onClose={() => setAdjustTarget(null)}
      />
    </div>
  );
}
