"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import TimelineItem, { TimelineEvent } from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant } from "@/lib/utils";
import { useGetOrder } from "@/services/queries/orders";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import SuspenseContainer from "@/components/custom-suspense";

export default function OrderDetailsPage() {
  const params = useParams();
  const { data, isLoading, error, isError } = useGetOrder(params.id as string);

  // Type cast for flexibility since actual return might be OrderPublicDetailResponse
  const orderDetail = data as any;

  const customerInfoRows = [
    { label: "Full Name", value: orderDetail.customer_name },
    { label: "Email Address", value: orderDetail.customer_email },
    { label: "Phone Number", value: orderDetail.customer_phone },
  ];

  const glassSpecRows = [
    { label: "Glass Type", value: orderDetail.glass_type?.name || "N/A" },
    {
      label: "Dimensions",
      value: `${orderDetail.width} x ${orderDetail.height}`,
    },
    { label: "Area", value: `${orderDetail.area} sqm` },
    { label: "Sheet Size", value: orderDetail.sheet_size || "N/A" },
    { label: "Thickness", value: orderDetail.thickness || "N/A" },
    {
      label: "Drill Holes",
      value: orderDetail.drill_holes_count?.toString() || "None",
    },
  ];
  if (orderDetail.hole_diameter)
    glassSpecRows.push({
      label: "Hole Diameter",
      value: `${orderDetail.hole_diameter}`,
    });
  if (orderDetail.tint_type)
    glassSpecRows.push({ label: "Tint Type", value: orderDetail.tint_type });
  if (orderDetail.engraving_text)
    glassSpecRows.push({
      label: "Engraving",
      value: orderDetail.engraving_text,
    });

  const mappedAddons =
    orderDetail.addons?.length > 0
      ? orderDetail.addons.map((a: any) => ({
          label: a.addon.name,
          value: `$${a.calculated_price}`,
        }))
      : [{ label: "No Add-ons", value: "-" }];

  const createdAt = orderDetail.created_at
    ? format(new Date(orderDetail.created_at), "EEEE, MMM d, yyyy 'at' h:mma")
    : "-";

  const productionAt = orderDetail.production_started_at
    ? format(
        new Date(orderDetail.production_started_at),
        "EEEE, MMM d, yyyy 'at' h:mma",
      )
    : undefined;
  const readyPickupAt = orderDetail.ready_pickup_at
    ? format(
        new Date(orderDetail.ready_pickup_at),
        "EEEE, MMM d, yyyy 'at' h:mma",
      )
    : undefined;
  const completedAt = orderDetail.completed_at
    ? format(new Date(orderDetail.completed_at), "EEEE, MMM d, yyyy 'at' h:mma")
    : undefined;

  const orderTimeline: TimelineEvent[] = [
    {
      title: "Order Placed",
      description: "An order has been placed successfully",
      date: createdAt,
      completed: true,
      active: true,
    },
    {
      title: "Production Started",
      description: "The order is in production",
      date: productionAt || "Pending",
      completed: !!productionAt,
      active: !!productionAt,
    },
    {
      title: "Ready for Pickup",
      description: "The order is ready for pickup",
      date: readyPickupAt || "Pending",
      completed: !!readyPickupAt,
      active: !!readyPickupAt,
    },
    {
      title: "Completed",
      description: "The order has been completed",
      date: completedAt || "Pending",
      completed: !!completedAt,
      active: !!completedAt,
    },
  ];

  return (
    <SuspenseContainer isLoading={isLoading} isError={isError} error={error}>
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Header */}
        <div className="bg-background border-b">
          <div className="container py-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E202E]">
              Order Details
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Order ID: {orderDetail.order_reference || orderDetail.id}
            </p>
          </div>
        </div>

        <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-6 px-4 xl:px-0">
          {/* ── Left card: Glass Specifications ── */}
          <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0 shadow-sm bg-white">
            <CardContent className="pb-4 px-0 pt-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Customer Information
              </h3>
              <SpecTable rows={customerInfoRows} />
            </CardContent>

            <CardContent className="py-4 px-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Glass Specifications
              </h3>
              <SpecTable rows={glassSpecRows} />
            </CardContent>

            <CardContent className="py-4 px-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Add-ons &amp; Services
              </h3>
              <SpecTable rows={mappedAddons} />
            </CardContent>

            <CardContent className="py-4 px-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Pricing Details
              </h3>
              <SpecTable
                rows={[
                  {
                    label: "Subtotal",
                    value: `$${orderDetail.subtotal_amount}`,
                  },
                  { label: "Tax", value: `$${orderDetail.tax_amount}` },
                  {
                    label: "Insurance",
                    value: `$${orderDetail.insurance_amount}`,
                  },
                ]}
              />
            </CardContent>
            <CardContent className="py-4 px-0">
              <SpecTable
                rows={[
                  {
                    label: "Total Paid",
                    value: (
                      <span className="text-lg font-bold text-[#1E202E]">
                        ${orderDetail.total_amount}
                      </span>
                    ),
                  },
                ]}
              />
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
                <QRCodeSVG
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/order/${orderDetail.id}`}
                  size={148}
                />
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
                    value: orderDetail.order_reference || orderDetail.id,
                  },
                  { label: "Created On", value: createdAt },
                  {
                    label: "Created By",
                    value: orderDetail.created_by_user?.name || "Customer",
                  },
                  {
                    label: "Status",
                    value: (
                      <Badge variant={getBadgeVariant(orderDetail.order_status)}>
                        {orderDetail.order_status}
                      </Badge>
                    ),
                  },
                  {
                    label: "Payment Status",
                    value: (
                      <Badge variant={getBadgeVariant(orderDetail.payment_status)}>
                        {orderDetail.payment_status}
                      </Badge>
                    ),
                  },
                ]}
              />
            </CardContent>

            {/* Timeline section */}
            <CardContent className="px-0 py-4 flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Order Status &amp; Timeline
              </h3>
              <div className="flex flex-col">
                {orderTimeline.map((event, i) => (
                  <TimelineItem
                    key={event.title}
                    event={event}
                    isLast={i === orderTimeline.length - 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuspenseContainer>
  );
}
