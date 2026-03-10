"use client";

import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import { cn } from "@/lib/utils";
import { Bell, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useGetCurrentUser } from "@/services/queries/auth";

export const Navbar = ({ fullWidth = true }: { fullWidth?: Boolean }) => {
  const { openConfirmModal } = useConfirmations();
  const { data: user } = useGetCurrentUser();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "—";

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("admin_device_token");
    Cookies.remove("device_token");
    window.location.href = "/admin/login";
  };

  return (
    <nav className="bg-white border-b">
      <div
        className={cn(
          " flex items-center justify-between py-6",
          fullWidth ? "px-6" : "container",
        )}
      >
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.svg"
            alt="Glasstronics"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors">
            <Bell size={20} />
          </button>
          <button
            onClick={() => {
              openConfirmModal(
                "Are you sure you want to log out from this device?",
                handleLogout,
                {
                  title: "Log Out",
                  isDelete: true,
                  confirmText: "Log Out",
                },
              );
            }}
            className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <LogOut size={20} />
          </button>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-[#F3E8E3] text-[#1E202E] font-semibold flex items-center justify-center text-sm">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#00AE4D]"></span>
          </div>
        </div>
      </div>
    </nav>
  );
};
