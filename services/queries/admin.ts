"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  createGlassType,
  listGlassTypes,
  updateGlassType,
  createAddon,
  listAddons,
  updateAddon,
  getPricingSettings,
  updatePricingSettings,
  registerAdminDevice,
  listAdminDevices,
  deactivateAdminDevice,
  registerStaffDevice,
  listStaffDevices,
  listCombinedDevices,
  deactivateStaffDevice,
  listStaff,
  listOrders,
  listPayments,
  getSummary,
  listRecentOrders,
  setupAdminDevice,
} from "../api/admin";
import {
  GlassTypeCreate,
  GlassTypeResponse,
  GlassTypeUpdate,
  AddonCreate,
  AddonResponse,
  AddonUpdate,
  PricingSettingsResponse,
  PricingSettingsUpdate,
  AdminDeviceCreate,
  DeviceResponse,
  StaffDeviceCreate,
  CombinedDeviceResponse,
  UserResponse,
  OrderResponse,
  PaymentResponse,
  DashboardSummaryResponse,
  DashboardOrderResponse,
} from "../types/openapi";

export function useCreateGlassType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: GlassTypeCreate }) => createGlassType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    mutationFn: ({ device_id, data }: { device_id: string; data?: any }) =>
      deactivateAdminDevice(device_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Admin device deactivated successfully.");
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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

export function useDeactivateStaffDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id, data }: { device_id: string; data?: any }) =>
      deactivateStaffDevice(device_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
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

export function useListOrders() {
  return useQuery<OrderResponse[]>({
    queryKey: queryKeys.admin.list("orders"),
    queryFn: () => listOrders(),
  });
}

export function useListPayments() {
  return useQuery<PaymentResponse[]>({
    queryKey: queryKeys.admin.list("payments"),
    queryFn: () => listPayments(),
  });
}

export function useGetSummary() {
  return useQuery<DashboardSummaryResponse>({
    queryKey: queryKeys.admin.list("summary"),
    queryFn: () => getSummary(),
  });
}

export function useListRecentOrders(params?: { limit?: number }) {
  return useQuery<DashboardOrderResponse[]>({
    queryKey: queryKeys.admin.list(params),
    queryFn: () => listRecentOrders(params),
  });
}

export function useGetDevices(params?: {
  token?: string | any | null;
  code?: string | any | null;
}) {
  return useQuery<any>({
    queryKey: queryKeys.admin.list(params),
    queryFn: () => setupAdminDevice(params),
  });
}
