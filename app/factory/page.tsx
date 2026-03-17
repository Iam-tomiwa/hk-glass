"use client";

import { useState, useEffect } from "react";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComboBox } from "@/components/ui/combo-box-2";
import { Search, Info, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScanOrderPage from "./scan-order";
import Link from "next/link";
import {
  useGetFactoryStats,
  useListFactoryQueue,
} from "@/services/queries/factory";
import { Header } from "@/components/header";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";
import { StatsGrid } from "@/components/stats-grid";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const getStatusParam = () => {
    switch (statusFilter) {
      case "production":
        return "in_production";
      case "completed":
        return "completed";
      case "ready":
        return "ready_for_pickup";
      default:
        return undefined;
    }
  };

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      valueGetter: (row) => row.id,
    },
    {
      field: "created_at",
      headerName: "Date Inititated",
      renderCell: (row) => <DateTag date={row.created_at} />,
    },
    {
      field: "dimensions",
      headerName: "Dimensions",
      valueGetter: (row) => row.dimensions,
    },
    {
      field: "thickness",
      headerName: "Thickness",
      valueGetter: (row) => row.thickness,
    },
    {
      field: "add-ons",
      headerName: "Add Ons",
      renderCell: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.addons.slice(0, 3).map((el: string) => (
            <Badge
              key={el}
              hideDot
              variant="secondary"
              className="bg-[#F1F5F9] rounded"
            >
              {el}
            </Badge>
          ))}
          {row.addons.slice(3).length > 0 && (
            <Badge variant="secondary" hideDot className="bg-[#F1F5F9] rounded">
              +{row.addons.slice(3).length}
            </Badge>
          )}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => {
        return <OrderStatusBadge status={row.status} />;
      },
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: (row) => (
        <div className="flex justify-end pr-4">
          <Link href={`/factory/${row.id}`}>
            <Button variant="outline">View Order</Button>
          </Link>
        </div>
      ),
    },
  ];
  const { data: stats } = useGetFactoryStats();
  const { data, isLoading, isError, error } = useListFactoryQueue({
    order_status: getStatusParam(),
  });
  return (
    <div className="bg-[#F8F9FA]">
      <div className="mx-auto">
        <Header
          title="Orders"
          description="Manage and track all glass manufacturing orders"
          className="mb-0"
        />

        <Tabs defaultValue={"order-queue"} orientation="horizontal">
          {/* Sidebar / Top Nav */}
          <div className="bg-background mb-6 border-b">
            <TabsList className="px-6 py-0 flex h-auto w-full justify-start items-start space-x-4 bg-transparent overflow-x-auto rounded-none border-none">
              <TabsTrigger
                className="shadow-none! pt-4 pb-3 bg-none data-[state=active]:border-b rounded-none data-[state=active]:border-b-black h-full"
                value={"scan"}
              >
                Scan Order
              </TabsTrigger>
              <TabsTrigger
                className="shadow-none! py-4 bg-none data-[state=active]:border-b rounded-none data-[state=active]:border-b-black h-full"
                value={"order-queue"}
              >
                Production Queue
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="order-queue">
            <div className="container space-y-4 pb-10">
              {/* Summary Cards */}
              <StatsGrid
                stats={[
                  { label: "Total Orders", value: stats?.total_orders ?? "--" },
                  {
                    label: "In Production",
                    value: stats?.in_production ?? "--",
                  },
                  { label: "Completed", value: stats?.completed ?? "--" },
                  { label: "Ready Pickup", value: stats?.ready_pickup ?? "--" },
                ]}
              />
              {/* Table Section */}
              <div className="rounded-xl border bg-white">
                {/* Table Toolbar */}
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
                  rows={
                    (data?.items ?? [])
                    .filter((order) => {
                      if (!debouncedSearch) return true;
                      const q = debouncedSearch.toLowerCase();
                      return (
                        order.order_reference?.toLowerCase().includes(q) ||
                        order.customer_name?.toLowerCase().includes(q)
                      );
                    })
                    .map((order) => ({
                      id: order.order_reference || order.id,
                      rowId: order.id,
                      created_at: order.created_at,
                      dimensions: `${order.width} x ${order.length}`,
                      thickness: order.thickness ?? "-",
                      addons: [
                        order.tint_type,
                        order.engraving_text,
                        order.drill_holes_count
                          ? `${order.drill_holes_count} Holes`
                          : null,
                      ].filter(Boolean),
                      status: order.order_status,
                    }))
                  }
                  columns={columns}
                  page={page}
                  setPage={setPage}
                  bordered={false}
                  loading={isLoading}
                  isError={isError}
                  error={error}
                  isPaginated
                  className="w-full"
                  emptyStateProps={{
                    title: "No Orders Found",
                    icon: <ShoppingBag />,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scan">
            <ScanOrderPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
