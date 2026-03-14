"use client";

import { Card, CardContent } from "@/components/ui/card";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatNaira } from "@/lib/utils";
import { useGetOrderByReference } from "@/services/queries/orders";
import { useParams } from "next/navigation";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";
import { useOrderDetails } from "@/hooks/use-order-details";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderQRSection } from "@/components/order-qr-section";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderByReference(orderId);

  const { glassSpecs, addOns } = useOrderDetails(order);

  const customerInfo = [
    { label: "Full Name", value: order?.customer_name ?? "—" },
    { label: "Email", value: order?.customer_email ?? "—" },
    { label: "Phone", value: order?.customer_phone ?? "—" },
  ];

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
        <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0  bg-white">
          <CardContent className="pb-4 px-0 pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Customer Information
            </h3>
            <SpecTable rows={customerInfo} />
          </CardContent>

          <CardContent className="py-4 px-0">
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

          <CardContent className="py-4 px-0">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Pricing and Payment Details
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
              ]}
            />
          </CardContent>

          <CardContent className="pt-4 pb-6 px-0">
            <SpecTable
              rows={[
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
          </CardContent>
        </Card>
      }
      rightCard={
        <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6  bg-white">
          <CardContent className="px-0">
            <OrderQRSection value={qrValue} />
          </CardContent>

          <CardContent className="px-0 py-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Order Information
            </h3>
            <SpecTable
              rows={[
                {
                  label: "Order ID",
                  value: order?.order_reference ?? orderId,
                },
                {
                  label: "Created On",
                  value: <DateTag date={order?.created_at ?? ""} />,
                },
                { label: "Created By", value: createdBy },
                {
                  label: "Order Status",
                  value: order ? (
                    <OrderStatusBadge status={order.order_status} />
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      }
    />
  );
}
