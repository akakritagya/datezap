import type { CalendarDayCell } from "@/lib/api";
import { LatchIcon } from "@/components/icons";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarGridProps = {
  weeks: CalendarDayCell[][];
  onDayClick?: (cell: CalendarDayCell) => void;
  selectedDay?: number | null;
  compact?: boolean;
};

export function CalendarGrid({ weeks, onDayClick, selectedDay = null, compact = false }: CalendarGridProps) {
  return (
    <table className="w-full table-fixed border-separate border-spacing-1.5 text-center">
      <thead>
        <tr>
          {WEEKDAY_HEADERS.map((day) => (
            <th
              key={day}
              scope="col"
              className="pb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((cell, cellIndex) => {
              const empty = cell.bs_day === null;
              const clickable = !empty && cell.ad_date !== null && onDayClick;
              const selected = !empty && cell.bs_day === selectedDay;

              return (
                <td key={cellIndex} className="p-0">
                  {empty ? (
                    <div className="flap-cell flap-cell--blank aspect-square w-full" />
                  ) : (
                    <button
                      type="button"
                      title={cell.ad_date ?? undefined}
                      disabled={!clickable}
                      aria-pressed={onDayClick ? selected : undefined}
                      onClick={() => clickable && onDayClick?.(cell)}
                      className={`flap-cell relative aspect-square w-full text-sm font-bold ${
                        compact ? "" : "sm:text-base lg:text-lg"
                      } ${
                        clickable ? "cursor-pointer hover:brightness-95" : "cursor-default"
                      } ${cell.is_today ? "flap-cell--today" : ""} ${
                        selected ? "flap-cell--selected" : ""
                      }`}
                    >
                      <span
                        className="flap-cell__face"
                        key={cell.bs_day}
                        style={{ animationDelay: `${(weekIndex * 7 + cellIndex) * 18}ms` }}
                      >
                        {cell.day_label}
                      </span>
                      {selected && (
                        <LatchIcon className="absolute bottom-1 left-1 h-3 w-3 text-amber" />
                      )}
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
