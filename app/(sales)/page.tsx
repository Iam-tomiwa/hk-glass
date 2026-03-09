"use client";

import { useState } from "react";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Info } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getBadgeClassName } from "@/lib/utils";
import { order_data } from "@/lib/constant";
import { Header } from "@/components/header";

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      renderCell: (row) => (
        <span className="text-sm font-medium text-[#4B5563] whitespace-nowrap">
          {row.id}
        </span>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer",
      renderCell: (row) => (
        <span className="text-sm text-[#4B5563] whitespace-nowrap">
          {row.customerName}
        </span>
      ),
    },
    {
      field: "customerEmail",
      headerName: "Customer's Email",
      renderCell: (row) => (
        <span className="text-sm text-[#4B5563] whitespace-nowrap">
          {row.customerEmail}
        </span>
      ),
    },
    {
      field: "date",
      headerName: "Date Inititated",
      renderCell: (row) => (
        <span className="text-sm text-[#4B5563] whitespace-nowrap">
          {row.date}
        </span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      renderCell: (row) => (
        <span className="text-sm font-semibold text-[#1E202E] whitespace-nowrap">
          ${row.total.toFixed(2)}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => {
        return (
          <Badge
            variant="secondary"
            className={`flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full ${getBadgeClassName(row.status).badgeClasses}`}
          >
            {row.status}
          </Badge>
        );
      },
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: () => (
        <div className="flex justify-end pr-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 font-medium rounded-md px-3 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            View Order
          </Button>
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

                <Select defaultValue="all">
                  <SelectTrigger className="max-w-[140px] h-10 rounded-md bg-white font-medium text-sm text-neutral-700">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="production">In Production</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ready">Ready Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DataGrid
              rows={order_data}
              columns={columns}
              page={page}
              setPage={setPage}
              bordered={false}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
