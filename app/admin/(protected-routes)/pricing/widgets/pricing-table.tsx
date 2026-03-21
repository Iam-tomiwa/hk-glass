"use client";

import { useState } from "react";
import { Blocks, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SuspenseContainer from "@/components/custom-suspense";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DeleteEntityButton, {
  DeleteEntityType,
} from "@/components/delete-entity-button";

export type PriceMap = Record<string, string>;

export interface PricingRow {
  id: string;
  name: string;
  unit: string;
  price: string | number;
}

export default function PricingTable({
  rows,
  isLoading = false,
  isError = false,
  error = null,
  onSave,
  deleteType,
  variableName = "Price (₦)",
}: {
  rows: PricingRow[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onSave: (id: string, newPrice: string) => Promise<void>;
  /** When provided, each row shows a Delete button backed by DeleteEntityButton */
  deleteType?: DeleteEntityType;
  variableName?: string;
}) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditClick = (row: PricingRow) => {
    setEditingId(row.id);
    setEditValue(String(row.price));
  };

  const handleConfirmSave = async () => {
    if (!confirmSave) return;
    setPendingSaveId(confirmSave.id);
    setConfirmSave(null);
    try {
      await onSave(confirmSave.id, confirmSave.value);
      setEditingId(null);
    } finally {
      setPendingSaveId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h2 className="text-[15px] font-semibold text-[#1E202E]">Inventory</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            placeholder="Search by name or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 w-64 text-sm"
          />
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left text-[13px] font-semibold px-6 py-3 w-1/3">
              Service
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3 w-1/4">
              Unit
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3">
              {variableName}
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4}>
              <SuspenseContainer
                isLoading={isLoading}
                isError={isError}
                error={error}
                isEmpty={!isLoading && rows.length === 0}
                emptyStateProps={{
                  title: "No items found",
                  icon: <Blocks />,
                  subTitle: "Click 'Add New Product' button to add a new item",
                }}
              >
                <></>
              </SuspenseContainer>
            </td>
          </tr>
          {!isLoading &&
            !isError &&
            filtered.map((row, i) => {
              const isEditing = editingId === row.id;
              const isSaving = pendingSaveId === row.id;

              return (
                <tr
                  key={row.id}
                  className={
                    i < filtered.length - 1 ? "border-b border-neutral-100" : ""
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#1E202E]">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-500">
                    {row.unit}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 w-[160px] text-sm border-neutral-200 bg-white focus-visible:ring-[#00AE4D]"
                          autoFocus
                        />
                      ) : (
                        <div className="h-9 w-[160px] flex items-center px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 select-none">
                          {row.price ? Number(row.price).toLocaleString() : "—"}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          isEditing
                            ? setConfirmSave({ id: row.id, value: editValue })
                            : handleEditClick(row)
                        }
                        disabled={isSaving}
                      >
                        {isSaving
                          ? "Saving..."
                          : isEditing
                            ? "Save Price"
                            : "Edit Price"}
                      </Button>
                      {deleteType && (
                        <DeleteEntityButton
                          type={deleteType}
                          id={row.id}
                          name={row.name}
                          btnProps={{ size: "sm" }}
                        >
                          Delete Item
                        </DeleteEntityButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <AlertDialog
        open={!!confirmSave}
        onOpenChange={(v) => !v && setConfirmSave(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Price Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this price? This will affect new
              orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
