"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setupAdminDevice } from "@/services/api/admin";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("session_expired")) {
      localStorage.removeItem("session_expired");
      toast.error("Your session has expired. Please authenticate this device.");
    }
  }, []);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      await setupAdminDevice({ code: code.trim() });
      window.location.href = redirectTo;
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white flex-col gap-4">
      <img
        src="/images/logo.svg"
        alt="Glasstronics"
        className="h-10 w-auto mb-2"
      />
      <div className="text-center">
        <h1 className="text-xl font-bold text-neutral-900 mb-1">
          Device Authentication
        </h1>
        <p className="text-neutral-500 text-sm max-w-xs">
          Enter the registration code provided by your administrator to register
          this device.
        </p>
      </div>
      <Input
        className="w-[300px] font-mono text-xl font-bold tracking-widest text-center h-14"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={isLoading}
      />
      <Button
        className="w-[300px] bg-[#00B412] hover:bg-[#00B412]/90 text-white"
        onClick={handleSubmit}
        disabled={isLoading || !code.trim()}
      >
        {isLoading ? "Verifying..." : "Submit"}
      </Button>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense>
      <UnauthorizedContent />
    </Suspense>
  );
}
