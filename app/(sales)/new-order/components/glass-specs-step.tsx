import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { OrderFormValues } from "../schema";
import { useListGlassTypes } from "@/services/queries/orders";
import { ComboBox } from "@/components/ui/combo-box-2";

export function GlassSpecsStep({
  form,
  onBack,
  onNext,
}: {
  form: UseFormReturn<OrderFormValues>;
  onBack: () => void;
  onNext: () => void;
}) {
  const { data: glassTypes, isLoading: isLoadingGlassTypes } =
    useListGlassTypes();

  const length = useWatch({ control: form.control, name: "length" });
  const width = useWatch({ control: form.control, name: "width" });
  const shape = useWatch({ control: form.control, name: "shape" });
  const sheetSize = useWatch({ control: form.control, name: "sheetSize" });

  const unit = useWatch({ control: form.control, name: "unit" }) || "mm";
  const curveDiameter = useWatch({
    control: form.control,
    name: "curveDiameter",
  });

  // Calculate area based on shape and units
  const calculateArea = () => {
    const l = parseFloat(length || "0");
    const w = parseFloat(width || "0");
    const d = parseFloat(curveDiameter || "0");

    if (shape === "curved") {
      return Math.PI * Math.pow(d / 2, 2);
    }
    return l * w;
  };

  const area = calculateArea();

  return (
    <TabsContent
      value="glass-specs"
      className="mt-0 outline-none max-w-xl mx-auto"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Glass Specifications
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Define the dimensions and type of glass
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Select Unit <span className="text-red-500">*</span>
                </FormLabel>
                <ComboBox
                  className="w-full"
                  value={field.value}
                  options={[
                    { label: "mm", value: "mm" },
                    { label: "cm", value: "cm" },
                    { label: "m", value: "m" },
                  ]}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="glassTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Glass Type <span className="text-red-500">*</span>
                </FormLabel>
                <ComboBox
                  className="w-full"
                  value={field.value}
                  isLoading={isLoadingGlassTypes}
                  options={(glassTypes || [])?.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Length <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                      {...field}
                      value={field.value || ""}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                      {unit}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Width <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                      {...field}
                      value={field.value || ""}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                      {unit}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shape"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Select Shape
                </FormLabel>
                <ComboBox
                  className="w-full"
                  value={field.value}
                  options={[
                    { value: "rectangular", label: "Rectangular" },
                    { value: "curved", label: "Curved" },
                  ]}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {shape === "curved" && (
            <FormField
              control={form.control}
              name="curveDiameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1E202E] font-medium text-sm">
                    Diameter <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                        {...field}
                        value={field.value || ""}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                        {unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="sheetSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Sheet Size
                </FormLabel>
                <ComboBox
                  className="w-full"
                  value={field.value}
                  options={[
                    {
                      value: "standard",
                      label: `Standard (48" x 72")`,
                    },
                    { value: "large", label: `Large (60" x 84")` },
                    { value: "custom", label: `Custom` },
                  ]}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {sheetSize === "custom" && (
            <FormField
              control={form.control}
              name="customSheetSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1E202E] font-medium text-sm">
                    Input Custom Sheet Size{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                        {...field}
                        value={field.value || ""}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                        {unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="thickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Sheet thickness
                </FormLabel>
                <ComboBox
                  className="w-full"
                  value={field.value}
                  options={[
                    { value: "1/8", label: `1/8" (3mm)` },
                    { value: "1/4", label: `1/4" (6mm)` },
                    { value: "3/8", label: `3/8" (10mm)` },
                    { value: "1/2", label: `1/2" (12mm)` },
                  ]}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {area > 0 && (
            <div className="bg-[#eff6ff] rounded-lg px-4 py-3 flex items-center justify-between border border-blue-100">
              <span className="text-neutral-600 text-sm">Calculated Area</span>
              <span className="font-bold text-blue-800 text-lg">
                {area.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                sq {unit}
              </span>
            </div>
          )}
        </div>

        <div className="pt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium"
          >
            Next
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="bg-white text-neutral-700 border-neutral-200 hover:bg-background px-6 h-10 rounded-md font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
