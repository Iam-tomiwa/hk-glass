"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { useLogin, useRecoverDevice } from "@/services/queries/auth";
import { getErrorMessage } from "@/lib/error-handler";
import Cookies from "js-cookie";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  otp_code: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  useEffect(() => {
    if (localStorage.getItem("session_expired")) {
      localStorage.removeItem("session_expired");
      toast.error("Your session has expired. Please log in again.");
    }
  }, []);

  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]); // Assuming 6-digit OTP

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      otp_code: undefined,
    },
  });

  const { mutateAsync: loginMutation, isPending: isLoading } = useLogin();
  const { mutateAsync: recoverMutation, isPending: isRecoverLoading } =
    useRecoverDevice();

  const onSubmit = async (data: LoginFormValues) => {
    if (showOtp) {
      data.otp_code = otpValue.join("");
    }

    try {
      const response = await loginMutation({ data });
      Cookies.set("access_token", response.access_token);
      router.push(redirectTo);
    } catch (loginError: any) {
      const status = loginError.response?.status;
      const errorMsg: string =
        loginError.response?.data?.detail || "An error occurred during login";

      if (status === 401) {
        const msgLower = errorMsg.toLowerCase();

        // Device not recognised — run recover-device to get admin_device_token cookie, then retry login
        if (
          msgLower.includes("unrecognized device") ||
          msgLower.includes("device not allowed") ||
          msgLower.includes("setup required")
        ) {
          try {
            await recoverMutation({ data });
            // Retry login; cookies will now be sent automatically (withCredentials)
            const response = await loginMutation({ data });
            Cookies.set("access_token", response.access_token);
            router.push("/admin");
          } catch (recoverError: any) {
            toast.error(
              getErrorMessage(
                recoverError,
                "Device recovery failed. Please try again.",
              ),
            );
          }
          return;
        }

        // 2FA required — show OTP input
        if (msgLower.includes("otp") || msgLower.includes("2fa")) {
          setShowOtp(true);
          toast.info("Please enter your 2FA code");
          return;
        }
      }

      toast.error(getErrorMessage(loginError, "Failed. Please try again."));
    }
  };

  const handleOtpComplete = (newOtp: string[]) => {
    // Optionally auto-submit when OTP is complete
    const code = newOtp.join("");
    setValue("otp_code", code);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/images/logo.svg"
            alt="Glasstronics"
            className="h-12 w-auto"
          />
        </div>
        <div className="my-4 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p>Enter the login credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!showOtp ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  placeholder="Enter email address"
                  id="email"
                  type="email"
                  disabled={isLoading}
                  error={errors.email?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password")}
                  placeholder="Enter password"
                  id="password"
                  type="password"
                  disabled={isLoading}
                  error={errors.password?.message}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 mt-6 flex flex-col items-center">
              <Label htmlFor="otp">Enter 2FA Code</Label>
              <OtpInput
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleOtpComplete}
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtpValue(["", "", "", "", "", ""]);
                }}
                disabled={isLoading}
              >
                Back to login
              </Button>
            </div>
          )}

          <Button
            className="w-full"
            type="submit"
            disabled={isRecoverLoading || isLoading}
          >
            {isLoading ? "Logging in..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
