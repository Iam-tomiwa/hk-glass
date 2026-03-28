"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useGetOrderByReference } from "@/services/queries/orders";
import { getBadgeVariant } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glasstronic | Payment Confirmation",
  description: "Engineered Glass for Modern Construction.",
};

function PaymentConfirmationContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const status = searchParams.get("status");

  const { data: order } = useGetOrderByReference(id ?? "");

  const isFailed = status === "failed" || status === "cancelled";

  const displayOrderId =
    order?.order_reference ?? order?.id ?? id ?? reference ?? "—";

  const qrValue =
    order?.qr_code_token ?? order?.id ?? id ?? reference ?? displayOrderId;

  const customerEmail = order?.customer_email;

  if (isFailed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500 max-w-[700px] w-[95%] mx-auto text-center">
        <AlertCircle className="size-10 text-red-500" />
        <h2 className="text-xl font-bold text-[#1E202E]">Payment Failed</h2>
        <p className="text-sm text-neutral-500">
          Your payment could not be processed. You can retry or contact support.
        </p>
        <p className="text-xs font-mono text-neutral-400">
          Reference: {reference ?? "—"}
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/new-order">
            <Button className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] rounded-md h-10 px-6">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="h-10 px-6 rounded-md border-neutral-200"
            >
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:max-w-max mx-auto py-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-start gap-3">
        <CheckCircle2 className="size-8 text-[#00AE4D] mt-0.5 shrink-0" />
        <div>
          <h2 className="text-3xl font-bold text-[#1E202E] tracking-tight mb-1">
            Confirmation
          </h2>
          <p className="text-neutral-500 font-medium text-[15px]">
            Your order has been confirmed and is ready for production
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start w-full">
        {/* Left: QR + order badge */}
        <div className="flex flex-col gap-4 md:max-w-[500px]">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="w-full aspect-square flex items-center justify-center">
                <QRCodeSVG
                  value={qrValue}
                  size={250}
                  level="M"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Badge
                  variant={getBadgeVariant("pending")}
                  className="flex w-fit items-center gap-1.5 px-3 py-1 text-sm font-medium border-transparent shadow-none rounded-full"
                >
                  Paid
                </Badge>
                <h3 className="text-3xl font-bold tracking-tight text-[#1E202E]">
                  {displayOrderId}
                </h3>
                {reference && (
                  <p className="text-xs font-mono text-neutral-400">
                    Payment ref: {reference}
                  </p>
                )}
                {customerEmail && (
                  <p className="text-[15px] text-neutral-500 font-medium">
                    A confirmation email has been sent to{" "}
                    <span className="font-bold text-neutral-700">
                      {customerEmail || "your email"}
                    </span>
                    .
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            {(order?.id || id) && (
              <Link href={`/${order?.order_reference ?? id}`} passHref>
                <Button>View Order Details</Button>
              </Link>
            )}
            <Link href="/" passHref>
              <Button variant="outline">Back To Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Right: Next steps */}
        <Card className="w-full md:min-w-[40%] md:max-w-[420px]">
          <CardHeader>
            <CardTitle className="text-[17px] font-bold text-[#1E202E]">
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[15px] text-neutral-600 font-medium leading-relaxed mb-4">
              The production team will receive this order via QR code scan and
              the customer will be notified when the order is ready for pickup.
            </p>
            <p className="text-[15px] text-[#1E202E] font-semibold">
              Estimated production time: 3-5 business days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24 text-neutral-400">
            Loading...
          </div>
        }
      >
        <PaymentConfirmationContent />
      </Suspense>
    </div>
  );
}
