import { Blocks } from "lucide-react";
import { Input } from "@/components/ui/input";
import SuspenseContainer from "@/components/custom-suspense";

export type PriceMap = Record<string, string>;

export default function PriceTable({
  title,
  fields,
  values,
  onChange,
  disabled,
  suffix = "$",
  defaults,
  isLoading = false,
  isError = false,
  error = null,
}: {
  title: string;
  fields: { key: string; label: string; unit: string }[];
  values: PriceMap;
  onChange: (key: string, val: string) => void;
  disabled: boolean;
  suffix?: "$" | "%";
  defaults?: PriceMap;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-[15px] font-semibold text-[#1E202E]">{title}</h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left text-[13px] font-semibold px-6 py-3 w-1/3">
              Service
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3 w-1/3">
              Unit
            </th>
            <th className="text-left text-[13px] font-semibold px-4 py-3">
              {suffix === "$" ? "Price ($)" : "Rate (%)"}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>
              <SuspenseContainer
                isLoading={isLoading}
                isError={isError}
                error={error}
                isEmpty={!isLoading && fields.length === 0}
                emptyStateProps={{
                  title: "No items found",
                  icon: <Blocks />,
                  subTitle: "Click 'Add New Product' button to add a new item",
                }}
              >
                <></>
              </SuspenseContainer>
            </td>
          </tr>
          {!isLoading &&
            !isError &&
            fields.length > 0 &&
            fields.map((field, i) => {
              const hasValue =
                values[field.key] !== undefined && values[field.key] !== "";
              const defaultVal = defaults?.[field.key];
              const viewDisplayValue = hasValue
                ? values[field.key]
                : (defaultVal ?? "");

              return (
                <tr
                  key={field.key}
                  className={
                    i < fields.length - 1 ? "border-b border-neutral-100" : ""
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#1E202E]">
                    {field.label}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-500">
                    {field.unit}
                  </td>
                  <td className="px-4 py-4">
                    {disabled ? (
                      <div className="flex items-center gap-2">
                        {suffix === "$" && (
                          <span className="text-sm font-medium text-neutral-400">
                            $
                          </span>
                        )}
                        <div className="h-9 max-w-[160px] w-full flex items-center px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-400 select-none">
                          {viewDisplayValue
                            ? Number(viewDisplayValue).toLocaleString()
                            : "—"}
                        </div>
                        {suffix === "%" && (
                          <span className="text-sm font-medium text-neutral-400">
                            %
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {suffix === "$" && (
                          <span className="text-sm font-medium text-neutral-500">
                            $
                          </span>
                        )}
                        <Input
                          type="number"
                          placeholder={
                            suffix === "$" ? "Enter Amount" : "Enter Rate"
                          }
                          value={values[field.key] ?? ""}
                          onChange={(e) => onChange(field.key, e.target.value)}
                          className="h-9 max-w-[160px] text-sm border-neutral-200 bg-white focus-visible:ring-[#00AE4D] placeholder:text-neutral-400"
                        />
                        {suffix === "%" && (
                          <span className="text-sm font-medium text-neutral-500">
                            %
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
