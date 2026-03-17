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
  const visibleRows = rows.filter((row) => {
    const val = row.value;
    if (val === null || val === undefined || val === "") return false;
    if (typeof val === "string" && (val.trim() === "—" || val.trim() === "__"))
      return false;
    return true;
  });

  if (visibleRows.length === 0) return null;

  return (
    <div className={className}>
      {visibleRows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">{row.label}</span>
          <span
            className={cn(
              "text-sm text-gray-900 text-right",
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
