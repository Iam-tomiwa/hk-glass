"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";

// ─── Data ────────────────────────────────────────────────────────────────────

const BASE_GLASS_FIELDS = [
  { key: "baseGlass", label: "Base Glass", unit: "sq ft" },
];

const ADDON_FIELDS = [
  { key: "edging", label: "Edging", unit: "per order" },
  { key: "glazing", label: "Glazing", unit: "per order" },
  { key: "warping", label: "Warping", unit: "per order" },
  { key: "drillHoleBase", label: "Drill Hole (Base)", unit: "per order" },
  {
    key: "drillHolePerHole",
    label: "Drill Hole (Per Hole)",
    unit: "per order",
  },
  { key: "tempering", label: "Tempering", unit: "per order" },
  { key: "tintFilm", label: "Tint Film", unit: "per order" },
  { key: "engraving", label: "Engraving", unit: "per order" },
];

const RATE_FIELDS = [
  { key: "insuranceRate", label: "Insurance Rate", unit: "% of subtotal" },
  { key: "taxRate", label: "Tax Rate", unit: "% of total" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type PriceMap = Record<string, string>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriceTable({
  title,
  fields,
  values,
  onChange,
  disabled,
  suffix = "$",
  inputSuffix,
}: {
  title: string;
  fields: { key: string; label: string; unit: string }[];
  values: PriceMap;
  onChange: (key: string, val: string) => void;
  disabled: boolean;
  suffix?: "$" | "%";
  inputSuffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-[15px] font-semibold text-[#1E202E]">{title}</h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left text-[13px] font-semibold text-neutral-500 px-6 py-3 w-1/3">
              Service
            </th>
            <th className="text-left text-[13px] font-semibold text-neutral-500 px-4 py-3 w-1/3">
              Unit
            </th>
            <th className="text-left text-[13px] font-semibold text-neutral-500 px-4 py-3">
              {suffix === "$" ? "Price ($)" : "Rate (%)"}
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr
              key={field.key}
              className={
                i < fields.length - 1 ? "border-b border-neutral-100" : ""
              }
            >
              <td className="px-6 py-4 text-sm font-medium text-[#1E202E]">
                {field.label}
              </td>
              <td className="px-4 py-4 text-sm text-neutral-500">
                {field.unit}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {suffix === "$" && (
                    <span className="text-sm font-medium text-neutral-500">
                      $
                    </span>
                  )}
                  <Input
                    type="number"
                    placeholder={suffix === "$" ? "Enter Amount" : "Enter Rate"}
                    value={values[field.key] ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    disabled={disabled}
                    className="h-9 max-w-[160px] text-sm border-neutral-200 bg-white disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-[#00AE4D] placeholder:text-neutral-400"
                  />
                  {suffix === "%" && (
                    <span className="text-sm font-medium text-neutral-500">
                      %
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [saved, setSaved] = useState(false);

  const [basePrices, setBasePrices] = useState<PriceMap>({});
  const [addonPrices, setAddonPrices] = useState<PriceMap>({});
  const [rates, setRates] = useState<PriceMap>({});

  const handleSave = () => setSaved(true);
  const handleManage = () => setSaved(false);

  const updateField =
    (setter: React.Dispatch<React.SetStateAction<PriceMap>>) =>
    (key: string, val: string) =>
      setter((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <Header
        title="Pricing"
        description="Manage pricing for glass and services"
      >
        {saved ? (
          <Button
            onClick={handleManage}
            className="bg-[#00AE4D] hover:bg-[#009b44] text-white h-10 px-6 rounded-md font-medium shadow-sm"
          >
            Manage Pricing
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            className="bg-[#00AE4D] hover:bg-[#009b44] text-white h-10 px-6 rounded-md font-medium shadow-sm"
          >
            Save Changes
          </Button>
        )}
      </Header>
      <div className="container py-8">
        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <PriceTable
              title="Base Glass Pricing"
              fields={BASE_GLASS_FIELDS}
              values={basePrices}
              onChange={updateField(setBasePrices)}
              disabled={saved}
              suffix="$"
            />

            <PriceTable
              title="Add-ons and Services Pricing"
              fields={ADDON_FIELDS}
              values={addonPrices}
              onChange={updateField(setAddonPrices)}
              disabled={saved}
              suffix="$"
            />
          </div>

          {/* Right column */}
          <div>
            <PriceTable
              title="Insurance & Tax Rates"
              fields={RATE_FIELDS}
              values={rates}
              onChange={updateField(setRates)}
              disabled={saved}
              suffix="%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
