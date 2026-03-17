"use client";

import { useState } from "react";
import { TimelineEvent } from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatNaira } from "@/lib/utils";
import { useGetOrder, useGetAdminOrderFiles } from "@/services/queries/admin";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import OrderStatusBadge from "@/components/order-status-badge";
import { DamageReportDialog } from "@/components/damage-report-dialog";

const ORDER_STATUSES = [
  "pending",
  "in_production",
  "ready_pickup",
  "completed",
  "collected",
];

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy 'at' h:mma");
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, isError, error } = useGetOrder(orderId);
  const hasDamage = !!order?.damage_reported_at;

  const { data: orderFiles } = useGetAdminOrderFiles(orderId);

  const [viewDamageOpen, setViewDamageOpen] = useState(false);

  const currentStatusIndex = ORDER_STATUSES.indexOf(order?.order_status ?? "");

  const timeline: TimelineEvent[] = [
    {
      title: "Payment Completed",
      description: "The customer completed payment",
      date: formatDate(order?.created_at),
      completed: currentStatusIndex >= 0,
      active: currentStatusIndex >= 0,
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
              onClick: () => setViewDamageOpen(true),
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

  const createdBy =
    (order as any)?.created_by_user?.name ??
    (order as any)?.created_by_user?.email ??
    "Customer";

  return (
    <>
      <OrderDetailShell
        description={`Order ID: ${order?.order_reference ?? orderId}`}
        backHref="/admin/orders"
        isLoading={isLoading}
        isError={isError}
        error={error}
        leftCard={
          <OrderLeftCard
            order={order}
            orderFiles={orderFiles}
            showSignatureRow
            customerRows={[
              { label: "Full Name", value: order?.customer_name ?? "—" },
              {
                label: "Email",
                value: order?.customer_email ? (
                  <a
                    className="hover:underline"
                    href={`mailto:${order?.customer_email}`}
                  >
                    {order?.customer_email}
                  </a>
                ) : (
                  "—"
                ),
              },
              {
                label: "Phone",
                value: order?.customer_phone ? (
                  <a
                    className="hover:underline"
                    href={`tel:${order?.customer_phone}`}
                  >
                    {order?.customer_phone}
                  </a>
                ) : (
                  "—"
                ),
              },
            ]}
            bottomSlot={
              <>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Pricing Details
                </h3>
                <SpecTable
                  rows={[
                    {
                      label: "Subtotal",
                      value: formatNaira(order?.subtotal_amount),
                    },
                    { label: "Tax", value: formatNaira(order?.tax_amount) },
                    {
                      label: "Insurance",
                      value: order?.insurance_selected
                        ? formatNaira(order.insurance_amount)
                        : "Not selected",
                    },
                    {
                      label: "Payment Status",
                      value: order ? (
                        <Badge variant={getBadgeVariant(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Total Paid",
                      value: (
                        <span className="text-lg font-bold text-[#1E202E]">
                          {formatNaira(order?.total_amount)}
                        </span>
                      ),
                    },
                  ]}
                />
              </>
            }
          />
        }
        rightCard={
          <OrderRightCard
            qrValue={qrValue}
            orderInfo={{
              orderId: order?.order_reference ?? orderId,
              createdAt: order?.created_at,
              createdBy,
              extraRows: [
                {
                  label: "Order Status",
                  value: order ? (
                    <OrderStatusBadge status={order.order_status} />
                  ) : (
                    "—"
                  ),
                },
                ...(hasDamage
                  ? [
                      {
                        label: "Damage Report",
                        value: <Badge variant={"destructive"}>Damage</Badge>,
                      },
                    ]
                  : []),
              ],
            }}
            timeline={timeline}
          />
        }
      />

      <DamageReportDialog
        open={viewDamageOpen}
        onOpenChange={setViewDamageOpen}
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
