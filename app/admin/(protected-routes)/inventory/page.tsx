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
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AddMaterialModal } from "./widgets/add-material-modal";
import { AdjustStockModal } from "./widgets/adjust-stock-modal";
import { useListInventory } from "@/services/queries/inventory";
import { InventoryItemResponse } from "@/services/types/openapi";
import { useRouter } from "next/navigation";
import DeleteEntityButton from "@/components/delete-entity-button";

const ITEM_TYPE_LABELS: Record<string, string> = {
  glass: "Glass Sheet",
  hardware: "Hardware",
  others: "Others",
};

function formatCurrency(value?: string | null) {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return `₦ ${num.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function RowActions({
  row,
  onAdjust,
}: {
  row: InventoryItemResponse;
  onAdjust: (row: InventoryItemResponse) => void;
}) {
  const router = useRouter();
  return (
    <>
      <DropdownMenuItem onClick={() => onAdjust(row)}>
        Adjust Stock
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => router.push(`/admin/inventory/${row.id}`)}
      >
        View Details
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DeleteEntityButton
        name={row.material_name}
        id={row.id}
        btnProps={{
          variant: "ghost",
          className: "w-full text-destructive! justify-start",
        }}
        type="inventory-item"
      >
        Delete Stock
      </DeleteEntityButton>
    </>
  );
}

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] =
    useState<InventoryItemResponse | null>(null);

  const { data, isLoading, error, isError } = useListInventory();

  const columns: ColumnDef[] = [
    {
      field: "serial_code",
      headerName: "Material ID",
    },
    {
      field: "item_type",
      headerName: "Material Type",
      valueGetter: (row) => ITEM_TYPE_LABELS[row.item_type] ?? row.item_type,
    },
    {
      field: "material_name",
      headerName: "Item Name",
    },
    {
      field: "stock_count",
      headerName: "Item Quantity",
      renderCell: (row) => <span>{row.stock_count}</span>,
    },
    {
      field: "price",
      headerName: "Stock Amount",
      valueGetter: (row) => formatCurrency(row.unit_price ?? row.price),
    },
    {
      field: "created_at",
      headerName: "Created on:",
      valueGetter: (row) => formatDate(row.created_at),
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
              : row.status === "out_of_stock"
                ? "bg-[#FAB2B2] text-[#7C3232]"
                : "bg-[#FAEEB2] text-[#7C3232]",
          )}
        >
          {row.status.split("_").join(" ")}
        </Badge>
      ),
    },
  ];

  const filteredData = (data || []).filter((item) => {
    const searchTerm = search.toLowerCase();
    const materialName = item.material_name?.toLowerCase() || "";
    const serialCode = item.serial_code?.toLowerCase() || "";
    const itemType = item.item_type?.toLowerCase() || "";
    const itemTypeLabel = ITEM_TYPE_LABELS[item.item_type]?.toLowerCase() || "";

    const matchesSearch =
      materialName.includes(searchTerm) ||
      serialCode.includes(searchTerm) ||
      itemType.includes(searchTerm) ||
      itemTypeLabel.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const rows = filteredData.map((el) => ({
    ...el,
    actions: <RowActions row={el} onAdjust={(r) => setAdjustTarget(r)} />,
  }));

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
                <div className="flex gap-2 flex-wrap">
                  <SearchInput
                    placeholder="Search by ID, name or type"
                    containerClass="w-full sm:w-[280px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <ComboBox
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "in_stock", label: "In Stock" },
                      { value: "low_stock", label: "Low Stock" },
                    ]}
                    placeholder="All statuses"
                    className="w-full sm:w-[150px]"
                  />
                </div>
              </div>
            }
            rows={rows}
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
