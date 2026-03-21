"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryItem,
  getInventoryItem,
} from "../api/inventory";
import {
  InventoryItemResponse,
  InventoryItemCreate,
  InventoryItemUpdate,
  InventoryAdjustRequest,
} from "../types/openapi";

export function useListInventory() {
  return useQuery<InventoryItemResponse[]>({
    queryKey: queryKeys.inventory.list(undefined),
    queryFn: () => listInventory(),
  });
}

export function useGetInventoryItem(item_id: string) {
  return useQuery<InventoryItemResponse>({
    queryKey: queryKeys.inventory.detail(item_id),
    queryFn: () => getInventoryItem(item_id),
    enabled: !!item_id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: InventoryItemCreate }) =>
      createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      item_id,
      data,
    }: {
      item_id: string;
      data: InventoryItemUpdate;
    }) => updateInventoryItem(item_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success("Action successful.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ item_id }: { item_id: string }) =>
      deleteInventoryItem(item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success("Action successful.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useAdjustInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      item_id,
      data,
    }: {
      item_id: string;
      data: InventoryAdjustRequest;
    }) => adjustInventoryItem(item_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success("Action successful.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}
