"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  createOrder,
  listGlassTypes,
  listAddons,
  searchOrders,
  updateOrder,
  deleteOrder,
  getOrderByReference,
  getOrderById,
  reviewOrder,
  getOrderFiles,
  listStaffNotifications,
  markStaffNotificationRead,
  sendReviewEmail,
  getOrderPricingSettings,
} from "../api/orders";
import {
  OrderCreate,
  OrderResponse,
  OrderReviewRequest,
  OrderReviewResponse,
  GlassTypeResponse,
  AddonResponse,
  PaymentStatus,
  OrderStatus,
  OrderUpdate,
  PaginatedResponse,
  OrderFileLinksResponse,
  NotificationListResponse,
  OrderReviewEmailRequest,
  OrderReviewEmailResponse,
} from "../types/openapi";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: OrderCreate }) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Action successful.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListGlassTypes() {
  return useQuery<GlassTypeResponse[]>({
    queryKey: [...queryKeys.orders.all, "glass-types"],
    queryFn: () => listGlassTypes(),
  });
}

export function useListAddons() {
  return useQuery<AddonResponse[]>({
    queryKey: [...queryKeys.orders.all, "addons"],
    queryFn: () => listAddons(),
  });
}

export function useGetOrderPricingSettings() {
  return useQuery({
    queryKey: [...queryKeys.orders.all, "pricing-settings"],
    queryFn: () => getOrderPricingSettings(),
    staleTime: Infinity,
  });
}

export function useSearchOrders(params?: {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  reference?: string | null;
  glass_type_id?: string | null;
  payment_status?: PaymentStatus | null;
  order_status?: OrderStatus | null;
  min_width?: number | string | null;
  max_width?: number | string | null;
  min_height?: number | string | null;
  max_height?: number | string | null;
  min_area?: number | string | null;
  max_area?: number | string | null;
  min_total?: number | string | null;
  max_total?: number | string | null;
  created_from?: string | null;
  created_to?: string | null;
}) {
  return useQuery<PaginatedResponse<OrderResponse>>({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => searchOrders(params),
  });
}

export function useGetOrderByReference(order_reference: string) {
  return useQuery<OrderResponse>({
    queryKey: queryKeys.orders.detail(order_reference),
    queryFn: () => getOrderByReference(order_reference),
    enabled: !!order_reference,
  });
}

export function useGetOrderById(order_id: string) {
  return useQuery<OrderResponse>({
    queryKey: queryKeys.orders.detail(order_id),
    queryFn: () => getOrderById(order_id),
    enabled: !!order_id,
  });
}

export function useGetOrderFiles(order_id: string) {
  return useQuery<OrderFileLinksResponse>({
    queryKey: queryKeys.orders.files(order_id),
    queryFn: () => getOrderFiles(order_id),
    enabled: !!order_id,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ order_id, data }: { order_id: string; data: OrderUpdate }) =>
      updateOrder(order_id, data),
    onSuccess: (res, { order_id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.files(order_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(res.order_reference),
      });
      toast.success("Order details updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ order_id }: { order_id: string }) => deleteOrder(order_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Action successful.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useReviewOrder() {
  return useMutation<OrderReviewResponse, Error, { data: OrderReviewRequest }>({
    mutationFn: ({ data }) => reviewOrder(data),
  });
}

export function useSendReviewEmail() {
  return useMutation<
    OrderReviewEmailResponse,
    Error,
    { order_id: string; data?: OrderReviewEmailRequest }
  >({
    mutationFn: ({ order_id, data }) => sendReviewEmail(order_id, data),
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          "Failed to send review email. Please try again.",
        ),
      );
    },
  });
}

export function useListStaffNotifications() {
  return useQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.staff,
    queryFn: () => listStaffNotifications(),
    refetchInterval: 30_000,
  });
}

export function useMarkStaffNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notification_id: string) =>
      markStaffNotificationRead(notification_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.staff,
      });
    },
  });
}
