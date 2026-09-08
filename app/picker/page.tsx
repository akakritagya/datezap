"use client";

import { useState } from "react";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import type { NepaliDateSelection } from "@/components/NepaliDatePicker";

export default function PickerDemoPage() {
  const [selected, setSelected] = useState<NepaliDateSelection | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-8">
      <h1 className="text-lg font-semibold">Embeddable date picker demo</h1>
      <p className="text-sm text-gray-600">Click a day to select it, as a form might.</p>
      <NepaliDatePicker onSelect={setSelected} />
      {selected && (
        <p className="text-sm">
          Selected: {selected.bs} (BS) / {selected.ad} (AD)
        </p>
      )}
    </main>
  );
}
