"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderFormSchema, type OrderFormValues } from "./schema";
import { CustomerStep } from "./components/customer-step";
import { GlassSpecsStep } from "./components/glass-specs-step";
import { AddOnsStep } from "./components/add-ons-step";
import { ReviewStep } from "./components/review-step";
import { PaymentStep } from "./components/payment-step";
import { ConfirmationStep } from "./components/confirmation-step";
import { Header } from "@/components/header";

const steps = [
  { id: "customer", label: "Customer" },
  { id: "glass-specs", label: "Glass Specs" },
  { id: "add-ons", label: "Add-ons" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmation" },
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

  // Automatically trigger the confirmation step if there is a payment reference in URL
  useEffect(() => {
    if (
      searchParams.get("reference") ||
      searchParams.get("paystack") === "success"
    ) {
      setActiveTab("confirmation");
    }
  }, [searchParams]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      length: "",
      width: "",
      sheetSize: "",
      thickness: "",
      edging: false,
      glazing: false,
      warping: false,
      waxing: false,
      drillHoles: false,
      numberOfHoles: "",
      holeDiameter: "",
      temperGlass: false,
      addTintFilm: false,
      tintType: "",
      engraving: false,
      engravingText: "",
      insuranceCoverage: false,
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
      setActiveTab(steps[currentIndex + 1].id);
    }
  };

  function onSubmit(data: OrderFormValues) {
    console.log(data);
    // Move to next step or submit based on current step
    const currentIndex = steps.findIndex((step) => step.id === activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id);
    } else {
      // Final submission
      console.log("Submit Order", data);
    }
  }

  const handleCancel = () => router.push("/");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header title="New Order Placement">
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

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex  flex-1 flex-col md:flex-row w-full data-[orientation=vertical]:flex-col md:data-[orientation=vertical]:flex-row"
        >
          {/* Sidebar / Top Nav */}
          <div className="md:w-[240px] sticky top-0 max-h-[calc(100vh-10rem)] overflow-y-auto md:shrink-0 border-b md:border-b-0 md:border-r bg-white flex flex-col px-4">
            <TabsList className="flex md:flex-col h-auto w-full justify-start items-start space-x-4 md:space-x-0 bg-transparent px-4 md:px-0 md:py-6 overflow-x-auto rounded-none border-none">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-neutral-600 font-medium justify-center md:justify-start px-2 md:px-6 py-3 w-auto md:w-full text-left whitespace-nowrap rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 md:border-b-0 md:border-l-[3px] md:data-[state=active]:border-blue-600 md:data-[state=active]:bg-[#eff6ff] transition-colors"
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 bg-[#F8F9FA] overflow-auto p-6 md:p-12">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={`mx-auto w-full`}
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
                    handleNextTab(["length", "width", "sheetSize", "thickness"])
                  }
                />
                <AddOnsStep
                  form={form}
                  onBack={handleCancel}
                  onNext={() =>
                    handleNextTab([
                      "edging",
                      "glazing",
                      "warping",
                      "waxing",
                      "drillHoles",
                      "numberOfHoles",
                      "holeDiameter",
                      "temperGlass",
                      "addTintFilm",
                      "tintType",
                      "engraving",
                      "engravingText",
                    ])
                  }
                />
                <ReviewStep
                  form={form}
                  onBack={() => setActiveTab("add-ons")}
                  onNext={() => handleNextTab()}
                />
                <PaymentStep
                  form={form}
                  onBack={() => setActiveTab("review")}
                />

                <TabsContent value="confirmation" className="mt-0 outline-none">
                  <ConfirmationStep />
                </TabsContent>
              </form>
            </Form>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
