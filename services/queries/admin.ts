"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  createGlassType,
  listGlassTypes,
  updateGlassType,
  deleteGlassType,
  createAddon,
  listAddons,
  updateAddon,
  updateAddonPrice,
  deleteAddon,
  getPricingSettings,
  updatePricingSettings,
  registerAdminDevice,
  listAdminDevices,
  deactivateAdminDevice,
  deleteAdminDevice,
  registerStaffDevice,
  listStaffDevices,
  listCombinedDevices,
  deactivateStaffDevice,
  reactivateAdminDevice,
  reactivateStaffDevice,
  deleteStaffDevice,
  listStaff,
  listOrders,
  listPayments,
  getSummary,
  listRecentOrders,
  setupDevice,
  getCurrentDevice,
  getOrder,
  getAdminOrderFiles,
  listAdminNotifications,
  markAdminNotificationRead,
} from "../api/admin";
import {
  GlassTypeCreate,
  GlassTypeResponse,
  GlassTypeUpdate,
  AddonCreate,
  AddonResponse,
  AddonUpdate,
  AddonPriceUpdate,
  PricingSettingsResponse,
  PricingSettingsUpdate,
  AdminDeviceCreate,
  DeviceResponse,
  StaffDeviceCreate,
  CombinedDeviceResponse,
  UserResponse,
  OrderResponse,
  OrderFileLinksResponse,
  PaymentResponse,
  DashboardSummaryResponse,
  DashboardOrderResponse,
  PaginatedResponse,
  NotificationListResponse,
} from "../types/openapi";

export function useCreateGlassType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: GlassTypeCreate }) => createGlassType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Action successful.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListGlassTypes() {
  return useQuery<GlassTypeResponse[]>({
    queryKey: queryKeys.admin.list("glass-types"),
    queryFn: () => listGlassTypes(),
  });
}

export function useUpdateGlassType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      glass_type_id,
      data,
    }: {
      glass_type_id: string;
      data: GlassTypeUpdate;
    }) => updateGlassType(glass_type_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Glass type updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteGlassType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ glass_type_id }: { glass_type_id: string }) =>
      deleteGlassType(glass_type_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Glass type deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useCreateAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: AddonCreate }) => createAddon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Addon created successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListAddons() {
  return useQuery<AddonResponse[]>({
    queryKey: queryKeys.admin.list("addons"),
    queryFn: () => listAddons(),
  });
}

export function useUpdateAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addon_id, data }: { addon_id: string; data: AddonUpdate }) =>
      updateAddon(addon_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Addon updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addon_id }: { addon_id: string }) => deleteAddon(addon_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Addon deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useUpdateAddonPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      addon_id,
      data,
    }: {
      addon_id: string;
      data: AddonPriceUpdate;
    }) => updateAddonPrice(addon_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Price updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update price."));
    },
  });
}

export function useGetPricingSettings() {
  return useQuery<PricingSettingsResponse>({
    queryKey: queryKeys.admin.list("pricing-settings"),
    queryFn: () => getPricingSettings(),
  });
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: PricingSettingsUpdate }) =>
      updatePricingSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Pricing settings updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useRegisterAdminDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: AdminDeviceCreate }) =>
      registerAdminDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Admin device registered successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListAdminDevices() {
  return useQuery<DeviceResponse[]>({
    queryKey: queryKeys.admin.list("admin-devices"),
    queryFn: () => listAdminDevices(),
  });
}

export function useDeactivateAdminDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id, data }: { device_id: string; data?: unknown }) =>
      deactivateAdminDevice(device_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Admin device deactivated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useRegisterStaffDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: StaffDeviceCreate }) =>
      registerStaffDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Action successful.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListStaffDevices() {
  return useQuery<DeviceResponse[]>({
    queryKey: queryKeys.admin.list("staff-devices"),
    queryFn: () => listStaffDevices(),
  });
}

export function useListCombinedDevices() {
  return useQuery<CombinedDeviceResponse[]>({
    queryKey: queryKeys.admin.list("combined-devices"),
    queryFn: () => listCombinedDevices(),
  });
}

export function useCurrentDevice() {
  return useQuery<CombinedDeviceResponse>({
    queryKey: queryKeys.admin.list("current-device"),
    queryFn: () => getCurrentDevice(),
  });
}

export function useDeactivateStaffDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id, data }: { device_id: string; data?: unknown }) =>
      deactivateStaffDevice(device_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Action successful.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteAdminDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id }: { device_id: string }) =>
      deleteAdminDevice(device_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Device deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteStaffDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id }: { device_id: string }) =>
      deleteStaffDevice(device_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Device deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useReactivateAdminDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id }: { device_id: string }) =>
      reactivateAdminDevice(device_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Device reactivated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useReactivateStaffDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id }: { device_id: string }) =>
      reactivateStaffDevice(device_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Device reactivated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListStaff() {
  return useQuery<UserResponse[]>({
    queryKey: queryKeys.admin.list("staff"),
    queryFn: () => listStaff(),
  });
}

export function useListOrders(params?: {
  page?: number;
  limit?: number;
  order_status?: string;
  search?: string;
}) {
  return useQuery<PaginatedResponse<OrderResponse>>({
    queryKey: queryKeys.admin.list(["orders", params]),
    queryFn: () => listOrders(params),
  });
}

export function useGetOrder(order_id: string) {
  return useQuery<OrderResponse>({
    queryKey: queryKeys.admin.detail(order_id),
    queryFn: () => getOrder(order_id),
    enabled: !!order_id,
  });
}

export function useGetAdminOrderFiles(order_id: string) {
  return useQuery<OrderFileLinksResponse>({
    queryKey: queryKeys.admin.files(order_id),
    queryFn: () => getAdminOrderFiles(order_id),
    enabled: !!order_id,
  });
}

export function useListPayments(params?: {
  paid_from?: string;
  paid_to?: string;
  status?: string;
}) {
  return useQuery<PaymentResponse[]>({
    queryKey: queryKeys.admin.list(["payments", params]),
    queryFn: () => listPayments(params),
  });
}

export function useGetSummary(params?: { range?: string; status?: string }) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: queryKeys.admin.list(["summary", params]),
    queryFn: () => getSummary(params),
  });
}

export function useListRecentOrders(params?: { limit?: number }) {
  return useQuery<DashboardOrderResponse[]>({
    queryKey: queryKeys.admin.list(params),
    queryFn: () => listRecentOrders(params),
  });
}

export function useGetDevices(params?: {
  token?: string | null;
  code?: string | null;
}) {
  return useQuery({
    queryKey: queryKeys.admin.list(params),
    queryFn: () => setupDevice(params),
  });
}

export function useListAdminNotifications() {
  return useQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.admin,
    queryFn: () => listAdminNotifications(),
    refetchInterval: 30_000,
  });
}

export function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notification_id: string) =>
      markAdminNotificationRead(notification_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.admin,
      });
    },
  });
}
