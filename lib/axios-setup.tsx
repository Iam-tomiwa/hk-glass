import axios, { AxiosError, AxiosRequestConfig as _AxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to support skipping the global auth redirect for
// background / polling requests (e.g. notification bell).
interface AxiosRequestConfig extends _AxiosRequestConfig {
  _skipAuthRedirect?: boolean;
}
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

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Background/polling requests (e.g. notification bell) opt out of the
      // global redirect so a single failed poll doesn't terminate the session.
      const skipRedirect = (error.config as AxiosRequestConfig)?._skipAuthRedirect;

      if (!skipRedirect && typeof window !== "undefined") {
        const { pathname } = window.location;

        // Let the login / unauthorized pages handle their own 401s
        // (e.g. recover-device flow). Redirecting here would prevent that.
        const isAuthPage =
          pathname === "/admin/login" || pathname === "/unauthorized";

        if (!isAuthPage) {
          const from = pathname + window.location.search;
          Cookies.remove("access_token");
          Cookies.remove("admin_device_token");
          Cookies.remove("device_token");
          localStorage.setItem("session_expired", "1");
          if (pathname.startsWith("/admin")) {
            window.location.href = `/admin/login?redirectTo=${encodeURIComponent(from)}`;
          } else {
            window.location.href = `/unauthorized?redirectTo=${encodeURIComponent(from)}`;
          }
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
  const response = await axiosInstance.get<T>(url, config as _AxiosRequestConfig);
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
