"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { downloadOrderQRPDF } from "@/lib/qr-pdf";

interface OrderQRSectionProps {
  /** The URL or string that the QR code should encode. */
  value: string;
  size?: number;
  /** When provided, shows a download button that saves the QR as a PDF. */
  orderId?: string;
}

/**
 * The "Production QR Code" panel used inside the right card on both the sales
 * and factory order-detail pages. Renders a heading, helper text, and the QR
 * code itself in a consistent bordered container.
 */
export function OrderQRSection({
  value,
  size = 148,
  orderId,
}: OrderQRSectionProps) {
  return (
    <div className="flex flex-col items-center pb-4 pt-6">
      <h2 className="text-base font-bold text-gray-900">Production QR Code</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5 text-center">
        Scan to view order in production system
      </p>
      <div className="relative p-2 bg-white rounded-lg border">
        <QRCodeSVG value={value || " "} size={size} />
        {orderId && (
          <button
            onClick={() => downloadOrderQRPDF(value, orderId)}
            className="absolute bottom-2 right-2 p-1 rounded bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            title="Download QR as PDF"
          >
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
