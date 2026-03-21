"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { Navbar } from "@/components/navbar";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure device_auth (SameSite=Lax) stays in sync with device_token.
  // This lets the middleware recognise authenticated sessions even on
  // cross-site navigations (e.g. returning from Paystack), where
  // SameSite=Strict cookies are not included in the request.
  useEffect(() => {
    if (Cookies.get("device_token") && !Cookies.get("device_auth")) {
      Cookies.set("device_auth", "1", { sameSite: "lax", expires: 365 });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar persona="staff" />
      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
