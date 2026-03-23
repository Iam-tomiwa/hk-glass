"use client";

import { useParams } from "next/navigation";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MirrorRectangular } from "lucide-react";
import { useScanBySerialCode } from "@/services/queries/inventory";
import SuspenseContainer from "@/components/custom-suspense";
import { Header } from "@/components/header";

const SHEET_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  available: { label: "In Stock", className: "bg-[#B8FAB2] text-[#327C3F]" },
  used: { label: "Used", className: "bg-[#FAEEB2] text-[#7C6032]" },
  damaged: { label: "Damaged", className: "bg-[#FAB2B2] text-[#7C3232]" },
  retired: { label: "Retired", className: "bg-neutral-100 text-neutral-500" },
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  glass: "Glass Sheet",
  hardware: "Hardware",
  others: "Others",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-neutral-500 font-medium">{label}</span>
      <span className="font-semibold text-[#1E202E]">{value}</span>
    </div>
  );
}

export default function MaterialDetailsPage() {
  const params = useParams();
  const serialCode = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    data: scan,
    isLoading,
    isError,
    error,
  } = useScanBySerialCode(serialCode);

  const statusCfg =
    SHEET_STATUS_CONFIG[scan?.status ?? ""] ?? SHEET_STATUS_CONFIG.available;

  return (
    <div className="bg-[#F8F9FA] flex flex-col min-h-screen">
      <Header
        title="Item Details"
        description={`Item ID: ${serialCode}`}
        className="border-b"
      />
      <div className="container max-w-sm py-10 space-y-6">
        <SuspenseContainer
          isLoading={isLoading}
          isError={isError}
          error={error as Error | null}
          isEmpty={!scan}
          emptyStateProps={{
            title: "Item Not Found",
            subTitle:
              "The item you are looking for does not exist or has been removed.",
            icon: <MirrorRectangular />,
          }}
        >
          {/* Item Information Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4">
            <div className="flex flex-col items-center gap-4 text-center pb-6 border-b">
              <div>
                <h1 className="text-lg font-bold text-[#1E202E]">
                  Item QR Code
                </h1>
              </div>
              <QRCodeCanvas
                ref={canvasRef}
                value={
                  scan?.serial_code
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/materials/${scan.serial_code}`
                    : ""
                }
                size={220}
                level="M"
              />
            </div>
            <h3 className="font-bold text-[#1E202E]">Item Information</h3>

            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 font-medium">Status</span>
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize rounded-full text-xs font-semibold border-none",
                  statusCfg.className,
                )}
              >
                {statusCfg.label}
              </Badge>
            </div>

            <InfoRow label="Material Name" value={scan?.item_name ?? "—"} />
            <InfoRow
              label="Material Type"
              value={
                ITEM_TYPE_LABELS[scan?.item_type ?? ""] ??
                scan?.item_type ??
                "—"
              }
            />
            <InfoRow label="Item ID" value={scan?.serial_code ?? "—"} />
            {scan?.item_size && (
              <InfoRow label="Item Size" value={scan.item_size} />
            )}
            {scan?.item_thickness && (
              <InfoRow label="Thickness" value={scan.item_thickness} />
            )}
            <InfoRow
              label="Order Reference"
              value={scan?.order_reference ?? "__"}
            />
            <InfoRow
              label="Linked Order"
              value={
                scan?.linked_order_reference ? (
                  <a
                    href={`${typeof window !== "undefined" ? window.location.origin : ""}/order/review/${scan.linked_order_reference}`}
                    className="underline text-blue-600"
                  >
                    {scan.linked_order_reference}
                  </a>
                ) : (
                  "__"
                )
              }
            />

            {scan?.status === "damaged" && (
              <>
                {scan.damage_reason && (
                  <InfoRow label="Damage Reason" value={scan.damage_reason} />
                )}
                {scan.damaged_at && (
                  <InfoRow
                    label="Damaged At"
                    value={new Date(scan.damaged_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  />
                )}
              </>
            )}

            {scan?.used_at && (
              <InfoRow
                label="Used At"
                value={new Date(scan.used_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
            )}
          </div>
        </SuspenseContainer>
      </div>
    </div>
  );
}
