"use client";

import { useState, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SpecTable from "@/components/spec-item";
import { ImageModal } from "@/components/image-modal";
import { FileListModal } from "@/components/file-list-modal";
import { useOrderDetails } from "@/hooks/use-order-details";
import { formatNaira } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type {
  OrderResponse,
  OrderFileLinksResponse,
} from "@/services/types/openapi";

// ─── Types ─────────────────────────────────────────────────────────────────

type SpecRow = {
  label: string;
  value: ReactNode;
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OrderLeftCardProps {
  /** The order data (undefined while loading). */
  order: OrderResponse | undefined;
  /** The files response (undefined while loading). */
  orderFiles: OrderFileLinksResponse | undefined;

  /**
   * Extra rows prepended to the Customer Information section.
   * When provided, a "Customer Information" heading + these rows are shown at the top.
   * Pass `null` or omit to hide the section entirely (factory page).
   */
  customerRows?: SpecRow[] | null;

  /**
   * When true, appends a "Signature:" row to the customer section that
   * opens the signature modal (only shown if a signature file exists).
   * Defaults to false.
   */
  showSignatureRow?: boolean;

  /**
   * Optional slot rendered after Delivery Details.
   * Use this for pricing / payment rows on the sales & admin pages.
   */
  bottomSlot?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable left-column card shared by the sales, admin, and factory
 * order-detail pages.
 *
 * Owns all modal state internally — pages no longer need useState for modals.
 *
 * Always renders:
 *  - Glass Specifications
 *  - Add-ons & Services  (with engraving-image link when files exist)
 *  - Delivery Details    (conditional on delivery_method)
 *  - Damage Images       (conditional)
 *
 * Optional sections via props:
 *  - customerRows / showSignatureRow  — customer info block (sales & admin)
 *  - showSpecifications               — notes + spec files (sales)
 *  - bottomSlot                       — pricing / payment (sales & admin)
 */
export function OrderLeftCard({
  order,
  orderFiles,
  customerRows,
  showSignatureRow = false,
  bottomSlot,
}: OrderLeftCardProps) {
  const { glassSpecs, addOns } = useOrderDetails(order);

  // ── Modal state (all owned here) ──────────────────────────────────────────
  const [engravingOpen, setEngravingOpen] = useState(false);
  const [specFilesOpen, setSpecFilesOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);

  // ── Derived file arrays ────────────────────────────────────────────────────
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

  // Whether to render the customer section
  const hasCustomerSection = !!customerRows && customerRows.length > 0;

  const customerTableRows: SpecRow[] = [
    ...(customerRows ?? []),
    ...(showSignatureRow && signatureImages.length > 0
      ? [
          {
            label: "Signature:",
            value: (
              <button
                onClick={() => setSignatureOpen(true)}
                className="underline"
              >
                View Signature
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Card className="border border-gray-200 divide divide-y px-6 h-max rounded-2xl gap-0 bg-white">
        {/* Customer Information */}
        {hasCustomerSection && (
          <CardContent className="pb-4 px-0 pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Customer Information
            </h3>
            <SpecTable rows={customerTableRows} />
          </CardContent>
        )}

        {/* Glass Specifications */}
        <CardContent
          className={hasCustomerSection ? "py-4 px-0" : "pb-4 px-0 pt-6"}
        >
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Glass Specifications
          </h3>
          <SpecTable rows={glassSpecs} />
        </CardContent>

        {/* Add-ons & Services */}
        <CardContent className="py-4 px-0">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Add-ons &amp; Services
          </h3>
          <SpecTable
            rows={[
              ...addOns,
              ...(engravingImages.length > 0
                ? [
                    {
                      label: "Engraving Images:",
                      value: (
                        <button
                          onClick={() => setEngravingOpen(true)}
                          className="underline"
                        >
                          View Image{engravingImages.length > 1 ? "s" : ""} (
                          {engravingImages.length})
                        </button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>

        {/* Specifications — customer notes + spec files (sales page) */}
        <CardContent className="py-4 px-0">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Specifications
          </h3>
          <SpecTable
            rows={[
              { label: "Notes:", value: order?.customer_notes ?? "—" },
              ...(specFiles.length > 0
                ? [
                    {
                      label: "Visuals:",
                      value: (
                        <button
                          onClick={() => setSpecFilesOpen(true)}
                          className="underline"
                        >
                          View Files ({specFiles.length})
                        </button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>

        {/* Delivery Details */}
        {order?.delivery_method && (
          <CardContent className="py-4 px-0">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Delivery Details
            </h3>
            <SpecTable
              rows={[
                {
                  label: "Delivery Method",
                  value: (
                    <span className="capitalize">{order.delivery_method}</span>
                  ),
                },
                ...(order.delivery_method === "delivery" &&
                order.delivery_address
                  ? [
                      {
                        label: "Delivery Address",
                        value: order.delivery_address,
                      },
                    ]
                  : []),
                ...(order.delivery_method === "delivery" && order.delivery_fee
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
        )}

        {/* Bottom slot — pricing / payment */}
        {bottomSlot && (
          <CardContent className="py-4 px-0">{bottomSlot}</CardContent>
        )}
      </Card>

      {/* ── Modals (all owned here) ──────────────────────────────────────── */}
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
