import { cn } from "@/lib/utils";

export type SpecRow = {
  label: string;
  value: React.ReactNode;
  notBold?: Boolean;
  className?: string;
};

export default function SpecTable({
  rows,
  className,
}: {
  rows: SpecRow[];
  className?: string;
}) {
  return (
    <div className={className}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">{row.label}</span>
          <span
            className={cn(
              "text-sm text-gray-900",
              row.notBold ? "" : "font-semibold",
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
