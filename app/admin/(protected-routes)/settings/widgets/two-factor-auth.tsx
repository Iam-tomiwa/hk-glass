"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { RecoveryCodesModal } from "./recovery-codes-modal";
import { QRCodeSVG } from "qrcode.react";
import {
  useGetCurrentUser,
  useSetupTotp,
  useConfirmTotp,
  useDisableTotp,
  useGenerateRecoveryCodes,
  useListRecoveryCodes,
} from "@/services/queries/auth";
import { TotpSetupResponse } from "@/services/types/openapi";

export default function TwoFactorAuth() {
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [confirmCode, setConfirmCode] = useState("");

  const {
    data: user,
    isPending: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetCurrentUser();
  const isEnabled = user?.is_2fa_enabled ?? false;

  const { mutateAsync: setupTotp, isPending: isSettingUp } = useSetupTotp();
  const { mutateAsync: confirmTotp, isPending: isConfirming } =
    useConfirmTotp();
  const { mutateAsync: disableTotp, isPending: isDisabling } = useDisableTotp();
  const { mutateAsync: generateCodes, isPending: isGenerating } =
    useGenerateRecoveryCodes();
  const { refetch: refetchCodes } = useListRecoveryCodes();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const result = await setupTotp({ data: undefined });
      setTotpSetup(result);
      setConfirmCode("");
    } else {
      await disableTotp();
      setTotpSetup(null);
    }
  };

  const handleConfirmOtp = async () => {
    if (!confirmCode.trim()) return;
    await confirmTotp({ data: { otp_code: confirmCode.trim() } });
    setTotpSetup(null);
    setConfirmCode("");
  };

  const handleReset = async () => {
    const result = await setupTotp({ data: undefined });
    setTotpSetup(result);
    setConfirmCode("");
  };

  const handleViewCodes = async () => {
    const result = await refetchCodes();
    const codes =
      result.data?.codes.map((c) => c.code_hint).filter(Boolean) ?? [];
    setRecoveryCodes(codes as string[]);
    setRecoveryModalOpen(true);
  };

  const handleGenerateCodes = async () => {
    const result = await generateCodes({ data: undefined });
    setRecoveryCodes(result.codes);
    setRecoveryModalOpen(true);
  };

  return (
    <div className="max-w-[700px] mx-auto py-10 w-full min-h-[500px] flex flex-col gap-6">
      <div>
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
              variant={isEnabled ? "success" : "destructive"}
              className="flex shrink-0 items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full text-[12px]"
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
                checked={isEnabled || !!totpSetup}
                onCheckedChange={handleToggle}
                disabled={isSettingUp || isDisabling}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-[#D1D5DB]"
              />
            </div>
          </div>
        </div>

        {(isEnabled || totpSetup) && (
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
                {/* QR Code */}
                <div className="shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-2 w-[160px] h-[160px] flex items-center justify-center">
                  {totpSetup?.otpauth_url ? (
                    <QRCodeSVG value={totpSetup.otpauth_url} size={140} />
                  ) : (
                    <QrCode className="w-[140px] h-[140px] text-black stroke-1" />
                  )}
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
                    <div className="w-full bg-white border border-[#E5E7EB] rounded-md px-4 py-3 text-center font-mono font-medium tracking-widest text-[#111827] text-sm">
                      {totpSetup?.secret ?? "••••••••••••••••"}
                    </div>
                  </div>
                </div>
              </div>

              {/* OTP Confirm (only shown when setting up) */}
              {totpSetup && (
                <div className="flex items-center gap-3 mb-6">
                  <Input
                    className="w-[200px] font-mono text-center tracking-widest"
                    placeholder="Enter 6-digit code"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirmOtp()}
                    maxLength={6}
                    disabled={isConfirming}
                  />
                  <Button
                    onClick={handleConfirmOtp}
                    disabled={confirmCode.length < 6 || isConfirming}
                  >
                    {isConfirming ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="px-4 text-[13px] border-[#E5E7EB]"
                onClick={handleReset}
                disabled={isSettingUp}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2 text-gray-500" />
                {isSettingUp ? "Resetting..." : "Reset Authenticator"}
              </Button>
            </div>

            {/* Recovery Codes Card */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 ">
              <h3 className="text-[15px] font-semibold text-[#111827] mb-1">
                Recovery Codes
              </h3>
              <p className="text-sm text-[#6B7280] mb-6">
                Use recovery codes to access your account if you lose your
                device
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
                    Store these codes in a secure location. Each code can only
                    be used once.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 text-[13px] border-[#E5E7EB] text-[#374151]"
                  onClick={handleViewCodes}
                >
                  View Recovery Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 text-[13px] border-[#E5E7EB] text-[#374151]"
                  onClick={handleGenerateCodes}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate New Codes"}
                </Button>
              </div>
            </div>
          </>
        )}

        <RecoveryCodesModal
          open={recoveryModalOpen}
          onOpenChange={setRecoveryModalOpen}
          codes={recoveryCodes}
        />
      </div>
    </div>
  );
}
