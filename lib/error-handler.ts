import { AxiosError } from "axios";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An error occurred. Please try again.",
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }

    if (!error.response) {
      return "Network error. Please check your connection.";
    }

    if (error.response.status === 500) {
      return "Server error. Please try again later.";
    }

    if (error.response.status === 404) {
      return "Resource not found.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

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
