"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatNaira } from "@/lib/utils";
import { Header } from "@/components/header";
import Link from "next/link";
import { X } from "lucide-react";
import { useGetOrder } from "@/services/queries/orders";
import { useParams } from "next/navigation";
import SuspenseContainer from "@/components/custom-suspense";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, isError, error } = useGetOrder(orderId);

  const customerInfo = [
    { label: "Full Name", value: order?.customer_name ?? "—" },
    { label: "Email", value: order?.customer_email ?? "—" },
    { label: "Phone", value: order?.customer_phone ?? "—" },
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
      value: order?.drill_holes_count
        ? String(order.drill_holes_count)
        : "None",
    },
    ...(order?.hole_diameter
      ? [{ label: "Hole Diameter", value: String(order.hole_diameter) }]
      : []),
    ...(order?.tint_type
      ? [{ label: "Tint Type", value: order.tint_type }]
      : []),
    ...(order?.engraving_text
      ? [{ label: "Engraving", value: order.engraving_text }]
      : []),
  ];

  const addOns =
    (order as any)?.addons?.length > 0
      ? (order as any).addons.map((a: any) => ({
          label: a.addon?.name ?? "Add-on",
          value: `$${a.calculated_price}`,
        }))
      : [{ label: "No add-ons", value: "—" }];

  const createdBy =
    (order as any)?.created_by_user?.name ??
    (order as any)?.created_by_user?.email ??
    "Staff";

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/${orderId}`
      : orderId;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header
        title="Order Details"
        description={`Order ID: ${order?.order_reference ?? orderId}`}
      >
        <Link href="/">
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
          {/* ── Left card ── */}
          <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0 shadow-sm bg-white">
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

          {/* ── Right card ── */}
          <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6 shadow-sm bg-white">
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
        </div>
      </SuspenseContainer>
    </div>
  );
}
