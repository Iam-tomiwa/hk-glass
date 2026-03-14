"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  listFactoryQueue,
  updateFactoryOrderStatus,
  getFactoryStats,
} from "../api/factory";
import {
  OrderResponse,
  OrderStatus,
  OrderStatusUpdate,
  PaginatedResponse,
  OrderStats,
} from "../types/openapi";

export function useListFactoryQueue(params?: {
  order_status?: OrderStatus | any | null;
}) {
  return useQuery<PaginatedResponse<OrderResponse>>({
    queryKey: queryKeys.factory.list(params),
    queryFn: () => listFactoryQueue(params),
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
