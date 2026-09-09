"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, getCalendarMonth, getToday, resolveMonthQuery } from "@/lib/api";
import type { CalendarDayCell, CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";
import { BoardPanel } from "@/components/BoardPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { useDevnagari } from "@/lib/devnagari-context";

export type NepaliDateSelection = {
  bs: string;
  ad: string;
};

// Latin BS month names for the search placeholder example only -- kept in
// sync with nepkit's BS_MONTH_NAMES by inspection, since the picker never
// needs the Devnagari names or aliases nepkit also knows about.
const BS_MONTH_NAMES = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashoj",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

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
  const { devnagari } = useDevnagari();
  const [year, setYear] = useState<number | null>(initialYear ?? null);
  const [month, setMonth] = useState<number | null>(initialMonth ?? null);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ year: number; month: number; day: number } | null>(
    null,
  );
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

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
    getCalendarMonth(year, month, devnagari)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, [year, month, devnagari]);

  useEffect(() => {
    if (!isSearchOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

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

  function openSearch() {
    setSearchQuery("");
    setSearchError(null);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
  }

  const searchPlaceholder =
    year !== null && month !== null
      ? `${BS_MONTH_NAMES[month - 1]} ${year} or ${String(month).padStart(2, "0")}-${year}`
      : "Month Year or MM-YYYY";

  async function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const result = await resolveMonthQuery(searchQuery.trim());
      setYear(result.year);
      setMonth(result.month);
      setSearchOpen(false);
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <>
      <BoardPanel className="w-72 px-3 py-4">
        <div className="mb-2.5 flex items-center justify-between text-sm">
          <button
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-ivory"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openSearch}
            disabled={!data}
            className="rounded font-display text-sm font-bold uppercase tracking-wide text-ivory transition-colors enabled:cursor-pointer enabled:hover:text-amber disabled:cursor-default"
          >
            {data?.title ?? "Loading…"}
          </button>
          <button
            onClick={goToNextMonth}
            aria-label="Next month"
            className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-ivory"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="px-1 py-2 font-sans text-xs text-hazard">{error}</p>}
        {data && (
          <CalendarGrid weeks={data.weeks} onDayClick={handleDayClick} selectedDay={selectedDay} compact />
        )}
      </BoardPanel>
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-casing-deep/80 px-4"
          onClick={closeSearch}
        >
          <BoardPanel
            className="w-full max-w-xs px-4 py-4"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit}>
              <label
                htmlFor="month-year-search"
                className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
              >
                Jump to month
              </label>
              <input
                id="month-year-search"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchError(null);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded border border-panel-line bg-casing px-2.5 py-2 font-sans text-sm text-ivory placeholder:text-muted focus:outline-none"
              />
              {searchError && (
                <p className="mt-2 font-sans text-xs text-hazard">{searchError}</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSearch}
                  className="cursor-pointer rounded px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded bg-amber px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-amber-ink transition-colors hover:brightness-95"
                >
                  Go
                </button>
              </div>
            </form>
          </BoardPanel>
        </div>
      )}
    </>
  );
}
