"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import QrCodeScanner from "@/components/qr-code-scanner";

export default function ScanOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const handleScanResult = useCallback((result: string) => {
    setScannedResult(result);
    setOrderId(result);
  }, []);

  const handleLookupOrder = () => {
    if (!orderId.trim()) return;
    console.log("Looking up order:", orderId);
  };

  return (
    <div className="min-h-screen flex items-start justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Scan Order
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xs leading-relaxed">
            Scan and Position QR code within the frame or enter the Order ID
            manually to retrieve production details
          </p>
        </div>

        {/* Main content */}
        <div className="flex items-stretch gap-0">
          {/* QR Scanner — inline, no modal */}
          <div className="flex-shrink-0 w-[340px]">
            <div
              className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              style={{ height: 340 }}
            >
              <CornerBrackets />

              {/* Live camera mounts directly here */}
              <QrCodeScanner
                onResult={handleScanResult}
                facingMode="environment"
                className="w-full h-full"
              />

              <ScanLineAnimated />
            </div>

            {scannedResult && (
              <p className="mt-2 text-xs text-green-700 text-center">
                ✓ Scanned: {scannedResult}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center self-stretch justify-center px-8">
            <div className="flex-1 w-px bg-gray-200" />
            <span className="my-4 text-xs text-gray-400 font-medium bg-[#F5F5F5] px-1">
              or
            </span>
            <div className="flex-1 w-px bg-gray-200" />
          </div>

          {/* Manual Input */}
          <div className="flex-1 flex flex-col justify-center gap-4 max-w-sm">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="order-id"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                Enter Order ID manually{" "}
                <span className="text-red-500 text-base leading-none">*</span>
              </Label>
              <Input
                id="order-id"
                placeholder="e.g., ORD-2026-001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookupOrder()}
                className="h-11 text-sm border-gray-300 focus-visible:ring-green-500 placeholder:text-gray-400 rounded-lg"
              />
            </div>

            <Button
              onClick={handleLookupOrder}
              disabled={!orderId.trim()}
              className="h-11 w-full bg-[#2E9B4E] hover:bg-[#27873F] active:bg-[#1F6E32] text-white font-semibold text-sm rounded-lg transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Lookup Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerBrackets() {
  const size = 32;
  const thickness = 3;
  const color = "#1A1A1A";
  const inset = 18;

  const style = (
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    left?: number | string,
  ): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    top,
    right,
    bottom,
    left,
    zIndex: 10,
    borderColor: color,
    borderStyle: "solid",
    borderWidth: 0,
    ...(top !== undefined && left !== undefined
      ? { borderTopWidth: thickness, borderLeftWidth: thickness }
      : top !== undefined && right !== undefined
        ? { borderTopWidth: thickness, borderRightWidth: thickness }
        : bottom !== undefined && left !== undefined
          ? { borderBottomWidth: thickness, borderLeftWidth: thickness }
          : { borderBottomWidth: thickness, borderRightWidth: thickness }),
    borderRadius: 2,
  });

  return (
    <>
      <div style={style(inset, undefined, undefined, inset)} />
      <div style={style(inset, inset, undefined, undefined)} />
      <div style={style(undefined, undefined, inset, inset)} />
      <div style={style(undefined, inset, inset, undefined)} />
    </>
  );
}

function ScanLineAnimated() {
  return (
    <>
      <style>{`
        @keyframes scanline {
          0%   { top: 18px; }
          50%  { top: calc(100% - 18px); }
          100% { top: 18px; }
        }
      `}</style>
      <div
        className="absolute left-[18px] right-[18px] h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-70 pointer-events-none"
        style={{ animation: "scanline 2.4s ease-in-out infinite", zIndex: 10 }}
      />
    </>
  );
}
