"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateInventoryItem } from "@/services/queries/inventory";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryItemCreateSchema } from "@/services/types/zod";
import { z } from "zod";

type AddMaterialForm = z.infer<typeof inventoryItemCreateSchema>;
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { ComboBox } from "@/components/ui/combo-box-2";

const MATERIAL_TYPES = [
  { label: "Glass Sheet", value: "glass" },
  { label: "Hardware", value: "hardware" },
  { label: "Others", value: "others" },
];

const UNIT_OPTIONS = [
  { label: "Metres", value: "m" },
  { label: "Centimeters", value: "cm" },
  { label: "Millimeters", value: "mm" },
];

const DESCRIPTION_MAX = 100;

export function AddMaterialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: createMutation, isPending: isLoading } =
    useCreateInventoryItem();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddMaterialForm>({
    resolver: zodResolver(inventoryItemCreateSchema),
    defaultValues: {
      item_type: undefined,
      material_name: "",
      description: "",
      size: "",
      unit: "",
      stock_count: 0,
      price: null,
    },
  });

  const itemType = useWatch({ control, name: "item_type" });
  const description = useWatch({ control, name: "description" }) ?? "";
  const isGlass = itemType === "glass";

  const onSubmit = async (data: AddMaterialForm) => {
    try {
      await createMutation({ data });
      reset();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create inventory item"));
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="sm:max-w-[420px] gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            Add New Material
          </DialogTitle>
          <DialogDescription>
            Add a new material to the inventory system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {/* Material Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Material Type
              </label>
              <Controller
                control={control}
                name="item_type"
                render={({ field }) => (
                  <ComboBox
                    options={MATERIAL_TYPES}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full h-10"
                  />
                )}
              />
              {errors.item_type && (
                <p className="text-xs text-red-500">
                  {errors.item_type.message}
                </p>
              )}
            </div>

            {/* Item Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Item Name
              </label>
              <Input
                {...register("material_name")}
                placeholder="Enter item name"
                className="h-10"
                error={errors.material_name?.message?.toString()}
              />
            </div>

            {/* Select Unit — glass only */}
            {isGlass && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">
                  Select Unit
                </label>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <ComboBox
                      options={UNIT_OPTIONS}
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                      className="w-full h-10"
                      placeholder="Select unit"
                    />
                  )}
                />
              </div>
            )}

            {/* Item Size — glass only */}
            {isGlass && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">
                  Item Size
                </label>
                <Input
                  {...register("size")}
                  placeholder="e.g., 3m × 2m"
                  className="h-10"
                  error={errors.size?.message?.toString()}
                />
              </div>
            )}

            {/* Item Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Item Description
              </label>
              <Textarea
                {...register("description")}
                placeholder="Enter the item description"
                maxLength={DESCRIPTION_MAX}
                className="resize-none min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                {String(description).length}/{DESCRIPTION_MAX} characters
              </p>
            </div>

            {/* Item Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Item Quantity
              </label>
              <Input
                type="number"
                {...register("stock_count", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
                error={errors.stock_count?.message?.toString()}
              />
            </div>

            {/* Item Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Item Price
              </label>
              <Input
                {...register("price")}
                placeholder="0"
                className="h-10"
                startIcon={"₦"}
              />
              {errors.price && (
                <p className="text-xs text-red-500">
                  {errors.price.message?.toString()}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add material"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
