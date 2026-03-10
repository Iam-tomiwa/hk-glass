"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";

export type InputProps = {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClass?: string;
  error?: string;
} & React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startIcon, endIcon, containerClass, error, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className={cn(containerClass, "space-y-2")}>
        <div className={cn("relative flex items-center")}>
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 ",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              startIcon && "pl-9",
              endIcon && "pr-9",
              className,
            )}
            {...props}
            type={showPassword ? "text" : type}
          />
          {endIcon && (
            <div className="absolute right-0 flex items-center z-[100]">
              {endIcon}
            </div>
          )}
          {type === "password" && (
            <button
              type="button"
              className="absolute cursor-pointer right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeClosed className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
