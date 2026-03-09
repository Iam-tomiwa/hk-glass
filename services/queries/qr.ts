"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  getOrderByQr
} from "../api/qr";
import { OrderPublicDetailResponse } from "../types/openapi";

export function useGetOrderByQr(token: string) {
  return useQuery<OrderPublicDetailResponse>({
    queryKey: queryKeys.qr.detail(token),
    queryFn: () => getOrderByQr(token),
  });
}

