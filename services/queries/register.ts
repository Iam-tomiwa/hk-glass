"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  registerChildren,
  fetchClasses,
  fetchLocations,
  IRegistrationPayload,
  IClassResponse,
  ILocationResponse,
} from "../api/register-training";
import { queryKeys } from "./keys";
import { getErrorMessage } from "@/lib/error-handler";
import { TApiResponse } from "../types/api.type";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: IRegistrationPayload) => registerChildren(data),
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, "Failed to register. Please try again."),
      );
    },
  });
}

export function useFetchClasses() {
  return useQuery<TApiResponse<IClassResponse>>({
    queryKey: queryKeys.register.classes(),
    queryFn: fetchClasses,
  });
}

export function useFetchLocations() {
  return useQuery<TApiResponse<ILocationResponse>>({
    queryKey: queryKeys.register.locations(),
    queryFn: fetchLocations,
  });
}
