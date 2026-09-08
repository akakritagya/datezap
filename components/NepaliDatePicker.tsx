"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth, getToday } from "@/lib/api";
import type { CalendarDayCell, CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";
import { BoardPanel } from "@/components/BoardPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

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
  initialYear,
  initialMonth,
  onSelect,
}: NepaliDatePickerProps) {
  const [year, setYear] = useState<number | null>(initialYear ?? null);
  const [month, setMonth] = useState<number | null>(initialMonth ?? null);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ year: number; month: number; day: number } | null>(
    null,
  );

  useEffect(() => {
    if (initialYear !== undefined && initialMonth !== undefined) return;
    getToday()
      .then((response) => {
        setYear(response.bs.year);
        setMonth(response.bs.month);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, [initialYear, initialMonth]);

  useEffect(() => {
    if (year === null || month === null) return;
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
    if (year === null || month === null) return;
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (year === null || month === null) return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  function handleDayClick(cell: CalendarDayCell) {
    if (year === null || month === null) return;
    if (cell.bs_day === null || cell.ad_date === null) return;
    setSelected({ year, month, day: cell.bs_day });
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(cell.bs_day).padStart(2, "0")}`;
    onSelect({ bs: iso, ad: cell.ad_date });
  }

  const selectedDay = selected && selected.year === year && selected.month === month
    ? selected.day
    : null;

  return (
    <BoardPanel className="w-72 px-3 py-4">
      <div className="mb-2.5 flex items-center justify-between text-sm">
        <button
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          className="rounded p-1 text-muted transition-colors hover:text-ivory"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-bold uppercase tracking-wide text-ivory">
          {data?.title ?? "Loading…"}
        </span>
        <button
          onClick={goToNextMonth}
          aria-label="Next month"
          className="rounded p-1 text-muted transition-colors hover:text-ivory"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="px-1 py-2 font-sans text-xs text-hazard">{error}</p>}
      {data && (
        <CalendarGrid weeks={data.weeks} onDayClick={handleDayClick} selectedDay={selectedDay} compact />
      )}
    </BoardPanel>
  );
}
