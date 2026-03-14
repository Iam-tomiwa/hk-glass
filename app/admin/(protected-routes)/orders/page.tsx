"use client";

import { useState } from "react";
import { ComboBox } from "@/components/ui/combo-box-2";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import Link from "next/link";
import { useListOrders } from "@/services/queries/admin";
import { Inbox } from "lucide-react";
import OrderStatusBadge from "@/components/order-status-badge";
import DateTag from "@/components/date-tag";
import { AmountDisplay } from "@/components/amount-display";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      renderCell: (row) => (
        <span className="font-semibold text-[#111827]">
          {row?.order_reference}
        </span>
      ),
    },
    {
      field: "customer",
      headerName: "Customer",
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#111827]">
            {row.customer_name}
          </span>
          <span className="text-[13px] text-[#6B7280]">
            {row.customer_email}
          </span>
        </div>
      ),
    },
    {
      field: "date",
      headerName: "Date Created",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-[14px]">
          <DateTag date={row.created_at} />
        </span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      renderCell: (row) => (
        <AmountDisplay amount={row.total_amount} showFullAmount />
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
        <div className="flex center">
          <Link href={`/admin/orders/${row.id}`}>
            <Button variant="outline" size="sm">
              View Order
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const { data, isLoading, error, isError } = useListOrders();
  return (
    <div className="space-y-8">
      <Header
        title="Orders"
        description="Monitor sales and production operations"
      />

      <div className="container space-y-8">
        {/* Table */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <DataGrid
            tableHeader={
              <div className="flex w-full items-center py-4 justify-between gap-4 flex-wrap">
                <h2 className="font-bold">Order History</h2>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                  <SearchInput
                    containerClass="w-[280px] flex-grow"
                    placeholder="Search by Order ID, customer name, or email..."
                  />

                  <ComboBox
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "in-production", label: "In Production" },
                      { value: "ready-for-pickup", label: "Ready for Pickup" },
                      { value: "paid", label: "Paid" },
                      { value: "completed", label: "Completed" },
                    ]}
                    placeholder="All Statuses"
                    className="w-[150px]"
                  />
                </div>
              </div>
            }
            rows={data?.items || []}
            emptyStateProps={{
              title: "No Orders Found",
              icon: <Inbox />,
            }}
            isError={isError}
            error={error}
            loading={isLoading}
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
