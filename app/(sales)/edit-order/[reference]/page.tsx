"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderFormSchema, type OrderFormValues } from "../../new-order/schema";
import { CustomerStep } from "../../new-order/components/customer-step";
import { GlassSpecsStep } from "../../new-order/components/glass-specs-step";
import { AddOnsStep } from "../../new-order/components/add-ons-step";
import { ReviewStep } from "../../new-order/components/review-step";
import { Header } from "@/components/header";
import {
  useGetOrderByReference,
  useGetOrderFiles,
  useUpdateOrder,
  useReviewOrder,
} from "@/services/queries/orders";
import { OrderReviewResponse } from "@/services/types/openapi";
import {
  uploadSpecification,
  uploadEngravingImage,
  uploadSignature,
} from "@/services/api/orders";

const steps = [
  { id: "customer", label: "Customer" },
  { id: "glass-specs", label: "Glass Specs" },
  { id: "add-ons", label: "Add-ons" },
  { id: "review", label: "Review" },
];

/**
 * Convert a dimension stored in meters (as returned by the API) back to the
 * display unit the user originally entered. Returns a plain numeric string
 * suitable for the form input.
 */
function convertFromMeters(
  meters: number,
  unit: "mm" | "cm" | "m",
): string {
  if (unit === "mm") return String(meters * 1000);
  if (unit === "cm") return String(meters * 100);
  return String(meters);
}

export default function EditOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <EditOrderForm />
    </Suspense>
  );
}

