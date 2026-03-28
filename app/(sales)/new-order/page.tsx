"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderFormSchema, type OrderFormValues } from "./schema";
import { CustomerStep } from "./components/customer-step";
import { GlassSpecsStep } from "./components/glass-specs-step";
import { AddOnsStep } from "./components/add-ons-step";
import { ReviewStep } from "./components/review-step";
import { Header } from "@/components/header";
import {
  useCreateOrder,
  useReviewOrder,
  useSendReviewEmail,
} from "@/services/queries/orders";
import { OrderReviewResponse, OrderResponse } from "@/services/types/openapi";
import {
  uploadSpecification,
  uploadEngravingImage,
  uploadSignature,
} from "@/services/api/orders";

const steps = [
  { id: "customer", label: "Customer" },
  { id: "glass-specs", label: "Glass Specs" },
  { id: "add-ons", label: "Add-ons" },
  { id: "review", label: "Logistics & Pricing" },
];

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewOrderForm />
    </Suspense>
  );
}

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("customer");
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(0);
  const [orderReview, setOrderReview] = useState<OrderReviewResponse | null>(
    null,
  );
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [specFiles, setSpecFiles] = useState<File[]>([]);
  const [engravingImageFile, setEngravingImageFile] = useState<File | null>(
    null,
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const filesUploadedForOrderId = useRef<string | null>(null);
  const emailSentForOrderId = useRef<string | null>(null);

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    const paystackSuccess = searchParams.get("paystack") === "success";
    if (reference || paystackSuccess) {
      const orderId = searchParams.get("order_id");
      if (orderId) {
        const params = new URLSearchParams(searchParams.toString());
        router.replace(`/payment-confirmation/${orderId}?${params.toString()}`);
      } else {
        setHighestUnlockedIndex(steps.length - 1);
        setActiveTab("confirmation");
      }
    }
  }, [router, searchParams]);

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

  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder();
  const { mutateAsync: reviewOrder, isPending: isReviewingOrder } =
    useReviewOrder();
  const { mutateAsync: sendReviewEmail } = useSendReviewEmail();

  /** Shared helper: build the review request from current form values */
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

  /** Re-price after the user toggles insurance or commission on the review step */
  const handleRefreshPricing = async () => {
    try {
      const result = await reviewOrder({
        data: buildReviewPayload(form.getValues()),
      });
      setOrderReview(result);
    } catch {
      // errors already toasted by the hook
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

    const values = form.getValues();
    try {
      const result = await reviewOrder({ data: buildReviewPayload(values) });
      setOrderReview(result);
      const currentIndex = steps.findIndex((s) => s.id === "add-ons");
      setHighestUnlockedIndex((prev) => Math.max(prev, currentIndex + 1));
      setActiveTab("review");
    } catch {
      // errors already toasted by the hooks
    }
  };

  const handleReviewOrder = async () => {
    const values = form.getValues();
    try {
      // Step 1: create order (skip if already done)
      let orderRes = createdOrder;
      if (!orderRes) {
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

        orderRes = await createOrder({
          data: {
            customer_name: values.customerName,
            customer_email: values.email,
            customer_phone: values.phone || "",
            width: `${values.width}${values.unit}`,
            length: `${values.length}${values.unit}`,
            sheet_size: values.sheetSize,
            thickness: values.thickness,
            drill_holes_count: values.drillHoles
              ? Number(values.numberOfHoles)
              : 0,
            hole_diameter: values.drillHoles ? values.holeDiameter : "",
            tint_type: values.addTintFilm ? values.tintType : "",
            engraving_text: values.engraving ? values.engravingText : "",
            glass_inventory_item_id: values.glassTypeId || null,
            glass_inventory_serial_code:
              values.glassInventorySerialCode || null,
            addon_items: addonItems.length > 0 ? addonItems : undefined,
            insurance_selected: values.insuranceCoverage,
            commission_selected: values.commissionSelected ?? false,
            shape_type: values.shape,
            curve_diameter: values.curveDiameter
              ? Number(values.curveDiameter)
              : undefined,
            customer_notes: values.customerNotes,
            delivery_method: values.deliveryMethod,
            delivery_address:
              values.deliveryMethod === "delivery"
                ? values.deliveryAddress
                : undefined,
            delivery_fee:
              values.deliveryMethod === "delivery" && values.deliveryFee
                ? Number(values.deliveryFee)
                : 0,
          },
        });
        setCreatedOrder(orderRes);
      }

      if (orderRes?.id) {
        // Step 2: upload files (skip if already done for this order)
        if (filesUploadedForOrderId.current !== orderRes.id) {
          const uploadPromises: Promise<unknown>[] = [];
          for (const file of specFiles) {
            uploadPromises.push(uploadSpecification(orderRes.id, file));
          }
          if (engravingImageFile) {
            uploadPromises.push(
              uploadEngravingImage(orderRes.id, engravingImageFile),
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
          filesUploadedForOrderId.current = orderRes.id;
        }

        // Step 3: upload signature if provided
        if (signatureDataUrl?.startsWith("data:")) {
          setIsUploading(true);
          try {
            const res = await fetch(signatureDataUrl);
            const blob = await res.blob();
            const sigFile = new File([blob], "signature.png", {
              type: "image/png",
            });
            await uploadSignature(orderRes.id, sigFile);
          } finally {
            setIsUploading(false);
          }
        }

        // Step 4: send review email (skip if already done for this order)
        if (emailSentForOrderId.current !== orderRes.id) {
          const reviewUrl = orderRes.order_reference
            ? `${window.location.origin}/orders/review/${orderRes.order_reference}`
            : `${window.location.origin}/orders/review?order_id=${orderRes.id}`;
          await sendReviewEmail({
            order_id: orderRes.id,
            data: { review_url: reviewUrl },
          });
          emailSentForOrderId.current = orderRes.id;
        }

        // Navigate to the order detail page
        const ref = orderRes.order_reference ?? orderRes.id;
        router.push(`/${ref}`);
      }
    } catch {
      // errors already toasted by the hooks
    }
  };

  const handleCancel = () => router.push("/");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="New Order Placement" className="border-b">
        <Link href="/">
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
                    <span className="flex items-center gap-2">
                      {step.label}
                    </span>
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
                  onBack={handleCancel}
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
                  onBack={handleCancel}
                  onNext={handleAddOnsNext}
                  isLoading={isReviewingOrder || isUploading}
                  specFiles={specFiles}
                  onSpecFilesChange={setSpecFiles}
                  engravingImageFile={engravingImageFile}
                  onEngravingImageChange={setEngravingImageFile}
                />
                <ReviewStep
                  form={form}
                  pricing={orderReview}
                  onBack={() => setActiveTab("add-ons")}
                  onSubmitOrder={handleReviewOrder}
                  onRefreshPricing={handleRefreshPricing}
                  isPricingLoading={isReviewingOrder}
                  isLoading={isUploading || isCreatingOrder || isReviewingOrder}
                  signatureDataUrl={signatureDataUrl}
                  onSignatureChange={setSignatureDataUrl}
                />
              </form>
            </Form>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
