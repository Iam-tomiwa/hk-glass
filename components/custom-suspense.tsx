import React, { ReactNode } from "react";
import { Braces, Loader2 } from "lucide-react";
import EmptyState, { EmptyStateProps } from "@/components/empty-state";
import ErrorMsg from "@/components/error-msg";

interface SuspenseContainerProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  children: ReactNode;
  isEmpty?: boolean; // To detect if data is empty
  emptyStateProps?: EmptyStateProps; // Props to customize the empty state component
  loadingText?: string;
  customLoader?: ReactNode;
}

const SuspenseContainer: React.FC<SuspenseContainerProps> = ({
  isLoading,
  isError,
  error,
  children,
  isEmpty = false,
  emptyStateProps,
  loadingText = "Loading...",
  customLoader,
}) => {
  if (isLoading) {
    return customLoader ? (
      customLoader
    ) : (
      <div
        style={{ padding: "10vh 0" }}
        className="space-y-4 mx-auto text-center flex flex-col justify-center items-center"
      >
        <Loader2 className="animate-spin size-10" />
        <p>{loadingText}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6">
        <ErrorMsg error={error} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-6 relative z-10">
        <EmptyState
          title="No data found"
          icon={<Braces />}
          {...emptyStateProps}
        />
      </div>
    );
  }

  return <>{children}</>; // Render children if everything is good
};

export default SuspenseContainer;
