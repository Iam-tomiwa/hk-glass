"use client";

import { useSearchParams } from "next/navigation";
import { useGetOrderById, useGetOrderFiles } from "@/services/queries/orders";
import { useInitializePayment } from "@/services/queries/payments";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import { AmountDisplay } from "@/components/amount-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import OrderStatusBadge from "@/components/order-status-badge";
import SpecTable from "@/components/spec-item";

export default function OrderReviewByIdContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? "";

  const { data: order, isLoading, isError, error } = useGetOrderById(orderId);
  const { data: orderFiles } = useGetOrderFiles(order?.id ?? "");
  const { mutateAsync: initializePayment, isPending: isInitializingPayment } =
    useInitializePayment();

  const isPaymentPending = order?.payment_status === "pending";

  async function handleProceedToPayment() {
    if (!order?.id) return;
    try {
      const res = await initializePayment({ data: { order_id: order.id } });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch {
      // error already toasted by the mutation
    }
  }

  const qrValue =
    typeof window !== "undefined" && order?.order_reference
      ? `${window.location.origin}/${order.order_reference}`
      : orderId;

  return (
    <OrderDetailShell
      description={`Order ID: ${order?.order_reference ?? orderId} — Please review your order below`}
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
            {
              label: "Email",
              value: order?.customer_email ? (
                <a
                  className="hover:underline"
                  href={`mailto:${order.customer_email}`}
                >
                  {order.customer_email}
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
                  href={`tel:${order.customer_phone}`}
                >
                  {order.customer_phone}
                </a>
              ) : (
                "—"
              ),
            },
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
                    label: "Total",
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
          footer={
            isPaymentPending ? (
              <Button
                onClick={handleProceedToPayment}
                disabled={isInitializingPayment}
                className="w-full bg-[#16a34a] hover:bg-[#15803d]"
              >
                {isInitializingPayment
                  ? "Redirecting..."
                  : "Proceed to Payment"}
              </Button>
            ) : undefined
          }
        />
      }
    />
  );
}
