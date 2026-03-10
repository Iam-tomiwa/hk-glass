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

export const getBadgeVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "In Production":
      return "default";
    case "Paid":
      return "pending";
    case "Completed":
      return "info";
    case "Ready For Pickup":
    case "ready_pickup":
    case "ready-for-pickup":
      return "success";
    default:
      return "default";
  }
};
