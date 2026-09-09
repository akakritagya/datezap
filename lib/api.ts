export type BSDate = {
  year: number;
  month: number;
  day: number;
  iso: string;
  named: string;
};

export type ConvertDirection = "bs2ad" | "ad2bs";

export type ConvertResponse = {
  input: string;
  bs: BSDate;
  ad: string;
  ad_named: string;
};

export type TodayResponse = {
  bs: BSDate;
  ad: string;
  ad_named: string;
};

export type CalendarDayCell = {
  bs_day: number | null;
  ad_date: string | null;
  is_today: boolean;
  day_label: string | null;
};

export type CalendarResponse = {
  year: number;
  month: number;
  title: string;
  subtitle: string;
  weeks: CalendarDayCell[][];
};

export type DateRangeResponse = {
  bs_min_year: number;
  bs_max_year: number;
  ad_min: string;
  ad_max: string;
};

export type MonthQueryResponse = {
  year: number;
  month: number;
};

type ApiErrorBody = {
  error_code?: unknown;
  message?: unknown;
};

export class ApiError extends Error {
  errorCode: string;

  constructor(errorCode: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiErrorBody & T;
  if (!response.ok) {
    const errorCode = typeof body.error_code === "string" ? body.error_code : "RequestError";
    const message = typeof body.message === "string" ? body.message : response.statusText;
    throw new ApiError(errorCode, message);
  }
  return body;
}

export async function convertDate(
  direction: ConvertDirection,
  value: string,
  devnagari = false,
): Promise<ConvertResponse> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction, value, devnagari }),
  });
  return parseJsonOrThrow<ConvertResponse>(response);
}

export async function getToday(devnagari = false): Promise<TodayResponse> {
  const response = await fetch(`/api/today?devnagari=${devnagari}`);
  return parseJsonOrThrow<TodayResponse>(response);
}

export async function getCalendarMonth(
  year: number,
  month: number,
  devnagari = false,
): Promise<CalendarResponse> {
  const response = await fetch(`/api/calendar?year=${year}&month=${month}&devnagari=${devnagari}`);
  return parseJsonOrThrow<CalendarResponse>(response);
}

export async function getRange(): Promise<DateRangeResponse> {
  const response = await fetch("/api/range");
  return parseJsonOrThrow<DateRangeResponse>(response);
}

export async function resolveMonthQuery(query: string): Promise<MonthQueryResponse> {
  const response = await fetch(`/api/calendar/resolve?query=${encodeURIComponent(query)}`);
  return parseJsonOrThrow<MonthQueryResponse>(response);
}
