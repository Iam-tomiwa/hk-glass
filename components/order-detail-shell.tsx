"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import SuspenseContainer from "@/components/custom-suspense";
import Link from "next/link";
import { X } from "lucide-react";

interface OrderDetailShellProps {
  /** Displayed in the page header, e.g. "Order ID: ORD-2026-001" */
  description: string;
  /** href for the close (×) button — typically the list page */
  backHref: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** Left column content (glass specs, customer info, etc.) */
  leftCard: ReactNode;
  /** Right column content (QR code, timeline, etc.) */
  rightCard: ReactNode;
}

/**
 * Shared outer shell used by both the sales and factory order-detail pages.
 * Handles the Header, close button, SuspenseContainer and the two-column grid.
 */
export function OrderDetailShell({
  description,
  backHref,
  isLoading,
  isError,
  error,
  leftCard,
  rightCard,
}: OrderDetailShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header title="Order Details" description={description}>
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 rounded-full h-10 w-10"
          >
            <X className="size-5" />
          </Button>
        </Link>
      </Header>

      <SuspenseContainer isLoading={isLoading} isError={isError} error={error}>
        <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-6 px-4 xl:px-0">
          {leftCard}
          {rightCard}
        </div>
      </SuspenseContainer>
    </div>
  );
}
