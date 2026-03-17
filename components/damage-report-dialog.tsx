"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn, downloadFile } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaItem {
  url: string;
  name?: string;
}

interface DamageReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ISO date string of when damage was reported */
  reportedAt?: string | null;
  /** Short reason text */
  reason?: string | null;
  /** Optional longer notes */
  notes?: string | null;
  /** Damage files — images or videos, rendered inline */
  images?: MediaItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "webm",
  "avi",
  "mkv",
  "m4v",
  "ogv",
]);

function isVideo(item: MediaItem): boolean {
  const src = item.name ?? item.url;
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.has(ext);
}

function formatReportedDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function handleDownload(item: MediaItem) {
  downloadFile(item.url, item.name ?? "file");
}

// ─── Inline media viewer ──────────────────────────────────────────────────────

function MediaViewer({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const hasMultiple = items.length > 1;

  if (!current) return null;

  return (
    <div className="space-y-2">
      {/* Media frame */}
      <div className="relative rounded-lg overflow-hidden bg-neutral-100 min-h-[180px] flex items-center justify-center">
        {isVideo(current) ? (
          <video
            key={current.url}
            src={current.url}
            controls
            className="w-full max-h-[55vh] object-contain"
          />
        ) : (
          <img
            src={current.url}
            alt={current.name ?? "Damage image"}
            className="w-full max-h-[55vh] object-contain"
          />
        )}

        {/* Prev / Next arrows */}
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
              onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
              disabled={index === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators + download */}
      <div className="flex items-center justify-between">
        {/* Dots */}
        {hasMultiple ? (
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === index ? "bg-neutral-700" : "bg-neutral-300",
                )}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 truncate max-w-[200px]">
            {current.name}
          </span>
        )}

        {/* Download */}
        <button
          onClick={() => handleDownload(current)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <Download className="size-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Read-only dialog that displays a damage report summary with an inline
 * media viewer (images and videos). Supports multiple files with
 * prev/next navigation.
 *
 * Used by both the admin and factory order-detail pages.
 */
export function DamageReportDialog({
  open,
  onOpenChange,
  reportedAt,
  reason,
  notes,
  images = [],
}: DamageReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Damage Report</DialogTitle>
          {reportedAt && (
            <p className="text-sm text-neutral-500">
              Reported on {formatReportedDate(reportedAt)}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Inline media — shown first so the report reads top-to-bottom */}
          {images.length > 0 && <MediaViewer items={images} />}

          <div>
            <p className="font-medium text-[#1E202E] mb-1">Damage Note</p>
            <p className="text-neutral-600">{reason ?? "—"}</p>
          </div>

          {notes && (
            <div>
              <p className="font-medium text-[#1E202E] mb-1">Notes</p>
              <p className="text-neutral-600">{notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
