from __future__ import annotations

from typing import Annotated, TypedDict

import nepkit
from fastapi import FastAPI, Query
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from datezap_api.calendar import get_calendar_month
from datezap_api.errors import error_response_for, status_code_for
from datezap_api.schemas import (
    BSDateOut,
    CalendarDayCell,
    CalendarResponse,
    ConvertRequest,
    ConvertResponse,
    DateRangeResponse,
    TodayResponse,
)
from datezap_api.service import ConvertResult, convert_date, get_today

app = FastAPI(
    title="datezap API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


def _bs_date_out(bs: nepkit.BSDate, *, devnagari: bool = False) -> BSDateOut:
    return BSDateOut(
        year=bs.year,
        month=bs.month,
        day=bs.day,
        iso=nepkit.format_bs_date(bs),
        named=nepkit.format_bs_date(bs, named=True, devnagari=devnagari),
    )


class _ConvertResultFields(TypedDict):
    bs: BSDateOut
    ad: str
    ad_named: str


def _convert_result_fields(
    result: ConvertResult, *, devnagari: bool = False
) -> _ConvertResultFields:
    return {
        "bs": _bs_date_out(result.bs, devnagari=devnagari),
        "ad": result.ad.isoformat(),
        # devnagari is a Nepali-date-only toggle -- the Gregorian side stays Latin.
        "ad_named": nepkit.format_ad_date(result.ad, named=True),
    }


@app.exception_handler(nepkit.NepkitError)
async def nepkit_error_handler(request: Request, exc: nepkit.NepkitError) -> JSONResponse:
    return JSONResponse(
        status_code=status_code_for(exc),
        content=error_response_for(exc).model_dump(),
    )


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/range", response_model=DateRangeResponse)
async def date_range() -> DateRangeResponse:
    return DateRangeResponse(
        bs_min_year=nepkit.MIN_BS_YEAR,
        bs_max_year=nepkit.MAX_BS_YEAR,
        ad_min=nepkit.MIN_AD_DATE.isoformat(),
        ad_max=nepkit.MAX_AD_DATE.isoformat(),
    )


@app.post("/api/convert", response_model=ConvertResponse)
async def convert(payload: ConvertRequest) -> ConvertResponse:
    result = convert_date(payload.direction, payload.value)
    return ConvertResponse(
        input=payload.value, **_convert_result_fields(result, devnagari=payload.devnagari)
    )


@app.get("/api/today", response_model=TodayResponse)
async def today(devnagari: bool = False) -> TodayResponse:
    result = get_today()
    return TodayResponse(**_convert_result_fields(result, devnagari=devnagari))


@app.get("/api/calendar", response_model=CalendarResponse)
async def calendar(
    year: Annotated[int, Query(ge=nepkit.MIN_BS_YEAR, le=nepkit.MAX_BS_YEAR)],
    month: Annotated[int, Query(ge=1, le=12)],
    devnagari: bool = False,
) -> CalendarResponse:
    result = get_calendar_month(year, month, devnagari=devnagari)
    weeks = [
        [
            CalendarDayCell(
                bs_day=day,
                ad_date=ad.isoformat() if ad is not None else None,
                is_today=day is not None and day == result.today_day,
                day_label=(
                    nepkit.to_devnagari_numerals(str(day))
                    if day is not None and devnagari
                    else (str(day) if day is not None else None)
                ),
            )
            for day, ad in zip(week, ad_week, strict=True)
        ]
        for week, ad_week in zip(result.weeks, result.ad_weeks, strict=True)
    ]
    return CalendarResponse(
        year=result.year,
        month=result.month,
        title=result.title,
        subtitle=result.subtitle,
        weeks=weeks,
    )
