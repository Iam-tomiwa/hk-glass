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
import { Header } from "@/components/header";
import Link from "next/link";
import { X } from "lucide-react";

export default function OrderDetailsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header title="Order Details" description="Order ID: ORD-2026-001">
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
                { label: "Created On", value: "ORD-2026-9334" },
                { label: "Created By", value: "ORD-2026-9334" },
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
        </Card>
      </div>
    </div>
  );
}
