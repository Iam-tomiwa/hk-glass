"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimelineEvent } from "@/components/timeline-item";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import {
  useGetOrderByReference,
  useGetOrderFiles,
} from "@/services/queries/orders";
import {
  useUpdateFactoryOrderStatus,
  useReportFactoryOrderDamage,
} from "@/services/queries/factory";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import { DamageReportDialog } from "@/components/damage-report-dialog";
import { Upload, X, Loader2 } from "lucide-react";
import { OrderStatus } from "@/services/types/openapi";

const ORDER_STATUSES = [
  "pending",
  "in_production",
  "ready_pickup",
  "completed",
];

const STATUS_CONFIRM_MESSAGE: Record<string, string> = {
  in_production:
    "Are you sure you want to start production for this order? The customer will be notified.",
  ready_pickup: `Are you sure you want to mark this order as "Ready for Pickup"? The customer will be notified.`,
  completed: `Are you sure you want to mark this order as "completed"? The customer will be notified.`,
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy 'at' h:mma");
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrderByReference(orderId);
  const { data: orderFiles, refetch: refetchFiles } = useGetOrderFiles(
    order?.id ?? "",
  );
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateFactoryOrderStatus();
  const { mutateAsync: reportDamage, isPending: isReporting } =
    useReportFactoryOrderDamage();
  const { openConfirmModal } = useConfirmations();

  // Report damage dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [damageReason, setDamageReason] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [damageFile, setDamageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View damage report dialog state
  const [viewOpen, setViewOpen] = useState(false);

  const currentStatusIndex = ORDER_STATUSES.indexOf(order?.order_status ?? "");
  const nextStatus =
    currentStatusIndex < ORDER_STATUSES.length - 1
      ? ORDER_STATUSES[currentStatusIndex + 1]
      : null;

  const hasDamage = !!order?.damage_reported_at;

  const isPendingPayment = order?.payment_status === "pending";

  const timeline: TimelineEvent[] = [
    ...(isPendingPayment
      ? [
          {
            title: "Awaiting Payment",
            description: "Waiting for the customer to complete payment",
            date: "",
            completed: true,
            active: true,
          },
        ]
      : []),
    {
      title: "Payment Completed",
      description: "The customer completed payment",
      date: isPendingPayment ? "" : formatDate(order?.created_at),
      completed: !isPendingPayment && currentStatusIndex >= 0,
      active: !isPendingPayment && currentStatusIndex >= 0,
    },
    {
      title: "In Production",
      description: "The order is in production",
      date: formatDate(order?.production_started_at),
      completed: currentStatusIndex >= 1,
      active: currentStatusIndex >= 1,
    },
    ...(hasDamage
      ? [
          {
            title: "Item Damage Reported",
            date: formatDate(order?.damage_reported_at),
            completed: true,
            active: true,
            variant: "damage" as const,
            link: {
              text: "View Damage Report",
              onClick: () => setViewOpen(true),
            },
          },
        ]
      : []),
    {
      title: "Ready For Pickup",
      description: "The item is ready for pickup",
      date: formatDate(order?.ready_pickup_at),
      completed: currentStatusIndex >= 2,
      active: currentStatusIndex >= 2,
    },
    {
      title: "Production Completed",
      description: "Order has been completed",
      date: formatDate(order?.completed_at),
      completed: currentStatusIndex >= 3,
      active: currentStatusIndex >= 3,
    },
  ];

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/${order?.order_reference}`
      : order?.order_reference;

  function handleUpdateStatus() {
    if (!nextStatus) return;
    openConfirmModal(
      STATUS_CONFIRM_MESSAGE[nextStatus] ??
        `Update order status to "${nextStatus.split("_").join(" ")}"?`,
      () => {
        updateStatus(
          {
            order_id: order?.id ?? "",
            data: { order_status: nextStatus as OrderStatus },
          },
          {
            onSuccess: () => {
              refetch();
              refetchFiles();
            },
          },
        );
      },
      { title: "Confirm Status Update" },
    );
  }

  async function handleSubmitDamage() {
    if (!damageReason.trim() || !order?.id) return;
    try {
      await reportDamage(
        {
          order_id: order.id,
          data: {
            damage_reason: damageReason.trim(),
            damage_notes: damageNotes.trim() || undefined,
          },
          file: damageFile ?? undefined,
        },
        {
          onSuccess: () => {
            refetch();
            refetchFiles();
          },
        },
      );
      setReportOpen(false);
      setDamageReason("");
      setDamageNotes("");
      setDamageFile(null);
    } catch {
      // error already toasted
    }
  }

  return (
    <>
      <OrderDetailShell
        description={`Order ID: ${order?.order_reference ?? orderId}`}
        backHref="/factory"
        isLoading={isLoading}
        isError={isError}
        error={error}
        leftCard={<OrderLeftCard order={order} orderFiles={orderFiles} />}
        rightCard={
          <OrderRightCard
            qrValue={qrValue}
            timeline={timeline}
            footer={
              !isPendingPayment ? (
                <>
                  {nextStatus && (
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg"
                    >
                      {isUpdating ? "Updating..." : "Update Order Status"}
                    </Button>
                  )}
                  {!hasDamage && order?.order_status !== "completed" && (
                    <Button
                      variant="outline"
                      onClick={() => setReportOpen(true)}
                      className="w-full h-11 font-semibold text-sm rounded-lg"
                    >
                      Report Item Damage
                    </Button>
                  )}
                </>
              ) : null
            }
          />
        }
      />

      {/* Report Damage Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Item Damage</DialogTitle>
            <p className="text-sm text-neutral-500">
              Report damage items or issues during production.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1E202E] mb-1.5 block">
                Input Damage Report <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Explain what happened"
                className="resize-none min-h-[80px] shadow-none"
                maxLength={100}
                value={damageReason}
                onChange={(e) => setDamageReason(e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">
                {damageReason.length}/100 characters
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#1E202E] mb-1">
                Upload Damaged Item
              </p>
              <p className="text-xs text-neutral-500 mb-2">
                Upload an image or video of the damaged item
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setDamageFile(e.target.files?.[0] ?? null)}
              />
              {damageFile ? (
                <div className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg bg-background">
                  <span className="text-sm text-neutral-700 flex-1 truncate">
                    {damageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDamageFile(null)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-neutral-300 transition-colors"
                >
                  <Upload className="size-5 text-neutral-400" />
                  <p className="text-sm text-neutral-500">Click to upload</p>
                  <p className="text-xs text-neutral-400">Any file type</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSubmitDamage}
                disabled={!damageReason.trim() || isReporting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isReporting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit Damage Report"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                disabled={isReporting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DamageReportDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        reportedAt={order?.damage_reported_at}
        reason={order?.damage_reason}
        notes={order?.damage_notes}
        images={
          orderFiles?.damage_files?.map((f) => ({
            url: f.download_url,
            name: f.file_path.split("/").pop(),
          })) ?? []
        }
      />
    </>
  );
}
