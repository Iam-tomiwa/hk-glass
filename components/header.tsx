import { cn } from "@/lib/utils";

export const Header = ({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("bg-background", className)}>
      <div className="container flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-neutral-500 mt-1">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
