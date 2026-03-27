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
      value: order
        ? `${order.width}${order.dimension_unit} × ${order.length}${order.dimension_unit}`
        : "—",
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

  // Build sets for quick lookup to avoid duplicating top-level fields
  const addonCodes = new Set(
    (order?.addons ?? []).map((a) => a.addon?.code).filter(Boolean),
  );
  const addonCategories = new Set(
    (order?.addons ?? []).map((a) => a.addon?.category).filter(Boolean),
  );

  const addOns: SpecRow[] = [
    // Fallback rows — only shown when the corresponding addon is absent from order.addons
    // (supports legacy orders that didn't store them as proper addon records)
    ...(order?.drill_holes_count && !addonCodes.has("glass_drilling")
      ? [
          { label: "Drill Holes", value: String(order.drill_holes_count) },
          ...(order.hole_diameter
            ? [{ label: "Hole Diameter", value: String(order.hole_diameter) }]
            : []),
        ]
      : []),
    ...(order?.tint_type && !addonCategories.has("thermal_film")
      ? [{ label: "Tint Type", value: String(order.tint_type) }]
      : []),
    ...(order?.engraving_text && !addonCodes.has("cnc_glass_engraving")
      ? [{ label: "Engraving", value: String(order.engraving_text) }]
      : []),

    // All addons from the order, with details merged inline
    ...(order?.addons?.map((a: OrderAddonResponse) => {
      const parts: string[] = [];

      if (a.addon?.code === "glass_drilling") {
        if (order.drill_holes_count)
          parts.push(`${order.drill_holes_count} holes`);
        if (order.hole_diameter) parts.push(`⌀${order.hole_diameter}mm`);
      } else if (a.addon?.code === "cnc_glass_engraving") {
        if (order.engraving_text) parts.push(order.engraving_text);
      } else if (a.addon?.category === "thermal_film") {
        if (order.tint_type) parts.push(String(order.tint_type));
      } else {
        if (a.custom_input) parts.push(a.custom_input);
        if (a.quantity != null && a.quantity > 1) {
          const label = a.addon?.code === "edging" ? "sides" : "pcs";
          parts.push(`${a.quantity} ${label}`);
        }
      }

      if (a.notes) parts.push(a.notes);
      return {
        label: a?.name ?? "Add-on",
        value: parts.length > 0 ? parts.join(", ") : "Yes",
      };
    }) ?? []),
  ];

  return { glassSpecs, addOns };
}
