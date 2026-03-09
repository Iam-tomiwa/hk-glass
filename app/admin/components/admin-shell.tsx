"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import { Navbar } from "@/components/navbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 relative">
      {/* Sidebar - Desktop and Mobile */}

      <Navbar fullWidth />
      {/* Main Content Area */}
      <div className="flex w-full flex-1 min-w-0">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto bg-[#FAFAFA]/50">{children}</main>
      </div>
    </div>
  );
}
