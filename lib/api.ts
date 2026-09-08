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
};

export type CalendarResponse = {
  year: number;
  month: number;
  title: string;
  subtitle: string;
  weeks: CalendarDayCell[][];
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
): Promise<ConvertResponse> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction, value }),
  });
  return parseJsonOrThrow<ConvertResponse>(response);
}

export async function getToday(): Promise<TodayResponse> {
  const response = await fetch("/api/today");
  return parseJsonOrThrow<TodayResponse>(response);
}

export async function getCalendarMonth(year: number, month: number): Promise<CalendarResponse> {
  const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
  return parseJsonOrThrow<CalendarResponse>(response);
}
