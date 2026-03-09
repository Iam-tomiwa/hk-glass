import * as z from "zod";

export const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),

  length: z.string().min(1, "Length is required"),
  width: z.string().min(1, "Width is required"),
  sheetSize: z.string().min(1, "Sheet Size is required"),
  thickness: z.string().min(1, "Thickness is required"),

  edging: z.boolean(),
  glazing: z.boolean(),
  warping: z.boolean(),
  waxing: z.boolean(),

  drillHoles: z.boolean(),
  numberOfHoles: z.string().optional(),
  holeDiameter: z.string().optional(),

  temperGlass: z.boolean(),
  addTintFilm: z.boolean(),
  tintType: z.string().optional(),

  engraving: z.boolean(),
  engravingText: z
    .string()
    .max(100, "Maximum 100 characters allowed")
    .optional(),
  insuranceCoverage: z.boolean(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
