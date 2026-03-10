"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdjustInventoryItem } from "@/services/queries/inventory";
import {
  InventoryItemResponse,
  InventoryAdjustRequest,
} from "@/services/types/openapi";
import { inventoryAdjustRequestSchema } from "@/services/types/zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { Textarea } from "@/components/ui/textarea";

export function AdjustStockModal({
  item,
  onClose,
}: {
  item: InventoryItemResponse | null;
  onClose: () => void;
}) {
  const { mutateAsync: adjustMutation, isPending: isLoading } =
    useAdjustInventoryItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryAdjustRequest>({
    resolver: zodResolver(inventoryAdjustRequestSchema),
    defaultValues: {
      adjustment: 0,
      reason: "",
    },
  });

  const onSubmit = async (data: InventoryAdjustRequest) => {
    if (!item) return;
    try {
      await adjustMutation({ item_id: item.id, data });
      reset();
      onClose();
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, "Failed to adjust inventory stock item"),
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="sm:max-w-[380px] gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            Adjust Stock Level
          </DialogTitle>
          <DialogDescription>
            Update stock level for {item?.material_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 font-medium">
                  Current Stock
                </span>
                <span className="font-semibold text-[#1E202E]">
                  {item?.stock_count ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 font-medium">
                  Minimum Stock
                </span>
                <span className="font-semibold text-[#1E202E]">
                  {item?.low_stock_threshold ?? 0}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Adjustment Amount
              </label>
              <Input
                type="number"
                {...register("adjustment", { valueAsNumber: true })}
                placeholder="Enter positive or negative number"
                className="h-10"
                error={errors.adjustment?.message?.toString()}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Reason (Optional)
              </label>
              <Textarea
                {...register("reason")}
                placeholder="e.g. Broken in transit"
                className="h-10"
              />
              {errors.reason?.message && (
                <p className="text-sm text-red-500">
                  {errors?.reason?.message.toString()}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adjusting..." : "Adjust Stock Level"}
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
