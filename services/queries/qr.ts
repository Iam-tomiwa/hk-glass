"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./openapi-keys";
import { getOrderByQr } from "../api/qr";
import { OrderResponse } from "../types/openapi";

export function useGetOrderByQr(token?: string) {
  return useQuery<OrderResponse>({
    queryKey: queryKeys.qr.detail(token!),
    queryFn: () => getOrderByQr(token!),
    enabled: !!token,
  });
}
