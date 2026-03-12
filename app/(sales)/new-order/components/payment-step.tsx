import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../schema";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useListAddons, useListGlassTypes } from "@/services/queries/orders";
import { formatNaira } from "@/lib/utils";

export function PaymentStep({
  form,
  onBack,
  isLoading,
}: {
  form: UseFormReturn<OrderFormValues>;
  onBack: () => void;
  isLoading?: boolean;
}) {
  const values = form.getValues();
  const { data: glassTypes } = useListGlassTypes();
  const { data: addonsList } = useListAddons();

  // Watch insuranceCoverage to dynamically update total
  const hasInsurance = form.watch("insuranceCoverage");

  const areaSqm =
    (((Number(values.length) || 0) * (Number(values.width) || 0)) / 144) *
    0.0929;
  const selectedGlassType = glassTypes?.find(
    (t) => t.id === values.glassTypeId,
  );
  const glassPrice = Number(selectedGlassType?.price_per_sqm || 0) * areaSqm;
  const addonTotal = (values.selectedAddons || [])
    .map((id) => addonsList?.find((a) => a.id === id))
    .filter(Boolean)
    .reduce((sum, a) => sum + Number(a?.price || 0), 0);
  const subtotal = glassPrice + addonTotal;

  const tax = subtotal * 0.08;
  const insuranceCost = hasInsurance ? subtotal * 0.05 : 0;
  const total = subtotal + tax + insuranceCost;

  return (
    <TabsContent value="payment" className="mt-0 outline-none max-w-xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Payment
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Make payment to confirm your product
          </p>
        </div>

        <div className="space-y-6 max-w-lg">
          <Card className="border rounded-xl py-2">
            <CardContent className="py-2 space-y-4">
              <h3 className="text-base font-bold text-[#1E202E] mb-2">
                Insurance Coverage
              </h3>
              <FormField
                control={form.control}
                name="insuranceCoverage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="rounded border-neutral-300 mt-0.5"
                        id="insuranceCoverage"
                      />
                    </FormControl>
                    <div className="space-y-1.5 leading-none">
                      <Label
                        htmlFor="insuranceCoverage"
                        className="font-medium cursor-pointer text-[#1E202E] text-sm"
                      >
                        Add Insurance Coverage (5% of subtotal)
                      </Label>
                      <p className="text-sm text-neutral-500 leading-relaxed pt-1">
                        Protect your order against damage during production,
                        transportation, and installation. Coverage includes
                        replacement at no additional cost.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border rounded-xl py-2">
            <CardContent className="py-2 space-y-4">
              <h3 className="text-base font-bold text-[#1E202E] mb-2">
                Price Breakdown
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal:</span>
                  <span className="font-medium text-neutral-800">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax (8%):</span>
                  <span className="font-medium text-neutral-800">
                    {formatNaira(tax)}
                  </span>
                </div>
                {hasInsurance && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Insurance (5%):</span>
                    <span className="font-medium text-neutral-800">
                      {formatNaira(insuranceCost)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-bold text-[#1E202E] text-base">
                  Total:
                </span>
                <span className="font-bold text-blue-800 text-lg">
                  {formatNaira(total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 flex items-center gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium min-w-[160px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Confirm Payment"
            )}
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
