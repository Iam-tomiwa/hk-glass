"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatNaira } from "@/lib/utils";
import {
  useGetOrderByReference,
  useGetOrderById,
  useGetOrderFiles,
} from "@/services/queries/orders";
import { useParams } from "next/navigation";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";
import { useOrderDetails } from "@/hooks/use-order-details";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderQRSection } from "@/components/order-qr-section";
import { FileText, Image, PenLine } from "lucide-react";
import { ImageModal } from "@/components/image-modal";
import { FileListModal } from "@/components/file-list-modal";
import { format, parseISO } from "date-fns";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: orderRef } = useGetOrderByReference(orderId);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderById(orderRef?.id ?? "");

  const { data: orderFiles } = useGetOrderFiles(orderRef?.id ?? "");

  const { glassSpecs, addOns } = useOrderDetails(order);

  const [engravingOpen, setEngravingOpen] = useState(false);
  const [specFilesOpen, setSpecFilesOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);

  const customerInfo = [
    { label: "Full Name", value: order?.customer_name ?? "—" },
    { label: "Email", value: order?.customer_email ?? "—" },
    { label: "Phone", value: order?.customer_phone ?? "—" },
  ];

  const createdBy =
    (order as any)?.created_by_user?.name ??
    (order as any)?.created_by_user?.email ??
    "Staff";

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/${orderId}`
      : orderId;

  const engravingImages =
    orderFiles?.engraving_image_files?.map((f) => ({
      url: f.download_url,
      name: f.file_path.split("/").pop(),
    })) ?? [];

  const specFiles =
    orderFiles?.specification_files?.map((f, i) => ({
      name: f.file_path.split("/").pop() ?? `file-${i + 1}`,
      url: f.download_url,
      date: order?.created_at
        ? format(parseISO(order.created_at), "dd MMM, yyyy | h:mma")
        : undefined,
    })) ?? [];

  const signatureImages = orderFiles?.signature_file
    ? [
        {
          url: orderFiles.signature_file.download_url,
          name: "signature.png",
        },
      ]
    : [];

  const damageImages =
    orderFiles?.damage_files?.map((f) => ({
      url: f.download_url,
      name: f.file_path.split("/").pop(),
    })) ?? [];

  return (
    <>
      <OrderDetailShell
        description={`Order ID: ${order?.order_reference ?? orderId}`}
        backHref="/"
        isLoading={isLoading}
        isError={isError}
        error={error}
        leftCard={
          <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0  bg-white">
            <CardContent className="pb-4 px-0 pt-6">
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
                  {
                    label: "Subtotal",
                    value: formatNaira(order?.subtotal_amount),
                  },
                  { label: "Tax", value: formatNaira(order?.tax_amount) },
                  {
                    label: "Insurance",
                    value: order?.insurance_selected
                      ? formatNaira(order.insurance_amount)
                      : "Not selected",
                  },
                  {
                    label: "Payment Status",
                    value: order ? (
                      <Badge variant={getBadgeVariant(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    ) : (
                      "—"
                    ),
                  },
                ]}
              />
            </CardContent>

            <CardContent className="pt-4 pb-6 px-0">
              <SpecTable
                rows={[
                  {
                    label: "Total Paid",
                    value: (
                      <span className="text-lg font-bold text-[#1E202E]">
                        {formatNaira(order?.total_amount)}
                      </span>
                    ),
                  },
                ]}
              />
            </CardContent>

            {/* Specification Files */}
            {specFiles.length > 0 && (
              <CardContent className="py-4 px-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="size-4" /> Specification Files
                  </h3>
                  <button
                    onClick={() => setSpecFilesOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Files ({specFiles.length})
                  </button>
                </div>
              </CardContent>
            )}

            {/* Engraving Images */}
            {engravingImages.length > 0 && (
              <CardContent className="py-4 px-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Image className="size-4" /> Engraving Images
                  </h3>
                  <button
                    onClick={() => setEngravingOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Image{engravingImages.length > 1 ? "s" : ""} (
                    {engravingImages.length})
                  </button>
                </div>
              </CardContent>
            )}

            {/* Damage Images */}
            {damageImages.length > 0 && (
              <CardContent className="py-4 px-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Damage Report Files
                  </h3>
                  <button
                    onClick={() => setDamageOpen(true)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    View Images ({damageImages.length})
                  </button>
                </div>
              </CardContent>
            )}

            {/* Signature */}
            {signatureImages.length > 0 && (
              <CardContent className="py-4 px-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <PenLine className="size-4" /> Customer Signature
                  </h3>
                  <button
                    onClick={() => setSignatureOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Signature
                  </button>
                </div>
              </CardContent>
            )}
          </Card>
        }
        rightCard={
          <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6  bg-white">
            <CardContent className="px-0">
              <OrderQRSection value={qrValue} />
            </CardContent>

            <CardContent className="px-0 py-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Order Information
              </h3>
              <SpecTable
                rows={[
                  {
                    label: "Order ID",
                    value: order?.order_reference ?? orderId,
                  },
                  {
                    label: "Created On",
                    value: <DateTag date={order?.created_at ?? ""} />,
                  },
                  { label: "Created By", value: createdBy },
                  {
                    label: "Order Status",
                    value: order ? (
                      <OrderStatusBadge status={order.order_status} />
                    ) : (
                      "—"
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        }
      />

      <ImageModal
        images={engravingImages}
        open={engravingOpen}
        onOpenChange={setEngravingOpen}
        title="Engraving Images"
        description="View Engraving Image"
      />

      <FileListModal
        files={specFiles}
        open={specFilesOpen}
        onOpenChange={setSpecFilesOpen}
        title="Specification Files"
      />

      <ImageModal
        images={signatureImages}
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        title="Customer Signature"
        description="Signed by customer"
      />

      <ImageModal
        images={damageImages}
        open={damageOpen}
        onOpenChange={setDamageOpen}
        title="Damage Report Images"
      />
    </>
  );
}
