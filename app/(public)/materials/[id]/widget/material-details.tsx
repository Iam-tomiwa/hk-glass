"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, MirrorRectangular, X, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useGetInventoryItem,
  useDeleteInventoryItem,
  useListInventoryUnits,
} from "@/services/queries/inventory";
import {
  GlassSheetResponse,
  InventoryGlassSheetStatus,
} from "@/services/types/openapi";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import EmptyState from "@/components/empty-state";
import { Header } from "@/components/header";
import { AdjustStockModal } from "@/app/admin/(protected-routes)/inventory/widgets/adjust-stock-modal";
import { ComboBox } from "@/components/ui/combo-box-2";
import { downloadQRCodesPDF } from "@/lib/qr-pdf";
import SearchInput from "@/components/search-input";

const ITEM_TYPE_LABELS: Record<string, string> = {
  glass: "Glass Sheet",
  hardware: "Hardware",
  others: "Others",
};

const SHEET_STATUS_CONFIG: Record<
  InventoryGlassSheetStatus,
  { label: string; className: string; dotClass: string }
> = {
  available: {
    label: "In Stock",
    className: "bg-[#B8FAB2] text-[#327C3F]",
    dotClass: "bg-[#327C3F]",
  },
  used: {
    label: "Used",
    className: "bg-[#FAEEB2] text-[#7C6032]",
    dotClass: "bg-[#7C6032]",
  },
  damaged: {
    label: "Damage",
    className: "bg-[#FAB2B2] text-[#7C3232]",
    dotClass: "bg-[#7C3232]",
  },
  retired: {
    label: "Retired",
    className: "bg-neutral-100 text-neutral-500",
    dotClass: "bg-neutral-400",
  },
};

function SheetStatusBadge({ status }: { status: InventoryGlassSheetStatus }) {
  const cfg = SHEET_STATUS_CONFIG[status] ?? SHEET_STATUS_CONFIG.available;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize rounded-full text-xs font-semibold border-none",
        cfg.className,
      )}
    >
      {cfg.label}
    </Badge>
  );
}

