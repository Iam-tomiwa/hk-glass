"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import TimelineItem, { TimelineEvent } from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import { Header } from "@/components/header";
import Link from "next/link";
import { X } from "lucide-react";
import { useGetOrder, useUpdateOrder } from "@/services/queries/orders";
import { useParams } from "next/navigation";
import SuspenseContainer from "@/components/custom-suspense";
import { format, parseISO } from "date-fns";

const ORDER_STATUSES = ["pending", "in_production", "ready_pickup", "completed", "collected"];

const STATUS_CONFIRM_MESSAGE: Record<string, string> = {
  in_production: "Are you sure you want to start production for this order? The customer will be notified.",
  ready_pickup: `Are you sure you want to mark this order as "Ready for Pickup"? The customer will be notified.`,
  completed: `Are you sure you want to mark this order as "completed"? The customer will be notified.`,
  collected: `Are you sure you want to mark this order as "collected"? The customer will be notified.`,
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy 'at' h:mma");
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, isError, error } = useGetOrder(orderId);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { openConfirmModal } = useConfirmations();

  const currentStatusIndex = ORDER_STATUSES.indexOf(order?.order_status ?? "");
  const nextStatus = currentStatusIndex < ORDER_STATUSES.length - 1
    ? ORDER_STATUSES[currentStatusIndex + 1]
    : null;

  const timeline: TimelineEvent[] = [
    {
      title: "Order Received",
      description: "Order has been placed and confirmed.",
      date: formatDate(order?.created_at),
      completed: currentStatusIndex >= 0,
      active: currentStatusIndex >= 0,
    },
    {
      title: "Production Started",
      description: "Glass is being cut and processed.",
      date: formatDate(order?.production_started_at),
      completed: currentStatusIndex >= 1,
      active: currentStatusIndex >= 1,
    },
    {
      title: "Ready for Pickup",
      description: "Order is complete and ready for collection.",
      date: formatDate(order?.ready_pickup_at),
      completed: currentStatusIndex >= 2,
      active: currentStatusIndex >= 2,
    },
    {
      title: "Completed",
      description: "Order has been picked up and closed.",
      date: formatDate(order?.completed_at),
      completed: currentStatusIndex >= 3,
      active: currentStatusIndex >= 3,
    },
  ];

  const glassSpecs = [
    { label: "Glass Type", value: (order as any)?.glass_type?.name ?? "—" },
    {
      label: "Dimensions",
      value: order ? `${order.width}" × ${order.height}"` : "—",
    },
    { label: "Area", value: order ? `${order.area} sqm` : "—" },
    { label: "Sheet Size", value: order?.sheet_size ?? "Standard" },
    { label: "Thickness", value: order?.thickness ?? "—" },
    {
      label: "Drill Holes",
      value: order?.drill_holes_count ? String(order.drill_holes_count) : "None",
    },
    ...(order?.hole_diameter
      ? [{ label: "Hole Diameter", value: String(order.hole_diameter) }]
      : []),
    ...(order?.tint_type ? [{ label: "Tint Type", value: order.tint_type }] : []),
    ...(order?.engraving_text
      ? [{ label: "Engraving", value: order.engraving_text }]
      : []),
  ];

  const addOns =
    (order as any)?.addons?.length > 0
      ? (order as any).addons.map((a: any) => ({
          label: a.addon?.name ?? "Add-on",
          value: `₦${a.calculated_price}`,
        }))
      : [{ label: "No add-ons", value: "—" }];

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/factory/${orderId}`
      : orderId;

  function handleUpdateStatus() {
    if (!nextStatus) return;
    openConfirmModal(
      STATUS_CONFIRM_MESSAGE[nextStatus] ?? `Update order status to "${nextStatus.split("_").join(" ")}"?`,
      () => {
        updateOrder({ order_id: orderId, data: { order_status: nextStatus } });
      },
      { title: "Confirm Status Update" },
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header
        title="Order Details"
        description={`Order ID: ${order?.order_reference ?? orderId}`}
      >
        <Link href="/factory">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 rounded-full h-10 w-10"
          >
            <X className="size-5" />
          </Button>
        </Link>
      </Header>

      <SuspenseContainer isLoading={isLoading} isError={isError} error={error}>
        <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-6 px-4 xl:px-0">
          {/* ── Left card: Glass Specifications ── */}
          <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0 shadow-sm bg-white">
            <CardContent className="pb-4 px-0 pt-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Glass Specifications
              </h3>
              <SpecTable rows={glassSpecs} />
            </CardContent>

            <CardContent className="py-4 px-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Add-ons &amp; Services
              </h3>
              <SpecTable rows={addOns} />
            </CardContent>
          </Card>

          {/* ── Right card: QR + Timeline ── */}
          <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6 shadow-sm bg-white">
            {/* QR Code section */}
            <CardContent className="px-0 flex flex-col items-center pb-4 pt-6">
              <h2 className="text-base font-bold text-gray-900">
                Production QR Code
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-5 text-center">
                Scan to view order in production system
              </p>
              <div className="p-2 bg-white rounded-lg shadow-sm border">
                <QRCodeSVG value={qrValue} size={148} />
              </div>
            </CardContent>

            {/* Timeline section */}
            <CardContent className="px-0 pt-5 pb-4 flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Order Status &amp; Timeline
              </h3>
              <div>
                {timeline.map((event, i) => (
                  <TimelineItem
                    key={event.title}
                    event={event}
                    isLast={i === timeline.length - 1}
                  />
                ))}
              </div>
            </CardContent>

            {/* Update button */}
            {nextStatus && (
              <div className="px-0 pb-6 pt-2">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="w-full h-11 text-white font-semibold text-sm rounded-lg"
                >
                  {isUpdating
                    ? "Updating..."
                    : `Mark as ${nextStatus.split("_").join(" ")}`}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </SuspenseContainer>
    </div>
  );
}
