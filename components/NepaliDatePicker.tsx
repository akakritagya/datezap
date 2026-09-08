"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth } from "@/lib/api";
import type { CalendarDayCell, CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";

export type NepaliDateSelection = {
  bs: string;
  ad: string;
};

type NepaliDatePickerProps = {
  initialYear?: number;
  initialMonth?: number;
  onSelect: (selection: NepaliDateSelection) => void;
};

export function NepaliDatePicker({
  initialYear = 2081,
  initialMonth = 1,
  onSelect,
}: NepaliDatePickerProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCalendarMonth(year, month)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, [year, month]);

  function goToPreviousMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleDayClick(cell: CalendarDayCell) {
    if (cell.bs_day === null || cell.ad_date === null) return;
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(cell.bs_day).padStart(2, "0")}`;
    onSelect({ bs: iso, ad: cell.ad_date });
  }

  return (
    <div className="w-72 rounded border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button onClick={goToPreviousMonth} aria-label="Previous month">
          &larr;
        </button>
        <span>{data?.title ?? "Loading..."}</span>
        <button onClick={goToNextMonth} aria-label="Next month">
          &rarr;
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {data && <CalendarGrid weeks={data.weeks} onDayClick={handleDayClick} />}
    </div>
  );
}
