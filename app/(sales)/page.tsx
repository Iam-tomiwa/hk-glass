"use client";

import { useState, useEffect } from "react";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combo-box-2";
import { Search, Plus, Info } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/utils";
import { Header } from "@/components/header";
import { useSearchOrders } from "@/services/queries/orders";
import { OrderResponse } from "@/services/types/openapi";
import OrderStatusBadge from "@/components/order-status-badge";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const getStatusParams = (): {
    order_status?: "in_production" | "completed" | "ready_pickup";
    payment_status?: "paid";
  } => {
    switch (statusFilter) {
      case "production":
        return { order_status: "in_production" };
      case "paid":
        return { payment_status: "paid" };
      case "completed":
        return { order_status: "completed" };
      case "ready":
        return { order_status: "ready_pickup" };
      default:
        return {};
    }
  };

  const {
    data: orders,
    isLoading,
    error,
    isError,
  } = useSearchOrders({
    customer_name: debouncedSearch || null,
    ...getStatusParams(),
  });

  const inProductionCount =
    orders?.items.filter((o) => o.order_status === "in_production").length ?? 0;
  const completedCount =
    orders?.items.filter((o) => o.order_status === "completed").length ?? 0;
  const readyCount =
    orders?.items.filter((o) => o.order_status === "ready_for_pickup").length ??
    0;

  const columns: ColumnDef[] = [
    {
      field: "order_reference",
      headerName: "Order ID",
      renderCell: (row: OrderResponse) => (
        <span className="text-sm font-medium text-[#4B5563] whitespace-nowrap">
          {row.order_reference || row.id}
        </span>
      ),
    },
    {
      field: "customer_name",
      headerName: "Customer",
      renderCell: (row: OrderResponse) => (
        <span className="text-sm text-[#4B5563] whitespace-nowrap">
          {row.customer_name}
        </span>
      ),
    },
    {
      field: "customer_email",
      headerName: "Customer's Email",
      renderCell: (row: OrderResponse) => (
        <span className="text-sm text-[#4B5563] whitespace-nowrap">
          {row.customer_email}
        </span>
      ),
    },
    {
      field: "total_amount",
      headerName: "Total",
      renderCell: (row: OrderResponse) => (
        <span className="text-sm font-semibold text-[#1E202E] whitespace-nowrap">
          {formatNaira(row.total_amount)}
        </span>
      ),
    },
    {
      field: "order_status",
      headerName: "Status",
      renderCell: (row: OrderResponse) => (
        <OrderStatusBadge status={row.order_status} />
      ),
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: (row: OrderResponse) => (
        <div className="flex justify-end pr-4">
          <Link href={`/${row.order_reference}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 font-medium rounded-md px-3 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            >
              View Order
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#F8F9FA]">
      <div className="mx-auto">
        <Header
          title="Orders"
          description="Manage and track all glass manufacturing orders"
        >
          <Link href="/new-order" passHref>
            <Button className="gap-2 bg-[#00AE4D] text-white hover:bg-[#009b44] rounded-md h-10 px-4 border-none">
              <Plus className="size-4" />
              New Order
            </Button>
          </Link>
        </Header>
        <div className="container space-y-4 pt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 rounded-xl border bg-white overflow-hidden">
            <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-500">
                  Total Orders
                </h3>
                <Info className="size-4 text-neutral-400" />
              </div>
              <div className="text-4xl font-bold text-[#1E202E]">
                {orders?.total ?? 0}
              </div>
            </div>
            <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-500">
                  In Production
                </h3>
                <Info className="size-4 text-neutral-400" />
              </div>
              <div className="text-4xl font-bold text-[#1E202E]">
                {inProductionCount}
              </div>
            </div>
            <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-500">
                  Completed
                </h3>
                <Info className="size-4 text-neutral-400" />
              </div>
              <div className="text-4xl font-bold text-[#1E202E]">
                {completedCount}
              </div>
            </div>
            <div className="p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-500">
                  Ready Pickup
                </h3>
                <Info className="size-4 text-neutral-400" />
              </div>
              <div className="text-4xl font-bold text-[#1E202E]">
                {readyCount}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="rounded-xl border bg-white">
            <div className="flex flex-col sm:flex-row justify-between p-4 border-b border-neutral-100 gap-4">
              <h2 className="text-base font-semibold text-[#1E202E]">
                Order History
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-[350px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or reference"
                    className="w-full pl-9 h-10 rounded-md"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <ComboBox
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v)}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "production", label: "In Production" },
                    { value: "paid", label: "Paid" },
                    { value: "completed", label: "Completed" },
                    { value: "ready", label: "Ready Pickup" },
                  ]}
                  placeholder="All statuses"
                  className="w-[140px]"
                />
              </div>
            </div>

            <DataGrid
              rows={orders?.items ?? []}
              columns={columns}
              page={page}
              loading={isLoading}
              setPage={setPage}
              bordered={false}
              error={error}
              isError={isError}
              isPaginated
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