function QRModal({
  sheet,
  open,
  onClose,
}: {
  sheet: GlassSheetResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `${sheet.serial_code}-qr.png`;
    a.href = url;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[320px] gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            View QR Code
          </DialogTitle>
          <DialogDescription>
            View QR Code for item {sheet?.serial_code}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <QRCodeCanvas
            ref={canvasRef}
            value={
              sheet?.serial_code
                ? `${typeof window !== "undefined" ? window.location.origin : ""}/materials/${sheet.serial_code}`
                : ""
            }
            size={270}
            level="M"
          />
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleDownload}>
            Download QR
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SheetCard({
  sheet,
  onViewQR,
}: {
  sheet: GlassSheetResponse;
  onViewQR: (sheet: GlassSheetResponse) => void;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-3">
      <p className="font-semibold text-sm text-[#1E202E]">
        {sheet.serial_code}
      </p>

      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-500">Status</span>
        <SheetStatusBadge status={sheet.status} />
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-500">Order:</span>
        <span className="text-[#1E202E] font-medium">
          {sheet.order_reference ?? "—"}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-500">QR Code:</span>
        <button
          onClick={() => onViewQR(sheet)}
          className="text-[#1E202E] font-medium underline underline-offset-2 text-sm"
        >
          View QR code
        </button>
      </div>
    </div>
  );
}

export default function MaterialDetailsPage({
  isAdmin,
}: {
  isAdmin?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { openConfirmModal } = useConfirmations();

  const { data: item, isLoading, isError } = useGetInventoryItem(itemId);
  const { data: sheets = [], isLoading: sheetsLoading } = useListInventoryUnits(
    item?.item_type === "glass" || item?.item_type === "hardware" ? itemId : "",
    item?.item_type ?? "glass",
  );
  const { mutate: deleteItem } = useDeleteInventoryItem();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [qrSheet, setQrSheet] = useState<GlassSheetResponse | null>(null);
  const [sheetSearch, setSheetSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadAllQR = async () => {
    if (!item || sheets.length === 0) return;
    setPdfLoading(true);
    try {
      await downloadQRCodesPDF(
        sheets.map((s) => ({
          serialCode: s.serial_code,
          materialName: item.material_name,
          url: `${window.location.origin}/materials/${s.serial_code}`,
        })),
        `${item.material_name}-qr-codes.pdf`,
      );
    } finally {
      setPdfLoading(false);
    }
  };

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

  const handleDelete = () => {
    openConfirmModal(
      `Are you sure you want to delete "${item.material_name}"? This action cannot be undone.`,
      () => {
        deleteItem(
          { item_id: item.id },
          { onSuccess: () => router.push("/admin/inventory") },
        );
      },
      { title: "Delete Material" },
    );
  };

  const filteredSheets = sheets.filter((s) => {
    const matchesSearch = s.serial_code
      .toLowerCase()
      .includes(sheetSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemStatusCfg =
    item.status === "in_stock"
      ? {
          label: "In Stock",
          className: "bg-[#B8FAB2] text-[#327C3F]",
          dotClass: "bg-[#327C3F]",
        }
      : {
          label: item.status.split("_").join(" "),
          className: "bg-[#FAEEB2] text-[#7C6632]",
          dotClass: "bg-[#7C6632]",
        };

  return (
    <div className="bg-[#F8F9FA] flex flex-col min-h-screen">
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

      <div className="container max-w-3xl py-8 space-y-6">
        {/* Stock Information Card */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 space-y-4">
          <h3 className="font-bold text-[#1E202E]">Stock Information</h3>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 font-medium">Status:</span>
            <Badge
              variant="secondary"
              className={cn(
                "capitalize rounded-full text-xs font-semibold border-none",
                itemStatusCfg.className,
              )}
            >
              {itemStatusCfg.label}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 font-medium">Material Type:</span>
            <span className="font-semibold text-[#1E202E]">
              {ITEM_TYPE_LABELS[item.item_type] ?? item.item_type}
            </span>
          </div>

          {item.size && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 font-medium">Item Size:</span>
              <span className="font-semibold text-[#1E202E]">{item.size}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 font-medium">Item Quantity</span>
            <span className="font-semibold text-[#1E202E]">
              {item.stock_count} {item.unit ?? "units"}
            </span>
          </div>

          {item.description && (
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="text-neutral-500 font-medium">
                Item Description
              </span>
              <p className="text-[#1E202E] leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setAdjustOpen(true)}>
                Adjust Stock Level
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                Delete Stock
              </Button>
            </div>
          )}
        </div>

        {/* Glass Sheets Grid — glass items only */}
        {(item.item_type === "glass" || item.item_type === "hardware") && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1E202E]">Glass Sheets</h3>
              {sheets.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAllQR}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="size-4 mr-2" />
                  )}
                  Download All QR Codes
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <SearchInput
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                placeholder="Search by name or reference"
                containerClass="grow"
                className="h-10"
              />
              <ComboBox
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "available", label: "In Stock" },
                  { value: "used", label: "Used" },
                  { value: "damaged", label: "Damaged" },
                  { value: "retired", label: "Retired" },
                ]}
                className="w-[150px] h-10"
              />
            </div>

            {sheetsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-neutral-400" />
              </div>
            ) : filteredSheets.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">
                No sheets found
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredSheets.map((sheet) => (
                  <SheetCard
                    key={sheet.sheet_id}
                    sheet={sheet}
                    onViewQR={setQrSheet}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AdjustStockModal
        item={adjustOpen ? item : null}
        onClose={() => setAdjustOpen(false)}
      />

      <QRModal
        sheet={qrSheet}
        open={!!qrSheet}
        onClose={() => setQrSheet(null)}
      />
    </div>
  );
}
