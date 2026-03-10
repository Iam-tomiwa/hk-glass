"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecoveryCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: string[];
}

export function RecoveryCodesModal({
  open,
  onOpenChange,
  codes,
}: RecoveryCodesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] p-0 overflow-hidden"
        showCloseButton={true}
      >
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Recovery Codes
            </DialogTitle>
            <DialogDescription className="text-[15px] text-[#4B5563] space-y-1">
              <p>Save these codes in a secure location.</p>
              <p>Each code can only be used once.</p>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pt-4 border-t border-[#E5E7EB]">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {codes.map((code, index) => (
                <div
                  key={index}
                  className="font-mono text-[14px] text-[#111827] tracking-wider whitespace-nowrap"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <DialogFooter className="flex-row items-center gap-3">
            <Button
              className="bg-[#05A05B] hover:bg-[#048C4F] text-white px-6 font-medium"
              onClick={() => {
                navigator.clipboard.writeText(codes.join("\n"));
                toast.success("Codes copied to clipboard");
              }}
            >
              Copy Codes
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 border-[#E5E7EB] text-[#374151] font-medium shadow-none"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
