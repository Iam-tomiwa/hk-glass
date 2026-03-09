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
import { Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getBadgeClassName } from "@/lib/utils";
import { order_data } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScanOrderPage from "./scan-order";
import Link from "next/link";

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const columns: ColumnDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      valueGetter: (row) => row.id,
    },
    {
      field: "date",
      headerName: "Date Inititated",
      valueGetter: (row) => row.date,
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
            <Badge key={el} hideDot variant="secondary" className="...">
              {el}
            </Badge>
          ))}

          <Badge variant="secondary" hideDot className="...">
            +{row.addons.slice(3).length}
          </Badge>
        </div>
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
          <Link href={"/factory/123"}>
            <Button variant="outline" size="sm">
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
        {/* Header */}
        <div className="bg-background border-b">
          <div className="container py-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E202E]">
              Orders
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage and track all glass manufacturing orders
            </p>
          </div>
        </div>

        <Tabs orientation="horizontal">
          {/* Sidebar / Top Nav */}
          <div className="bg-background mb-6 border-b">
            <TabsList
              defaultValue={"order-queue"}
              className="p-0 flex container h-auto w-full justify-start items-start space-x-4 bg-transparent overflow-x-auto rounded-none border-none"
            >
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
            <div className="container space-y-4">
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
                        <SelectItem value="production">
                          In Production
                        </SelectItem>
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
          </TabsContent>

          <TabsContent value="scan">
            <ScanOrderPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
