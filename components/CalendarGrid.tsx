import type { CalendarDayCell } from "@/lib/api";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarGridProps = {
  weeks: CalendarDayCell[][];
  onDayClick?: (cell: CalendarDayCell) => void;
};

export function CalendarGrid({ weeks, onDayClick }: CalendarGridProps) {
  return (
    <table className="w-full table-fixed border-collapse text-center text-sm">
      <thead>
        <tr>
          {WEEKDAY_HEADERS.map((day) => (
            <th key={day} className="p-2 font-medium text-gray-500">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                title={cell.ad_date ?? undefined}
                onClick={() => cell.bs_day !== null && onDayClick?.(cell)}
                className={[
                  "p-2",
                  cell.bs_day === null ? "text-transparent" : "cursor-pointer hover:bg-gray-100",
                  cell.is_today ? "rounded bg-black text-white hover:bg-black" : "",
                ].join(" ")}
              >
                {cell.bs_day ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
