"use client";

import { useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFormValues } from "../schema";
import { useListAddons } from "@/services/queries/orders";
import { Loader2, Upload, X } from "lucide-react";

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
  const { data: addons, isLoading: isLoadingAddons } = useListAddons();

  const drillHoles = useWatch({ control: form.control, name: "drillHoles" });
  const addTintFilm = useWatch({ control: form.control, name: "addTintFilm" });
  const engraving = useWatch({ control: form.control, name: "engraving" });

  const engravingImageRef = useRef<HTMLInputElement>(null);
  const specFilesRef = useRef<HTMLInputElement>(null);

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
            {/* Edge & Surface (Dynamic Addons) */}
            <div>
              <h3 className="text-lg font-bold text-[#1E202E] mb-2">
                Edge & Surface
              </h3>
              {isLoadingAddons ? (
                <div className="flex items-center gap-2 py-4 text-neutral-500 text-sm">
                  <Loader2 className="animate-spin size-4" /> Loading add-ons...
                </div>
              ) : (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="selectedAddons"
                    render={() => (
                      <FormItem>
                        {addons?.map((addon) => (
                          <FormField
                            key={addon.id}
                            control={form.control}
                            name="selectedAddons"
                            render={({ field }) => (
                              <FormItem
                                key={addon.id}
                                className="flex flex-row items-center justify-between rounded-lg p-0 py-2"
                              >
                                <div className="space-y-0.5">
                                  <FormLabel className="text-[#1E202E] font-medium text-sm">
                                    {addon.name}
                                  </FormLabel>
                                  <p className="text-sm text-neutral-500 capitalize">
                                    {String(addon.category)
                                      .toLowerCase()
                                      .replace("_", " ")}
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={
                                      field.value?.includes(addon.id) || false
                                    }
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            addon.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (v) => v !== addon.id,
                                            ),
                                          )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <hr className="border-neutral-100" />

            {/* Structural */}
            <div>
              <h3 className="text-lg font-bold text-[#1E202E] mb-2">
                Structural
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="drillHoles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[#1E202E] font-medium text-sm">
                          Drill Holes
                        </FormLabel>
                        <p className="text-sm text-neutral-500">
                          Add mounting or drainage holes
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {drillHoles && (
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="numberOfHoles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1E202E] font-medium text-sm">
                            Number of Holes{" "}
                            <span className="text-red-500">*</span>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                                <SelectValue placeholder="Select thickness" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1/4">1/4&quot;</SelectItem>
                              <SelectItem value="1/2">1/2&quot;</SelectItem>
                              <SelectItem value="3/4">3/4&quot;</SelectItem>
                              <SelectItem value="1">1&quot;</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Thermal & Film */}
            <div>
              <h3 className="text-lg font-bold text-[#1E202E] mb-2">
                Thermal & Film
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="addTintFilm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[#1E202E] font-medium text-sm">
                          Add Tint Film
                        </FormLabel>
                        <p className="text-sm text-neutral-500">
                          Privacy or UV protection tint
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {addTintFilm && (
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="tintType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1E202E] font-medium text-sm">
                            Tint Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                                <SelectValue placeholder="Select tint type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dark">Dark Tint</SelectItem>
                              <SelectItem value="medium">
                                Medium Tint
                              </SelectItem>
                              <SelectItem value="light">Light Tint</SelectItem>
                              <SelectItem value="frosted">Frosted</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Decorative */}
            <div>
              <h3 className="text-lg font-bold text-[#1E202E] mb-2">
                Decorative
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="engraving"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[#1E202E] font-medium text-sm">
                          Engraving
                        </FormLabel>
                        <p className="text-sm text-neutral-500">
                          Custom text or image engraving
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {engraving && (
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="engravingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1E202E] font-medium text-sm">
                            Engraving Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                                <SelectValue placeholder="Select Engraving Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="laser">
                                Laser Engraving
                              </SelectItem>
                              <SelectItem value="sand_blast">
                                Sand Blast
                              </SelectItem>
                              <SelectItem value="hand_carved">
                                Hand Carved
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                            Engraving Text{" "}
                            <span className="text-red-500">*</span>
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
                          <p className="text-sm text-neutral-500">
                            Click to upload
                          </p>
                          <p className="text-xs text-neutral-400">PNG or JPG</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="space-y-4">
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
