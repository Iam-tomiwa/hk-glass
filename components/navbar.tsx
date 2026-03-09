import useConfirmations from "@/app/confirmations-provider/use-confirmations";
import { cn } from "@/lib/utils";
import { Bell, LogOut } from "lucide-react";

export const Navbar = ({ fullWidth = true }: { fullWidth?: Boolean }) => {
  const { openConfirmModal } = useConfirmations();
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
                "Are you sure you want to log out from this device? ",
                () => {},
                {
                  title: "Log Out",
                  isDelete: true,
                  confirmText: "Confirm",
                },
              );
            }}
            className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <LogOut size={20} />
          </button>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-[#F3E8E3] text-[#1E202E] font-semibold flex items-center justify-center text-sm">
              OM
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#00AE4D]"></span>
          </div>
        </div>
      </div>
    </nav>
  );
};
