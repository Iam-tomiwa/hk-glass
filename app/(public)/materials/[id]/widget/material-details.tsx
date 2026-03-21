"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, MirrorRectangular, X } from "lucide-react";
import {
  // useGetInventoryItem,
  useDeleteInventoryItem,
} from "@/services/queries/inventory";
import { InventoryItemResponse } from "@/services/types/openapi";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import EmptyState from "@/components/empty-state";
import { Header } from "@/components/header";
import { AdjustStockModal } from "@/app/admin/(protected-routes)/inventory/widgets/adjust-stock-modal";

export default function MaterialDetailsPage({
  isAdmin,
}: {
  isAdmin?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { openConfirmModal } = useConfirmations();

  // const { data: item, isLoading, isError } = useGetInventoryItem(itemId);
  const item: InventoryItemResponse = {
    id: itemId,
    material_name: "Glass Sheet",
    size: "3m x 2m",
    thickness: "10",
    stock_count: 42,
    low_stock_threshold: 5,
    unit: "sheets",
    status: "in_stock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const isLoading = false;
  const isError = false;
  const { mutate: deleteItem } = useDeleteInventoryItem();

  const [adjustOpen, setAdjustOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <EmptyState
        title="Material Not Found"
        subTitle="The material you are looking for does not exist or has been removed."
        icon={<MirrorRectangular />}
      />
    );
  }

  const qrValue = typeof window !== "undefined" ? window.location.href : itemId;

  const handleDelete = () => {
    openConfirmModal(
      `Are you sure you want to delete "${item.material_name}"? This action cannot be undone.`,
      () => {
        deleteItem(
          { item_id: item.id },
          {
            onSuccess: () => router.push("/admin/inventory"),
          },
        );
      },
      { title: "Delete Material" },
    );
  };

  return (
    <div className=" bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <Header title="Material Details" description={`Material ID: ${itemId}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-neutral-400"
        >
          <X className="size-5" />
        </Button>
      </Header>

      {/* Main Content Card */}
      <Card className="max-w-md w-full my-10 mx-auto">
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 w-full text-center">
            <h3 className="font-bold text-[#1E202E] mb-1">Item QR Code</h3>
            <p className="text-sm text-neutral-500">
              Scan to view item details in the system
            </p>
          </div>

          <div className="bg-white p-4 mb-5">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M"
              className="w-full h-auto"
            />
          </div>

          <div className="w-full space-y-6 border-t pt-5">
            <h3 className="font-bold text-[#1E202E]">Item Information</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Material:</span>
                <span className="font-semibold text-[#1E202E]">
                  {item.material_name}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Size:</span>
                <span className="font-semibold text-[#1E202E]">
                  {item.size || "—"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">
                  Thickness/Type:
                </span>
                <span className="font-semibold text-[#1E202E]">
                  {item.thickness ? `${item.thickness}mm` : "—"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">
                  Stock Level:
                </span>
                <span className="font-semibold text-[#1E202E]">
                  {item.stock_count} {item.unit || "units"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Status:</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize px-3 py-1 rounded-full text-xs font-semibold",
                    item.status === "in_stock"
                      ? "bg-[#B8FAB2] text-[#327C3F] border-none"
                      : "bg-[#FAEEB2] text-[#7C6632] border-none",
                  )}
                >
                  {item.status.split("_").join(" ")}
                </Badge>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-3 pt-5 border-t">
                <Button onClick={() => setAdjustOpen(true)}>
                  Adjust Stock Level
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Stock
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AdjustStockModal
        item={adjustOpen ? item : null}
        onClose={() => setAdjustOpen(false)}
      />
    </div>
  );
}
