import { QRCodeSVG } from "qrcode.react";

interface OrderQRSectionProps {
  /** The URL or string that the QR code should encode. */
  value: string;
  size?: number;
}

/**
 * The "Production QR Code" panel used inside the right card on both the sales
 * and factory order-detail pages. Renders a heading, helper text, and the QR
 * code itself in a consistent bordered container.
 */
export function OrderQRSection({ value, size = 148 }: OrderQRSectionProps) {
  return (
    <div className="flex flex-col items-center pb-4 pt-6">
      <h2 className="text-base font-bold text-gray-900">Production QR Code</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5 text-center">
        Scan to view order in production system
      </p>
      <div className="p-2 bg-white rounded-lg  border">
        <QRCodeSVG value={value || " "} size={size} />
      </div>
    </div>
  );
}
