"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderFormSchema, type OrderFormValues } from "./schema";
import { CustomerStep } from "./components/customer-step";
import { GlassSpecsStep } from "./components/glass-specs-step";
import { AddOnsStep } from "./components/add-ons-step";
import { ReviewStep } from "./components/review-step";
import { Header } from "@/components/header";
import { useCreateOrder, useReviewOrder, useSendReviewEmail } from "@/services/queries/orders";
import { useInitializePayment } from "@/services/queries/payments";
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
  const [orderReview, setOrderReview] = useState<OrderReviewResponse | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [specFiles, setSpecFiles] = useState<File[]>([]);
  const [engravingImageFile, setEngravingImageFile] = useState<File | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { mutateAsync: initializePayment, isPending: isInitializingPayment } = useInitializePayment();
  const { mutateAsync: reviewOrder, isPending: isReviewingOrder } = useReviewOrder();
  const { mutateAsync: sendReviewEmail } = useSendReviewEmail();

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
      // Calculate pricing preview
      const result = await reviewOrder({
        data: {
          width: `${values.width}${values.unit}`,
          length: `${values.length}${values.unit}`,
          glass_type_id: values.glassTypeId,
          shape_type: values.shape,
          drill_holes_count: values.drillHoles
            ? Number(values.numberOfHoles) || 0
            : 0,
          addon_ids: values.selectedAddons ?? [],
          insurance_selected: values.insuranceCoverage ?? false,
        },
      });
      setOrderReview(result);

      // Create the order
      const orderRes = await createOrder({
        data: {
          customer_name: values.customerName,
          customer_email: values.email,
          customer_phone: values.phone || "",
          width: `${values.width}${values.unit}`,
          length: `${values.length}${values.unit}`,
          sheet_size: values.sheetSize,
          thickness: values.thickness,
          drill_holes_count: values.drillHoles ? Number(values.numberOfHoles) : 0,
          hole_diameter: values.drillHoles ? values.holeDiameter : "",
          tint_type: values.addTintFilm ? values.tintType : "",
          engraving_text: values.engraving ? values.engravingText : "",
          glass_type_id: values.glassTypeId,
          addon_ids: values.selectedAddons,
          insurance_selected: values.insuranceCoverage,
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

      if (orderRes?.id) {
        const orderId = orderRes.id;
        setCreatedOrderId(orderId);

        // Upload spec + engraving files in parallel
        const uploadPromises: Promise<unknown>[] = [];
        for (const file of specFiles) {
          uploadPromises.push(uploadSpecification(orderId, file));
        }
        if (engravingImageFile) {
          uploadPromises.push(uploadEngravingImage(orderId, engravingImageFile));
        }
        if (uploadPromises.length > 0) {
          setIsUploading(true);
          try {
            await Promise.all(uploadPromises);
          } finally {
            setIsUploading(false);
          }
        }

        // Send pre-payment review email
        const reviewUrl = orderRes.order_reference
          ? `${window.location.origin}/orders/review/${orderRes.order_reference}`
          : `${window.location.origin}/orders/review?order_id=${orderId}`;
        await sendReviewEmail({ order_id: orderId, data: { review_url: reviewUrl } });
      }

      const currentIndex = steps.findIndex((s) => s.id === "add-ons");
      setHighestUnlockedIndex((prev) => Math.max(prev, currentIndex + 1));
      setActiveTab("review");
    } catch {
      // errors already toasted by the hooks
    }
  };

  const handleProceedToPayment = async () => {
    const orderId = createdOrderId;
    if (!orderId) return;
    try {
      // Upload signature if provided
      if (signatureDataUrl?.startsWith("data:")) {
        setIsUploading(true);
        try {
          const res = await fetch(signatureDataUrl);
          const blob = await res.blob();
          const sigFile = new File([blob], "signature.png", { type: "image/png" });
          await uploadSignature(orderId, sigFile);
        } finally {
          setIsUploading(false);
        }
      }

      const paymentRes = await initializePayment({ data: { order_id: orderId } });

      if (paymentRes?.authorization_url) {
        window.location.href = paymentRes.authorization_url;
      } else {
        setHighestUnlockedIndex(steps.length - 1);
        setActiveTab("confirmation");
      }
    } catch (e) {
      console.error("Payment failed", e);
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
                  isLoading={isReviewingOrder || isCreatingOrder || isUploading}
                  specFiles={specFiles}
                  onSpecFilesChange={setSpecFiles}
                  engravingImageFile={engravingImageFile}
                  onEngravingImageChange={setEngravingImageFile}
                />
                <ReviewStep
                  form={form}
                  pricing={orderReview}
                  onBack={() => setActiveTab("add-ons")}
                  onProceedToPayment={handleProceedToPayment}
                  isLoading={isUploading || isInitializingPayment}
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
