type FlapRowProps = {
  value: string;
  label: string;
  size?: "sm" | "md" | "lg";
  hazard?: boolean;
};

const SIZE_CLASSES: Record<NonNullable<FlapRowProps["size"]>, string> = {
  sm: "h-7 w-5 text-sm",
  md: "h-11 w-8 text-xl",
  lg: "h-16 w-11 text-3xl sm:h-20 sm:w-14 sm:text-4xl",
};

// Splitting on UTF-16 code units (value.split("")) tears a devnagari base
// consonant apart from its combining vowel sign, leaving the sign alone in
// its own flap cell with no visible glyph. Segment by grapheme cluster
// instead so each flap cell holds one complete, renderable character.
const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function splitGraphemes(value: string): string[] {
  return segmenter ? Array.from(segmenter.segment(value), (s) => s.segment) : Array.from(value);
}

export function FlapRow({ value, label, size = "md", hazard = false }: FlapRowProps) {
  const chars = splitGraphemes(value);
  const cellClass = SIZE_CLASSES[size];

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {chars.map((char, index) => {
        const blank = char === " ";
        return (
          <span
            key={`${index}-${char === " " ? "space" : "char"}`}
            className={`flap-cell ${cellClass} ${blank ? "flap-cell--blank" : ""} ${
              hazard && !blank ? "flap-cell--hazard" : ""
            }`}
          >
            {!blank && !hazard && (
              <span key={char} className="flap-cell__face">
                {char}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
