"use client";

import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import {
  useGetOrderByReference,
  useGetOrderFiles,
} from "@/services/queries/orders";
import { useUpdateFactoryOrderStatus } from "@/services/queries/factory";
import { useParams } from "next/navigation";
import OrderStatusBadge from "@/components/order-status-badge";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import { AmountDisplay } from "@/components/amount-display";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderByReference(orderId);

  const { data: orderFiles } = useGetOrderFiles(order?.id ?? "");
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateFactoryOrderStatus();
  const { openConfirmModal } = useConfirmations();

  const isReadyForPickup = order?.order_status === "ready_pickup";

  function handleCompleteOrder() {
    if (!order?.id) return;
    openConfirmModal(
      "Are you sure you want to mark this order as completed? The customer will be notified.",
      () => {
        updateStatus({
          order_id: order.id,
          data: { order_status: "completed" },
        });
      },
      { title: "Complete Order" },
    );
  }

  const createdBy =
    (order as any)?.created_by_user?.name ??
    (order as any)?.created_by_user?.email ??
    "Staff";

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/${orderId}`
      : orderId;

  return (
    <OrderDetailShell
      description={`Order ID: ${order?.order_reference ?? orderId}`}
      backHref="/"
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
            { label: "Email", value: order?.customer_email ?? "—" },
            { label: "Phone", value: order?.customer_phone ?? "—" },
          ]}
          bottomSlot={
            <>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Pricing and Payment Details
              </h3>
              <SpecTable
                rows={[
                  {
                    label: "Subtotal",
                    value: (
                      <AmountDisplay
                        showFullAmount
                        amount={order?.subtotal_amount}
                      />
                    ),
                  },
                  {
                    label: "Tax",
                    value: (
                      <AmountDisplay
                        showFullAmount
                        amount={order?.tax_amount}
                      />
                    ),
                  },
                  {
                    label: "Insurance",
                    value: order?.insurance_selected ? (
                      <AmountDisplay
                        showFullAmount
                        amount={order.insurance_amount}
                      />
                    ) : (
                      "Not selected"
                    ),
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
                      <AmountDisplay
                        showFullAmount
                        amount={order?.total_amount}
                      />
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
            ],
          }}
          // footer={
          //   isReadyForPickup ? (
          //     <Button
          //       onClick={handleCompleteOrder}
          //       disabled={isUpdating}
          //       className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg"
          //     >
          //       {isUpdating ? "Completing..." : "Complete Order"}
          //     </Button>
          //   ) : undefined
          // }
        />
      }
    />
  );
}
