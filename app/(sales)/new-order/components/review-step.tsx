import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../schema";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useListAddons, useListGlassTypes } from "@/services/queries/orders";
import { formatNaira } from "@/lib/utils";
import { OrderReviewResponse } from "@/services/types/openapi";

export function ReviewStep({
  form,
  pricing,
  onBack,
  onNext,
}: {
  form: UseFormReturn<OrderFormValues>;
  pricing: OrderReviewResponse | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const values = form.getValues();
  const { data: addonsList } = useListAddons();
  const { data: glassTypes } = useListGlassTypes();

  const selectedGlassType = glassTypes?.find((t) => t.id === values.glassTypeId);

  const basicAddons = [
    { key: "drillHoles", label: "drill Holes" },
    { key: "addTintFilm", label: "tint" },
    { key: "engraving", label: "engraving" },
  ].filter((addon) => values[addon.key as keyof OrderFormValues]);

  const dynamicAddons = (values.selectedAddons || [])
    .map((id) => addonsList?.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <TabsContent value="review" className="mt-0 outline-none max-w-5xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Order Review
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Review your order details below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column - Details */}
          <Card className="border rounded-xl py-2 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-[#1E202E]">
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-base font-bold text-[#1E202E] mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Name:</span>
                    <span className="font-medium text-neutral-800">
                      {values.customerName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email:</span>
                    <span className="font-medium text-neutral-800">
                      {values.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Glass Specs */}
              <div>
                <h3 className="text-base font-bold text-[#1E202E] mb-4">
                  Glass Specifications
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Glass Type:</span>
                    <span className="font-medium text-neutral-800">
                      {selectedGlassType?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Dimensions:</span>
                    <span className="font-medium text-neutral-800">
                      {values.length || 0}&quot; x {values.width || 0}&quot;
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Area:</span>
                    <span className="font-medium text-neutral-800">
                      {pricing ? Number(pricing.area).toFixed(2) : "—"} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sheet Size:</span>
                    <span className="font-medium text-neutral-800 capitalize">
                      {values.sheetSize || "Standard"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Thickness:</span>
                    <span className="font-medium text-neutral-800">
                      {values.thickness || "1/8"}&quot;
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Add-ons */}
              <div>
                <h3 className="text-base font-bold text-[#1E202E] mb-4">
                  Add-ons & Services
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {basicAddons.length > 0 || dynamicAddons.length > 0 ? (
                    <>
                      {basicAddons.map((addon) => (
                        <Badge
                          key={addon.key}
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-normal shadow-none border-none pb-[2px] capitalize"
                        >
                          {addon.label}
                        </Badge>
                      ))}
                      {dynamicAddons.map((addon) => (
                        <Badge
                          key={addon?.id}
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-normal shadow-none border-none pb-[2px] capitalize"
                        >
                          {addon?.name}
                        </Badge>
                      ))}
                    </>
                  ) : (
                    <span className="text-sm text-neutral-500">
                      No add-ons selected
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  {values.drillHoles && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">
                          Number of Holes:
                        </span>
                        <span className="font-medium text-neutral-800">
                          {values.numberOfHoles || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Hole Diameter:</span>
                        <span className="font-medium text-neutral-800">
                          {values.holeDiameter || 0}&quot;
                        </span>
                      </div>
                    </>
                  )}
                  {values.addTintFilm && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Tint Type:</span>
                      <span className="font-medium text-neutral-800 capitalize">
                        {values.tintType || "-"}
                      </span>
                    </div>
                  )}
                  {values.engraving && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Engraving Text:</span>
                      <span className="font-medium text-neutral-800">
                        {values.engravingText
                          ? `"${values.engravingText}"`
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Price */}
          <Card className="border rounded-xl py-2 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-[#1E202E]">
                Price Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal:</span>
                  <span className="font-medium text-neutral-800">
                    {formatNaira(pricing?.subtotal_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax:</span>
                  <span className="font-medium text-neutral-800">
                    {formatNaira(pricing?.tax_amount)}
                  </span>
                </div>
                {pricing && Number(pricing.insurance_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Insurance:</span>
                    <span className="font-medium text-neutral-800">
                      {formatNaira(pricing.insurance_amount)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[#1E202E]">Total:</span>
                <span className="font-bold text-blue-600 text-base">
                  {formatNaira(pricing?.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium"
          >
            Make Payment
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 px-6 h-10 rounded-md font-medium"
          >
            Back
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
