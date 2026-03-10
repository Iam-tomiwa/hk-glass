"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/combo-box-2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateInventoryItem } from "@/services/queries/inventory";
import { InventoryItemCreate } from "@/services/types/openapi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryItemCreateSchema } from "@/services/types/zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";

const MATERIAL_TYPES = [
  "Glass Sheet",
  "Tint Film",
  "Edging Material",
  "Glazing Compound",
];

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
  } = useForm<InventoryItemCreate>({
    resolver: zodResolver(inventoryItemCreateSchema),
    defaultValues: {
      material_name: "",
      size: "",
      thickness: "",
      stock_count: 0,
      low_stock_threshold: 0,
    },
  });

  const onSubmit = async (data: InventoryItemCreate) => {
    try {
      await createMutation({ data });
      reset();
      onClose();
    } catch (error: any) {
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Material Type
              </label>
              <Controller
                control={control}
                name="material_name"
                render={({ field }) => (
                  <ComboBox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={MATERIAL_TYPES.map((t) => ({
                      value: t,
                      label: t,
                    }))}
                    placeholder="Select material type"
                    className="w-full h-10"
                  />
                )}
              />
              {errors.material_name && (
                <p className="text-xs text-red-500">
                  {errors.material_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">Size</label>
              <Input
                {...register("size")}
                placeholder="e.g., 3m × 2m"
                className="h-10"
                error={errors.size?.message?.toString()}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Thickness / Type
              </label>
              <Input
                {...register("thickness")}
                placeholder="e.g., 10"
                error={errors.thickness?.message?.toString()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">Unit</label>
              <Input
                {...register("unit")}
                placeholder="e.g. Sheets, Rolls"
                error={errors.unit?.message?.toString()}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">
                  Initial Stock
                </label>
                <Input
                  type="number"
                  {...register("stock_count", { valueAsNumber: true })}
                  placeholder="0"
                  className="h-10"
                  error={errors.stock_count?.message?.toString()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">
                  Min Stock Level
                </label>
                <Input
                  type="number"
                  {...register("low_stock_threshold", { valueAsNumber: true })}
                  placeholder="0"
                  className="h-10"
                  error={errors.low_stock_threshold?.message?.toString()}
                />
              </div>
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
