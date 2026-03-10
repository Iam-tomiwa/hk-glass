"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import TimelineItem from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import { addOns, glassSpecs, timeline } from "@/lib/constant";
import { Header } from "@/components/header";
import Link from "next/link";
import { X } from "lucide-react";

export default function OrderDetailsPage() {
  const { openConfirmModal } = useConfirmations();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <Header title="Order Details" description="Order ID: ORD-2026-001">
        <Link href="/factory">
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
        <Card className="border border-gray-200 h-max rounded-2xl">
          <CardContent className="py-2">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Glass Specifications
            </h3>
            <SpecTable rows={glassSpecs} />
          </CardContent>

          <div className="mx-6 border-t border-gray-100" />

          <CardContent className="py-2">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Add-ons &amp; Services
            </h3>
            <SpecTable rows={addOns} />
          </CardContent>
        </Card>

        {/* ── Right card: QR + Timeline ── */}
        <Card className="border border-gray-200 h-max rounded-2xl flex flex-col">
          {/* QR Code section */}
          <CardContent className="pt-6 pb-4 px-6 flex flex-col items-center border-b border-gray-100">
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

          {/* Timeline section */}
          <CardContent className="pt-5 px-6 pb-4 flex-1">
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

          {/* Update button */}
          <div className="px-4 pb-4">
            <Button
              onClick={() =>
                openConfirmModal(
                  "Are you sure you want to update the order status?",
                  () => {
                    console.log("Order status updated");
                  },
                  {
                    title: "Confirm Status Update",
                  },
                )
              }
              className="w-full h-11 text-white font-semibold text-sm rounded-lg"
            >
              Update Order Status
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
