import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (value: string[]) => void;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  className,
  ...props
}: OtpInputProps) {
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...value];
    newOtp[index] = val;
    onChange(newOtp);

    // Auto-focus next input
    if (val !== "" && index < value.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      onComplete?.(newOtp);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && value[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
      // Optional: clear the previous input when navigating back
      // const newOtp = [...value];
      // newOtp[index - 1] = "";
      // onChange(newOtp);
    }
  };

  return (
    <div className={cn("flex justify-center gap-4", className)}>
      {value.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            "flex size-[4.5rem] items-center text-center justify-center rounded-xl border bg-background text-[2.5rem] font-bold shadow-sm outline-none transition-all placeholder:text-muted-foreground",
            "focus:border-[#00B412] focus:ring-1 focus:ring-[#00B412]",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          {...props}
        />
      ))}
    </div>
  );
}
