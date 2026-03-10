"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  register,
  login,
  recoverDevice,
  setupTotp,
  confirmTotp,
  generateRecoveryCodes,
  listRecoveryCodes,
  getCurrentUser,
  disableTotp,
} from "../api/auth";
import {
  UserCreate,
  AdminRecoveryRequest,
  TotpConfirmRequest,
  RecoveryCodeStatusResponse,
  UserResponse,
} from "../types/openapi";
import { LoginFormValues } from "@/app/admin/login/page";

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: UserCreate }) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: LoginFormValues }) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useRecoverDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: AdminRecoveryRequest }) =>
      recoverDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useSetupTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data?: any }) => setupTotp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useConfirmTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: TotpConfirmRequest }) => confirmTotp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useGenerateRecoveryCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data?: any }) => generateRecoveryCodes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Action successful.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}

export function useListRecoveryCodes() {
  return useQuery<RecoveryCodeStatusResponse>({
    queryKey: queryKeys.auth.list(undefined),
    queryFn: () => listRecoveryCodes(),
  });
}

export function useGetCurrentUser() {
  return useQuery<UserResponse>({
    queryKey: queryKeys.auth.detail("me"),
    queryFn: () => getCurrentUser(),
  });
}

export function useDisableTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => disableTotp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Two-factor authentication disabled.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed. Please try again."));
    },
  });
}
