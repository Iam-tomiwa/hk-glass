import { Navbar } from "@/components/navbar";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar />
      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
