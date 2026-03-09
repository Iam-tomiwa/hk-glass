import { AxiosError, type AxiosRequestConfig } from "axios";

export type IPaginatedResponse<T> = {
  total?: number;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  data: T[];
  // Cursor-based pagination fields
  next?: string | null;
  previous?: string | null;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

export type ErrorResponseType = {
  status: "fail" | "success";
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
  detail?: string;
};

export type APIErrorTypeWrapper = AxiosError<
  ErrorResponseType,
  AxiosRequestConfig
>;
