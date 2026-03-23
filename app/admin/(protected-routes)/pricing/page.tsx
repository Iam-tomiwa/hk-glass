"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import PricingTable, { PricingRow } from "./widgets/pricing-table";
import AddAddonModal, { NewAddon } from "./widgets/add-product";
import AddonsTable from "./widgets/addons-table";
import {
  useGetPricingSettings,
  useUpdatePricingSettings,
  useListAddons,
  useCreateAddon,
} from "@/services/queries/admin";
import {
  useListInventory,
  useUpdateInventoryItemPrice,
} from "@/services/queries/inventory";

type Tab = "addons" | "glass-sheets" | "hardware" | "insurance";

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("addons");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: pricingSettings,
    isLoading: isRatesLoading,
    isError: isRatesError,
    error: ratesError,
  } = useGetPricingSettings();

  const {
    data: addons = [],
    isLoading: isAddonsLoading,
    isError: isAddonsError,
    error: addonsError,
  } = useListAddons();

  const {
    data: glassItems = [],
    isLoading: isGlassLoading,
    isError: isGlassError,
    error: glassError,
  } = useListInventory("glass");

  const {
    data: hardwareItems = [],
    isLoading: isHardwareLoading,
    isError: isHardwareError,
    error: hardwareError,
  } = useListInventory("hardware");

  const updatePricingSettingsMutation = useUpdatePricingSettings();
  const createAddonMutation = useCreateAddon();
  const updateInventoryPriceMutation = useUpdateInventoryItemPrice();

  const glassRows: PricingRow[] = glassItems.map((g) => ({
    id: g.id,
    name: g.material_name,
    unit: g.unit ?? "sheets",
    price: g.price_per_sqm ?? "",
  }));

  const hardwareRows: PricingRow[] = hardwareItems.map((h) => ({
    id: h.id,
    name: h.material_name,
    unit: h.unit ?? "units",
    price: h.unit_price ?? "",
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

  const handleSaveGlassPrice = async (id: string, newPrice: string) => {
    await updateInventoryPriceMutation.mutateAsync({
      item_id: id,
      data: { price_per_sqm: newPrice },
    });
  };

  const handleSaveHardwarePrice = async (id: string, newPrice: string) => {
    await updateInventoryPriceMutation.mutateAsync({
      item_id: id,
      data: { unit_price: newPrice },
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

  const handleAddAddon = async (addon: NewAddon) => {
    await createAddonMutation.mutateAsync({
      data: {
        name: addon.name,
        description: addon.description,
        category: addon.category,
        price: addon.price,
        price_type: addon.price_type,
      },
    });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "addons", label: "Add-ons and Services" },
    { key: "glass-sheets", label: "Glass sheets" },
    { key: "hardware", label: "Hardware" },
    { key: "insurance", label: "Insurance and Tax" },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Header
        title="Pricing"
        description="Manage pricing for glass and services"
        className="mb-0"
      >
        <Button onClick={() => setModalOpen(true)}>
          Add new Add-ons and Services
        </Button>
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
        {activeTab === "addons" && (
          <AddonsTable
            rows={addons}
            isLoading={isAddonsLoading}
            isError={isAddonsError}
            error={addonsError as Error | null}
          />
        )}

        {activeTab === "glass-sheets" && (
          <PricingTable
            rows={glassRows}
            title="Glass sheets"
            variableName="Price Per Sqm (₦)"
            nameHeader="Sheets"
            showUnit={false}
            isLoading={isGlassLoading}
            isError={isGlassError}
            error={glassError as Error | null}
            onSave={handleSaveGlassPrice}
          />
        )}

        {activeTab === "hardware" && (
          <PricingTable
            rows={hardwareRows}
            title="Hardware"
            variableName="Price Per Unit (₦)"
            nameHeader="Hardware"
            showUnit={false}
            isLoading={isHardwareLoading}
            isError={isHardwareError}
            error={hardwareError as Error | null}
            onSave={handleSaveHardwarePrice}
          />
        )}

        {activeTab === "insurance" && (
          <PricingTable
            rows={rateRows}
            variableName="Rate (%)"
            title="Insurance and Tax"
            isLoading={isRatesLoading}
            isError={isRatesError}
            error={ratesError as Error | null}
            onSave={handleSaveRate}
          />
        )}
      </div>

      <AddAddonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddAddon}
      />
    </div>
  );
}
