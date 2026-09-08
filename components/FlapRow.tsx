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

export function FlapRow({ value, label, size = "md", hazard = false }: FlapRowProps) {
  const chars = value.split("");
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
