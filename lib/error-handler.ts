import { AxiosError } from "axios";
import { APIErrorTypeWrapper } from "./types";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const getErrorMessage = (error: unknown, fallback?: string): string => {
  const axiosError = error as APIErrorTypeWrapper;
  const data = axiosError?.response?.data;

  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      return data.detail.map((e: { msg: string }) => e.msg).join("; ");
    }
    return data.detail;
  }
  if (data?.message) return data.message;

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
