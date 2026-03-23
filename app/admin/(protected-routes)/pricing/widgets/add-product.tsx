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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const DESCRIPTION_MAX = 150;

export interface NewAddon {
  name: string;
  description: string;
  category: string;
  price_type: string;
  price: string;
}

const CATEGORY_OPTIONS = [
  { value: "edge_surface", label: "Edge Surface" },
  { value: "structural", label: "Structural" },
  { value: "thermal_film", label: "Thermal Film" },
  { value: "decorative", label: "Decorative" },
  { value: "other", label: "Other" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "flat", label: "Per order (flat)" },
  { value: "per_sqm", label: "Per sq ft" },
  { value: "per_side", label: "Per side" },
];

export default function AddAddonModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (addon: NewAddon) => Promise<void> | void;
}) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = category && name && priceType && price;

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      await onSave({
        category,
        name,
        description,
        price_type: priceType,
        price,
      });
      reset();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCategory("");
    setName("");
    setDescription("");
    setPriceType("");
    setPrice("");
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1E202E]">
            Add new Add-ons and Services
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            Add a new add-on or service to the system
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Select Category
            </Label>
            <ComboBox
              value={category}
              onValueChange={setCategory}
              options={CATEGORY_OPTIONS}
              placeholder="Select Category"
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

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold text-[#1E202E]">
                Service Description
              </Label>
              <span className="text-xs text-neutral-400">
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              placeholder="Enter a short description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIPTION_MAX))
              }
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Service Price Unit
            </Label>
            <ComboBox
              value={priceType}
              onValueChange={setPriceType}
              options={PRICE_TYPE_OPTIONS}
              placeholder="Select Price Unit"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-[#1E202E]">
              Service Pricing
            </Label>
            <Input
              startIcon="₦"
              type="number"
              placeholder="Enter Amount"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!isFormValid || isLoading}>
            Save Add-on
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
