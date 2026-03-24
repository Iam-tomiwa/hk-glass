"use client";

import { useState } from "react";
import { Blocks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SuspenseContainer from "@/components/custom-suspense";
import DeleteEntityButton, {
  DeleteEntityType,
} from "@/components/delete-entity-button";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import SearchInput from "@/components/search-input";

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
  nameHeader = "Service",
  title,
  showUnit = true,
}: {
  rows: PricingRow[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onSave: (id: string, newPrice: string) => Promise<void>;
  deleteType?: DeleteEntityType;
  variableName?: string;
  nameHeader?: string;
  title?: string;
  showUnit?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const { openConfirmModal } = useConfirmations();

  const filtered = rows
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEditClick = (row: PricingRow) => {
    setEditingId(row.id);
    setEditValue(String(row.price));
  };

  const handleSavePrice = (id: string, value: string) => {
    openConfirmModal(
      "Are you sure you want to update this price? This will affect new orders.",
      async () => {
        setPendingSaveId(id);
        try {
          await onSave(id, value);
          setEditingId(null);
        } finally {
          setPendingSaveId(null);
        }
      },
      { title: "Save Price Change", confirmText: "Save" },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h2 className="text-[15px] font-semibold text-[#1E202E]">{title}</h2>
        <SearchInput
          containerClass="min-w-64"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left text-[13px] font-semibold px-6 py-3 w-1/3">
              {nameHeader}
            </th>
            {showUnit && (
              <th className="text-left text-[13px] font-semibold px-4 py-3 w-1/4">
                Unit
              </th>
            )}
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
                  <td className="px-6 capitalize py-4 text-sm font-medium text-[#1E202E]">
                    {row.name}
                  </td>
                  {showUnit && (
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {row.unit}
                    </td>
                  )}
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
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          isEditing
                            ? handleSavePrice(row.id, editValue)
                            : handleEditClick(row)
                        }
                        disabled={isSaving}
                      >
                        {isSaving
                          ? "Saving..."
                          : isEditing
                            ? `Save ${variableName.split(" ")[0]}`
                            : `Edit ${variableName.split(" ")[0]}`}
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
    </div>
  );
}
