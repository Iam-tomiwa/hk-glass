"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const PRODUCT_CATEGORIES = [
  "Base Glass",
  "Add-ons and Services",
  "Insurance & Tax",
];

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_BASE_PRICES: Record<string, string> = {
  baseGlass: "13000",
};

const DEFAULT_ADDON_PRICES: Record<string, string> = {
  edging: "13000",
  glazing: "13000",
  warping: "13000",
  drillHoleBase: "13000",
  drillHolePerHole: "13000",
  tempering: "13000",
  tintFilm: "13000",
  engraving: "13000",
};

const DEFAULT_RATES: Record<string, string> = {
  insuranceRate: "10",
  taxRate: "10",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type PriceMap = Record<string, string>;

interface CustomProduct {
  id: string;
  category: string;
  name: string;
  price: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriceTable({
  title,
  fields,
  values,
  onChange,
  disabled,
  suffix = "$",
  defaults,
}: {
  title: string;
  fields: { key: string; label: string; unit: string }[];
  values: PriceMap;
  onChange: (key: string, val: string) => void;
  disabled: boolean;
  suffix?: "$" | "%";
  defaults?: PriceMap;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-[15px] font-semibold text-[#1E202E]">{title}</h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left text-[13px] font-semibold px-6 py-3 w-1/3">
              Service
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3 w-1/3">
              Unit
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3">
              {suffix === "$" ? "Price ($)" : "Rate (%)"}
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => {
            const hasValue =
              values[field.key] !== undefined && values[field.key] !== "";
            const defaultVal = defaults?.[field.key];
            const viewDisplayValue = hasValue
              ? values[field.key]
              : (defaultVal ?? "");

            return (
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
                  {disabled ? (
                    // View mode — read-only styled cell
                    <div className="flex items-center gap-2">
                      {suffix === "$" && (
                        <span className="text-sm font-medium text-neutral-400">
                          $
                        </span>
                      )}
                      <div className="h-9 max-w-[160px] w-full flex items-center px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-400 select-none">
                        {viewDisplayValue
                          ? Number(viewDisplayValue).toLocaleString()
                          : "—"}
                      </div>
                      {suffix === "%" && (
                        <span className="text-sm font-medium text-neutral-400">
                          %
                        </span>
                      )}
                    </div>
                  ) : (
                    // Edit mode — editable input, pre-populated with saved/default value
                    <div className="flex items-center gap-2">
                      {suffix === "$" && (
                        <span className="text-sm font-medium text-neutral-500">
                          $
                        </span>
                      )}
                      <Input
                        type="number"
                        placeholder={
                          suffix === "$" ? "Enter Amount" : "Enter Rate"
                        }
                        value={values[field.key] ?? ""}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className="h-9 max-w-[160px] text-sm border-neutral-200 bg-white focus-visible:ring-[#00AE4D] placeholder:text-neutral-400"
                      />
                      {suffix === "%" && (
                        <span className="text-sm font-medium text-neutral-500">
                          %
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Add New Product Modal ────────────────────────────────────────────────────

function AddProductModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<CustomProduct, "id">) => void;
}) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSave = () => {
    if (!category || !name || !price) return;
    onSave({ category, name, price });
    setCategory("");
    setName("");
    setPrice("");
    onClose();
  };

  const handleCancel = () => {
    setCategory("");
    setName("");
    setPrice("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1E202E]">
              Add new Product
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Add a new product into the system
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Select Product Category
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Product Category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Service Name
            </Label>
            <Input
              placeholder="e.g., Figurine Glasses"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Product Pricing
            </Label>
            <Input
              startIcon="$"
              type="number"
              placeholder="Enter Amount"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={!category || !name || !price}>
            Save Product
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [saved, setSaved] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Committed/saved values (empty map = rely on defaults for display)
  const [basePrices, setBasePrices] = useState<PriceMap>({});
  const [addonPrices, setAddonPrices] = useState<PriceMap>({});
  const [rates, setRates] = useState<PriceMap>({});
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);

  // Draft values — only used while in edit mode
  const [draftBase, setDraftBase] = useState<PriceMap>({});
  const [draftAddon, setDraftAddon] = useState<PriceMap>({});
  const [draftRates, setDraftRates] = useState<PriceMap>({});

  const handleManage = () => {
    // Pre-populate drafts: use last saved value or fall back to hardcoded default
    const hydrate = (saved: PriceMap, defaults: Record<string, string>) =>
      Object.fromEntries(
        Object.keys(defaults).map((k) => [k, saved[k] ?? defaults[k]]),
      );

    setDraftBase(hydrate(basePrices, DEFAULT_BASE_PRICES));
    setDraftAddon(hydrate(addonPrices, DEFAULT_ADDON_PRICES));
    setDraftRates(hydrate(rates, DEFAULT_RATES));
    setSaved(false);
  };

  const handleSave = () => {
    // Commit drafts → saved state
    setBasePrices(draftBase);
    setAddonPrices(draftAddon);
    setRates(draftRates);
    setSaved(true);
  };

  const updateDraft =
    (setter: React.Dispatch<React.SetStateAction<PriceMap>>) =>
    (key: string, val: string) =>
      setter((prev) => ({ ...prev, [key]: val }));

  const handleAddProduct = (product: Omit<CustomProduct, "id">) => {
    setCustomProducts((prev) => [
      ...prev,
      { ...product, id: crypto.randomUUID() },
    ]);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Header
        title="Pricing"
        description="Manage pricing for glass and services"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-[#00AE4D] hover:bg-[#009b44] text-white h-10 px-6 rounded-md font-medium shadow-sm"
          >
            Add new Product
          </Button>
          {saved ? (
            <Button onClick={handleManage} variant="outline">
              Manage Pricing
            </Button>
          ) : (
            <Button onClick={handleSave} variant="outline">
              Save Changes
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
              fields={BASE_GLASS_FIELDS}
              values={saved ? basePrices : draftBase}
              onChange={updateDraft(setDraftBase)}
              disabled={saved}
              suffix="$"
              defaults={DEFAULT_BASE_PRICES}
            />

            <PriceTable
              title="Add-ons and Services Pricing"
              fields={ADDON_FIELDS}
              values={saved ? addonPrices : draftAddon}
              onChange={updateDraft(setDraftAddon)}
              disabled={saved}
              suffix="$"
              defaults={DEFAULT_ADDON_PRICES}
            />

            {customProducts.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h2 className="text-[15px] font-semibold text-[#1E202E]">
                    Custom Products
                  </h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/60">
                      <th className="text-left text-[13px] font-semibold text-neutral-500 px-6 py-3 w-1/3">
                        Service
                      </th>
                      <th className="text-left text-[13px] font-semibold text-neutral-500 px-4 py-3 w-1/3">
                        Category
                      </th>
                      <th className="text-left text-[13px] font-semibold text-neutral-500 px-4 py-3">
                        Price ($)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customProducts.map((p, i) => (
                      <tr
                        key={p.id}
                        className={
                          i < customProducts.length - 1
                            ? "border-b border-neutral-100"
                            : ""
                        }
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#1E202E]">
                          {p.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-500">
                          {p.category}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-400">
                              $
                            </span>
                            <div className="h-9 max-w-[160px] w-full flex items-center px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
                              {p.price}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            <PriceTable
              title="Insurance & Tax Rates"
              fields={RATE_FIELDS}
              values={saved ? rates : draftRates}
              onChange={updateDraft(setDraftRates)}
              disabled={saved}
              suffix="%"
              defaults={DEFAULT_RATES}
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
