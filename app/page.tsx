"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError, convertDate, getToday } from "@/lib/api";
import type { ConvertDirection, ConvertResponse, TodayResponse } from "@/lib/api";

export default function HomePage() {
  const [direction, setDirection] = useState<ConvertDirection>("bs2ad");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<TodayResponse | null>(null);

  useEffect(() => {
    getToday()
      .then(setToday)
      .catch(() => setToday(null));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    try {
      const response = await convertDate(direction, value);
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">datezap</h1>

      {today && (
        <p className="text-sm text-gray-600">
          Today: {today.bs.named} &middot; {today.ad_named}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Direction</span>
          <select
            value={direction}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setDirection(event.target.value as ConvertDirection)
            }
            className="rounded border border-gray-300 p-2"
          >
            <option value="bs2ad">Bikram Sambat to Gregorian</option>
            <option value="ad2bs">Gregorian to Bikram Sambat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Date</span>
          <input
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
            placeholder={direction === "bs2ad" ? "2081-04-15 or 15 Shrawan 2081" : "2024-07-30"}
            className="rounded border border-gray-300 p-2"
          />
        </label>

        <button
          type="submit"
          disabled={value.trim().length === 0}
          className="rounded bg-black p-2 text-white disabled:opacity-50"
        >
          Convert
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded border border-gray-200 p-4 text-sm">
          <p>
            BS: {result.bs.named} ({result.bs.iso})
          </p>
          <p>
            AD: {result.ad_named} ({result.ad})
          </p>
        </div>
      )}
    </main>
  );
}
