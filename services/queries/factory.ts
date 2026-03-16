"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  listFactoryQueue,
  updateFactoryOrderStatus,
  getFactoryStats,
  getFactoryOrderDetail,
  reportFactoryOrderDamage,
  uploadFactoryDamageFile,
  listFactoryNotifications,
  markFactoryNotificationRead,
} from "../api/factory";
import {
  OrderResponse,
  OrderDetailResponse,
  OrderStatus,
  OrderStatusUpdate,
  OrderDamageReport,
  PaginatedResponse,
  OrderStats,
  NotificationListResponse,
} from "../types/openapi";

export function useListFactoryQueue(params?: {
  order_status?: OrderStatus | any | null;
}) {
  return useQuery<PaginatedResponse<OrderResponse>>({
    queryKey: queryKeys.factory.list(params),
    queryFn: () => listFactoryQueue(params),
  });
}

export function useGetFactoryOrderDetail(order_id: string) {
  return useQuery<OrderDetailResponse>({
    queryKey: queryKeys.factory.detail(order_id),
    queryFn: () => getFactoryOrderDetail(order_id),
    enabled: !!order_id,
  });
}

export function useGetFactoryStats() {
  return useQuery<OrderStats>({
    queryKey: queryKeys.factory.stats(),
    queryFn: () => getFactoryStats(),
  });
}

export function useUpdateFactoryOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      order_id,
      data,
    }: {
      order_id: string;
      data: OrderStatusUpdate;
    }) => updateFactoryOrderStatus(order_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.factory.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useReportFactoryOrderDamage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order_id,
      data,
      file,
    }: {
      order_id: string;
      data: OrderDamageReport;
      file?: File;
    }) => {
      let filePaths: string[] = [];
      if (file) {
        const uploaded = await uploadFactoryDamageFile(order_id, file);
        filePaths = [uploaded.file_path];
      }
      return reportFactoryOrderDamage(order_id, {
        ...data,
        damage_files: filePaths.length > 0 ? filePaths : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.factory.all });
      toast.success("Damage report submitted.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to submit damage report."));
    },
  });
}

export function useListFactoryNotifications() {
  return useQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.factory,
    queryFn: () => listFactoryNotifications(),
    refetchInterval: 30_000,
  });
}

export function useMarkFactoryNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notification_id: string) =>
      markFactoryNotificationRead(notification_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.factory,
      });
    },
  });
}
