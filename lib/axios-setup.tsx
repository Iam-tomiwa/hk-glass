import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

export const axiosInstance = axios.create({
  baseURL: "/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token (admin endpoints)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response && error.code === "ECONNABORTED") {
      // Handle timeout errors
      toast.error("Request timed out. Please try again.");
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const from = window.location.pathname + window.location.search;
        Cookies.remove("access_token");
        Cookies.remove("admin_device_token");
        Cookies.remove("device_token");
        localStorage.setItem("session_expired", "1");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = `/admin/login?redirectTo=${encodeURIComponent(from)}`;
        } else {
          window.location.href = `/unauthorized?redirectTo=${encodeURIComponent(from)}`;
        }
      }
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
