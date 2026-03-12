"use client";

import { useState } from "react";
import SearchInput from "@/components/search-input";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ComboBox } from "@/components/ui/combo-box-2";
import {
  useListCombinedDevices,
  useDeactivateAdminDevice,
  useDeactivateStaffDevice,
} from "@/services/queries/admin";
import { CombinedDeviceResponse } from "@/services/types/openapi";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin";
  return (
    <Badge
      variant={isAdmin ? "secondary" : "info"}
      className={isAdmin ? "bg-[#F3E8FF] text-[#7E22CE]" : undefined}
    >
      {role}
    </Badge>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "pending"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CompanyDevices() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const { openConfirmModal } = useConfirmations();
  const { data = [], isLoading } = useListCombinedDevices();
  const deactivateAdmin = useDeactivateAdminDevice();
  const deactivateStaff = useDeactivateStaffDevice();

  const handleRevoke = (device: CombinedDeviceResponse) => {
    if (device.device_type.toLowerCase() === "admin") {
      deactivateAdmin.mutate({ device_id: device.id });
    } else {
      deactivateStaff.mutate({ device_id: device.id });
    }
  };

  const filtered = data.filter((d) => {
    if (statusFilter === "active") return d.is_active;
    if (statusFilter === "inactive") return !d.is_active;
    return true;
  });

  const columns: ColumnDef[] = [
    {
      field: "email",
      headerName: "Staff Name",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.email || "-"}</span>
      ),
    },
    {
      field: "name",
      headerName: "Device Name",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.name}</span>
      ),
    },
    {
      field: "last_used_at",
      headerName: "Last Login",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">
          {formatDate(row.last_used_at)}
        </span>
      ),
    },
    {
      field: "device_type",
      headerName: "Role",
      renderCell: (row) => <RoleBadge role={row.device_type} />,
    },
    {
      field: "is_active",
      headerName: "Status",
      renderCell: (row) => <StatusBadge isActive={row.is_active} />,
    },
    {
      field: "actions",
      headerName: " ",
      align: "right",
      renderCell: (row) => (
        <div className="flex justify-end pr-2">
          {row.is_active && (
            <Button
              variant="outline"
              size="sm"
              className="px-4"
              onClick={() => {
                openConfirmModal(
                  "Are you sure you want to revoke this device?",
                  () => handleRevoke(row as CombinedDeviceResponse),
                  {
                    title: "Revoke Device",
                    isDelete: true,
                    confirmText: "Confirm",
                  },
                );
              }}
              disabled={deactivateAdmin.isPending || deactivateStaff.isPending}
            >
              Revoke
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] w-[95%] mx-auto min-h-[500px]">
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <DataGrid
          isPaginated
          loading={isLoading}
          tableHeader={
            <div className="flex w-full items-center py-4 px-2 justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-[#1E202E]">Company Devices</h2>
              <div className="flex gap-2">
                <SearchInput
                  placeholder="Search by name or reference"
                  containerClass="w-[280px]"
                />
                <ComboBox
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v || "all")}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  placeholder="All statuses"
                  className="w-[150px]"
                />
              </div>
            </div>
          }
          rows={filtered}
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
