"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  setupDevice
} from "../api/devices";

export function useSetupDevice(params?: { token?: string | any | null; code?: string | any | null }) {
  return useQuery<any>({
    queryKey: queryKeys.devices.list(params),
    queryFn: () => setupDevice(params),
  });
}

