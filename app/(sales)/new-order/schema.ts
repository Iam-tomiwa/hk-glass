import * as z from "zod";

export const orderFormSchema = z
  .object({
    customerName: z.string().min(1, "Customer Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),

    glassTypeId: z.string().optional(),
    quantity: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    shape: z.enum(["rectangular", "curved"]),
    curveDiameter: z.string().optional(),
    sheetSize: z.string().optional(),
    customSheetSize: z.string().optional(),
    thickness: z.string().optional(),

    // Addons and services
    selectedAddons: z.array(z.string()),

    drillHoles: z.boolean(),
    numberOfHoles: z.string().optional(),
    holeDiameter: z.string().optional(),

    addTintFilm: z.boolean(),
    tintType: z.string().optional(),

    engraving: z.boolean(),
    engravingType: z.string().optional(),
    engravingText: z
      .string()
      .max(100, "Maximum 100 characters allowed")
      .optional(),

    customerNotes: z.string().max(500).optional(),

    insuranceCoverage: z.boolean(),

    deliveryMethod: z.enum(["pickup", "delivery"]),
    deliveryAddress: z.string().optional(),
    deliveryFee: z.string().optional(),

    unit: z.enum(["mm", "cm", "m"]),

    // Per-addon extras for addons that have input_schema
    // Keys are addon IDs, values hold the relevant inputs
    addonItemExtras: z
      .record(
        z.string(),
        z.object({
          type_key: z.string().optional(),
          sides: z.number().optional(),
          quantity: z.number().optional(),
        }),
      )
      .optional(),

    // Commission
    commissionSelected: z.boolean(),

    // Auto-resolved by sheets lookup (hidden) — one code per unit of quantity
    glassInventorySerialCode: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    const toMm = (val: string | undefined) => {
      const num = parseFloat(val || "0");
      if (!num) return 0;
      if (data.unit === "cm") return num * 10;
      if (data.unit === "m") return num * 1000;
      return num;
    };

    if (data.glassTypeId) {
      if (!data.length) {
        ctx.addIssue({ code: "custom", message: "Length is required", path: ["length"] });
      }
      if (!data.width) {
        ctx.addIssue({ code: "custom", message: "Width is required", path: ["width"] });
      }
    }

    const lengthMm = toMm(data.length);
    const widthMm = toMm(data.width);

    if (lengthMm > 0 && lengthMm < 200) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum length is 200mm",
        path: ["length"],
      });
    }
    if (lengthMm > 6000) {
      ctx.addIssue({
        code: "custom",
        message: "Maximum length is 6m (6000mm)",
        path: ["length"],
      });
    }
    if (widthMm > 0 && widthMm < 200) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum width is 200mm",
        path: ["width"],
      });
    }
    if (widthMm > 3000) {
      ctx.addIssue({
        code: "custom",
        message: "Maximum width is 3m (3000mm)",
        path: ["width"],
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderFormSchema>;
