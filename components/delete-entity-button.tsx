"use client";

import { ReactNode, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { del } from "@/lib/axios-setup";
import { queryKeys } from "@/services/queries/openapi-keys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type DeleteEntityType = "glass-type" | "addon" | "inventory-item";

const entityConfig: Record<
  DeleteEntityType,
  { endpoint: string; queryKey: readonly unknown[]; label: string }
> = {
  "glass-type": {
    endpoint: "/api/admin/glass-types",
    queryKey: queryKeys.admin.all,
    label: "glass type",
  },
  addon: {
    endpoint: "/api/admin/addons",
    queryKey: queryKeys.admin.all,
    label: "addon",
  },
  "inventory-item": {
    endpoint: "/api/admin/inventory",
    queryKey: queryKeys.inventory.all,
    label: "inventory item",
  },
};

interface DeleteEntityButtonProps {
  /**
   * Predefined entity type. Automatically resolves the URL and query key.
   * Either `type` + `id`, or both `url` + `queryKey` must be provided.
   */
  type?: DeleteEntityType;
  /** Entity id — appended as a path segment to the entity's configured endpoint. */
  id?: string;
  /**
   * Full DELETE URL override. Use this when no predefined type covers the
   * endpoint, e.g. a one-off endpoint not listed in entityConfig.
   */
  url?: string;
  /** Query key to invalidate after deletion. Required when using `url`. */
  queryKey?: readonly unknown[];
  /** Display name of the specific item, shown in the confirmation message. */
  name: string;
  /** Override the entity label used in the confirmation message. */
  label?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  btnProps?: ButtonProps;
}

export default function DeleteEntityButton({
  type,
  id,
  url,
  queryKey,
  name,
  label,
  onSuccess,
  disabled = false,
  children,
  btnProps,
}: DeleteEntityButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const resolvedUrl =
    url ?? (type && id ? `${entityConfig[type].endpoint}/${id}` : null);
  const resolvedQueryKey =
    queryKey ?? (type ? entityConfig[type].queryKey : null);
  const resolvedLabel = label ?? (type ? entityConfig[type].label : "item");

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!resolvedUrl) throw new Error("No delete URL resolved.");
      return del(resolvedUrl);
    },
    onSuccess: () => {
      if (resolvedQueryKey) {
        queryClient.invalidateQueries({ queryKey: resolvedQueryKey });
      }
      toast.success(
        `${resolvedLabel.charAt(0).toUpperCase() + resolvedLabel.slice(1)} deleted successfully.`,
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, "Failed to delete. Please try again."),
      );
    },
  });

  return (
    <>
      <Button
        variant="outline"
        disabled={deleteMutation.isPending || disabled}
        {...btnProps}
        onClick={() => setOpen(true)}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : children ? (
          children
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {resolvedLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{name}</span>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
