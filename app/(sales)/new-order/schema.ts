import * as z from "zod";

export const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),

  glassTypeId: z.string().min(1, "Glass type is required"),
  length: z.string().min(1, "Length/Height is required"),
  width: z.string().min(1, "Width is required"),
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

  unit: z.enum(["mm", "cm"]),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
