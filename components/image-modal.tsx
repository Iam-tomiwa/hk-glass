"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn, downloadFile } from "@/lib/utils";

export interface ImageItem {
  url: string;
  name?: string;
}

interface ImageModalProps {
  images: ImageItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ImageModal({
  images,
  open,
  onOpenChange,
  title = "View Image",
  description,
}: ImageModalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const current = images[index];
  const hasMultiple = images.length > 1;

  async function handleDownload() {
    if (!current) return;
    await downloadFile(current.url, current.name ?? "image.png");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
        </DialogHeader>

        <div className="relative rounded-lg overflow-hidden bg-neutral-100 min-h-[200px] flex items-center justify-center">
          {current && (
            <img
              src={current.url}
              alt={current.name ?? "Image"}
              className="w-full max-h-[60vh] object-contain"
            />
          )}
          {hasMultiple && (
            <>
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() =>
                  setIndex((i) => Math.min(images.length - 1, i + 1))
                }
                disabled={index === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      i === index ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="size-4" /> Download Image
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
