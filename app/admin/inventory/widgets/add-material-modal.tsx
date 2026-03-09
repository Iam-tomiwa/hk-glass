"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { InventoryItem } from "../types";

const MATERIAL_TYPES = [
  "Glass Sheet",
  "Tint Film",
  "Edging Material",
  "Glazing Compound",
];

export function AddMaterialModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, "id" | "status">) => void;
}) {
  const [materialType, setMaterialType] = useState("");
  const [size, setSize] = useState("");
  const [thickness, setThickness] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [minStock, setMinStock] = useState("");

  const reset = () => {
    setMaterialType("");
    setSize("");
    setThickness("");
    setInitialStock("");
    setMinStock("");
  };

  const handleAdd = () => {
    if (!materialType || !size) return;
    onAdd({
      material: materialType,
      size,
      thicknessType: thickness || "–",
      stockLevel: initialStock ? `${initialStock} units` : "0 units",
      minStock: minStock ? `${minStock} units` : "0 units",
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[420px] gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#1E202E]">
            Add New Material
          </DialogTitle>
          <DialogDescription>
            Add a new material to the inventory system
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">
              Material Type
            </label>
            <Select
              value={materialType}
              onValueChange={(v) => setMaterialType(v ?? "")}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">Size</label>
            <Input
              placeholder="e.g., 3m × 2m"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">
              Thickness / Type
            </label>
            <Input
              placeholder="e.g., 10mm"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Initial Stock
              </label>
              <Input
                type="number"
                placeholder="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">
                Min Stock Level
              </label>
              <Input
                type="number"
                placeholder="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAdd}>Add material</Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
