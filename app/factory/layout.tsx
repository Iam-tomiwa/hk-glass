"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { Navbar } from "@/components/navbar";

export default function FactoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (Cookies.get("device_token") && !Cookies.get("device_auth")) {
      Cookies.set("device_auth", "1", { sameSite: "lax", expires: 365 });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar persona="factory" />
      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
