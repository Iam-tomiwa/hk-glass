"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  initializePayment,
  paystackCallback,
  paystackCallbackRedirect
} from "../api/payments";
import { PaymentInitialize, PaymentInitResponse, PaystackCallback, PaymentResponse } from "../types/openapi";

export function useInitializePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: PaymentInitialize }) => initializePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function usePaystackCallback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: PaystackCallback }) => paystackCallback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function usePaystackCallbackRedirect(params?: { reference?: string | any | null; trxref?: string | any | null }) {
  return useQuery<PaymentResponse>({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => paystackCallbackRedirect(params),
    enabled: !!(params?.reference || params?.trxref),
    refetchOnWindowFocus: false,
    retry: false,
  });
}

