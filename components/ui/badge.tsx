import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "capitalize h-[28px] gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-[#DFDFDF] text-[#474747]",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#FAB2B2] [a]:hover:bg-[#FAB2B2] focus-visible:ring-[#FAB2B2] dark:focus-visible:ring-[#FAB2B2] text-[#7C3232] dark:bg-[#FAB2B2]",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        info: "bg-[#B2E3FA] text-[#324F7C]",
        success: "bg-[#B8FAB2] text-[#327C3F]",
        pending: "bg-[#FAEEB2] text-[#7C3232]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends useRender.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  hideDot?: boolean;
}

function Badge({
  className,
  variant = "default",
  hideDot = false,
  render,
  children,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
        children: (
          <>
            {!hideDot && (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-current"
              />
            )}
            {children}
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
