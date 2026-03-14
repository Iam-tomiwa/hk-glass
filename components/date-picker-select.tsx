"use client";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateRange } from "@/providers/date-range-context";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ButtonProps } from "react-day-picker";
import { ComboBox } from "./ui/combo-box-2";

export function DateRangePicker({
  className,
  showSelector,
  ...btnProps
}: { className?: string; showSelector?: boolean } & ButtonProps) {
  const { dateRange, setDateRange, preset, setPreset } = useDateRange();

  const handleSelect = (value: string) => {
    setPreset(value);
    const now = new Date();

    switch (value) {
      case "reset":
        setDateRange(undefined);
        break;
      case "today":
        setDateRange({
          from: startOfDay(now),
          to: endOfDay(now),
        });
        break;
      case "this-week":
        setDateRange({
          from: startOfWeek(now),
          to: endOfWeek(now),
        });
        break;
      case "this-month":
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now),
        });
        break;
      case "this-year":
        setDateRange({
          from: startOfYear(now),
          to: endOfYear(now),
        });
        break;
      case "custom":
        break;
    }
  };

  return (
    <Popover modal>
      <Button
        variant={"outline"}
        className={cn(
          "justify-start text-left font-normal w-full h-11",
          !dateRange && "text-muted-foreground",
          className,
        )}
        {...btnProps}
      >
        <PopoverTrigger className={"flex gap-2 items-center"}>
          <CalendarIcon className="h-4 w-4" />
          <span className="overflow-ellipsis overflow-hidden">
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </span>
        </PopoverTrigger>
      </Button>
      <PopoverContent
        className="flex w-auto flex-col space-y-2 p-2"
        align="start"
        side="bottom"
      >
        {showSelector && (
          <>
            <Label htmlFor="date-range-picker" className="mt-2">
              Select Range
            </Label>
            <ComboBox
              className="w-full"
              options={[
                { value: "reset", label: "Reset" },
                { value: "today", label: "Today" },
                { value: "this-week", label: "This Week" },
                { value: "this-month", label: "This Month" },
                { value: "this-year", label: "This Year" },
                { value: "custom", label: "Custom Range" },
              ]}
              value={preset}
              onValueChange={handleSelect}
            />
            <div className="flex w-full gap-4 items-center">
              <Separator title="(or)" className="w-auto! grow" />
              <p className="text-sm text-muted-foreground italic">(or)</p>
              <Separator title="(or)" className="w-auto! grow" />
            </div>
          </>
        )}

        <div className="rounded-md border max-h-[350px] overflow-auto">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setDateRange({
                from: range?.from,
                to: endOfDay(range?.to || new Date()),
              });
              if (range) setPreset("custom");
            }}
            // showOutsideDays={false}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
