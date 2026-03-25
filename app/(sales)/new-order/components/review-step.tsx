"use client";

import { useRef, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { OrderFormValues } from "../schema";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useListAddons, useListGlassTypes } from "@/services/queries/orders";
import { formatNaira } from "@/lib/utils";
import { OrderReviewResponse } from "@/services/types/openapi";
import { Package, Truck, Pen, Type, Hash, Loader2 } from "lucide-react";

export function ReviewStep({
  form,
  pricing,
  onBack,
  onProceedToPayment,
  isLoading,
  signatureDataUrl,
  onSignatureChange,
}: {
  form: UseFormReturn<OrderFormValues>;
  pricing: OrderReviewResponse | null;
  onBack: () => void;
  onProceedToPayment: () => void;
  isLoading?: boolean;
  signatureDataUrl: string | null;
  onSignatureChange: (url: string | null) => void;
}) {
  const values = form.getValues();
  const { data: addonsList } = useListAddons();
  const { data: glassTypes } = useListGlassTypes();

  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const insuranceCoverage = useWatch({
    control: form.control,
    name: "insuranceCoverage",
  });
  const commissionSelected = useWatch({
    control: form.control,
    name: "commissionSelected",
  });

  const selectedGlassType = glassTypes?.find(
    (t) => t.id === values.glassTypeId,
  );

  const basicAddons = [
    { key: "drillHoles", label: "Drill Holes" },
    { key: "addTintFilm", label: "Tint" },
    { key: "engraving", label: "Engraving" },
  ].filter((addon) => values[addon.key as keyof OrderFormValues]);

  const dynamicAddons = (values.selectedAddons || [])
    .map((id) => addonsList?.find((a) => a.id === id))
    .filter(Boolean);

  // Signature modal state
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureTab, setSignatureTab] = useState<
    "draw" | "type" | "initials"
  >("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [initialsSignature, setInitialsSignature] = useState(() => {
    const parts = (values.customerName || "").trim().split(" ");
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  });
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getCanvasPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1E202E";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleAttachSignature = () => {
    if (!signatureConfirmed) return;
    if (signatureTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas) onSignatureChange(canvas.toDataURL());
    } else if (signatureTab === "type") {
      onSignatureChange(`text:${typedSignature}`);
    } else {
      onSignatureChange(`initials:${initialsSignature}`);
    }
    setSignatureOpen(false);
  };

  const clearSignature = () => {
    if (signatureTab === "draw") {
      clearCanvas();
    } else if (signatureTab === "type") {
      setTypedSignature("");
    } else {
      setInitialsSignature("");
    }
  };

  // Removed effect that caused cascading renders. Initial fill is now handled by state initialization and tab/modal events.

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
          {/* Left Column - Order Details */}
          <div className="sticky top-20 self-start">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
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
                        {values.shape === "curved" ? (
                          <>
                            Diameter: {values.curveDiameter || 0}{" "}
                            {values.unit || "mm"}
                          </>
                        ) : (
                          <>
                            {values.length || 0} {values.unit || "mm"} x{" "}
                            {values.width || 0} {values.unit || "mm"}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Area:</span>
                      <span className="font-medium text-neutral-800">
                        {pricing ? Number(pricing.area).toFixed(2) : "—"} sq{" "}
                        {values.unit || "mm"}
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
                          <span className="text-neutral-500">
                            Hole Diameter:
                          </span>
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
                        <span className="text-neutral-500">
                          Engraving Text:
                        </span>
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="space-y-2">
                        <div
                          onClick={() => field.onChange("pickup")}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${field.value === "pickup" ? "border-blue-500 bg-blue-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${field.value === "pickup" ? "border-blue-500" : "border-neutral-300"}`}
                          >
                            {field.value === "pickup" && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="size-4 text-neutral-600" />
                              <span className="font-medium text-sm text-[#1E202E]">
                                Pickup
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Customer will collect the order from our facility
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={() => field.onChange("delivery")}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${field.value === "delivery" ? "border-blue-500 bg-blue-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${field.value === "delivery" ? "border-blue-500" : "border-neutral-300"}`}
                          >
                            {field.value === "delivery" && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Truck className="size-4 text-neutral-600" />
                              <span className="font-medium text-sm text-[#1E202E]">
                                Delivery
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              We will deliver the order to the customer&apos;s
                              address
                            </p>
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {deliveryMethod === "delivery" && (
                  <div className="space-y-3 pt-1">
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1E202E] font-medium text-sm">
                            Delivery Address{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Enter complete delivery address including street, city, state, and zip code..."
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-medium text-neutral-800"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1E202E] font-medium text-sm">
                            Delivery Fee <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="0"
                                className="shadow-none h-11 pl-7 pr-4 placeholder:text-neutral-400 font-medium text-neutral-800"
                                {...field}
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Signature */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-500 leading-relaxed">
                  By signing, you confirm that the specifications of this order
                  are approved. This signature authorizes production based on
                  the provided information.
                </p>
                {signatureDataUrl && (
                  <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                    {signatureDataUrl.startsWith("text:") ? (
                      <p className="text-lg font-signature text-[#1E202E] italic">
                        {signatureDataUrl.replace("text:", "")}
                      </p>
                    ) : signatureDataUrl.startsWith("initials:") ? (
                      <p className="text-2xl font-bold text-[#1E202E]">
                        {signatureDataUrl.replace("initials:", "")}
                      </p>
                    ) : (
                      <img
                        src={signatureDataUrl}
                        alt="Signature"
                        className="max-h-16 object-contain"
                      />
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSignatureOpen(true);
                    // Pre-fill initials if switching to that tab or opening for the first time
                    if (
                      signatureTab === "initials" &&
                      !initialsSignature &&
                      values.customerName
                    ) {
                      const parts = values.customerName.trim().split(" ");
                      setInitialsSignature(
                        parts.map((p) => p[0]?.toUpperCase() || "").join(""),
                      );
                    }
                  }}
                  className="h-9 text-sm font-medium"
                >
                  {signatureDataUrl ? "Update Signature" : "Attach Signature"}
                </Button>
              </CardContent>
            </Card>

            {/* Insurance Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance Coverage</CardTitle>
              </CardHeader>
              <CardContent>
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
                          transportation, and installation. This insurance only
                          covers our inventory.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Commission */}
            <Card>
              <CardHeader>
                <CardTitle>Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="commissionSelected"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded border-neutral-300 mt-0.5"
                          id="commissionSelected"
                        />
                      </FormControl>
                      <div className="space-y-1.5 leading-none">
                        <Label
                          htmlFor="commissionSelected"
                          className="font-medium cursor-pointer text-[#1E202E] text-sm"
                        >
                          Apply Commission
                        </Label>
                        <p className="text-sm text-neutral-500 leading-relaxed pt-1">
                          Include a commission deduction for this order. This
                          will be reflected in the final amount payable.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal:</span>
                    <span className="font-medium text-neutral-800">
                      {formatNaira(pricing?.subtotal_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tax (8%):</span>
                    <span className="font-medium text-neutral-800">
                      {formatNaira(pricing?.tax_amount)}
                    </span>
                  </div>
                  {insuranceCoverage && pricing?.insurance_amount && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Insurance (5%):</span>
                      <span className="font-medium text-neutral-800">
                        {formatNaira(pricing.insurance_amount)}
                      </span>
                    </div>
                  )}
                  {commissionSelected && pricing?.commission_amount && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Commission:</span>
                      <span className="font-medium text-red-600">
                        − {formatNaira(pricing.commission_amount)}
                      </span>
                    </div>
                  )}
                  {deliveryMethod === "delivery" && values.deliveryFee && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Delivery Fee:</span>
                      <span className="font-medium text-neutral-800">
                        {formatNaira(values.deliveryFee)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[#1E202E]">Total:</span>
                  <span className="font-bold text-base">
                    {formatNaira(pricing?.total_amount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="pt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={onProceedToPayment}
            disabled={isLoading}
            className="bg-[#16a34a] text-white hover:bg-[#15803d] px-8 h-10 rounded-md font-medium min-w-[180px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 px-6 h-10 rounded-md font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={signatureOpen} onOpenChange={setSignatureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attach Signature</DialogTitle>
            <p className="text-sm text-neutral-500">
              Capture customer approval for the order
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-neutral-200">
              {(["draw", "type", "initials"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setSignatureTab(tab);
                    if (
                      tab === "initials" &&
                      !initialsSignature &&
                      values.customerName
                    ) {
                      const parts = values.customerName.trim().split(" ");
                      setInitialsSignature(
                        parts.map((p) => p[0]?.toUpperCase() || "").join(""),
                      );
                    }
                  }}
                  className={`flex justify-center items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                    signatureTab === tab
                      ? "border-[#1E202E] text-[#1E202E]"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab === "draw" && <Pen className="size-3.5" />}
                  {tab === "type" && <Type className="size-3.5" />}
                  {tab === "initials" && <Hash className="size-3.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearSignature}
              className="ml-auto flex text-xs cursor-pointer underline px-2"
            >
              Clear Signature
            </button>
            {/* Draw */}
            {signatureTab === "draw" && (
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                className="w-full border border-neutral-200 rounded-lg bg-white cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            )}

            {/* Type */}
            {signatureTab === "type" && (
              <div className="border border-neutral-200 rounded-lg p-4 bg-white min-h-[160px] flex items-center">
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your full name..."
                  className="w-full text-2xl italic font-serif text-[#1E202E] bg-transparent border-none outline-none placeholder:text-neutral-300 placeholder:text-base placeholder:not-italic"
                />
              </div>
            )}

            {/* Initials */}
            {signatureTab === "initials" && (
              <div className="border border-neutral-200 rounded-lg p-4 bg-white min-h-[160px] flex items-center justify-center">
                <input
                  type="text"
                  value={initialsSignature}
                  onChange={(e) =>
                    setInitialsSignature(e.target.value.toUpperCase())
                  }
                  placeholder="AB"
                  maxLength={4}
                  className="text-5xl font-bold text-[#1E202E] bg-transparent border-none outline-none text-center w-40 placeholder:text-neutral-300"
                />
              </div>
            )}

            {/* Confirm checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="sig-confirm"
                checked={signatureConfirmed}
                onCheckedChange={(v) => setSignatureConfirmed(!!v)}
              />
              <Label
                htmlFor="sig-confirm"
                className="text-sm text-neutral-700 cursor-pointer"
              >
                I confirm the order details are correct
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAttachSignature}
                disabled={!signatureConfirmed}
              >
                Attach Signature
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSignatureOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
