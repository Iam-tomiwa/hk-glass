"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import TimelineItem from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import useConfirmations from "@/app/confirmations-provider/use-confirmations";
import { addOns, customerInfo, glassSpecs, timeline } from "@/lib/constant";
import { Badge } from "@/components/ui/badge";
import { cn, getBadgeClassName } from "@/lib/utils";

export default function OrderDetailsPage() {
  const { openConfirmModal } = useConfirmations();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#1E202E]">
            Order Details
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Order ID: ORD-2026-001
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
        {/* ── Left card: Glass Specifications ── */}

        <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0">
          <CardContent className="pb-4 px-0">
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
                { label: "Payment Method", value: "Credit Card" },
                { label: "Insurance:", value: "Yes" },
              ]}
            />
          </CardContent>
          <CardContent className="pt-4 px-0">
            <SpecTable
              rows={[
                {
                  label: "Total Paid",
                  value: <span className="text-lg">$842.40</span>,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* ── Right card: QR + Timeline ── */}
        <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6">
          {/* QR Code section */}
          <CardContent className="px-0 flex flex-col items-center pb-4">
            <h2 className="text-base font-bold text-gray-900">
              Production QR Code
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-5">
              Scan to view order in production system
            </p>
            <div className="p-2 bg-white rounded-lg">
              <QRCodeSVG
                value="https://example.com/order/ORD-2026-001"
                size={148}
              />
            </div>
          </CardContent>

          <CardContent className="px-0 pb-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Order Information
            </h3>
            <SpecTable
              rows={[
                { label: "Order ID", value: "ORD-2026-9334" },
                {
                  label: "Created On",
                  value: "Wednesday, Feb 20, 2026 at 3:30PM",
                },
                { label: "Created By", value: "sales@glassco.com" },
                {
                  label: "Status",
                  value: (
                    <Badge
                      className={cn(getBadgeClassName("Paid").badgeClasses)}
                    >
                      Paid
                    </Badge>
                  ),
                },
              ]}
            />
          </CardContent>

          {/* Timeline section */}
          <CardContent className="px-0 pb-4 flex-1">
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
        </Card>
      </div>
    </div>
  );
}
