"use client";

import { useMemo, useState } from "react";
import { PackagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/combo-box-2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DeleteEntityButton from "@/components/delete-entity-button";
import DataGrid from "@/components/data-table";
import type { ColumnDef } from "@/components/data-table/types";
import { AddonResponse } from "@/services/types/openapi";
import { useUpdateAddon } from "@/services/queries/admin";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import SearchInput from "@/components/search-input";

export default function AddonsTable({
  rows,
  isLoading = false,
  isError = false,
  error = null,
  onSavePrice,
}: {
  rows: AddonResponse[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onSavePrice: (id: string, newPrice: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [builtinFilter, setBuiltinFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);

  const updateAddonMutation = useUpdateAddon();
  const { openConfirmModal } = useConfirmations();

  const filtered = rows.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesBuiltin =
      builtinFilter === "all" ||
      (builtinFilter === "yes" ? r.is_builtin : !r.is_builtin);
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? r.is_active : !r.is_active);
    return matchesSearch && matchesBuiltin && matchesActive;
  });

  const handleSavePrice = (id: string, value: string) => {
    openConfirmModal(
      "Are you sure you want to update this price? This will affect new orders.",
      async () => {
        setPendingSaveId(id);
        try {
          await onSavePrice(id, value);
          setEditingId(null);
        } finally {
          setPendingSaveId(null);
        }
      },
      { title: "Save Price Change", confirmText: "Save" },
    );
  };

  const handleToggleActive = (row: AddonResponse) => {
    const action = row.is_active ? "deactivate" : "activate";
    openConfirmModal(
      `Are you sure you want to ${action} "${row.name}"?`,
      () => {
        updateAddonMutation.mutate({
          addon_id: row.id,
          data: { is_active: !row.is_active },
        });
      },
      { title: `${row.is_active ? "Deactivate" : "Activate"} Add-on` },
    );
  };

  const columns: ColumnDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Service Name",
        width: 160,
      },
      {
        field: "description",
        headerName: "Description",
        width: 200,
        renderCell: (row: AddonResponse) => (
          <span className="text-neutral-500 text-sm line-clamp-2">
            {row.description || "—"}
          </span>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        width: 130,
        renderCell: (row: AddonResponse) => (
          <span className="capitalize text-sm text-neutral-500">
            {row.category?.replace(/_/g, " ") || "—"}
          </span>
        ),
      },
      {
        field: "price_type",
        headerName: "Unit",
        width: 110,
        renderCell: (row: AddonResponse) => (
          <span className="text-sm capitalize text-neutral-500">
            {row.price_type.split("_").join(" ")}
          </span>
        ),
      },
      {
        field: "is_builtin",
        headerName: "Built-in",
        width: 90,
        align: "center",
        renderCell: (row: AddonResponse) => (
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full text-xs font-semibold border-none",
              row.is_builtin
                ? "bg-[#E8F0FE] text-[#1967D2]"
                : "bg-neutral-100 text-neutral-500",
            )}
          >
            {row.is_builtin ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        field: "price",
        headerName: "Price (₦)",
        width: 160,
        renderCell: (row: AddonResponse) => {
          const isEditing = editingId === row.id;
          return isEditing ? (
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-9 w-[140px] text-sm border-neutral-200 bg-white focus-visible:ring-[#00AE4D]"
              autoFocus
            />
          ) : (
            <div className="h-9 w-[140px] flex items-center px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 select-none">
              {row.price ? Number(row.price).toLocaleString() : "—"}
            </div>
          );
        },
      },
      {
        field: "",
        headerName: "",
        width: 180,
        align: "right",
        renderCell: (row: AddonResponse) => {
          const isEditing = editingId === row.id;
          const isSaving = pendingSaveId === row.id;
          return (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSavePrice(row.id, editValue);
                  } else {
                    setEditingId(row.id);
                    setEditValue(String(row.price));
                  }
                }}
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Save Price"
                    : "Edit Price"}
              </Button>
              {row.is_builtin ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(row)}
                  disabled={updateAddonMutation.isPending}
                >
                  {row.is_active ? "Deactivate" : "Activate"}
                </Button>
              ) : (
                <DeleteEntityButton
                  type="addon"
                  id={row.id}
                  name={row.name}
                  btnProps={{ size: "sm" }}
                >
                  Delete
                </DeleteEntityButton>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingId, editValue, pendingSaveId, updateAddonMutation],
  );

  return (
    <div className="bg-background">
      <DataGrid
        rows={filtered}
        columns={columns}
        loading={isLoading}
        isError={isError}
        error={error}
        bordered
        tableHeaderClass="p-4 border-b border-neutral-100"
        tableHeader={
          <div className="flex items-center flex-wrap gap-4 justify-between w-full">
            <h2 className="text-[15px] font-semibold text-[#1E202E]">
              Add-ons and Services
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <ComboBox
                value={builtinFilter}
                onValueChange={setBuiltinFilter}
                options={[
                  { value: "all", label: "All types" },
                  { value: "yes", label: "Built-in" },
                  { value: "no", label: "Custom" },
                ]}
                className="w-[130px]"
              />
              <ComboBox
                value={activeFilter}
                onValueChange={setActiveFilter}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                className="w-[140px]"
              />
              <SearchInput
                containerClass="min-w-64 w-full md:w-fit"
                value={search}
                placeholder="Search by name or description"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }
        emptyStateProps={{
          icon: <PackagePlus />,
          title: "No add-ons found",
          subTitle: "Click 'Add new Add-ons and Services' to add one",
        }}
      />
    </div>
  );
}
