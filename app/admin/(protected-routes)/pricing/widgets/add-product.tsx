"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ComboBox } from "@/components/ui/combo-box-2";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CustomProduct {
  id: string;
  category: string;
  name: string;
  price: string;
  price_type?: string;
}

const PRODUCT_CATEGORIES = ["Base Glass", "Add-ons and Services"];

const PRICE_TYPE_OPTIONS = [
  { value: "flat", label: "Flat" },
  { value: "per_sqm", label: "Per sqm" },
];

export default function AddProductModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<CustomProduct, "id">) => Promise<void> | void;
}) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAddon = category === "Add-ons and Services";
  const isFormValid = category && name && price && (!isAddon || priceType);

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      await onSave({
        category,
        name,
        price,
        price_type: isAddon ? priceType : undefined,
      });
      setCategory("");
      setName("");
      setPrice("");
      setPriceType("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCategory("");
    setName("");
    setPrice("");
    setPriceType("");
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
            <ComboBox
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPriceType("");
              }}
              options={PRODUCT_CATEGORIES.map((cat) => ({
                value: cat,
                label: cat,
              }))}
              placeholder="Select Product Category"
              className="w-full"
            />
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

          {isAddon && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E202E]">
                Price Type
              </Label>
              <ComboBox
                value={priceType}
                onValueChange={(v) => setPriceType(v)}
                options={PRICE_TYPE_OPTIONS}
                placeholder="Select Price Type"
                className="w-full"
              />
            </div>
          )}

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
          <Button onClick={handleSave} disabled={!isFormValid || isLoading}>
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
