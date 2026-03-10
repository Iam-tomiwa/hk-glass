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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFormValues } from "../schema";
import { useListGlassTypes } from "@/services/queries/orders";
import { Loader2 } from "lucide-react";

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

  const length = useWatch({
    control: form.control,
    name: "length",
  });

  const width = useWatch({
    control: form.control,
    name: "width",
  });

  // Calculate area in sq ft assuming length and width are in inches
  const area = ((Number(length) || 0) * (Number(width) || 0)) / 144;

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
            name="glassTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Glass Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                      {isLoadingGlassTypes ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin size-4" /> Loading...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select glass type" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      inches
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
                      inches
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {area > 0 && (
            <div className="bg-[#eff6ff] rounded-lg px-4 py-3 flex items-center justify-between border border-blue-100">
              <span className="text-neutral-600 text-sm">Calculated Area</span>
              <span className="font-bold text-blue-800 text-lg">
                {area.toFixed(2)} sq ft
              </span>
            </div>
          )}

          <FormField
            control={form.control}
            name="sheetSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Sheet Size <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                      <SelectValue placeholder="Select sheet size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard (48&quot; x 72&quot;)
                    </SelectItem>
                    <SelectItem value="large">
                      Large (60&quot; x 96&quot;)
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Thickness <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                      <SelectValue placeholder="Select thickness" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1/8">1/8&quot; (3mm)</SelectItem>
                    <SelectItem value="1/4">1/4&quot; (6mm)</SelectItem>
                    <SelectItem value="3/8">3/8&quot; (10mm)</SelectItem>
                    <SelectItem value="1/2">1/2&quot; (12mm)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
