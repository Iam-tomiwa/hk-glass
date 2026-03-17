"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import PricingTable, { PricingRow } from "./widgets/pricing-table";
import AddProductModal, { CustomProduct } from "./widgets/add-product";
import {
  useGetPricingSettings,
  useUpdatePricingSettings,
  useListGlassTypes,
  useUpdateGlassType,
  useCreateGlassType,
  useListAddons,
  useUpdateAddon,
  useCreateAddon,
} from "@/services/queries/admin";

type Tab = "base-glass" | "addons" | "insurance";

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("base-glass");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: pricingSettings,
    isLoading: isRatesLoading,
    isError: isRatesError,
    error: ratesError,
  } = useGetPricingSettings();
  const {
    data: glassTypes = [],
    isLoading: isGlassLoading,
    isError: isGlassError,
    error: glassError,
  } = useListGlassTypes();
  const {
    data: addons = [],
    isLoading: isAddonsLoading,
    isError: isAddonsError,
    error: addonsError,
  } = useListAddons();

  const updateGlassTypeMutation = useUpdateGlassType();
  const updateAddonMutation = useUpdateAddon();
  const updatePricingSettingsMutation = useUpdatePricingSettings();
  const createGlassTypeMutation = useCreateGlassType();
  const createAddonMutation = useCreateAddon();

  const glassRows: PricingRow[] = glassTypes.map((g) => ({
    id: g.id,
    name: g.name,
    unit: "sq ft",
    price: g.price_per_sqm,
  }));

  const addonRows: PricingRow[] = addons.map((a) => ({
    id: a.id,
    name: a.name,
    unit: a.price_type === "per_sqm" ? "per sq ft" : "per order",
    price: a.price,
  }));

  const rateRows: PricingRow[] = [
    {
      id: "insurance_rate",
      name: "Insurance Rate",
      unit: "% of subtotal",
      price: pricingSettings?.insurance_rate ?? "",
    },
    {
      id: "tax_rate",
      name: "Tax Rate",
      unit: "% of total",
      price: pricingSettings?.tax_rate ?? "",
    },
  ];

  const handleSaveGlass = async (id: string, newPrice: string) => {
    await updateGlassTypeMutation.mutateAsync({
      glass_type_id: id,
      data: { price_per_sqm: newPrice },
    });
  };

  const handleSaveAddon = async (id: string, newPrice: string) => {
    await updateAddonMutation.mutateAsync({
      addon_id: id,
      data: { price: newPrice },
    });
  };

  const handleSaveRate = async (id: string, newValue: string) => {
    await updatePricingSettingsMutation.mutateAsync({
      data: {
        insurance_rate:
          id === "insurance_rate"
            ? newValue
            : (pricingSettings?.insurance_rate ?? ""),
        tax_rate:
          id === "tax_rate" ? newValue : (pricingSettings?.tax_rate ?? ""),
      },
    });
  };

  const handleAddProduct = async (product: Omit<CustomProduct, "id">) => {
    if (product.category === "Base Glass") {
      await createGlassTypeMutation.mutateAsync({
        data: { name: product.name, price_per_sqm: product.price },
      });
    } else {
      await createAddonMutation.mutateAsync({
        data: {
          name: product.name,
          price: product.price,
          price_type: product.price_type ?? "flat",
        },
      });
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "base-glass", label: "Base Glass" },
    { key: "addons", label: "Add - ons" },
    { key: "insurance", label: "Insurance and Tax" },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Header
        title="Pricing"
        description="Manage pricing for glass and services"
        className="mb-0"
      >
        <Button onClick={() => setModalOpen(true)}>Add new Product</Button>
      </Header>

      <div className="flex px-6 bg-background items-center border-b border-neutral-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#1E202E] text-[#1E202E]"
                : "border-transparent text-neutral-500 hover:text-[#1E202E]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="container pb-10">
        {activeTab === "base-glass" && (
          <PricingTable
            rows={glassRows}
            variableName="Price (₦)"
            isLoading={isGlassLoading}
            isError={isGlassError}
            error={glassError as Error | null}
            onSave={handleSaveGlass}
            deleteType="glass-type"
          />
        )}

        {activeTab === "addons" && (
          <PricingTable
            rows={addonRows}
            variableName="Price (₦)"
            isLoading={isAddonsLoading}
            isError={isAddonsError}
            error={addonsError as Error | null}
            onSave={handleSaveAddon}
            deleteType="addon"
          />
        )}

        {activeTab === "insurance" && (
          <PricingTable
            rows={rateRows}
            variableName="Rate (%)"
            isLoading={isRatesLoading}
            isError={isRatesError}
            error={ratesError as Error | null}
            onSave={handleSaveRate}
          />
        )}
      </div>

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddProduct}
      />
    </div>
  );
}