function EditOrderForm() {
  const router = useRouter();
  const params = useParams();
  const reference = params.reference as string;

  const { data: order, isLoading } = useGetOrderByReference(reference);
  const { data: orderFiles } = useGetOrderFiles(order?.id ?? "");

  const [activeTab, setActiveTab] = useState("customer");
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(
    steps.length - 1,
  ); // all unlocked in edit mode
  const [orderReview, setOrderReview] = useState<OrderReviewResponse | null>(
    null,
  );
  const [specFiles, setSpecFiles] = useState<File[]>([]);
  const [engravingImageFile, setEngravingImageFile] = useState<File | null>(
    null,
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const filesUploadedRef = useRef(false);
  const isFormInitialized = useRef(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      glassTypeId: "",
      length: "",
      width: "",
      shape: "rectangular",
      curveDiameter: "",
      sheetSize: "",
      customSheetSize: "",
      thickness: "",
      selectedAddons: [],
      drillHoles: false,
      numberOfHoles: "",
      holeDiameter: "",
      addTintFilm: false,
      tintType: "",
      engraving: false,
      engravingType: "",
      engravingText: "",
      customerNotes: "",
      insuranceCoverage: false,
      deliveryMethod: "pickup",
      deliveryAddress: "",
      deliveryFee: "",
      unit: "mm",
      addonItemExtras: {},
      commissionSelected: false,
      glassInventorySerialCode: "",
    },
  });

  // Pre-fill form once order data is loaded
  useEffect(() => {
    if (!order || isFormInitialized.current) return;

    // The API stores dimensions in meters; dimension_unit is the original display unit
    const raw = order as unknown as Record<string, unknown>;
    const unit = (raw.dimension_unit as "mm" | "cm" | "m") ?? "mm";
    const widthValue = convertFromMeters(Number(order.width), unit);
    const lengthValue = convertFromMeters(Number(order.length), unit);

    // Use top-level addon_id (works for both real addons and hardware items where addon is null)
    const selectedAddons = (order.addons ?? []).map((a) => a.addon_id);
    const addonItemExtras: Record<
      string,
      { type_key?: string; sides?: number; quantity?: number }
    > = {};
    for (const a of order.addons ?? []) {
      const schema = a.addon?.input_schema;
      // Hardware items (addon === null) — store their quantity
      if (!a.addon) {
        if (a.quantity != null) addonItemExtras[a.addon_id] = { quantity: a.quantity };
        continue;
      }
      if (!schema) continue;
      const extra: { type_key?: string; sides?: number; quantity?: number } =
        {};
      if (a.type_key) extra.type_key = a.type_key;
      if (a.sides != null) extra.sides = a.sides;
      else if (schema.supports_sides && a.quantity != null) extra.sides = a.quantity;
      if (schema.supports_quantity && a.quantity != null) extra.quantity = a.quantity;
      addonItemExtras[a.addon_id] = extra;
    }

    form.reset({
      customerName: order.customer_name ?? "",
      email: order.customer_email ?? "",
      phone: order.customer_phone ?? "",
      glassTypeId: order.glass_type?.id ?? "",
      length: lengthValue,
      width: widthValue,
      unit,
      shape: (order.shape_type as "rectangular" | "curved") ?? "rectangular",
      curveDiameter: order.curve_diameter ?? "",
      sheetSize: order.sheet_size ?? "",
      customSheetSize: "",
      thickness: order.thickness ?? "",
      selectedAddons,
      addonItemExtras,
      drillHoles: (order.drill_holes_count ?? 0) > 0,
      numberOfHoles: order.drill_holes_count
        ? String(order.drill_holes_count)
        : "",
      holeDiameter:
        order.hole_diameter != null ? String(order.hole_diameter) : "",
      addTintFilm: !!order.tint_type,
      tintType: order.tint_type ?? "",
      engraving: !!order.engraving_text,
      engravingType: order.engraving_text ? "text" : "",
      engravingText: order.engraving_text ?? "",
      customerNotes: order.customer_notes ?? "",
      insuranceCoverage: order.insurance_selected ?? false,
      commissionSelected: false,
      deliveryMethod:
        (order.delivery_method as "pickup" | "delivery") ?? "pickup",
      deliveryAddress: order.delivery_address ?? "",
      deliveryFee:
        order.delivery_fee != null ? String(order.delivery_fee) : "",
      glassInventorySerialCode:
        (raw.glass_inventory_serial_code as string) ?? "",
    });

    isFormInitialized.current = true;
  }, [order, form]);

  // Upgrade engravingType once orderFiles loads (image-only or both)
  useEffect(() => {
    if (!isFormInitialized.current) return;
    const hasImage = (orderFiles?.engraving_image_files?.length ?? 0) > 0;
    if (!hasImage) return;
    const current = form.getValues("engravingType");
    form.setValue("engravingType", current === "text" ? "both" : "image");
  }, [orderFiles, form]);

  const { mutateAsync: updateOrder, isPending: isUpdatingOrder } =
    useUpdateOrder();
  const { mutateAsync: reviewOrder, isPending: isReviewingOrder } =
    useReviewOrder();

  const buildReviewPayload = (values: OrderFormValues) => {
    const extras = values.addonItemExtras ?? {};
    const addonItems = (values.selectedAddons ?? []).map((addon_id) => {
      const e = extras[addon_id] ?? {};
      return {
        addon_id,
        ...(e.type_key ? { type_key: e.type_key } : {}),
        ...(e.sides != null ? { sides: e.sides } : {}),
        ...(e.quantity != null ? { quantity: e.quantity } : {}),
      };
    });
    return {
      width: `${values.width}${values.unit}`,
      length: `${values.length}${values.unit}`,
      glass_inventory_item_id: values.glassTypeId || null,
      shape_type: values.shape,
      drill_holes_count: values.drillHoles
        ? Number(values.numberOfHoles) || 0
        : 0,
      addon_items: addonItems.length > 0 ? addonItems : undefined,
      insurance_selected: values.insuranceCoverage ?? false,
      commission_selected: values.commissionSelected ?? false,
      delivery_fee:
        values.deliveryMethod === "delivery" && values.deliveryFee
          ? Number(values.deliveryFee)
          : undefined,
    };
  };

  const handleRefreshPricing = async () => {
    if (!isFormInitialized.current) return;
    try {
      const result = await reviewOrder({
        data: buildReviewPayload(form.getValues()),
      });
      setOrderReview(result);
    } catch {
      // errors already toasted
    }
  };

  const handleNextTab = async (
    fieldsToValidate?: (keyof OrderFormValues)[],
  ) => {
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    const currentIndex = steps.findIndex((step) => step.id === activeTab);
    if (currentIndex < steps.length - 1) {
      setHighestUnlockedIndex((prev) => Math.max(prev, currentIndex + 1));
      setActiveTab(steps[currentIndex + 1].id);
    }
  };

  const handleAddOnsNext = async () => {
    const fields: (keyof OrderFormValues)[] = [
      "selectedAddons",
      "drillHoles",
      "numberOfHoles",
      "holeDiameter",
      "addTintFilm",
      "tintType",
      "engraving",
      "engravingText",
    ];
    const isValid = await form.trigger(fields);
    if (!isValid) return;

    try {
      const result = await reviewOrder({
        data: buildReviewPayload(form.getValues()),
      });
      setOrderReview(result);
      const currentIndex = steps.findIndex((s) => s.id === "add-ons");
      setHighestUnlockedIndex((prev) => Math.max(prev, currentIndex + 1));
      setActiveTab("review");
    } catch {
      // errors already toasted
    }
  };

  const handleSaveChanges = async () => {
    if (!order?.id) return;
    const values = form.getValues();

    try {
      // Build a payload with only fields that differ from the original order
      type Payload = Parameters<typeof updateOrder>[0]["data"];
      const payload: Payload = {};

      if (values.customerName !== order.customer_name)
        payload.customer_name = values.customerName;
      if (values.email !== order.customer_email)
        payload.customer_email = values.email;
      if (values.phone !== order.customer_phone)
        payload.customer_phone = values.phone;

      const newWidth = `${values.width}${values.unit}`;
      const newLength = `${values.length}${values.unit}`;
      if (newWidth !== order.width) payload.width = newWidth;
      if (newLength !== order.length) payload.length = newLength;

      if ((values.sheetSize ?? "") !== (order.sheet_size ?? ""))
        payload.sheet_size = values.sheetSize;
      if ((values.thickness ?? "") !== (order.thickness ?? ""))
        payload.thickness = values.thickness;

      const newDrillCount = values.drillHoles
        ? Number(values.numberOfHoles)
        : 0;
      if (newDrillCount !== (order.drill_holes_count ?? 0))
        payload.drill_holes_count = newDrillCount;

      const newHoleDiameter = values.drillHoles
        ? (values.holeDiameter ?? "")
        : "";
      if (newHoleDiameter !== String(order.hole_diameter ?? ""))
        payload.hole_diameter = newHoleDiameter;

      const newTintType = values.addTintFilm ? (values.tintType ?? "") : "";
      if (newTintType !== (order.tint_type ?? ""))
        payload.tint_type = newTintType;

      payload.engraving_text = values.engraving
        ? (values.engravingText ?? "")
        : "";


      // Addons: compare full ID sets and extras content
      const extras = values.addonItemExtras ?? {};
      const addonItems = (values.selectedAddons || []).map((addon_id) => {
        const e = extras[addon_id] ?? {};
        return {
          addon_id,
          ...(e.type_key ? { type_key: e.type_key } : {}),
          ...(e.sides != null ? { sides: e.sides } : {}),
          ...(e.quantity != null ? { quantity: e.quantity } : {}),
        };
      });

      const originalAddonIds = (order.addons ?? []).map((a) => a.addon_id).sort();
      const currentAllAddonIds = (values.selectedAddons || []).slice().sort();

      // Reconstruct original extras for comparison
      const originalExtras: Record<string, unknown> = {};
      for (const a of order.addons ?? []) {
        const entry: Record<string, unknown> = {};
        if (!a.addon) {
          // Hardware item — compare by quantity
          if (a.quantity != null) entry.quantity = a.quantity;
        } else {
          const schema = a.addon.input_schema;
          if (schema) {
            if (a.custom_input && schema.supported_types) {
              const lower = a.custom_input.toLowerCase();
              const key = Object.keys(schema.supported_types).find(
                (k) => k.toLowerCase() === lower,
              );
              if (key) entry.type_key = key;
            }
            if (schema.supports_sides && a.quantity != null) entry.sides = a.quantity;
            else if (schema.supports_quantity && a.quantity != null) entry.quantity = a.quantity;
          }
        }
        originalExtras[a.addon_id] = entry;
      }

      const addonsChanged =
        JSON.stringify(currentAllAddonIds) !== JSON.stringify(originalAddonIds) ||
        JSON.stringify(extras) !== JSON.stringify(originalExtras);

      if (addonsChanged) {
        payload.addon_items = addonItems.length > 0 ? addonItems : [];
      }

      if (values.insuranceCoverage !== order.insurance_selected)
        payload.insurance_selected = values.insuranceCoverage;

      if (values.commissionSelected)
        payload.commission_selected = values.commissionSelected;

      const newDeliveryMethod = values.deliveryMethod;
      if (newDeliveryMethod !== (order.delivery_method ?? "pickup"))
        payload.delivery_method = newDeliveryMethod;

      const newDeliveryAddress =
        values.deliveryMethod === "delivery"
          ? (values.deliveryAddress ?? "")
          : "";
      if (newDeliveryAddress !== (order.delivery_address ?? ""))
        payload.delivery_address = newDeliveryAddress || undefined;

      const newDeliveryFee =
        values.deliveryMethod === "delivery" && values.deliveryFee
          ? Number(values.deliveryFee)
          : 0;
      if (newDeliveryFee !== Number(order.delivery_fee ?? 0))
        payload.delivery_fee = newDeliveryFee;

      if (Object.keys(payload).length > 0) {
        await updateOrder({ order_id: order.id, data: payload });
      }

      // Upload any new spec / engraving files
      if (!filesUploadedRef.current) {
        const uploadPromises: Promise<unknown>[] = [];
        for (const file of specFiles) {
          uploadPromises.push(uploadSpecification(order.id, file));
        }
        if (engravingImageFile) {
          uploadPromises.push(
            uploadEngravingImage(order.id, engravingImageFile),
          );
        }
        if (uploadPromises.length > 0) {
          setIsUploading(true);
          try {
            await Promise.all(uploadPromises);
          } finally {
            setIsUploading(false);
          }
        }
        filesUploadedRef.current = true;
      }

      // Upload signature if provided
      if (signatureDataUrl?.startsWith("data:")) {
        setIsUploading(true);
        try {
          const res = await fetch(signatureDataUrl);
          const blob = await res.blob();
          const sigFile = new File([blob], "signature.png", { type: "image/png" });
          await uploadSignature(order.id, sigFile);
        } finally {
          setIsUploading(false);
        }
      }

      router.push(`/${reference}`);
    } catch {
      // errors already toasted
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Edit Order" className="border-b">
        <Link href={`/${reference}`}>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 rounded-full h-10 w-10"
          >
            <X className="size-5" />
          </Button>
        </Link>
      </Header>

      <div className="flex flex-1 flex-col md:flex-row">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-1 flex-col md:flex-row w-full data-[orientation=vertical]:flex-col md:data-[orientation=vertical]:flex-row"
        >
          {/* Sidebar / Top Nav */}
          <div className="md:w-[240px] sticky top-0 max-h-[calc(100vh-10rem)] overflow-y-auto md:shrink-0 border-b md:border-b-0 md:border-r bg-white flex flex-col px-4">
            <TabsList className="flex md:flex-col h-auto w-full justify-start items-start space-x-4 md:space-x-0 bg-transparent px-4 md:px-0 md:py-6 overflow-x-auto rounded-none border-none">
              {steps.map((step, index) => {
                const isLocked = index > highestUnlockedIndex;
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    disabled={isLocked}
                    className="data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-neutral-600 font-medium justify-center md:justify-start px-2 md:px-6 py-3 w-auto md:w-full text-left whitespace-nowrap rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 md:border-b-0 md:border-l-[3px] md:data-[state=active]:border-blue-600 md:data-[state=active]:bg-[#eff6ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-auto"
                  >
                    <span className="flex items-center gap-2">{step.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 bg-[#F8F9FA] overflow-auto p-6 md:p-12">
            <Form {...form}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto w-full"
              >
                <CustomerStep
                  form={form}
                  onNext={() =>
                    handleNextTab(["customerName", "email", "phone"])
                  }
                />
                <GlassSpecsStep
                  form={form}
                  disableGlassType
                  onBack={() => setActiveTab("customer")}
                  onNext={() =>
                    handleNextTab([
                      "glassTypeId",
                      "length",
                      "width",
                      "sheetSize",
                      "thickness",
                    ])
                  }
                />
                <AddOnsStep
                  form={form}
                  onBack={() => setActiveTab("glass-specs")}
                  onNext={handleAddOnsNext}
                  isLoading={isReviewingOrder || isUploading}
                  specFiles={specFiles}
                  onSpecFilesChange={setSpecFiles}
                  engravingImageFile={engravingImageFile}
                  onEngravingImageChange={setEngravingImageFile}
                  existingSpecFileUrls={(
                    orderFiles?.specification_files ?? []
                  ).map((f) => ({
                    name: f.file_path.split("/").pop() ?? f.file_path,
                    url: f.download_url,
                  }))}
                  existingEngravingImageUrl={
                    orderFiles?.engraving_image_files?.[0]
                      ? {
                          name:
                            orderFiles.engraving_image_files[0].file_path
                              .split("/")
                              .pop() ?? "engraving-image",
                          url: orderFiles.engraving_image_files[0].download_url,
                        }
                      : null
                  }
                  existingAddons={order?.addons ?? []}
                />
                <ReviewStep
                  form={form}
                  pricing={orderReview}
                  onBack={() => setActiveTab("add-ons")}
                  onSubmitOrder={handleSaveChanges}
                  onRefreshPricing={handleRefreshPricing}
                  isPricingLoading={isReviewingOrder}
                  isLoading={isUpdatingOrder || isUploading || isReviewingOrder}
                  signatureDataUrl={signatureDataUrl}
                  onSignatureChange={setSignatureDataUrl}
                  submitLabel="Save Changes"
                />
              </form>
            </Form>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
