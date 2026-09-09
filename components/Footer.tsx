"use client";

import { useEffect, useState } from "react";
import { getRange } from "@/lib/api";
import type { DateRangeResponse } from "@/lib/api";
import { ExternalLinkIcon } from "@/components/icons";

const LINKS = [
  { label: "nepkit", href: "https://github.com/akakritagya/nepkit" },
  { label: "nepkit on PyPI", href: "https://pypi.org/project/nepkit/" },
  { label: "datezap", href: "https://github.com/akakritagya/datezap" },
];

export function Footer() {
  const [range, setRange] = useState<DateRangeResponse | null>(null);

  useEffect(() => {
    getRange()
      .then(setRange)
      .catch(() => setRange(null));
  }, []);

  return (
    <footer className="border-t border-panel-line bg-casing-deep">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
        <span className="font-sans text-xs text-muted">
          {range
            ? `Covers BS ${range.bs_min_year}–${range.bs_max_year} · AD ${range.ad_min} – ${range.ad_max}`
            : "Covers a bundled BS/AD date range"}
        </span>
        <nav aria-label="Project links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-amber"
            >
              {link.label}
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
