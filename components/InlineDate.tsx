import type { ReactNode } from "react";

type InlineDateProps = {
  children: ReactNode;
  className?: string;
};

// A date value sitting inside a sentence, not a flap-cell grid -- e.g. "today
// in Gregorian" or a supported-range boundary. Shares the flap font so it
// still reads as diegetic board data, styled as an inline code chip rather
// than a run of individual flap tiles.
export function InlineDate({ children, className = "" }: InlineDateProps) {
  return (
    <code
      className={`rounded bg-panel px-1.5 py-0.5 font-flap text-flap-dim ${className}`}
    >
      {children}
    </code>
  );
}
