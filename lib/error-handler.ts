/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import { APIErrorTypeWrapper } from "./types";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const getErrorMessage = (error: unknown, fallback?: string): string => {
  const axiosError = error as APIErrorTypeWrapper;
  const data = axiosError?.response?.data as any;

  if (data) {
    // 1. Handle "detail" (e.g. FastAPI/Pydantic validation errors)
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((e: any) => {
            if (e && typeof e === "object") {
              return e.msg || e.message || JSON.stringify(e);
            }
            return String(e);
          })
          .join("; ");
      }
      if (typeof data.detail === "object" && data.detail !== null) {
        return JSON.stringify(data.detail);
      }
      return String(data.detail);
    }

    // 2. Handle "errors" (e.g. Django/Laravel validation dictionary of arrays)
    if (data.errors && typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(", ") : String(val);
          return `${key}: ${msg}`;
        })
        .join("; ");
    }

    // 3. Handle "message"
    if (data.message) {
      if (typeof data.message === "object" && data.message !== null) {
        return JSON.stringify(data.message);
      }
      return String(data.message);
    }

    // 4. Handle "error"
    if (data.error) {
      if (typeof data.error === "object" && data.error !== null) {
        return JSON.stringify(data.error);
      }
      return String(data.error);
    }
  }

  return (
    axiosError?.message ??
    fallback ??
    "Something went wrong! Please try again later."
  );
};

// Optional: Helper for logging errors in development
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error${context ? ` in ${context}` : ""}]:`, error);
    if (error instanceof AxiosError) {
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
    }
  }
}
