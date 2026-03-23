"use client";

import { useRef, useMemo, useState } from "react";
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
import { AddonResponse } from "@/services/types/openapi";
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

const EDGING_OPTIONS = ["Single", "Double"];
const BEVELING_OPTIONS = ["Single", "Double", "Triple"];
const GLAZING_OPTIONS = ["Single", "Double", "Triple"];
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
const HOLE_DIAMETER_OPTIONS = [
  { value: "1/4", label: '1/4"' },
  { value: "1/2", label: '1/2"' },
  { value: "3/4", label: '3/4"' },
  { value: "1", label: '1"' },
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
}: {
  form: UseFormReturn<OrderFormValues>;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  specFiles: File[];
  onSpecFilesChange: (files: File[]) => void;
  engravingImageFile: File | null;
  onEngravingImageChange: (file: File | null) => void;
}) {
  const { data: addons = [], isLoading: isLoadingAddons } = useListAddons();
  const { data: hardwareItems = [], isLoading: isLoadingHardware } =
    useListInventory("hardware", true);

  const [addonExtras, setAddonExtras] = useState<Record<string, string>>({});
  const [hardwareQty, setHardwareQty] = useState<Record<string, string>>({});

  const engravingImageRef = useRef<HTMLInputElement>(null);
  const specFilesRef = useRef<HTMLInputElement>(null);

  const selectedAddons = useWatch({
    control: form.control,
    name: "selectedAddons",
  });

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

    if (addon.code === "glass_drilling") {
      form.setValue("drillHoles", checked);
    }
    if (addon.code === "cnc_glass_engraving") {
      form.setValue("engraving", checked);
    }
    if (addon.category === "thermal_film") {
      form.setValue("addTintFilm", checked);
    }
    if (addon.code === "edging") {
      form.setValue("edgingAddonId", checked ? addon.id : "");
      if (!checked) {
        form.setValue("edgingType", "");
        form.setValue("edgingSides", "");
      }
    }
  };

  const renderAddonExtraFields = (addon: AddonResponse) => {
    if (!isSelected(addon.id)) return null;

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
                <ComboBox
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v)}
                  options={HOLE_DIAMETER_OPTIONS}
                  placeholder="Select diameter"
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

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
          <FormField
            control={form.control}
            name="engravingText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Engraving Text <span className="text-red-500">*</span>
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
          <div>
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

    if (addon.code === "edging") {
      return (
        <div className="pt-3 pl-1 space-y-3">
          <FormField
            control={form.control}
            name="edgingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Edging Type
                </FormLabel>
                <ComboBox
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={EDGING_OPTIONS.map((o) => ({ value: o, label: o }))}
                  placeholder="Select edging type"
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="edgingSides"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Number of Sides
                </FormLabel>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      field.onChange(
                        String(Math.max(1, Number(field.value || 1) - 1)),
                      )
                    }
                    className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 font-medium"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-[#1E202E]">
                    {field.value || "1"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      field.onChange(
                        String(Math.min(4, Number(field.value || 1) + 1)),
                      )
                    }
                    className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 font-medium"
                  >
                    +
                  </button>
                  <span className="text-sm text-neutral-500">
                    side{Number(field.value || 1) !== 1 ? "s" : ""}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (addon.code === "beveling") {
      return (
        <div className="pt-3 pl-1 space-y-1.5">
          <label className="text-[#1E202E] font-medium text-sm">
            Bevel Angle
          </label>
          <ComboBox
            value={addonExtras[`${addon.id}:type`] || ""}
            onValueChange={(v) =>
              setAddonExtras((prev) => ({ ...prev, [`${addon.id}:type`]: v }))
            }
            options={BEVELING_OPTIONS.map((o) => ({ value: o, label: o }))}
            placeholder="Select bevel angle"
            className="w-full"
          />
        </div>
      );
    }

    if (addon.code === "glass_glazing") {
      return (
        <div className="pt-3 pl-1 space-y-1.5">
          <label className="text-[#1E202E] font-medium text-sm">
            Glazing Type
          </label>
          <ComboBox
            value={addonExtras[`${addon.id}:type`] || ""}
            onValueChange={(v) =>
              setAddonExtras((prev) => ({ ...prev, [`${addon.id}:type`]: v }))
            }
            options={GLAZING_OPTIONS.map((o) => ({ value: o, label: o }))}
            placeholder="Select glazing type"
            className="w-full"
          />
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
        <h3 className="text-base font-bold text-[#1E202E] mb-3">
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
                            const qty = hardwareQty[item.id] || "";
                            const enabled = !!qty && qty !== "0";
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
                                      setHardwareQty((prev) => ({
                                        ...prev,
                                        [item.id]: checked ? "1" : "",
                                      }));
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
                                        onChange={(e) =>
                                          setHardwareQty((prev) => ({
                                            ...prev,
                                            [item.id]: e.target.value,
                                          }))
                                        }
                                        className="shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
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
