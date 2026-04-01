"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ComboBox } from "@/components/ui/combo-box-2";
import { OrderFormValues } from "../schema";
import { useListAddons } from "@/services/queries/orders";
import { useListInventory } from "@/services/queries/inventory";
import { AddonResponse, OrderAddonResponse } from "@/services/types/openapi";
import { Loader2, Upload, X } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  edge_surface: "Edge & Surface",
  structural: "Structural",
  thermal_film: "Thermal & Film",
  decorative: "Decorative",
  fabrication_processing: "Fabrication & Processing",
  strength_insulation: "Strength & Insulation",
  assembly: "Assembly",
  hardware: "Hardware Add-ons",
  other: "Other Services",
};

const CATEGORY_ORDER = [
  "edge_surface",
  "structural",
  "thermal_film",
  "decorative",
  "fabrication_processing",
  "strength_insulation",
  "assembly",
  "hardware",
  "other",
];

const TINT_OPTIONS = [
  { value: "dark", label: "Dark Tint" },
  { value: "medium", label: "Medium Tint" },
  { value: "light", label: "Light Tint" },
  { value: "frosted", label: "Frosted" },
];
const ENGRAVING_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "both", label: "Both" },
];

export function AddOnsStep({
  form,
  onBack,
  onNext,
  isLoading,
  specFiles,
  onSpecFilesChange,
  engravingImageFile,
  onEngravingImageChange,
  existingSpecFileUrls = [],
  existingEngravingImageUrl = null,
  existingAddons = [],
}: {
  form: UseFormReturn<OrderFormValues>;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  specFiles: File[];
  onSpecFilesChange: (files: File[]) => void;
  engravingImageFile: File | null;
  onEngravingImageChange: (file: File | null) => void;
  existingSpecFileUrls?: { name: string; url: string }[];
  existingEngravingImageUrl?: { name: string; url: string } | null;
  existingAddons?: OrderAddonResponse[];
}) {
  const { data: addons = [], isLoading: isLoadingAddons } = useListAddons();
  const { data: hardwareItems = [], isLoading: isLoadingHardware } =
    useListInventory("hardware", true);

  const [hardwareQty, setHardwareQty] = useState<Record<string, string>>({});
  const [hardwareEnabled, setHardwareEnabled] = useState<Record<string, boolean>>({});

  // Derive prefilled quantities from existingAddons (edit mode) — avoids timing issues with form.reset()
  const prefillQty = useMemo(() => {
    if (!hardwareItems.length || !existingAddons.length) return {};
    const result: Record<string, string> = {};
    for (const item of hardwareItems) {
      const match = existingAddons.find((a) => a.addon_id === item.id && a.addon === null);
      if (match?.quantity != null) result[item.id] = String(match.quantity);
    }
    return result;
  }, [hardwareItems, existingAddons]);

  const engravingImageRef = useRef<HTMLInputElement>(null);
  const specFilesRef = useRef<HTMLInputElement>(null);

  const selectedAddons = useWatch({
    control: form.control,
    name: "selectedAddons",
  });
  const addonItemExtras = useWatch({
    control: form.control,
    name: "addonItemExtras",
  });
  const drillHoles = useWatch({ control: form.control, name: "drillHoles" });
  const engraving = useWatch({ control: form.control, name: "engraving" });
  const engravingType = useWatch({ control: form.control, name: "engravingType" });
  const addTintFilm = useWatch({ control: form.control, name: "addTintFilm" });

  // When form is pre-filled (edit mode), sync boolean fields → selectedAddons
  useEffect(() => {
    if (!addons.length) return;
    const current = form.getValues("selectedAddons") ?? [];
    const toAdd: string[] = [];
    for (const addon of addons) {
      const shouldBeSelected =
        (addon.code === "glass_drilling" && drillHoles) ||
        (addon.code === "cnc_glass_engraving" && engraving) ||
        (addon.category === "thermal_film" && addTintFilm);
      if (shouldBeSelected && !current.includes(addon.id)) {
        toAdd.push(addon.id);
      }
    }
    if (toAdd.length > 0) {
      form.setValue("selectedAddons", [...current, ...toAdd]);
    }
  }, [addons, drillHoles, engraving, addTintFilm, form]);

  const grouped = useMemo(() => {
    const activeAddons = addons.filter((a) => a.is_active);
    const map: Record<string, AddonResponse[]> = {};
    for (const addon of activeAddons) {
      const cat = addon.category || "other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(addon);
    }
    for (const cat of Object.keys(map)) {
      map[cat].sort(
        (a, b) => (a.display_order ?? 99) - (b.display_order ?? 99),
      );
    }
    return map;
  }, [addons]);

  const sortedCategories = CATEGORY_ORDER.filter((c) => grouped[c]);
  const extraCategories = Object.keys(grouped).filter(
    (c) => !CATEGORY_ORDER.includes(c),
  );

  const handleEngravingImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) onEngravingImageChange(file);
  };

  const handleSpecFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onSpecFilesChange([...specFiles, ...files].slice(0, 5));
  };

  const removeSpecFile = (index: number) => {
    onSpecFilesChange(specFiles.filter((_, i) => i !== index));
  };

  const isSelected = (addonId: string) =>
    (selectedAddons || []).includes(addonId);

  const handleToggle = (addon: AddonResponse, checked: boolean) => {
    const current = selectedAddons || [];
    const next = checked
      ? [...current, addon.id]
      : current.filter((id) => id !== addon.id);
    form.setValue("selectedAddons", next);

    if (addon.code === "glass_drilling") form.setValue("drillHoles", checked);
    if (addon.code === "cnc_glass_engraving")
      form.setValue("engraving", checked);
    if (addon.category === "thermal_film")
      form.setValue("addTintFilm", checked);

    if (checked && addon.input_schema) {
      // Auto-initialize numeric defaults so the addon is routed to addon_items
      const currentExtras = form.getValues("addonItemExtras") ?? {};
      const existing = currentExtras[addon.id] ?? {};
      const toInit: { sides?: number; quantity?: number } = {};
      if (addon.input_schema.supports_sides && existing.sides == null)
        toInit.sides = 1;
      if (addon.input_schema.supports_quantity && existing.quantity == null)
        toInit.quantity = 1;
      if (Object.keys(toInit).length > 0) {
        form.setValue("addonItemExtras", {
          ...currentExtras,
          [addon.id]: { ...existing, ...toInit },
        });
      }
    }

    // Clear stored extras when deselecting
    if (!checked && addon.input_schema) {
      const currentExtras = form.getValues("addonItemExtras") ?? {};
      const next = { ...currentExtras };
      delete next[addon.id];
      form.setValue("addonItemExtras", next);
    }
  };

  const setAddonExtra = (
    addonId: string,
    patch: { type_key?: string; sides?: number; quantity?: number },
  ) => {
    const current = form.getValues("addonItemExtras") ?? {};
    form.setValue("addonItemExtras", {
      ...current,
      [addonId]: { ...(current[addonId] ?? {}), ...patch },
    });
  };

  const renderAddonExtraFields = (addon: AddonResponse) => {
    if (!isSelected(addon.id)) return null;

    // Glass drilling — custom form fields
    if (addon.code === "glass_drilling") {
      return (
        <div className="space-y-4 pt-3 pl-1">
          <FormField
            control={form.control}
            name="numberOfHoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Number of Holes <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      className="shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                      {...field}
                      value={field.value || ""}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                      holes
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="holeDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Hole Diameter
                </FormLabel>
                <div className="relative">
                  <Input {...field} value={field.value || ""} type="number" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                    mm
                  </span>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    // Engraving — custom form fields
    if (addon.code === "cnc_glass_engraving") {
      return (
        <div className="space-y-4 pt-3 pl-1">
          <FormField
            control={form.control}
            name="engravingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Engraving Type
                </FormLabel>
                <ComboBox
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v)}
                  options={ENGRAVING_OPTIONS}
                  placeholder="Select engraving type"
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={engravingType === "text" || engravingType === "both" ? "" : "hidden"}>
            <FormField
              control={form.control}
              name="engravingText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1E202E] font-medium text-sm">
                    Engraving Text
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter text to engrave"
                      className="shadow-none px-4 placeholder:text-neutral-400 font-medium text-neutral-800 resize-none min-h-[80px]"
                      maxLength={100}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    {(field.value || "").length}/100 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={engravingType === "image" || engravingType === "both" ? "" : "hidden"}>
            <p className="text-[#1E202E] font-medium text-sm mb-2">
              Engraving Image
            </p>
              <input
                ref={engravingImageRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleEngravingImageChange}
              />
              {existingEngravingImageUrl && !engravingImageFile && (
                <div className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg bg-background mb-2">
                  <a
                    href={existingEngravingImageUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 flex-1 truncate hover:underline"
                  >
                    {existingEngravingImageUrl.name}
                  </a>
                  <span className="text-xs text-neutral-400">(existing)</span>
                </div>
              )}
              {engravingImageFile ? (
                <div className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg bg-background">
                  <span className="text-sm text-neutral-700 flex-1 truncate">
                    {engravingImageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEngravingImageChange(null)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => engravingImageRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-neutral-300 transition-colors"
                >
                  <Upload className="size-5 text-neutral-400" />
                  <p className="text-sm text-neutral-500">Click to upload</p>
                  <p className="text-xs text-neutral-400">PNG or JPG</p>
                </div>
              )}
          </div>
        </div>
      );
    }

    // Tint film — custom form fields
    if (addon.category === "thermal_film") {
      return (
        <div className="pt-3 pl-1">
          <FormField
            control={form.control}
            name="tintType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Tint Type
                </FormLabel>
                <ComboBox
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v)}
                  options={TINT_OPTIONS}
                  placeholder="Select tint type"
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    // Generic input_schema-driven fields (edging, beveling, glazing, etc.)
    if (addon.input_schema) {
      const schema = addon.input_schema;
      const extras = addonItemExtras?.[addon.id] ?? {};
      const typeOptions = schema.supported_types
        ? Object.keys(schema.supported_types).map((k) => ({
            value: k,
            label: k.charAt(0).toUpperCase() + k.slice(1),
          }))
        : [];

      return (
        <div className="pt-3 pl-1 space-y-3">
          {typeOptions.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[#1E202E] font-medium text-sm">Type</label>
              <ComboBox
                value={extras.type_key || ""}
                onValueChange={(v) => setAddonExtra(addon.id, { type_key: v })}
                options={typeOptions}
                placeholder="Select type"
                className="w-full"
              />
            </div>
          )}
          {schema.supports_sides && (
            <div className="space-y-1.5">
              <label className="text-[#1E202E] font-medium text-sm">
                Number of Sides
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAddonExtra(addon.id, {
                      sides: Math.max(1, (extras.sides ?? 1) - 1),
                    })
                  }
                  className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium text-[#1E202E]">
                  {extras.sides ?? 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddonExtra(addon.id, {
                      sides: Math.min(4, (extras.sides ?? 1) + 1),
                    })
                  }
                  className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  +
                </button>
                <span className="text-sm text-neutral-500">
                  side{(extras.sides ?? 1) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
          {schema.supports_quantity && (
            <div className="space-y-1.5">
              <label className="text-[#1E202E] font-medium text-sm">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={extras.quantity ?? ""}
                onChange={(e) =>
                  setAddonExtra(addon.id, {
                    quantity: Number(e.target.value) || 1,
                  })
                }
                className="shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800"
              />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderCategorySection = (category: string) => {
    const categoryAddons = grouped[category];
    if (!categoryAddons?.length) return null;

    return (
      <div key={category}>
        <h3 className="text-base capitalize font-bold text-[#1E202E] mb-3">
          {CATEGORY_LABELS[category] || category.replace(/_/g, " ")}
        </h3>
        <div className="space-y-3">
          {categoryAddons.map((addon) => (
            <div key={addon.id}>
              <div className="flex flex-row items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-[#1E202E] font-medium text-sm">
                    {addon.name}
                  </p>
                  {addon.description && (
                    <p className="text-sm text-neutral-500">
                      {addon.description}
                    </p>
                  )}
                </div>
                <Switch
                  checked={isSelected(addon.id)}
                  onCheckedChange={(checked) => handleToggle(addon, checked)}
                />
              </div>
              {renderAddonExtraFields(addon)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const allCategories = [...sortedCategories, ...extraCategories];

  return (
    <TabsContent
      value="add-ons"
      className="mt-0 outline-none max-w-5xl mx-auto"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Add-ons & Services
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Customize your glass order with additional services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-6 bg-card p-6 rounded-lg">
            {isLoadingAddons ? (
              <div className="flex items-center gap-2 py-4 text-neutral-500 text-sm">
                <Loader2 className="animate-spin size-4" /> Loading add-ons...
              </div>
            ) : (
              <>
                {allCategories.map((cat, i) => (
                  <div key={cat}>
                    {renderCategorySection(cat)}
                    {i < allCategories.length - 1 && (
                      <hr className="border-neutral-100 mt-6" />
                    )}
                  </div>
                ))}

                {/* Hardware from Inventory */}
                {(isLoadingHardware || hardwareItems.length > 0) && (
                  <>
                    {allCategories.length > 0 && (
                      <hr className="border-neutral-100" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-[#1E202E] mb-3">
                        Hardware
                      </h3>
                      {isLoadingHardware ? (
                        <div className="flex items-center gap-2 py-2 text-neutral-500 text-sm">
                          <Loader2 className="animate-spin size-4" /> Loading...
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {hardwareItems.map((item) => {
                            const qty = hardwareQty[item.id] ?? prefillQty[item.id] ?? "";
                            const enabled = hardwareEnabled[item.id] ?? (prefillQty[item.id] != null && prefillQty[item.id] !== "0");
                            return (
                              <div key={item.id}>
                                <div className="flex flex-row items-center justify-between py-2">
                                  <div className="space-y-0.5">
                                    <p className="text-[#1E202E] font-medium text-sm">
                                      {item.material_name}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-neutral-500">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={(checked) => {
                                      setHardwareEnabled((prev) => ({ ...prev, [item.id]: checked }));
                                      setHardwareQty((prev) => ({
                                        ...prev,
                                        [item.id]: checked ? (prev[item.id] || prefillQty[item.id] || "1") : "",
                                      }));
                                      const cur =
                                        form.getValues("selectedAddons") ?? [];
                                      const curExtras =
                                        form.getValues("addonItemExtras") ?? {};
                                      if (checked) {
                                        if (!cur.includes(item.id))
                                          form.setValue("selectedAddons", [
                                            ...cur,
                                            item.id,
                                          ]);
                                        form.setValue("addonItemExtras", {
                                          ...curExtras,
                                          [item.id]: { quantity: 1 },
                                        });
                                      } else {
                                        form.setValue(
                                          "selectedAddons",
                                          cur.filter((id) => id !== item.id),
                                        );
                                        const next = { ...curExtras };
                                        delete next[item.id];
                                        form.setValue("addonItemExtras", next);
                                      }
                                    }}
                                  />
                                </div>
                                {enabled && (
                                  <div className="pt-2 pl-1 space-y-1.5">
                                    <label className="text-[#1E202E] font-medium text-sm">
                                      Quantity
                                    </label>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={qty}
                                        className="shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
                                        onChange={(e) => {
                                          const newQty = e.target.value;
                                          setHardwareQty((prev) => ({
                                            ...prev,
                                            [item.id]: newQty,
                                          }));
                                          setAddonExtra(item.id, {
                                            quantity: Number(newQty) || 1,
                                          });
                                        }}
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                                        {item.unit || "units"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!isLoadingAddons &&
                  allCategories.length === 0 &&
                  hardwareItems.length === 0 && (
                    <p className="text-sm text-neutral-500 py-4">
                      No add-ons available.
                    </p>
                  )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4 bg-card p-6 rounded-lg divide-y">
            {/* Notes Specifications */}
            <div className="space-y-4 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E202E]">
                  Notes Specifications
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Add special instructions and upload design files
                </p>
              </div>

              <FormField
                control={form.control}
                name="customerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1E202E] font-medium text-sm">
                      Customer Notes <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter special instructions or customer requirements..."
                        className="shadow-none px-4 placeholder:text-neutral-400 font-medium text-neutral-800 resize-none min-h-[100px]"
                        maxLength={500}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <p className="text-xs text-neutral-500 mt-1.5">
                      {(field.value || "").length}/100 characters
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload Specifications */}
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="text-base font-bold text-[#1E202E]">
                  Upload Specifications
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Upload design files, drawings, or reference images (Max 5
                  files)
                </p>
              </div>

              <div>
                <p className="text-[#1E202E] font-medium text-sm mb-2">
                  Customer Visual Specifications{" "}
                  <span className="text-red-500">*</span>
                </p>
                <input
                  ref={specFilesRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={handleSpecFilesChange}
                />
                {existingSpecFileUrls.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-neutral-500">
                      Already uploaded:
                    </p>
                    {existingSpecFileUrls.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg bg-background"
                      >
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 flex-1 truncate hover:underline"
                        >
                          {f.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {specFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {specFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg bg-background"
                      >
                        <span className="text-sm text-neutral-700 flex-1 truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSpecFile(index)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {specFiles.length < 5 && (
                  <div
                    onClick={() => specFilesRef.current?.click()}
                    className="border-2 border-dashed border-neutral-200 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-neutral-300 transition-colors"
                  >
                    <Upload className="size-5 text-neutral-400" />
                    <p className="text-sm text-neutral-500">Click to upload</p>
                    <p className="text-xs text-neutral-400">PNG or JPG</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin size-4 mr-2" />
                Calculating...
              </>
            ) : (
              "Next"
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="bg-white text-neutral-700 border-neutral-200 px-6 h-10 rounded-md font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
