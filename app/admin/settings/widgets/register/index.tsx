"use client";

import { useState } from "react";
import { Copy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function RegisterDeviceModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  const handleGenerate = () => {
    if (!deviceName || !role) return;
    setStep(2);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      setIsSubmittingOtp(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmittingOtp(false);
        setStep(3);
      }, 1000);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setStep(1);
        setRole("");
        setDeviceName("");
        setOtp(["", "", "", ""]);
      }, 300);
    }
  };

  const isUrlAuth = step === 3;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger render={children as React.ReactElement} />}
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>Add a new device to the system.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-b pb-4 mt-2">
          <div
            className={cn(
              "text-sm font-semibold flex items-center transition-colors",
              step === 1 ? "text-foreground" : "text-foreground/50",
            )}
          >
            1. Device and Role
          </div>
          <LogIn className="size-4 text-[#00B412] shrink-0" />
          <div
            className={cn(
              "text-sm font-semibold transition-colors",
              step >= 2 ? "text-foreground" : "text-foreground/50",
            )}
          >
            2. Authentication Key
          </div>
        </div>

        {step === 1 ? (
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName" className="text-sm font-medium">
                Device Name
              </Label>
              <Input
                id="deviceName"
                placeholder="e.g., Sales Terminal 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Select Role
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v || "")}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select Device Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display">Display Profile</SelectItem>
                  <SelectItem value="staff">Staff Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="bg-[#00B412] hover:bg-[#00B412]/90 text-white"
                onClick={handleGenerate}
                disabled={!deviceName || !role}
              >
                Generate Auth Key
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 animate-in fade-in zoom-in-95 duration-200">
            {step === 3 ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    readOnly
                    value="www.glasstronicsauthkey.com/url/staff/id"
                  />
                </div>
                <Button
                  variant="outline"
                  className="px-3 shrink-0 flex items-center gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "www.glasstronicsauthkey.com/url/staff/id",
                    );
                  }}
                >
                  <span>Copy</span>
                  <Copy className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6">
                {isSubmittingOtp ? (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    Verifying...
                  </div>
                ) : null}
                <div className="flex justify-center gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isSubmittingOtp}
                      className={cn(
                        "flex size-[4.5rem] items-center text-center justify-center rounded-xl border bg-background text-[2.5rem] font-bold shadow-sm outline-none transition-all placeholder:text-muted-foreground",
                        "focus:border-[#00B412] focus:ring-1 focus:ring-[#00B412]",
                        isSubmittingOtp && "opacity-50 cursor-not-allowed",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
