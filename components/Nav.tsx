"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLinkIcon } from "@/components/icons";
import { useDevnagari } from "@/lib/devnagari-context";

const ROUTES = [
  { href: "/", label: "Converter" },
  { href: "/calendar", label: "Calendar" },
  { href: "/picker", label: "Picker" },
];

export function Nav() {
  const pathname = usePathname();
  const { devnagari, setDevnagari } = useDevnagari();

  return (
    <header className="w-full border-b border-panel-line bg-casing-deep">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 pt-3 pb-0 sm:px-6 sm:pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="pilot-dot" />
            <span className="font-display text-xl font-extrabold uppercase tracking-tight text-ivory">
              datezap
            </span>
            <span className="hidden font-sans text-[11px] uppercase tracking-[0.14em] text-muted sm:inline">
              BS ⇄ AD departure board
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDevnagari(!devnagari)}
            aria-pressed={devnagari}
            title="Toggle devnagari numerals"
            className={`rounded-full border px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide transition-colors ${
              devnagari
                ? "border-amber text-amber"
                : "border-panel-line text-muted hover:border-amber hover:text-ivory"
            }`}
          >
            Devnagari
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <nav aria-label="Board sections" className="flex items-center gap-4">
            {ROUTES.map((route) => {
              const active = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-0.5 pt-0.5 pb-2 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                    active ? "text-amber" : "text-muted hover:text-amber"
                  }`}
                >
                  {route.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </nav>

          <a
            href="/api/docs"
            className="flex items-center gap-1.5 px-0.5 pt-0.5 pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-ivory"
          >
            API docs
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
