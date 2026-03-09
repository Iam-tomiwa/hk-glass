import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const circularProgressVariants = cva("inline-block animate-spin", {
	variants: {
		size: {
			default: "h-6 w-6",
			sm: "h-4 w-4",
			lg: "h-8 w-8",
			xl: "h-12 w-12",
			"2xl": "h-16 w-16",
			"3xl": "h-24 w-24",
		},
		variant: {
			default: "text-primary",
			secondary: "text-secondary",
			muted: "text-muted-foreground",
			destructive: "text-destructive",
		},
	},
	defaultVariants: {
		size: "default",
		variant: "default",
	},
});

export interface CircularProgressProps
	extends React.SVGAttributes<SVGElement>,
		VariantProps<typeof circularProgressVariants> {
	value?: number; // 0-100 for determinate progress
	strokeWidth?: number;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
	({ className, size, variant, value, strokeWidth = 2, ...props }, ref) => {
		const isIndeterminate = value === undefined;
		const radius = 20;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = isIndeterminate
			? 0
			: circumference - (value / 100) * circumference;

		return (
			<svg
				ref={ref}
				className={cn(
					circularProgressVariants({ size, variant }),
					!isIndeterminate && "animate-none",
					className
				)}
				viewBox="0 0 50 50"
				{...props}
			>
				{/* Background circle */}
				<circle
					cx="25"
					cy="25"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="opacity-20"
				/>
				{/* Progress circle */}
				<circle
					cx="25"
					cy="25"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className={cn(
						"transition-all duration-300 ease-in-out",
						isIndeterminate &&
							"animate-[spin_1.4s_ease-in-out_infinite] [stroke-dasharray:80,200] [stroke-dashoffset:0]"
					)}
					style={{
						transform: "rotate(-90deg)",
						transformOrigin: "50% 50%",
					}}
				/>
			</svg>
		);
	}
);

CircularProgress.displayName = "CircularProgress";

// eslint-disable-next-line react-refresh/only-export-components
export { CircularProgress, circularProgressVariants };
