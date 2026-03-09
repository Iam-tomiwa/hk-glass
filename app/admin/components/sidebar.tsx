"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  Database,
  LineChart,
  Terminal,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: Inbox },
  { name: "Inventory", href: "/admin/inventory", icon: Database },
  { name: "Pricing", href: "/admin/pricing", icon: LineChart },
  { name: "Settings", href: "/admin/settings", icon: Terminal },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={clsx(
          "w-[260px] border-r border-[#E5E7EB] bg-white flex flex-col justify-between shrink-0 h-screen top-0 z-30 transition-transform duration-300",
          "fixed md:sticky md:translate-x-0 inset-y-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            {/* Placeholder for optional app logo/name */}
            <div className="h-6" />

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden p-1 -mr-1 text-[#6B7280] hover:text-[#111827]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/admin");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-[#F3F4F6] text-[#111827]"
                      : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]",
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-[18px] w-[18px]",
                      isActive ? "text-[#111827]" : "text-[#9CA3AF]",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
