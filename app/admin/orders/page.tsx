"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  "In Production": "bg-blue-100 text-blue-700",
  "Ready for Pickup": "bg-indigo-100 text-indigo-700",
  Paid: "bg-green-100 text-green-700",
  Completed: "bg-purple-100 text-purple-700",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      renderCell: (row) => (
        <span className="font-semibold text-[#111827]">{row.id}</span>
      ),
    },
    {
      field: "customer",
      headerName: "Customer",
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#111827]">
            {row.customer.name}
          </span>
          <span className="text-[13px] text-[#6B7280]">
            {row.customer.email}
          </span>
        </div>
      ),
    },
    {
      field: "date",
      headerName: "Date Created",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-[14px]">{row.date}</span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      renderCell: (row) => (
        <span className="font-semibold text-[#111827]">{row.total}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => (
        <Badge
          variant="secondary"
          className={`flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full ${statusStyles[row.status]}`}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: () => (
        <div className="flex center">
          <Link href={"/admin/orders/123"}>
            <Button variant="outline" size="sm">
              View Order
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const data = [
    {
      id: "ORD-2026-001",
      customer: { name: "John Smith", email: "john.smith@example.com" },
      date: "Feb 20, 2026",
      status: "In Production",
      total: "$842.40",
    },
    {
      id: "ORD-2026-002",
      customer: { name: "Sarah Johnson", email: "sarah.j@example.com" },
      date: "Feb 19, 2026",
      status: "Ready for Pickup",
      total: "$978.50",
    },
    {
      id: "ORD-2026-003",
      customer: { name: "Michael Chen", email: "mchen@example.com" },
      date: "Mar 04, 2026",
      status: "Paid",
      total: "$1245.60",
    },
    {
      id: "ORD-2026-004",
      customer: { name: "Emily Rodriguez", email: "emily.r@example.com" },
      date: "Mar 03, 2026",
      status: "Completed",
      total: "$456.75",
    },
    {
      id: "ORD-2026-005",
      customer: { name: "David Wilson", email: "dwilson@example.com" },
      date: "Mar 02, 2026",
      status: "In Production",
      total: "$1876.30",
    },
  ];

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
                <div className="flex gap-2 min-w-[60%]">
                  <SearchInput
                    containerClass="flex-grow"
                    placeholder="Search by Order ID, customer name, or email..."
                  />

                  <div className="w-[200px] shrink-0">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full h-full">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="in-production">
                          In Production
                        </SelectItem>
                        <SelectItem value="ready-for-pickup">
                          Ready for Pickup
                        </SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
            rows={data}
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
