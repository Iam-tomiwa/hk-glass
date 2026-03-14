"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TimelineItem, { TimelineEvent } from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import {
  useGetOrderByReference,
  useUpdateOrder,
} from "@/services/queries/orders";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useOrderDetails } from "@/hooks/use-order-details";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderQRSection } from "@/components/order-qr-section";

const ORDER_STATUSES = [
  "pending",
  "in_production",
  "ready_pickup",
  "completed",
  "collected",
];

const STATUS_CONFIRM_MESSAGE: Record<string, string> = {
  in_production:
    "Are you sure you want to start production for this order? The customer will be notified.",
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

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderByReference(orderId);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { openConfirmModal } = useConfirmations();

  const { glassSpecs, addOns } = useOrderDetails(order);

  const currentStatusIndex = ORDER_STATUSES.indexOf(order?.order_status ?? "");
  const nextStatus =
    currentStatusIndex < ORDER_STATUSES.length - 1
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

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/factory/${orderId}`
      : orderId;

  function handleUpdateStatus() {
    if (!nextStatus) return;
    openConfirmModal(
      STATUS_CONFIRM_MESSAGE[nextStatus] ??
        `Update order status to "${nextStatus.split("_").join(" ")}"?`,
      () => {
        updateOrder({
          order_id: order?.id ?? "",
          data: { order_status: nextStatus },
        });
      },
      { title: "Confirm Status Update" },
    );
  }

  return (
    <OrderDetailShell
      description={`Order ID: ${order?.order_reference ?? orderId}`}
      backHref="/factory"
      isLoading={isLoading}
      isError={isError}
      error={error}
      leftCard={
        <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0  bg-white">
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
      }
      rightCard={
        <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6  bg-white">
          <CardContent className="px-0">
            <OrderQRSection value={qrValue} />
          </CardContent>

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
      }
    />
  );
}
