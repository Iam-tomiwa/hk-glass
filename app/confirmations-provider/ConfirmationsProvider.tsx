"use client";

import React, { type ReactElement, useState, useRef } from "react";
import type { Confirmation, confirmOptions } from "./types";
import context from "./context";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const generateId = (() => {
  let id = 0;
  return () => ++id;
})();

const ConfirmationsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const loadingRefs = useRef<Map<string | number, (loading: boolean) => void>>(
    new Map(),
  );
  const shouldCloseRefs = useRef<Map<string | number, boolean>>(new Map());

  const openConfirmModal = (
    message: string | ReactElement,
    onConfirm: () => Promise<void> | void,
    options?: confirmOptions,
  ) => {
    const id = generateId();

    const setLoading = (loading: boolean) => {
      setConfirmations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, loading } : c)),
      );
    };

    const shouldCloseOnConfirm =
      options?.shouldCloseOnConfirm !== undefined
        ? options.shouldCloseOnConfirm
        : true;

    loadingRefs.current.set(id, setLoading);
    shouldCloseRefs.current.set(id, shouldCloseOnConfirm);

    setConfirmations((prev) => [
      ...prev,
      {
        id,
        message,
        open: true,
        onConfirm,
        loading: false,
        title: options?.title || "Confirm",
        confirmText: options?.confirmText || "Ok",
        cancelText: options?.cancelText || "Cancel",
        isDelete: options?.isDelete || false,
        shouldCloseOnConfirm,
      },
    ]);
  };

  const closeConfirmModal = () => {
    setConfirmations((prev) => {
      if (prev.length > 0) {
        const lastId = prev[prev.length - 1].id;
        loadingRefs.current.delete(lastId);
        shouldCloseRefs.current.delete(lastId);
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const setLoading = (loading: boolean) => {
    // Update loading state for the last (current) confirmation
    setConfirmations((prev) => {
      if (prev.length > 0) {
        const lastId = prev[prev.length - 1].id;
        return prev.map((c) => (c.id === lastId ? { ...c, loading } : c));
      }
      return prev;
    });
  };

  const handleConfirm = async (confirmation: Confirmation) => {
    try {
      await confirmation.onConfirm();
      // Get the current confirmation state to check shouldCloseOnConfirm
      setConfirmations((prev) => {
        const currentConfirmation = prev.find((c) => c.id === confirmation.id);
        if (currentConfirmation?.shouldCloseOnConfirm) {
          loadingRefs.current.delete(confirmation.id);
          shouldCloseRefs.current.delete(confirmation.id);
          return prev.filter((c) => c.id !== confirmation.id);
        }
        // Don't modify loading state - let the user control it
        return prev;
      });
    } catch {
      // Error handling is done by the caller
      // Don't automatically set loading to false - let the user control it
    }
  };

  const handleClose = (confirmation: Confirmation) => {
    loadingRefs.current.delete(confirmation.id);
    shouldCloseRefs.current.delete(confirmation.id);
    setConfirmations((prev) => prev.filter((c) => c.id !== confirmation.id));
  };

  return (
    <context.Provider
      value={{ openConfirmModal, closeConfirmModal, setLoading }}
    >
      {props.children}

      {confirmations.map((confirmation) => (
        <Dialog
          key={confirmation.id}
          open={confirmation.open}
          onOpenChange={(open) => {
            // Only allow closing if not loading and shouldCloseOnConfirm is true
            if (!open && !confirmation.loading) {
              // Check the current value from ref map to avoid stale closure
              const shouldClose = shouldCloseRefs.current.get(confirmation.id);
              if (shouldClose !== false) {
                handleClose(confirmation);
              }
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-[calc(var(--container-md)-100px)]! gap-0 rounded-xl p-0"
          >
            <DialogHeader className="border-b p-4">
              <DialogTitle className="text-lg">
                {confirmation?.title || "Confirm"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center text-base md:text-left p-4">
              {confirmation.message}
            </DialogDescription>
            <DialogFooter className="justify-start! px-4 pb-4">
              <Button
                className={cn(
                  "min-w-[100px]",
                  confirmation?.isDelete ? "bg-red-500!" : "",
                )}
                onClick={() => handleConfirm(confirmation)}
                disabled={confirmation.loading}
              >
                {confirmation.loading
                  ? "Loading..."
                  : confirmation?.confirmText || "Confirm"}
              </Button>
              <Button
                className={cn("min-w-[100px]")}
                variant="outline"
                type="button"
                onClick={() => handleClose(confirmation)}
                disabled={confirmation.loading}
              >
                {confirmation?.cancelText || "Cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </context.Provider>
  );
};

export default ConfirmationsProvider;
