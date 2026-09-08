"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth } from "@/lib/api";
import type { CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";

const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2090;

function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}

function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

export default function CalendarPage() {
  const [year, setYear] = useState(2081);
  const [month, setMonth] = useState(4);
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

  function goToPrevious() {
    const [nextYear, nextMonthValue] = previousMonth(year, month);
    if (nextYear < MIN_BS_YEAR) return;
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  function goToNext() {
    const [nextYear, nextMonthValue] = nextMonth(year, month);
    if (nextYear > MAX_BS_YEAR) return;
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <button onClick={goToPrevious} className="rounded border px-3 py-1">
          &larr; Prev
        </button>
        <h1 className="text-lg font-semibold">{data?.title ?? "Loading..."}</h1>
        <button onClick={goToNext} className="rounded border px-3 py-1">
          Next &rarr;
        </button>
      </div>

      {data && <p className="text-center text-sm text-gray-500">{data.subtitle}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      {data && <CalendarGrid weeks={data.weeks} />}
    </main>
  );
}
