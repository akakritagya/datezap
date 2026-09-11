"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { NAV_TRANSITION } from "@/lib/nav-transition";
import { ApiError, convertDate, getRange, getToday } from "@/lib/api";
import type {
  ConvertDirection,
  ConvertResponse,
  DateRangeResponse,
  TodayResponse,
} from "@/lib/api";
import { BoardPanel } from "@/components/BoardPanel";
import { CopyButton } from "@/components/CopyButton";
import { FlapRow, FlapRowSkeleton } from "@/components/FlapRow";
import { InlineDate } from "@/components/InlineDate";
import { SkeletonBar } from "@/components/SkeletonBar";
import { WarningIcon } from "@/components/icons";
import { useDevnagari } from "@/lib/devnagari-context";

export default function HomePage() {
  const { devnagari } = useDevnagari();
  const [direction, setDirection] = useState<ConvertDirection>("bs2ad");
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState<{
    direction: ConvertDirection;
    value: string;
  } | null>(null);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [range, setRange] = useState<DateRangeResponse | null>(null);
  // The "Today" widget's BS side honors the toggle; the input placeholder is
  // a typing hint and must stay in the Latin format users can actually type,
  // so it's always built from `today` (fetched without devnagari) below.
  const [todayBsNamedDevnagari, setTodayBsNamedDevnagari] = useState<
    string | null
  >(null);
  const outcomeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getToday()
      .then(setToday)
      .catch(() => setToday(null));
  }, []);

  useEffect(() => {
    getRange()
      .then(setRange)
      .catch(() => setRange(null));
  }, []);

  useEffect(() => {
    if (!devnagari) return;
    getToday(true)
      .then((response) => setTodayBsNamedDevnagari(response.bs.named))
      .catch(() => setTodayBsNamedDevnagari(null));
  }, [devnagari]);

  // Re-fetches whenever a new date is submitted, and also when the devnagari
  // toggle changes -- so a result already on screen flips language in place
  // instead of staying frozen in whatever language it was fetched in.
  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;
    convertDate(submitted.direction, submitted.value, devnagari)
      .then((response) => {
        if (cancelled) return;
        setResult(response);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Something went wrong.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsConverting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted, devnagari]);

  // Scroll the outcome into view once the result (or an error) lands, since
  // the flip button sits above the fold on short viewports and the converted
  // date would otherwise render off-screen.
  useEffect(() => {
    if (!result && !error && !isConverting) return;
    outcomeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result, error, isConverting]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsConverting(true);
    setSubmitted({ direction, value });
  }

  return (
    <ViewTransition enter={NAV_TRANSITION} exit={NAV_TRANSITION} default="none">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 sm:py-14">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-ivory sm:text-5xl">
            Single-date converter
          </h1>
          <p className="mt-2 max-w-prose font-sans text-muted">
            Type a Bikram Sambat or Gregorian date in ISO or natural language.
            Watch it flap into the other calendar, live from the API.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-panel-line bg-panel/60 px-5 py-3">
          <span className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="pilot-dot" />
            Today
          </span>
          {today ? (
            <div className="flex flex-wrap items-center gap-4">
              <FlapRow
                label="Today in Bikram Sambat"
                value={
                  devnagari && todayBsNamedDevnagari
                    ? todayBsNamedDevnagari
                    : today.bs.named
                }
                size="sm"
              />
              <InlineDate className="text-sm">{today.ad_named}</InlineDate>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <FlapRowSkeleton label="Today in Bikram Sambat" size="sm" length={14} />
              <SkeletonBar className="h-5 w-28" />
            </div>
          )}
        </div>

        <BoardPanel className="flex flex-col gap-5 px-5 py-7 sm:px-8 sm:py-9">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Coverage
          </span>
          {range ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted">
                  Bikram Sambat
                </span>
                <p className="flex flex-wrap items-center gap-2 font-sans text-sm text-ivory">
                  <InlineDate>{range.bs_min_year}</InlineDate>
                  <span className="text-muted">to</span>
                  <InlineDate>{range.bs_max_year}</InlineDate>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted">
                  Gregorian
                </span>
                <p className="flex flex-wrap items-center gap-2 font-sans text-sm text-ivory">
                  <InlineDate>{range.ad_min}</InlineDate>
                  <span className="text-muted">to</span>
                  <InlineDate>{range.ad_max}</InlineDate>
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2" aria-busy="true">
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted">
                  Bikram Sambat
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <SkeletonBar className="h-5 w-16" />
                  <span className="text-muted">to</span>
                  <SkeletonBar className="h-5 w-16" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted">
                  Gregorian
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <SkeletonBar className="h-5 w-20" />
                  <span className="text-muted">to</span>
                  <SkeletonBar className="h-5 w-20" />
                </div>
              </div>
            </div>
          )}
        </BoardPanel>

        <BoardPanel className="px-5 py-7 sm:px-8 sm:py-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Direction
              </legend>
              <div className="inline-flex w-fit overflow-hidden rounded-md border border-panel-line">
                {(
                  [
                    {
                      id: "bs2ad",
                      label: (
                        <>
                          BS{" "}
                          <span className="inline-block -translate-y-0.5">→</span>{" "}
                          AD
                        </>
                      ),
                    },
                    {
                      id: "ad2bs",
                      label: (
                        <>
                          AD{" "}
                          <span className="inline-block -translate-y-0.5">→</span>{" "}
                          BS
                        </>
                      ),
                    },
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
                    className={`cursor-pointer px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setValue(event.target.value)
                }
                placeholder={
                  direction === "ad2bs"
                    ? today
                      ? `${today.ad} or ${today.ad_named}`
                      : "2024-07-30 or 30 July 2024"
                    : today
                      ? `${today.bs.iso} or ${today.bs.named}`
                      : "2081-04-15 or 15 Shrawan 2081"
                }
                className="rounded-md border border-panel-line bg-casing-deep px-4 py-3 font-flap text-lg text-ivory placeholder:text-muted/60 focus:border-amber"
              />
            </label>

            <button
              type="submit"
              disabled={value.trim().length === 0}
              className="w-fit cursor-pointer rounded-md bg-bezel px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-ivory transition-colors duration-300 ease-out hover:bg-amber hover:text-amber-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-panel-line disabled:bg-transparent disabled:text-muted"
            >
              Flip the board
            </button>
          </form>
        </BoardPanel>

        {isConverting && !result && !error && (
          <BoardPanel
            ref={outcomeRef}
            className="flex flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9"
          >
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Bikram Sambat (BS)
              </span>
              <FlapRowSkeleton label="Bikram Sambat result" size="lg" length={14} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Gregorian (AD)
              </span>
              <FlapRowSkeleton label="Gregorian result" size="lg" length={14} />
            </div>
          </BoardPanel>
        )}

        {error && (
          <BoardPanel
            ref={outcomeRef}
            className="flex flex-col gap-3 px-5 py-6 sm:px-8"
          >
            <FlapRow label="Error" value="ERROR" size="md" hazard />
            <p className="flex items-start gap-2 font-sans text-sm text-hazard">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          </BoardPanel>
        )}

        {result && (
          <BoardPanel
            ref={outcomeRef}
            className="flex flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9"
          >
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Bikram Sambat (BS)
              </span>
              <FlapRow
                label="Bikram Sambat result"
                value={result.bs.named}
                size="lg"
                trailing={
                  <CopyButton
                    value={result.bs.iso}
                    label="Bikram Sambat date"
                    size="lg"
                  />
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Gregorian (AD)
              </span>
              <FlapRow
                label="Gregorian result"
                value={result.ad_named}
                size="lg"
                trailing={
                  <CopyButton
                    value={result.ad}
                    label="Gregorian date"
                    size="lg"
                  />
                }
              />
            </div>
          </BoardPanel>
        )}
      </main>
    </ViewTransition>
  );
}
