"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import PriceTable, { PriceMap } from "./widgets/pricing-table";
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

const RATE_FIELDS = [
  { key: "insurance_rate", label: "Insurance Rate", unit: "% of subtotal" },
  { key: "tax_rate", label: "Tax Rate", unit: "% of total" },
];

export default function PricingPage() {
  const [saved, setSaved] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [draftBase, setDraftBase] = useState<PriceMap>({});
  const [draftAddon, setDraftAddon] = useState<PriceMap>({});
  const [draftRates, setDraftRates] = useState<PriceMap>({});

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

  const isSaving =
    updateGlassTypeMutation.isPending ||
    updateAddonMutation.isPending ||
    updatePricingSettingsMutation.isPending;

  // ─── Derived values for display ───────────────────────────────────────────

  const glassFields = glassTypes.map((g) => ({
    key: g.id,
    label: g.name,
    unit: "sq ft",
  }));

  const glassValues: PriceMap = saved
    ? Object.fromEntries(glassTypes.map((g) => [g.id, g.price_per_sqm]))
    : draftBase;

  const addonFields = addons.map((a) => ({
    key: a.id,
    label: a.name,
    unit: "per order",
  }));

  const addonValues: PriceMap = saved
    ? Object.fromEntries(addons.map((a) => [a.id, a.price]))
    : draftAddon;

  const rateValues: PriceMap = saved
    ? {
        insurance_rate: pricingSettings?.insurance_rate ?? "",
        tax_rate: pricingSettings?.tax_rate ?? "",
      }
    : draftRates;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleManage = () => {
    setDraftBase(
      Object.fromEntries(glassTypes.map((g) => [g.id, g.price_per_sqm])),
    );
    setDraftAddon(Object.fromEntries(addons.map((a) => [a.id, a.price])));
    setDraftRates({
      insurance_rate: pricingSettings?.insurance_rate ?? "",
      tax_rate: pricingSettings?.tax_rate ?? "",
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const updates: Promise<any>[] = [];

      glassTypes.forEach((g) => {
        if (
          draftBase[g.id] !== undefined &&
          draftBase[g.id] !== g.price_per_sqm
        ) {
          updates.push(
            updateGlassTypeMutation.mutateAsync({
              glass_type_id: g.id,
              data: { price_per_sqm: draftBase[g.id] },
            }),
          );
        }
      });

      addons.forEach((a) => {
        if (draftAddon[a.id] !== undefined && draftAddon[a.id] !== a.price) {
          updates.push(
            updateAddonMutation.mutateAsync({
              addon_id: a.id,
              data: { price: draftAddon[a.id] },
            }),
          );
        }
      });

      if (
        draftRates.tax_rate !== pricingSettings?.tax_rate ||
        draftRates.insurance_rate !== pricingSettings?.insurance_rate
      ) {
        updates.push(
          updatePricingSettingsMutation.mutateAsync({
            data: {
              tax_rate: draftRates.tax_rate,
              insurance_rate: draftRates.insurance_rate,
            },
          }),
        );
      }

      await Promise.all(updates);
      setSaved(true);
    } catch {
      // errors handled by each mutation's onError toast
    }
  };

  const updateDraft =
    (setter: React.Dispatch<React.SetStateAction<PriceMap>>) =>
    (key: string, val: string) =>
      setter((prev) => ({ ...prev, [key]: val }));

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

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Header
        title="Pricing"
        description="Manage pricing for glass and services"
      >
        <div className="flex items-center gap-3">
          <Button onClick={() => setModalOpen(true)}>Add new Product</Button>
          {saved ? (
            <Button onClick={handleManage} variant="outline">
              Manage Pricing
            </Button>
          ) : (
            <Button onClick={handleSave} variant="outline" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </Header>

      <div className="container pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <PriceTable
              title="Base Glass Pricing"
              fields={glassFields}
              values={glassValues}
              onChange={updateDraft(setDraftBase)}
              disabled={saved}
              suffix="$"
              isLoading={isGlassLoading}
              isError={isGlassError}
              error={glassError as Error | null}
            />

            <PriceTable
              title="Add-ons and Services Pricing"
              fields={addonFields}
              values={addonValues}
              onChange={updateDraft(setDraftAddon)}
              disabled={saved}
              suffix="$"
              isLoading={isAddonsLoading}
              isError={isAddonsError}
              error={addonsError as Error | null}
            />
          </div>

          {/* Right column */}
          <div>
            <PriceTable
              title="Insurance & Tax Rates"
              fields={RATE_FIELDS}
              values={rateValues}
              onChange={updateDraft(setDraftRates)}
              disabled={saved}
              suffix="%"
              isLoading={isRatesLoading}
              isError={isRatesError}
              error={ratesError as Error | null}
            />
          </div>
        </div>
      </div>

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddProduct}
      />
    </div>
  );
}
