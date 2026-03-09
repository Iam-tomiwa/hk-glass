import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

interface Props {
  current: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
}

export const Pagination = ({
  current,
  onPageChange,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  itemLabel = "items",
}: Props) => {
  const goToPrevious = useCallback(() => {
    if (current > 1) onPageChange(current - 1);
  }, [current, onPageChange]);

  const goToNext = useCallback(() => {
    if (current < totalPages) onPageChange(current + 1);
  }, [current, totalPages, onPageChange]);

  const startItem = (current - 1) * itemsPerPage + 1;
  const endItem =
    totalItems != null
      ? Math.min(current * itemsPerPage, totalItems)
      : current * itemsPerPage;

  return (
    <div className="flex w-full items-center justify-center gap-4 px-6 py-4">
      <button
        disabled={current <= 1}
        onClick={goToPrevious}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {totalItems != null && (
        <span className="text-sm text-[#6B7280]">
          Showing {startItem}–{endItem} of {totalItems} {itemLabel}.
        </span>
      )}

      <button
        disabled={current >= totalPages}
        onClick={goToNext}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
