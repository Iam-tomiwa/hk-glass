"use client";

/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { DateRange } from "react-day-picker";

export interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  preset: string | undefined;
  setPreset: (preset: string | undefined) => void;
}

interface DateRangeProviderProps {
  children: React.ReactNode;
  initialValue?: DateRange;
}

export const DateRangeContext = React.createContext<
  DateRangeContextType | undefined
>(undefined);

export function DateRangeProvider({
  children,
  initialValue,
}: DateRangeProviderProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    initialValue,
  );
  const [preset, setPreset] = React.useState<string>();

  const value = React.useMemo(
    () => ({ dateRange, setDateRange, preset, setPreset }),
    [dateRange, preset],
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = React.useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
