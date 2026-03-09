"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "./openapi-keys";
import { getErrorMessage } from "@/lib/error-handler";
import {
  healthCheck
} from "../api/default";

export function useHealthCheck() {
  return useQuery<any>({
    queryKey: queryKeys.default.list(undefined),
    queryFn: () => healthCheck(),
  });
}

