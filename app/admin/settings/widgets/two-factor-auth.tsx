"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { RecoveryCodesModal } from "./recovery-codes-modal";

export default function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);

  return (
    <div className="max-w-[700px] mx-auto py-10 w-full min-h-[500px] flex flex-col gap-6">
      {/* Settings Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 ">
        {/* Row 1 - Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Authentication Status
              </h3>
              <p className="text-sm text-[#6B7280]">
                Two-factor authentication adds an extra layer of security
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "flex shrink-0 items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full text-[12px]",
              isEnabled
                ? "bg-[#D1FAE5] text-[#065F46]"
                : "bg-[#FECACA] text-[#991B1B]",
            )}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Row 2 - Enable Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-sm text-[#6B7280]">
                Require a verification code in addition to your password
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-[#D1D5DB]"
            />
          </div>
        </div>
      </div>

      {isEnabled && (
        <>
          {/* Authenticator App Card */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 ">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-1">
              Authenticator App
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Use an authenticator app like Google Authenticator or Authy
            </p>

            <div className="rounded-lg border border-[#E5E7EB] p-6 bg-[#FAFAFA] flex flex-col md:flex-row gap-8 mb-6">
              {/* QR Code Container */}
              <div className="shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-2 w-[160px] h-[160px] flex items-center justify-center ">
                <QrCode className="w-[140px] h-[140px] text-black stroke-[1]" />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-semibold text-[14px] text-[#111827] mb-3">
                  Setup Instructions:
                </h4>
                <ol className="text-sm text-[#4B5563] space-y-2 list-decimal list-inside mb-6">
                  <li>Install an authenticator app on your phone</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code from the app to verify</li>
                </ol>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                  <span className="text-[12px] text-[#6B7280] uppercase tracking-wider">
                    or
                  </span>
                  <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-[#4B5563]">
                    Use manual entry key:
                  </p>
                  <div className="w-full bg-white border border-[#E5E7EB] rounded-md px-4 py-3 text-center font-mono font-medium tracking-widest text-[#111827]  text-sm">
                    JBSWY3DPEHPK3PXP
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="px-4 text-[13px] border-[#E5E7EB] "
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Reset Authenticator
            </Button>
          </div>

          {/* Recovery Codes Card */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 ">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-1">
              Recovery Codes
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Use recovery codes to access your account if you lose your device
            </p>

            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 flex gap-3 mb-6 items-start">
              <div className="shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-[#D97706]" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-[13px] text-[#92400E]">
                  Keep your recovery codes safe
                </h4>
                <p className="text-[13px] text-[#92400E]">
                  Store these codes in a secure location. Each code can only be
                  used once.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="px-4 text-[13px] border-[#E5E7EB]  text-[#374151]"
              >
                View Recovery Codes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 text-[13px] border-[#E5E7EB]  text-[#374151]"
                onClick={() => setRecoveryModalOpen(true)}
              >
                Generate New Codes
              </Button>
            </div>
          </div>
        </>
      )}

      <RecoveryCodesModal
        open={recoveryModalOpen}
        onOpenChange={setRecoveryModalOpen}
      />
    </div>
  );
}
