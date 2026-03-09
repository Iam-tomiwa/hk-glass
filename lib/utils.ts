import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APIErrorTypeWrapper } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessageFromAPi = (error: APIErrorTypeWrapper) => {
  // Check for validation errors in the format: {"errors":{"field":["error message"]}}
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const errorMessages: string[] = [];

    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          errorMessages.push(`${field}: ${message}`);
        });
      } else if (typeof messages === "string") {
        errorMessages.push(`${field}: ${messages}`);
      }
    });

    if (errorMessages.length > 0) {
      return errorMessages.join(", ");
    }
  }

  // Check for detail field in data (common in DRF and similar APIs)
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  // Fallback to regular message handling
  return (
    error?.response?.data?.message ??
    error?.message ??
    "Something went wrong! Please try again later."
  );
};

export const getBadgeClassName = (status: string) => {
  let badgeClasses = "";
  let dotClasses = "";

  switch (status) {
    case "In Production":
      badgeClasses = "bg-neutral-200 text-neutral-700 hover:bg-neutral-300";
      dotClasses = "bg-neutral-500";
      break;
    case "Paid":
      badgeClasses = "bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]";
      dotClasses = "bg-[#D97706]";
      break;
    case "Completed":
      badgeClasses = "bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE]";
      dotClasses = "bg-[#3B82F6]";
      break;
    case "Ready For Pickup":
      badgeClasses = "bg-[#A7F3D0] text-[#047857] hover:bg-[#6EE7B7]";
      dotClasses = "bg-[#10B981]";
      break;
    default:
      badgeClasses = "bg-neutral-100 text-neutral-700 hover:bg-neutral-200";
      dotClasses = "bg-neutral-400";
      break;
  }
  return {
    badgeClasses,
    dotClasses,
  };
};
