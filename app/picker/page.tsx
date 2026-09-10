"use client";

import { useState } from "react";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import type { NepaliDateSelection } from "@/components/NepaliDatePicker";
import { BoardPanel } from "@/components/BoardPanel";
import { CopyButton } from "@/components/CopyButton";
import { FlapRow } from "@/components/FlapRow";
import { InlineDate } from "@/components/InlineDate";
import { LatchIcon } from "@/components/icons";

export default function PickerDemoPage() {
  const [selected, setSelected] = useState<NepaliDateSelection | null>(null);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10 sm:py-14">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-ivory sm:text-5xl">
          Embeddable picker
        </h1>
        <p className="mt-2 max-w-prose font-sans text-muted">
          The{" "}
          <InlineDate className="text-sm">&lt;NepaliDatePicker&gt;</InlineDate>{" "}
          module below drops into any form. Click a day to latch it in, the way
          a real form would.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <NepaliDatePicker onSelect={setSelected} />

        <BoardPanel className="w-72 px-5 py-6 md:w-auto md:flex-1 md:px-6">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Selected value
          </span>
          {selected ? (
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <LatchIcon className="h-4 w-4 text-amber" />
                <span className="font-sans text-xs uppercase tracking-wide text-amber">
                  Latched
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <FlapRow
                  label="Selected date, Bikram Sambat"
                  value={selected.bs}
                  size="sm"
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-xs text-muted">BS · ISO</span>
                  <CopyButton value={selected.bs} label="Bikram Sambat date" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <FlapRow
                  label="Selected date, Gregorian"
                  value={selected.ad}
                  size="sm"
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-xs text-muted">AD · ISO</span>
                  <CopyButton value={selected.ad} label="Gregorian date" />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 font-sans text-sm text-muted">
              Nothing selected yet. Click a day on the board.
            </p>
          )}
        </BoardPanel>
      </div>
    </main>
  );
}
