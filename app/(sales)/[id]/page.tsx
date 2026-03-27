"use client";

import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import {
  useGetOrderByReference,
  useGetOrderFiles,
} from "@/services/queries/orders";
import { useInitializePayment } from "@/services/queries/payments";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrderStatusBadge from "@/components/order-status-badge";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderLeftCard } from "@/components/order-left-card";
import { OrderRightCard } from "@/components/order-right-card";
import { AmountDisplay } from "@/components/amount-display";

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

  const isPaymentPending = order?.payment_status === "pending";

  const { mutateAsync: initializePayment, isPending: isInitializingPayment } =
    useInitializePayment();

  async function handleMakePayment() {
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

  const createdBy =
    order?.created_by_user?.name ?? order?.created_by_user?.email ?? "Staff";

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
          footer={
            <div className="flex gap-2 w-full">
              {isPaymentPending && (
                <>
                  <Button
                    onClick={handleMakePayment}
                    disabled={isInitializingPayment}
                    className={"grow"}
                  >
                    {isInitializingPayment ? "Redirecting..." : "Make Payment"}
                  </Button>
                  <Button variant="outline" className={"grow"}>
                    <Link href={`/edit-order/${order.order_reference}`}>
                      Edit Order
                    </Link>
                  </Button>
                </>
              )}
            </div>
          }
        />
      }
    />
  );
}
