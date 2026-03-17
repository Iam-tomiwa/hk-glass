"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderQRSection } from "@/components/order-qr-section";
import SpecTable from "@/components/spec-item";
import DateTag from "@/components/date-tag";
import TimelineItem, { TimelineEvent } from "@/components/timeline-item";

// ─── Order Info Row ───────────────────────────────────────────────────────────

export interface OrderInfoRow {
  label: string;
  value: ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OrderRightCardProps {
  /** Value encoded in the QR code */
  qrValue: string;

  /**
   * When provided, renders the "Order Information" section.
   * Pass `null` to hide it entirely (e.g. factory page).
   */
  orderInfo?: {
    orderId: string;
    createdAt?: string;
    createdBy?: string;
    /** Rendered as the last row(s) — typically a status badge or damage badge */
    extraRows?: OrderInfoRow[];
  } | null;

  /**
   * When provided, renders the "Order Status & Timeline" section.
   */
  timeline?: TimelineEvent[];

  /**
   * Optional footer content rendered below the timeline/order-info sections.
   * Useful for action buttons (factory page).
   */
  footer?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable right-column card shared by the sales, admin, and factory
 * order-detail pages.
 *
 * - Sales:   QR + Order Info (with status badge), no timeline
 * - Admin:   QR + Order Info (payment status + optional damage badge) + Timeline
 * - Factory: QR + Timeline + action buttons footer, no Order Info
 */
export function OrderRightCard({
  qrValue,
  orderInfo,
  timeline,
  footer,
}: OrderRightCardProps) {
  return (
    <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6 bg-white">
      {/* QR Code — always present */}
      <CardContent className="px-0">
        <OrderQRSection value={qrValue} />
      </CardContent>

      {/* Order Information — hidden when orderInfo is null/undefined */}
      {orderInfo != null && (
        <CardContent className="px-0 py-4">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Order Information
          </h3>
          <SpecTable
            rows={[
              { label: "Order ID", value: orderInfo.orderId },
              {
                label: "Created On",
                value: <DateTag date={orderInfo.createdAt ?? ""} />,
              },
              ...(orderInfo.createdBy
                ? [{ label: "Created By", value: orderInfo.createdBy }]
                : []),
              ...(orderInfo.extraRows ?? []),
            ]}
          />
        </CardContent>
      )}

      {/* Timeline — hidden when not provided */}
      {timeline && timeline.length > 0 && (
        <CardContent className="px-0 pt-5 pb-4 flex-1">
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
      )}

      {/* Footer — e.g. action buttons for the factory page */}
      {footer && <div className="px-0 pt-2 space-y-2">{footer}</div>}
    </Card>
  );
}
