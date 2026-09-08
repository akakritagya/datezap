"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError, convertDate, getToday } from "@/lib/api";
import type { ConvertDirection, ConvertResponse, TodayResponse } from "@/lib/api";
import { BoardPanel } from "@/components/BoardPanel";
import { FlapRow } from "@/components/FlapRow";
import { WarningIcon } from "@/components/icons";

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
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-10 sm:py-14">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-ivory sm:text-5xl">
          Single-date converter
        </h1>
        <p className="mt-2 max-w-prose font-sans text-muted">
          Type a Bikram Sambat or Gregorian date — ISO or natural language — and watch it flap
          into the other calendar, live from the API.
        </p>
      </div>

      <BoardPanel className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Today
        </span>
        {today ? (
          <div className="flex flex-wrap items-center gap-4">
            <FlapRow label="Today in Bikram Sambat" value={today.bs.named} size="sm" />
            <span className="font-sans text-sm text-muted">{today.ad_named}</span>
          </div>
        ) : (
          <span className="font-sans text-sm text-muted">Reading the clock&hellip;</span>
        )}
      </BoardPanel>

      <BoardPanel className="px-5 py-7 sm:px-8 sm:py-9">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Direction
            </legend>
            <div className="inline-flex w-fit overflow-hidden rounded border border-panel-line">
              {(
                [
                  { id: "bs2ad", label: "BS → AD" },
                  { id: "ad2bs", label: "AD → BS" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setDirection(option.id);
                    setValue("");
                  }}
                  aria-pressed={direction === option.id}
                  className={`px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                    direction === option.id
                      ? "bg-amber text-amber-ink"
                      : "bg-casing-deep text-muted hover:text-ivory"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Date
            </span>
            <input
              value={value}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
              placeholder={
                direction === "ad2bs"
                  ? today
                    ? `${today.ad} or ${today.ad_named}`
                    : "2024-07-30 or 30 July 2024"
                  : today
                    ? `${today.bs.iso} or ${today.bs.named}`
                    : "2081-04-15 or 15 Shrawan 2081"
              }
              className="rounded border border-panel-line bg-casing-deep px-4 py-3 font-flap text-lg text-ivory placeholder:text-muted/60 focus:border-amber"
            />
          </label>

          <button
            type="submit"
            disabled={value.trim().length === 0}
            className="w-fit rounded bg-bezel px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-ivory transition-colors hover:bg-amber hover:text-amber-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bezel disabled:hover:text-ivory"
          >
            Flip the board
          </button>
        </form>
      </BoardPanel>

      {error && (
        <BoardPanel className="flex flex-col gap-3 px-5 py-6 sm:px-8">
          <FlapRow label="Error" value="ERROR" size="md" hazard />
          <p className="flex items-start gap-2 font-sans text-sm text-hazard">
            <WarningIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        </BoardPanel>
      )}

      {result && (
        <BoardPanel className="flex flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Bikram Sambat
            </span>
            <FlapRow label="Bikram Sambat result" value={result.bs.named} size="lg" />
            <span className="font-sans text-sm text-muted">{result.bs.iso}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Gregorian
            </span>
            <FlapRow label="Gregorian result" value={result.ad_named} size="lg" />
            <span className="font-sans text-sm text-muted">{result.ad}</span>
          </div>
        </BoardPanel>
      )}
    </main>
  );
}
