import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { Input } from "../ui/input";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePopoverProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export function DateRangePopover({
  dateRange,
  setDateRange,
}: DateRangePopoverProps) {
  const [startDateInput, setStartDateInput] = useState(
    dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : ""
  );
  const [endDateInput, setEndDateInput] = useState(
    dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : ""
  );

  const handleManualDateInput = (value: string, isStart: boolean) => {
    if (!value) {
      if (isStart) {
        setDateRange({ ...dateRange, from: undefined });
        setStartDateInput("");
      } else {
        setDateRange({ ...dateRange, to: undefined });
        setEndDateInput("");
      }
      return;
    }

    // Parse the date in DD/MM/YYYY format
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      if (isStart) {
        setDateRange({ ...dateRange, from: date });
        setStartDateInput(value);
      } else {
        setDateRange({ ...dateRange, to: date });
        setEndDateInput(value);
      }
    }
  };

  const presetOptions = [
    {
      label: "Today",
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "Last Month",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "Last Year",
      getValue: () => ({
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      }),
    },
  ];

  return (
    <PopoverContent className="flex w-auto p-0" align="start">
      <div className="border-r border-border">
        <div className="p-2 w-[150px]">
          {presetOptions.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              className="w-full justify-start text-left font-normal mb-1 px-2"
              onClick={() => {
                const range = preset.getValue();
                setDateRange(range);
                setStartDateInput(format(range.from, "dd/MM/yyyy"));
                setEndDateInput(format(range.to, "dd/MM/yyyy"));
              }}
            >
              {preset.label}
            </Button>
          ))}
          <div className="border-t border-border my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal mb-1 px-2"
            onClick={() => {
              setDateRange({});
              setStartDateInput("");
              setEndDateInput("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="p-2">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="DD/MM/YYYY"
            value={startDateInput}
            onChange={(e) => handleManualDateInput(e.target.value, true)}
            className="w-[120px]"
          />
          <span className="text-muted-foreground self-center">-</span>
          <Input
            placeholder="DD/MM/YYYY"
            value={endDateInput}
            onChange={(e) => handleManualDateInput(e.target.value, false)}
            className="w-[120px]"
          />
        </div>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            if (range?.from) {
              setStartDateInput(format(range.from, "dd/MM/yyyy"));
            }
            if (range?.to) {
              setEndDateInput(format(range.to, "dd/MM/yyyy"));
            }
            setDateRange(range || {});
          }}
          initialFocus
        />
      </div>
    </PopoverContent>
  );
}
