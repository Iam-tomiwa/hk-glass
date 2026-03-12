import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APIErrorTypeWrapper } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant =
  | "default"
  | "info"
  | "success"
  | "pending"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export const BadgeVariantMap = {
  in_production: "default",
  paid: "pending",
  completed: "info",
  ready_pickup: "success",
};
export const getBadgeVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "in_production":
      return "default";
    case "pending":
      return "pending";
    case "paid":
      return "pending";
    case "completed":
      return "info";
    case "ready_pickup":
      return "success";
    default:
      return "default";
  }
};

/**
 * Format a number or numeric string as Nigerian Naira.
 * e.g. formatNaira(1500) → "₦1,500.00"
 */
export function formatNaira(
  amount: number | string | null | undefined,
): string {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
}
