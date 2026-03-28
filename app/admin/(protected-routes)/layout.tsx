import type { Metadata } from "next";
import AdminShell from "../components/admin-shell";

export const metadata: Metadata = {
  title: "Glasstronic | Admin Dashboard",
  description: "Admin area for Glasstronic",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
