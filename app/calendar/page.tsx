"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth, getToday } from "@/lib/api";
import type { CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";
import { BoardPanel } from "@/components/BoardPanel";
import { ChevronLeftIcon, ChevronRightIcon, EndStopIcon, WarningIcon } from "@/components/icons";
import { useDevnagari } from "@/lib/devnagari-context";

const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2090;

function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}

function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

export default function CalendarPage() {
  const { devnagari } = useDevnagari();
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToday()
      .then((response) => {
        setYear(response.bs.year);
        setMonth(response.bs.month);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, []);

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

  const ready = year !== null && month !== null;
  const atMinYear = !ready || previousMonth(year, month)[0] < MIN_BS_YEAR;
  const atMaxYear = !ready || nextMonth(year, month)[0] > MAX_BS_YEAR;

  function goToPrevious() {
    if (!ready || atMinYear) return;
    const [nextYear, nextMonthValue] = previousMonth(year, month);
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  function goToNext() {
    if (!ready || atMaxYear) return;
    const [nextYear, nextMonthValue] = nextMonth(year, month);
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10 sm:py-14">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-ivory sm:text-5xl">
          Calendar
        </h1>
        <p className="mt-2 max-w-prose font-sans text-muted">
          A Bikram Sambat month grid, board-side. The Gregorian date for any day rides in its
          title, so hover or focus a cell to see it.
        </p>
      </div>

      <BoardPanel className="px-4 py-6 sm:px-6 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={atMinYear}
            aria-label="Previous month"
            className="flex items-center gap-1 rounded-full border border-panel-line bg-casing-deep px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-amber hover:text-ivory disabled:cursor-not-allowed disabled:border-hazard/30 disabled:hover:border-hazard/30 disabled:hover:text-muted"
          >
            {atMinYear ? (
              <EndStopIcon className="h-3.5 w-3.5 text-hazard" />
            ) : (
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            )}
            Prev
          </button>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ivory sm:text-xl">
            {data?.title ?? "Loading…"}
          </h2>
          <button
            type="button"
            onClick={goToNext}
            disabled={atMaxYear}
            aria-label="Next month"
            className="flex items-center gap-1 rounded-full border border-panel-line bg-casing-deep px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-amber hover:text-ivory disabled:cursor-not-allowed disabled:border-hazard/30 disabled:hover:border-hazard/30 disabled:hover:text-muted"
          >
            Next
            {atMaxYear ? (
              <EndStopIcon className="h-3.5 w-3.5 text-hazard" />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {data && (
          <p className="mb-4 text-center font-sans text-sm text-muted">{data.subtitle}</p>
        )}

        {error ? (
          <p className="flex items-center justify-center gap-2 py-8 font-sans text-sm text-hazard">
            <WarningIcon className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        ) : data ? (
          <CalendarGrid weeks={data.weeks} />
        ) : (
          <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="flap-cell flap-cell--loading aspect-square animate-pulse" />
            ))}
          </div>
        )}
      </BoardPanel>
    </main>
  );
}
