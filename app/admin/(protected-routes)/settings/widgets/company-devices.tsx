"use client";

import { useState } from "react";
import SearchInput from "@/components/search-input";
import DataGrid from "@/components/data-table";
import { ColumnDef } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ComboBox } from "@/components/ui/combo-box-2";
import {
  useDeactivateStaffDevice,
  useReactivateStaffDevice,
  useDeleteStaffDevice,
  useListStaffDevices,
} from "@/services/queries/admin";
import { CombinedDeviceResponse } from "@/services/types/openapi";
import useConfirmations from "@/providers/confirmations-provider/use-confirmations";

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "pending"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export function formatDate(dateStr?: string | null) {
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
  const { data = [], isLoading } = useListStaffDevices();
  const [reactivateCode, setReactivateCode] = useState<string | null>(null);
  const deactivateStaff = useDeactivateStaffDevice();
  const reactivateStaff = useReactivateStaffDevice();
  const deleteStaff = useDeleteStaffDevice();
  const { openConfirmModal, setLoading } = useConfirmations();

  const handleDeactivate = (device: CombinedDeviceResponse) => {
    openConfirmModal(
      `Are you sure you want to deactivate "${device.name}"?`,
      async () => {
        setLoading(true);
        await deactivateStaff.mutateAsync({ device_id: device.id });
        setLoading(false);
      },
      { title: "Deactivate Device", isDelete: true, confirmText: "Deactivate" },
    );
  };

  const handleReactivate = (device: CombinedDeviceResponse) => {
    openConfirmModal(
      `Are you sure you want to reactivate "${device.name}"?`,
      async () => {
        setLoading(true);
        const res = await reactivateStaff.mutateAsync({ device_id: device.id });
        setReactivateCode(res.setup_code);
        setLoading(false);
      },
      { title: "Reactivate Device", confirmText: "Reactivate" },
    );
  };

  const handleDelete = (device: CombinedDeviceResponse) => {
    openConfirmModal(
      `Are you sure you want to delete "${device.name}"? This action cannot be undone.`,
      () => {
        deleteStaff.mutate({ device_id: device.id });
      },
      { title: "Delete Device", isDelete: true, confirmText: "Delete" },
    );
  };

  const filtered = (data as CombinedDeviceResponse[])
    .filter((d) => d.device_type?.toLowerCase() !== "admin")
    .filter((d) => {
      if (statusFilter === "active") return d.is_active;
      if (statusFilter === "inactive") return !d.is_active;
      return true;
    });

  const columns: ColumnDef[] = [
    {
      field: "email",
      headerName: "Name",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.name || "-"}</span>
      ),
    },
    {
      field: "name",
      headerName: "Email",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">{row.email || "_"}</span>
      ),
    },
    {
      field: "last_used_at",
      headerName: "Last Used At",
      renderCell: (row) => (
        <span className="text-[#4B5563] text-sm">
          {formatDate(row.last_used_at)}
        </span>
      ),
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
        <div className="flex justify-end gap-2 pr-2">
          {row.is_active ? (
            <Button
              variant="outline"
              size="sm"
              className="px-4"
              onClick={() => handleDeactivate(row as CombinedDeviceResponse)}
              disabled={deactivateStaff.isPending}
            >
              Deactivate
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="px-4"
                onClick={() => handleReactivate(row as CombinedDeviceResponse)}
                disabled={reactivateStaff.isPending}
              >
                Reactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleDelete(row as CombinedDeviceResponse)}
                disabled={deleteStaff.isPending}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] w-[95%] mx-auto min-h-[500px]">
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden ">
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

      <Dialog
        open={!!reactivateCode}
        onOpenChange={(open) => !open && setReactivateCode(null)}
      >
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Device Reactivated</DialogTitle>
            <DialogDescription>
              The authentication key has been regenerated.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Share this code with the device operator to authenticate.
            </p>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 flex items-center justify-center gap-1.5 bg-muted rounded-lg px-4 py-3">
                {reactivateCode?.split("").map((char, i) => (
                  <span
                    key={i}
                    className="font-mono text-2xl font-bold tracking-widest text-foreground"
                  >
                    {char}
                  </span>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  navigator.clipboard.writeText(reactivateCode || "")
                }
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <Button
              className="w-full mt-2 bg-[#00B412] hover:bg-[#00B412]/90 text-white"
              onClick={() => setReactivateCode(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
