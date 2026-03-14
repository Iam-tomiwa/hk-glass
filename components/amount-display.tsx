import { formatCompactNaira, formatNaira } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AmountDisplayProps {
  /** Raw amount — number or numeric string from the API */
  amount: number | string | null | undefined;
  /** Extra classes applied to the visible text span */
  className?: string;
  showFullAmount?: boolean;
}

/**
 * Renders a compact Naira amount (abbreviates ≥10k) with a tooltip on hover
 * that shows the full, precise formatted value.
 *
 * Under 10,000 the compact and full values are identical so no tooltip is shown.
 */
export function AmountDisplay({
  amount,
  className,
  showFullAmount,
}: AmountDisplayProps) {
  const compact = formatCompactNaira(amount);
  const full = formatNaira(amount);

  // Only show a tooltip when the two representations differ
  const needsTooltip = compact !== full;

  if (showFullAmount) {
    return <span className={className}>{full}</span>;
  }

  if (!needsTooltip) {
    return <span className={className}>{compact}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className={className}
        // Prevent the trigger from submitting parent forms
        type="button"
        style={{
          cursor: "default",
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        {compact}
      </TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  );
}
