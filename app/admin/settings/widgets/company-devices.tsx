"use client";

import { useState } from "react";
import SearchInput from "@/components/search-input";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DeviceRole = "Staff - Sales" | "Staff - FW" | "Admin";
type DeviceStatus = "Active" | "Pending";

interface CompanyDevice {
  id: string;
  staffName: string;
  deviceName: string;
  lastLogin: string;
  role: DeviceRole;
  status: DeviceStatus;
}

const INITIAL_DATA: CompanyDevice[] = [
  {
    id: "1",
    staffName: "John Smith",
    deviceName: "Sales Terminal 1",
    lastLogin: "Mar 05, 2026 9:15 AM",
    role: "Staff - Sales",
    status: "Active",
  },
  {
    id: "2",
    staffName: "Sarah Johnson",
    deviceName: "Factory Station 1",
    lastLogin: "Mar 05, 2026 8:30 AM",
    role: "Staff - FW",
    status: "Active",
  },
  {
    id: "3",
    staffName: "Mike Wilson",
    deviceName: "Factory Station 2",
    lastLogin: "Mar 04, 2026 4:45 PM",
    role: "Staff - Sales",
    status: "Active",
  },
  {
    id: "4",
    staffName: "Emily Davis",
    deviceName: "Tablet - iPad Pro",
    lastLogin: "Mar 03, 2026 2:20 PM",
    role: "Staff - FW",
    status: "Pending",
  },
  {
    id: "5",
    staffName: "John Wikens",
    deviceName: "Sales Terminal 2",
    lastLogin: "Mar 05, 2026 9:15 AM",
    role: "Admin",
    status: "Active",
  },
  {
    id: "6",
    staffName: "Tyler Durden",
    deviceName: "Factory Station 3",
    lastLogin: "Mar 05, 2026 8:30 AM",
    role: "Admin",
    status: "Active",
  },
];

function RoleBadge({ role }: { role: DeviceRole }) {
  const isAdmin = role === "Admin";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full text-[12px]",
        isAdmin ? "bg-[#F3E8FF] text-[#7E22CE]" : "bg-[#DBEAFE] text-[#1E3A8A]",
      )}
    >
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: DeviceStatus }) {
  const isActive = status === "Active";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-transparent shadow-none rounded-full text-[12px]",
        isActive
          ? "bg-[#D1FAE5] text-[#065F46]"
          : "bg-[#FEF3C7] text-[#92400E]",
      )}
    >
      {status}
    </Badge>
  );
}

export default function CompanyDevices() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CompanyDevice[]>(INITIAL_DATA);

  const columns: ColumnDef[] = [
    {
      field: "staffName",
      headerName: "Staff Name",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.staffName}</span>
      ),
    },
    {
      field: "deviceName",
      headerName: "Device Name",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.deviceName}</span>
      ),
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.lastLogin}</span>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      renderCell: (row) => <RoleBadge role={row.role as DeviceRole} />,
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (row) => <StatusBadge status={row.status as DeviceStatus} />,
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: (row) => (
        <div className="flex justify-end pr-2">
          <Button variant="outline" size="sm" className="px-4">
            {row.status === "Pending" ? "Approve" : "Revoke"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto w-full min-h-[500px]">
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <DataGrid
          isPaginated
          tableHeader={
            <div className="flex w-full items-center py-4 px-2 justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-[#1E202E]">Company Devices</h2>
              <div className="flex gap-2">
                <SearchInput
                  placeholder="Search by name or reference"
                  containerClass="w-[280px]"
                />
                <div className="w-[150px] shrink-0">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full h-full">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
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
  );
}
