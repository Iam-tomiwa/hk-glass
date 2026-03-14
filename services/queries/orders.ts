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
} from "../api/orders";
import {
  OrderCreate,
  OrderResponse,
  GlassTypeResponse,
  AddonResponse,
  PaymentStatus,
  OrderStatus,
  OrderUpdate,
  PaginatedResponse,
} from "../types/openapi";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: OrderCreate }) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
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

export function useSearchOrders(params?: {
  customer_name?: string | any | null;
  customer_email?: string | any | null;
  customer_phone?: string | any | null;
  reference?: string | any | null;
  glass_type_id?: string | any | null;
  payment_status?: PaymentStatus | any | null;
  order_status?: OrderStatus | any | null;
  min_width?: number | string | any | null;
  max_width?: number | string | any | null;
  min_height?: number | string | any | null;
  max_height?: number | string | any | null;
  min_area?: number | string | any | null;
  max_area?: number | string | any | null;
  min_total?: number | string | any | null;
  max_total?: number | string | any | null;
  created_from?: string | any | null;
  created_to?: string | any | null;
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

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ order_id, data }: { order_id: string; data: OrderUpdate }) =>
      updateOrder(order_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}
