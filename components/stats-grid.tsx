import { Info } from "lucide-react";

type StatItem = {
  label: string;
  value: number | string;
};

export function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 rounded-xl border bg-white overflow-hidden">
      {stats.map((stat, index) => {
        const isLast = index === stats.length - 1;

        return (
          <div
            key={stat.label}
            className={`p-6 relative border-neutral-100
              border-b md:border-b-0
              ${!isLast ? "md:border-r" : ""}
            `}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-neutral-500">
                {stat.label}
              </h3>
              <Info className="size-4 text-neutral-400" />
            </div>

            <div className="text-4xl font-bold text-[#1E202E]">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
