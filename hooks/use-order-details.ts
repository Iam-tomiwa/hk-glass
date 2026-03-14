import { OrderResponse } from "@/services/types/openapi";

type SpecRow = {
  label: string;
  value: string;
};

/**
 * Derives the glass specification rows and add-on rows from an OrderResponse.
 * Both the sales and factory order-detail pages share this exact derivation logic.
 */
export function useOrderDetails(order: OrderResponse | undefined) {
  const glassSpecs: SpecRow[] = [
    { label: "Glass Type", value: (order as any)?.glass_type?.name ?? "—" },
    {
      label: "Dimensions",
      value: order ? `${order.width}" × ${order.height}"` : "—",
    },
    { label: "Area", value: order ? `${order.area} sqm` : "—" },
    { label: "Sheet Size", value: order?.sheet_size ?? "Standard" },
    { label: "Thickness", value: order?.thickness ?? "—" },
    {
      label: "Drill Holes",
      value: order?.drill_holes_count
        ? String(order.drill_holes_count)
        : "None",
    },
    ...(order?.hole_diameter
      ? [{ label: "Hole Diameter", value: String(order.hole_diameter) }]
      : []),
    ...(order?.tint_type
      ? [{ label: "Tint Type", value: order.tint_type }]
      : []),
    ...(order?.engraving_text
      ? [{ label: "Engraving", value: order.engraving_text }]
      : []),
  ];

  const addOns: SpecRow[] =
    (order as any)?.addons?.length > 0
      ? (order as any).addons.map((a: any) => ({
          label: a.addon?.name ?? "Add-on",
          value: `₦${a.calculated_price}`,
        }))
      : [{ label: "No add-ons", value: "—" }];

  return { glassSpecs, addOns };
}
