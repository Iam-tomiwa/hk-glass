"use client";

import { useMemo, useState } from "react";
import { PackagePlus } from "lucide-react";
import { ComboBox } from "@/components/ui/combo-box-2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatNaira } from "@/lib/utils";
import DeleteEntityButton from "@/components/delete-entity-button";
import DataGrid from "@/components/data-table";
import type { ColumnDef } from "@/components/data-table/types";
import { AddonResponse, AddonPriceType } from "@/services/types/openapi";
import { useUpdateAddon, useUpdateAddonPrice } from "@/services/queries/admin";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import SearchInput from "@/components/search-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PRICE_TYPE_OPTIONS: { value: AddonPriceType; label: string }[] = [
  { value: "flat", label: "Flat (per unit)" },
  { value: "per_sqm", label: "Per sqm" },
  { value: "per_side", label: "Per side" },
];

function EditPriceModal({
  addon,
  open,
  onClose,
}: {
  addon: AddonResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const { openConfirmModal } = useConfirmations();
  const { mutate: updatePrice, isPending } = useUpdateAddonPrice();

  const [priceType, setPriceType] = useState<AddonPriceType>(
    (addon?.price_type as AddonPriceType) ?? "flat",
  );
  const [price, setPrice] = useState(addon?.price ?? "");

  // Reset fields when a different addon is opened
  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  const handleOpen = () => {
    setPriceType((addon?.price_type as AddonPriceType) ?? "flat");
    setPrice(addon?.price ?? "");
  };

  const handleSave = () => {
    if (!addon) return;
    openConfirmModal(
      "Are you sure you want to update this price? This will affect new orders.",
      () => {
        const data =
          priceType === "flat"
            ? { price_per_unit: price }
            : priceType === "per_sqm"
              ? { price_per_sqm: price }
              : { price_per_side: price };

        updatePrice({ addon_id: addon.id, data }, { onSuccess: onClose });
      },
      { title: "Save Price Change", confirmText: "Save" },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] gap-5"
        onAnimationStart={open ? handleOpen : undefined}
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            Edit Price
          </DialogTitle>
          <DialogDescription>
            Update price for <span className="font-medium">{addon?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1E202E]">
              Pricing Unit
            </label>
            <ComboBox
              value={priceType}
              onValueChange={(v) => setPriceType(v as AddonPriceType)}
              options={PRICE_TYPE_OPTIONS}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1E202E]">
              Price (₦)
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="h-9"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isPending || !price}
          >
            {isPending ? "Saving..." : "Save Price"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AddonsTable({
  rows,
  isLoading = false,
  isError = false,
  error = null,
}: {
  rows: AddonResponse[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}) {
  const [search, setSearch] = useState("");
  const [builtinFilter, setBuiltinFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingAddon, setEditingAddon] = useState<AddonResponse | null>(null);

  const updateAddonMutation = useUpdateAddon();
  const { openConfirmModal } = useConfirmations();

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        const matchesSearch = r.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesBuiltin =
          builtinFilter === "all" ||
          (builtinFilter === "yes" ? r.is_builtin : !r.is_builtin);
        const matchesActive =
          activeFilter === "all" ||
          (activeFilter === "active" ? r.is_active : !r.is_active);
        return matchesSearch && matchesBuiltin && matchesActive;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, search, builtinFilter, activeFilter]);

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
        width: 140,
        renderCell: (row: AddonResponse) => (
          <span className="text-sm text-neutral-700">
            {row.price ? formatNaira(Number(row.price)) : "Not Set"}
          </span>
        ),
      },
      {
        field: "",
        headerName: "",
        width: 180,
        align: "right",
        renderCell: (row: AddonResponse) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingAddon(row)}
            >
              Edit Price
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
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateAddonMutation],
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

      <EditPriceModal
        addon={editingAddon}
        open={!!editingAddon}
        onClose={() => setEditingAddon(null)}
      />
    </div>
  );
}
