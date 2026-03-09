import { AxiosError, AxiosRequestConfig } from "axios";

export type IPaginatedResponse<T> = {
  total?: number;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  data: T[];
};

export type ErrorResponseType = {
  status: "fail" | "success";
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
};

export type APIErrorTypeWrapper = AxiosError<
  ErrorResponseType,
  AxiosRequestConfig
>;

export type TApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};
