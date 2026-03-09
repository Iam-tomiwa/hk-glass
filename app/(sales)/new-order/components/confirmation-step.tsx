import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ConfirmationStep() {
  const searchParams = useSearchParams();
  const rawReference = searchParams.get("reference");

  // Clean up order ID or provide a fallback
  const orderId = rawReference
    ? rawReference.startsWith("ORD-")
      ? rawReference
      : `ORD-${rawReference.substring(0, 9).toUpperCase()}`
    : "ORD-2026-9334";

  return (
    <div className="flex flex-col md:max-w-max mx-auto py-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1E202E] tracking-tight mb-2">
          Confirmation
        </h2>
        <p className="text-neutral-500 font-medium text-[15px]">
          Your order has been confirmed and is ready for production
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start w-full">
        <div className="flex flex-col gap-4 w-full md:w-[50%] shrink-0">
          <div className="bg-white rounded-xl border border-neutral-100 p-6 flex flex-col gap-4">
            <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg">
              <QRCodeSVG
                value={orderId}
                size={350}
                level="M"
                className="w-full h-auto"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Badge
                variant="secondary"
                className="flex w-fit items-center gap-1.5 px-3 py-1 text-sm font-medium border-transparent shadow-none rounded-full bg-[#FEF3C7] text-[#92400E]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]"></span>
                Paid
              </Badge>
              <h3 className="text-3xl font-bold tracking-tight text-[#1E202E]">
                {orderId}
              </h3>
              <p className="text-[15px] text-neutral-500 font-medium">
                A confirmation email has been sent to{" "}
                <span className="font-bold text-neutral-700">tk@gmail.com</span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/sales/orders/${orderId}`} passHref>
              <Button className="bg-[#00AE4D] hover:bg-[#009b44] text-white rounded-md font-medium h-10 px-6">
                View Order Details
              </Button>
            </Link>
            <Link href="/sales/new-order" passHref>
              <Button
                variant="outline"
                className="h-10 px-6 rounded-md font-medium bg-white border-neutral-200 text-[#1E202E] hover:bg-neutral-50"
              >
                Create New Order
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-6 w-full max-w-[420px]">
          <h3 className="text-[17px] font-bold text-[#1E202E] mb-4">
            Next Steps
          </h3>
          <p className="text-[15px] text-neutral-600 font-medium leading-relaxed mb-6">
            The production team will receive this order via QR code scan and the
            customer will be notified when order is ready for pickup.
          </p>
          <p className="text-[15px] text-[#1E202E] font-semibold">
            Estimated production time: 3-5 business days
          </p>
        </div>
      </div>
    </div>
  );
}
