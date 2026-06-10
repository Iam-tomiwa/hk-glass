import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

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
export const getBadgeVariant = (status?: string): BadgeVariant => {
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
  if (Number.isNaN(num)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Compact Naira formatter for tight UI spaces (e.g. summary cards).
 * Abbreviates only at ≥10,000 so smaller amounts still show full precision:
 *   1,040      → ₦1,040
 *   9,999      → ₦9,999
 *   10,000     → ₦10k
 *   10,500     → ₦10.5k
 *   1,200,000  → ₦1.2M
 *   2,500,000,000 → ₦2.5B
 */
export function formatCompactNaira(
  amount: number | string | null | undefined,
): string {
  const num = Number(amount ?? 0);
  if (Number.isNaN(num)) return "₦0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  // Below 10k — show the full formatted amount
  if (abs < 10_000) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  let value: string;
  if (abs >= 1_000_000_000) {
    value = `${(abs / 1_000_000_000).toFixed(abs % 1_000_000_000 === 0 ? 0 : 1)}B`;
  } else if (abs >= 1_000_000) {
    value = `${(abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  } else {
    // 10,000 – 999,999
    value = `${(abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
  }

  return `${sign}₦${value}`;
}

/**
 * Downloads a file by fetching it as a blob.
 * This is useful for cross-origin URLs where the 'download' attribute on a tags is ignored.
 */
export async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    globalThis.URL.revokeObjectURL(blobUrl);
    a.remove();
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: try opening in a new tab
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

export const getCookieDomain = () => {
  if (globalThis.window === undefined) return undefined;
  const hostname = globalThis.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return undefined;
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://backend.glasstronictech.org";

  try {
    const backendHost = new URL(backendUrl).hostname;
    const backendParts = backendHost.split(".");

    if (backendParts.length >= 2) {
      const baseDomain = backendParts.slice(-2).join(".");
      if (hostname.endsWith(baseDomain)) {
        return `.${baseDomain}`;
      }
    }
  } catch (e) {
    console.error("Failed to parse backend URL for cookie domain:", e);
  }

  return undefined;
};

export const setCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) => {
  if (globalThis.window === undefined) return;
  const domain = getCookieDomain();
  Cookies.set(name, value, {
    sameSite: "lax",
    ...(domain ? { domain, secure: true } : {}),
    ...options,
  });
};

export const removeCookie = (
  name: string,
  options?: Cookies.CookieAttributes,
) => {
  if (globalThis.window === undefined) return;
  const domain = getCookieDomain();
  Cookies.remove(name, {
    ...(domain ? { domain, secure: true } : {}),
    ...options,
  });
};
