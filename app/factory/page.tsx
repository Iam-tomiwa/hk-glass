"use client";

import { useState } from "react";
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
import { useListFactoryQueue } from "@/services/queries/factory";
import { Header } from "@/components/header";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      valueGetter: (row) => row.id,
    },
    {
      field: "date",
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
          <Link href={`/factory/${row.rowId}`}>
            <Button variant="outline">View Order</Button>
          </Link>
        </div>
      ),
    },
  ];

  const { data, isLoading, isError, error } = useListFactoryQueue();
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
              <div className="grid grid-cols-1 md:grid-cols-4 rounded-xl border bg-white overflow-hidden">
                {/* Box 1 */}
                <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Total Orders
                    </h3>
                    <Info className="size-4 text-neutral-400" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E202E]">50</div>
                </div>
                {/* Box 2 */}
                <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      In Production
                    </h3>
                    <Info className="size-4 text-neutral-400" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E202E]">10</div>
                </div>
                {/* Box 3 */}
                <div className="p-6 relative border-b md:border-b-0 md:border-r border-neutral-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Completed
                    </h3>
                    <Info className="size-4 text-neutral-400" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E202E]">4</div>
                </div>
                {/* Box 4 */}
                <div className="p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Ready Pickup
                    </h3>
                    <Info className="size-4 text-neutral-400" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E202E]">2</div>
                </div>
              </div>

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
                    data?.map((order) => ({
                      id: order.order_reference || order.id,
                      rowId: order.id,
                      // date: new Date(order.).toLocaleDateString(),
                      dimensions: `${order.width} x ${order.height}`,
                      thickness: order.thickness ?? "-",
                      addons: [
                        order.tint_type,
                        order.engraving_text,
                        order.drill_holes_count
                          ? `${order.drill_holes_count} Holes`
                          : null,
                      ].filter(Boolean),
                      status: order.order_status,
                    })) ?? []
                  }
                  columns={columns}
                  page={page}
                  setPage={setPage}
                  bordered={false}
                  loading={isLoading}
                  isError={isError}
                  error={error}
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
