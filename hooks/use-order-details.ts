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
      value: order ? `${order.width}" × ${order.length}"` : "—",
    },
    { label: "Area", value: order ? `${order.area} sqm` : "—" },
    { label: "Sheet Size", value: order?.sheet_size ?? "__" },
    { label: "Shape", value: order?.shape_type ?? "__" },
    ...(order?.curve_diameter
      ? [{ label: "Curve Diameter", value: order.curve_diameter }]
      : []),
    { label: "Thickness", value: order?.thickness ?? "—" },
  ];

  const addOns: SpecRow[] = [
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
    ...((order as any)?.addons?.length > 0
      ? (order as any).addons.map((a: any) => ({
          label: a.addon?.name ?? "Add-on",
          value: `₦${a.calculated_price}`,
        }))
      : []),
  ];

  return { glassSpecs, addOns };
}
