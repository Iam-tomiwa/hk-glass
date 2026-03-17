"use client";

import useConfirmations from "@/providers/confirmations-provider/use-confirmations";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import Cookies from "js-cookie";
import {
  StaffNotificationBell,
  FactoryNotificationBell,
} from "@/components/notification-bell";

export const Navbar = ({
  fullWidth = true,
  persona,
  onMenuClick,
}: {
  fullWidth?: Boolean;
  persona?: "factory" | "staff";
  onMenuClick?: () => void;
}) => {
  const { openConfirmModal } = useConfirmations();

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("admin_device_token");
    Cookies.remove("device_token");
    Cookies.remove("device_auth");
    if (window.location.pathname.includes("admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/unauthorized";
    }
  };

  return (
    <nav className="bg-white border-b">
      <div
        className={cn(
          " flex items-center justify-between py-6",
          fullWidth ? "md:px-6 px-4" : "container",
        )}
      >
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.svg"
            alt="Glasstronics"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {persona === "factory" && <FactoryNotificationBell />}
          {persona === "staff" && <StaffNotificationBell />}
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
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
