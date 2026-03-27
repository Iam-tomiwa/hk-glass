"use client";

import { useParams } from "next/navigation";
import {
  useGetOrderByReference,
  useGetOrderFiles,
} from "@/services/queries/orders";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import { AmountDisplay } from "@/components/amount-display";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant } from "@/lib/utils";
import OrderStatusBadge from "@/components/order-status-badge";
import SpecTable from "@/components/spec-item";

export default function OrderReviewPage() {
  const params = useParams();
  const orderReference = params.order_reference as string;

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderByReference(orderReference);
  const { data: orderFiles } = useGetOrderFiles(order?.id ?? "");

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/${orderReference}`
      : orderReference;

  return (
    <OrderDetailShell
      description={`Order ID: ${order?.order_reference ?? orderReference} — Please review your order below`}
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
            orderId: order?.order_reference ?? orderReference,
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
        />
      }
    />
  );
}
