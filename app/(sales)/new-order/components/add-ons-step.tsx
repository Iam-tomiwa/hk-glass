import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

export function AddOnsStep({
  form,
  onBack,
  onNext,
}: {
  form: UseFormReturn<OrderFormValues>;
  onBack: () => void;
  onNext: () => void;
}) {
  const drillHoles = useWatch({
    control: form.control,
    name: "drillHoles",
  });

  const addTintFilm = useWatch({
    control: form.control,
    name: "addTintFilm",
  });

  const engraving = useWatch({
    control: form.control,
    name: "engraving",
  });

  return (
    <TabsContent value="add-ons" className="mt-0 outline-none max-w-xl mx-auto">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Add-ons & Services
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Customize your glass order with additional services
          </p>
        </div>

        <div className="space-y-6 bg-card p-6 rounded-lg">
          {/* Edge & Surface */}
          <div>
            <h3 className="text-lg font-bold text-[#1E202E] mb-2">
              Edge & Surface
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="edging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1E202E] font-medium text-sm">
                        Edging
                      </FormLabel>
                      <p className="text-sm text-neutral-500">
                        Smooth and polish glass edges
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
              <FormField
                control={form.control}
                name="glazing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1E202E] font-medium text-sm">
                        Glazing
                      </FormLabel>
                      <p className="text-sm text-neutral-500">
                        Apply protective glazing coat
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
              <FormField
                control={form.control}
                name="warping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1E202E] font-medium text-sm">
                        Warping
                      </FormLabel>
                      <p className="text-sm text-neutral-500">
                        Custom glass warping/bending
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
              <FormField
                control={form.control}
                name="waxing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1E202E] font-medium text-sm">
                        Waxing
                      </FormLabel>
                      <p className="text-sm text-neutral-500">
                        Protective wax coating
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
            </div>
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
                          Number of Holes
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0"
                              className=" shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800 pr-16"
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
                            <SelectTrigger className=" shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                              <SelectValue placeholder="Select diameter" />
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
                name="temperGlass"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1E202E] font-medium text-sm">
                        Temper Glass
                      </FormLabel>
                      <p className="text-sm text-neutral-500">
                        Heat-treated for extra strength
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
                            <SelectTrigger className=" shadow-none h-11 px-4 text-neutral-800 font-medium font-sans">
                              <SelectValue placeholder="Select tint type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dark">Dark Tint</SelectItem>
                            <SelectItem value="medium">Medium Tint</SelectItem>
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
                        Custom text or logo engraving
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
                    name="engravingText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1E202E] font-medium text-sm">
                          Engraving Text
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter text to engrave"
                            className=" shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800"
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
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium"
          >
            Next
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
