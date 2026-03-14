"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import { Inbox, Info, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { cn, formatNaira } from "@/lib/utils";
import { AmountDisplay } from "@/components/amount-display";
import { format, subDays, subMonths, subYears } from "date-fns";
import SuspenseContainer from "@/components/custom-suspense";
import {
  useGetSummary,
  useListRecentOrders,
  useListPayments,
} from "@/services/queries/admin";
import DateTag from "@/components/date-tag";
import OrderStatusBadge from "@/components/order-status-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ComboBox } from "@/components/ui/combo-box-2";
import { DateRangePicker } from "@/components/date-picker-select";
import { useDateRange } from "@/providers/date-range-context";

// ─── Table columns ────────────────────────────────────────────────────────────

const columns: ColumnDef[] = [
  {
    field: "id",
    headerName: "Order ID",
    renderCell: (row) => (
      <span className="font-semibold text-[#111827]">
        {row.order_reference ?? row.id}
      </span>
    ),
  },
  {
    field: "customer",
    headerName: "Customer",
    renderCell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-[#111827]">{row.customer_name}</span>
        <span className="text-[13px] text-[#6B7280]">{row.customer_email}</span>
      </div>
    ),
  },
  {
    field: "date",
    headerName: "Date Initiated",
    renderCell: (row) => <DateTag date={row.created_at} />,
  },
  {
    field: "total",
    headerName: "Total",
    renderCell: (row) => (
      <span className="font-semibold text-[#111827]">
        {formatNaira(row.total_amount)}
      </span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    renderCell: (row) => <OrderStatusBadge status={row.order_status} />,
  },
  {
    field: "actions",
    headerName: " ",
    align: "right",
    renderCell: (row) => (
      <div className="flex justify-end pr-2">
        <Link href={`/admin/orders/${row.id}`}>
          <Button variant="outline" size="sm">
            View Order
          </Button>
        </Link>
      </div>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [page, setPage] = useState(1);
  const [chartRange, setChartRange] = useState<"7D" | "1M" | "1Y" | "custom">(
    "1Y",
  );
  const [chartStatus, setChartStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Date range comes from the shared DateRangeContext (written by DateRangePicker)
  const { dateRange, setDateRange } = useDateRange();

  const activeFilterCount = [chartStatus, dateRange].filter(Boolean).length;

  const computedPaidFrom = useMemo(() => {
    // Custom date range from the picker takes priority
    if (dateRange?.from) return dateRange.from.toISOString();
    const now = new Date();
    if (chartRange === "7D") return subDays(now, 7).toISOString();
    if (chartRange === "1M") return subMonths(now, 1).toISOString();
    if (chartRange === "1Y") return subYears(now, 1).toISOString();
  }, [chartRange, dateRange]);

  const computedPaidTo = useMemo(() => {
    if (dateRange?.to) return dateRange.to.toISOString();
    return undefined;
  }, [dateRange]);

  const {
    data: summary,
    isPending: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useGetSummary();

  const {
    data: recentOrders,
    isPending: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useListRecentOrders({ limit: 10 });

  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = useListPayments({
    paid_from: computedPaidFrom,
    paid_to: computedPaidTo,
    status: chartStatus || undefined,
  });

  const paymentsArr = Array.isArray(payments) ? payments : [];

  const chartData = Object.entries(
    paymentsArr.reduce<Record<string, { value: number; ts: number }>>(
      (acc, p) => {
        const date = new Date(p.paid_at);
        const key = format(date, "dd MMM, yyyy");
        if (!acc[key]) acc[key] = { value: 0, ts: date.getTime() };
        acc[key].value += parseFloat(p.amount);
        return acc;
      },
      {},
    ),
  )
    .sort((a, b) => a[1].ts - b[1].ts)
    .map(([day, { value }]) => ({ day, value }));

  const summaryCards = [
    {
      label: "Today's Sales",
      value: <AmountDisplay amount={summary?.todays_sales} />,
    },
    { label: "In Production", value: summary?.in_production ?? "—" },
    { label: "Completed", value: summary?.completed ?? "—" },
    {
      label: "Total Revenue",
      value: <AmountDisplay amount={summary?.total_revenue} />,
    },
  ];

  return (
    <div className="space-y-0 bg-[#F8F9FA] min-h-screen">
      <Header title="Dashboard" description="Overview of your business" />

      <div className="container space-y-5 pb-10">
        {/* ── Summary cards ── */}
        <SuspenseContainer
          isLoading={isSummaryLoading}
          isError={isSummaryError}
          error={summaryError as Error | null}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 rounded-xl border bg-white overflow-hidden">
            {summaryCards.map((card, i) => (
              <div
                key={card.label}
                className={cn(
                  "p-6 relative",
                  i < summaryCards.length - 1 &&
                    "border-b md:border-b-0 md:border-r border-neutral-100",
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-neutral-500">
                    {card.label}
                  </h3>
                  <Info className="size-4 text-neutral-400" />
                </div>
                <div className="text-3xl font-bold text-[#1E202E] truncate">
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </SuspenseContainer>

        {/* ── Chart ── */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-[15px] font-semibold text-[#1E202E]">
              Transaction Activity
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {(["7D", "1M", "1Y"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setChartRange(r);
                    // Clear any custom date range from the picker
                    setDateRange(undefined);
                  }}
                  className={cn(
                    "h-8 min-w-[40px] px-3 rounded-md text-sm font-medium border transition-colors",
                    chartRange === r
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                  )}
                >
                  {r}
                </button>
              ))}

              {/* Filter button + popup */}
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "h-8 px-3 rounded-md text-sm font-medium border flex items-center gap-1.5 transition-colors",
                    activeFilterCount > 0
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                  )}
                >
                  <SlidersHorizontal size={14} />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 h-4 w-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 gap-2">
                  <p className="text-xs mb-1 font-semibold text-neutral-500 uppercase tracking-wide">
                    Filters
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Status
                    </label>
                    <ComboBox
                      className="w-full"
                      options={[
                        { value: "", label: "All Statuses" },
                        { value: "pending", label: "Pending" },
                        { value: "paid", label: "Paid" },
                        { value: "failed", label: "Failed" },
                      ]}
                      value={chartStatus}
                      onValueChange={(value) => setChartStatus(value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Date Range
                    </label>
                    <DateRangePicker className="overflow-ellipsis" />
                  </div>
                  {activeFilterCount > 0 && (
                    <Button
                      className={"mt-4"}
                      variant={"outline"}
                      onClick={() => {
                        setChartStatus("");
                        setDateRange(undefined);
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* legend */}
          <div className="flex justify-end mb-2">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              Revenue (₦)
            </span>
          </div>

          <SuspenseContainer
            isError={isError}
            error={error}
            isLoading={isLoading}
            isEmpty={payments?.length === 0}
            emptyStateProps={{
              title: chartStatus
                ? `No ${chartStatus} payments found`
                : "No payments found",
              icon: <Inbox />,
            }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#F0F0F0"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatNaira(v)}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                  }}
                  formatter={(v) => [formatNaira(Number(v)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#txGradient)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SuspenseContainer>
        </div>

        {/* ── Recent orders table ── */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <DataGrid
            loading={isOrdersLoading}
            error={ordersError as Error | null}
            isError={isOrdersError}
            emptyStateProps={{ title: "No orders yet", icon: <Inbox /> }}
            tableHeader={
              <div className="flex w-full items-center py-4 justify-between gap-4 flex-wrap">
                <h2 className="font-bold text-[#1E202E]">Recent Orders</h2>
                <div className="flex gap-2">
                  <SearchInput
                    placeholder="Search by name or reference"
                    containerClass="w-[280px]"
                  />
                  <ComboBox
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "in-production", label: "In Production" },
                      {
                        value: "ready-for-pickup",
                        label: "Ready For Pickup",
                      },
                      { value: "paid", label: "Paid" },
                      { value: "completed", label: "Completed" },
                    ]}
                    placeholder="All statuses"
                    className="w-[160px]"
                  />
                </div>
              </div>
            }
            rows={recentOrders ?? []}
            columns={columns}
            page={page}
            setPage={setPage}
            bordered={false}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
