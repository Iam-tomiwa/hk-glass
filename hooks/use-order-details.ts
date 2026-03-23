import { OrderResponse, OrderAddonResponse } from "@/services/types/openapi";

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
    { label: "Glass Type", value: order?.glass_type?.name ?? "—" },
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
    ...(order?.custom_shape_spec
      ? [{ label: "Custom Shape", value: order.custom_shape_spec }]
      : []),
    { label: "Thickness", value: order?.thickness ?? "—" },
  ];

  const addOns: SpecRow[] = [
    ...(order?.drill_holes_count
      ? [
          { label: "Drill Holes", value: String(order.drill_holes_count) },
          ...(order.hole_diameter
            ? [{ label: "Hole Diameter", value: String(order.hole_diameter) }]
            : []),
        ]
      : []),
    ...(order?.tint_type
      ? [{ label: "Tint Type", value: String(order.tint_type) }]
      : []),
    ...(order?.engraving_text
      ? [{ label: "Engraving", value: String(order.engraving_text) }]
      : []),
    ...(order?.addons?.map((a: OrderAddonResponse) => ({
      label: a.addon?.name ?? "Add-on",
      value: "Yes",
    })) ?? []),
  ];

  return { glassSpecs, addOns };
}
