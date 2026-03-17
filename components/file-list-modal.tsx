"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";

export interface FileItem {
  name: string;
  url: string;
  date?: string;
}

interface FileListModalProps {
  files: FileItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function FileListModal({
  files,
  open,
  onOpenChange,
  title = "Uploaded Files",
}: FileListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-white"
            >
              <div className="size-10 flex items-center justify-center bg-neutral-100 rounded-lg shrink-0">
                <FileText className="size-5 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{ textWrap: "wrap" }}
                  className="text-sm font-semibold text-neutral-900"
                >
                  {file.name}
                </p>
                {file.date && (
                  <p className="text-xs text-neutral-500 mt-0.5">{file.date}</p>
                )}
              </div>
              <a
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Download className="size-5" />
              </a>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
