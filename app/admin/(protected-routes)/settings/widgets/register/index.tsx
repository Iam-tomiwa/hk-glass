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
import { cn } from "@/lib/utils";
import { useRegisterStaffDevice } from "@/services/queries/admin";

export default function RegisterDeviceModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [deviceName, setDeviceName] = useState("");
  const [deviceEmail, setDeviceEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [setupCode, setSetupCode] = useState<string[]>([]);
  const registerStaff = useRegisterStaffDevice();

  const isLoading = registerStaff.isPending;

  const handleGenerate = async () => {
    if (!deviceName || !deviceEmail) return;

    try {
      const response = await registerStaff.mutateAsync({
        data: { name: deviceName, email: deviceEmail },
      });

      setSetupCode(response.setup_code.split(""));
      setStep(2);
    } catch {
      // Error handled by mutation's onError toast
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setStep(1);
        setDeviceName("");
        setDeviceEmail("");
        setSetupCode([]);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger render={children as React.ReactElement} />}
      <DialogContent className="max-w-[450px] gap-2">
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
                Staff Name
              </Label>
              <Input
                id="deviceName"
                placeholder="e.g., Sales Terminal 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceEmail" className="text-sm font-medium">
                Staff Email
              </Label>
              <Input
                id="deviceEmail"
                type="email"
                placeholder="e.g., operator@company.com"
                value={deviceEmail}
                onChange={(e) => setDeviceEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="bg-[#00B412] hover:bg-[#00B412]/90 text-white"
                onClick={handleGenerate}
                disabled={!deviceName || !deviceEmail || isLoading}
              >
                {isLoading ? "Generating..." : "Generate Auth Key"}
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Share this code with the device operator to authenticate.
            </p>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 flex items-center justify-center gap-1.5 bg-muted rounded-lg px-4 py-3">
                {setupCode.map((char, i) => (
                  <span
                    key={i}
                    className="font-mono text-2xl font-bold tracking-widest text-foreground"
                  >
                    {char}
                  </span>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  navigator.clipboard.writeText(setupCode.join(""))
                }
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
