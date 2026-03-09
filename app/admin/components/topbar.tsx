import { Bell, Menu } from "lucide-react";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-[72px] items-center border-b border-[#E5E7EB] px-4 md:px-8 bg-white justify-between md:justify-end shrink-0 sticky top-0 z-10 w-full">
      <div className="flex md:hidden items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-9 w-9 rounded-full bg-[#991b1b] flex items-center justify-center font-semibold text-white text-[14px]">
          SD
        </div>
      </div>
    </header>
  );
}
