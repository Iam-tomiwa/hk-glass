"use client";

import { useState } from "react";
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
import { InventoryItem } from "../types";

export function AdjustStockModal({
  item,
  onClose,
  onAdjust,
}: {
  item: InventoryItem | null;
  onClose: () => void;
  onAdjust: (id: string, delta: number) => void;
}) {
  const [amount, setAmount] = useState("");

  const handleAdjust = () => {
    if (!item) return;
    const delta = parseInt(amount, 10);
    if (isNaN(delta)) return;
    onAdjust(item.id, delta);
    setAmount("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[380px] gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            Adjust Stock Level
          </DialogTitle>
          <DialogDescription>
            Update stock level for {item?.material}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-medium">
                Current Stock
              </span>
              <span className="font-semibold text-[#1E202E]">
                {item?.stockLevel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-medium">
                Minimum Stock
              </span>
              <span className="font-semibold text-[#1E202E]">
                {item?.minStock}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">
              Adjustment Amount
            </label>
            <Input
              type="number"
              placeholder="Enter positive or negative number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAdjust}>Adjust Stock Level</Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
