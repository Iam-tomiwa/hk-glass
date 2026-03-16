"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TimelineItem, { TimelineEvent } from "@/components/timeline-item";
import SpecTable from "@/components/spec-item";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatNaira } from "@/lib/utils";
import { useGetOrder, useGetAdminOrderFiles } from "@/services/queries/admin";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useOrderDetails } from "@/hooks/use-order-details";
import { OrderDetailShell } from "@/components/order-detail-shell";
import { OrderQRSection } from "@/components/order-qr-section";
import DateTag from "@/components/date-tag";
import { FileText, Image, PenLine } from "lucide-react";
import { ImageModal } from "@/components/image-modal";
import { FileListModal } from "@/components/file-list-modal";

const ORDER_STATUSES = [
  "pending",
  "in_production",
  "ready_pickup",
  "completed",
  "collected",
];

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy 'at' h:mma");
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, isError, error } = useGetOrder(orderId);
  const hasDamage = !!order?.damage_reported_at;

  const { data: orderFiles } = useGetAdminOrderFiles(orderId);

  const { glassSpecs, addOns } = useOrderDetails(order);

  const [engravingOpen, setEngravingOpen] = useState(false);
  const [specFilesOpen, setSpecFilesOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);
  const [viewDamageOpen, setViewDamageOpen] = useState(false);

  const currentStatusIndex = ORDER_STATUSES.indexOf(order?.order_status ?? "");

  const customerInfo = [
    { label: "Full Name", value: order?.customer_name ?? "—" },
    { label: "Email Address", value: order?.customer_email ?? "—" },
    { label: "Phone Number", value: order?.customer_phone ?? "—" },
  ];

  const timeline: TimelineEvent[] = [
    {
      title: "Payment Completed",
      description: "The customer completed payment",
      date: formatDate(order?.created_at),
      completed: currentStatusIndex >= 0,
      active: currentStatusIndex >= 0,
    },
    {
      title: "In Production",
      description: "The order is in production.",
      date: formatDate(order?.production_started_at),
      completed: currentStatusIndex >= 1,
      active: currentStatusIndex >= 1,
    },
    ...(hasDamage
      ? [
          {
            title: "Item Damage Reported",
            description: "An item was reported damaged",
            date: formatDate(order?.damage_reported_at),
            completed: true,
            active: true,
            variant: "damage" as const,
            link: {
              text: "View Damage Report",
              onClick: () => setViewDamageOpen(true),
            },
          },
        ]
      : []),
    {
      title: "Production Completed",
      description: "Factory station has completed production",
      date: formatDate(order?.ready_pickup_at),
      completed: currentStatusIndex >= 2,
      active: currentStatusIndex >= 2,
    },
    {
      title: "Ready For Pickup",
      description: "The item is ready for pickup",
      date: formatDate(order?.ready_pickup_at),
      completed: currentStatusIndex >= 3,
      active: currentStatusIndex >= 3,
    },
    {
      title: "Item Collected",
      description: "This item has been picked up",
      date: formatDate(order?.completed_at),
      completed: currentStatusIndex >= 4,
      active: currentStatusIndex >= 4,
    },
  ];

  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/order/${orderId}`
      : orderId;

  const createdBy =
    (order as any)?.created_by_user?.name ??
    (order as any)?.created_by_user?.email ??
    "Customer";

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
    ? [{ url: orderFiles.signature_file.download_url, name: "signature.png" }]
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
        backHref="/admin/orders"
        isLoading={isLoading}
        isError={isError}
        error={error}
        leftCard={
          <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0 bg-white">
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
                Pricing Details
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
                  {
                    label: "Delivery Method",
                    value:
                      order?.delivery_method === "delivery"
                        ? "Delivery"
                        : "Pickup",
                  },
                  ...(order?.delivery_method === "delivery" &&
                  order?.delivery_address
                    ? [
                        {
                          label: "Delivery Address",
                          value: order.delivery_address,
                        },
                      ]
                    : []),
                  ...(order?.delivery_method === "delivery" && order?.delivery_fee
                    ? [
                        {
                          label: "Delivery Fee",
                          value: formatNaira(order.delivery_fee),
                        },
                      ]
                    : []),
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
          <Card className="border border-gray-200 h-max rounded-2xl flex flex-col divide divide-y px-6 bg-white">
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
                    label: "Status",
                    value: order ? (
                      <Badge
                        variant="outline"
                        className="capitalize font-medium text-xs"
                      >
                        {order.payment_status}
                      </Badge>
                    ) : (
                      "—"
                    ),
                  },
                  ...(hasDamage
                    ? [
                        {
                          label: "Damage Report",
                          value: (
                            <Badge className="bg-red-100 text-red-700 border-red-200 font-medium text-xs shadow-none hover:bg-red-100">
                              Damage
                            </Badge>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </CardContent>

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

      <Dialog open={viewDamageOpen} onOpenChange={setViewDamageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Damage Report</DialogTitle>
            <p className="text-sm text-neutral-500">
              Reported on {formatDate(order?.damage_reported_at)}
            </p>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-[#1E202E] mb-1">Damage Reason</p>
              <p className="text-neutral-600">{order?.damage_reason ?? "—"}</p>
            </div>
            {order?.damage_notes && (
              <div>
                <p className="font-medium text-[#1E202E] mb-1">Notes</p>
                <p className="text-neutral-600">{order.damage_notes}</p>
              </div>
            )}
            {damageImages.length > 0 && (
              <div>
                <p className="font-medium text-[#1E202E] mb-1">
                  Attached Files ({damageImages.length})
                </p>
                <button
                  onClick={() => {
                    setViewDamageOpen(false);
                    setDamageOpen(true);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Images ({damageImages.length})
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
