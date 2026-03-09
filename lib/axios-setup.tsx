import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: "hk.planetal.app",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Separate axios instance for guest user creation (no interceptors to avoid circular dependency)
const axiosGuestInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response && error.code === "ECONNABORTED") {
      // Handle timeout errors
      toast.error("Request timed out. Please try again.");
    }

    return Promise.reject(error);
  },
);

//===== Helper functions for CRUD operations =====//
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.delete<T>(url, config);
  return response.data;
}

export default axiosInstance;
