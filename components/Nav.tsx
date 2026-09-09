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
    <header className="border-b border-panel-line bg-casing-deep">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="pilot-dot" />
          <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-ivory">
            datezap
          </span>
          <span className="hidden font-sans text-[11px] uppercase tracking-[0.14em] text-muted sm:inline">
            BS ⇄ AD departure board
          </span>
        </Link>

        <nav aria-label="Board sections" className="flex items-center gap-1">
          {ROUTES.map((route) => {
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-amber" : "text-muted hover:text-amber"
                }`}
              >
                {route.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-amber" aria-hidden="true" />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setDevnagari(!devnagari)}
            aria-pressed={devnagari}
            title="Toggle devnagari numerals"
            className={`ml-2 rounded border px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide transition-colors ${
              devnagari
                ? "border-amber text-amber"
                : "border-panel-line text-muted hover:border-amber hover:text-ivory"
            }`}
          >
            Devnagari
          </button>
          <a
            href="/api/docs"
            className="ml-2 flex items-center gap-1.5 rounded border border-panel-line px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-amber hover:text-ivory"
          >
            API docs
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </nav>
      </div>
    </header>
  );
}
