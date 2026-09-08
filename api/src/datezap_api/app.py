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
    TodayResponse,
)
from datezap_api.service import ConvertResult, convert_date, get_today

app = FastAPI(title="datezap API")


def _bs_date_out(bs: nepkit.BSDate) -> BSDateOut:
    return BSDateOut(
        year=bs.year,
        month=bs.month,
        day=bs.day,
        iso=nepkit.format_bs_date(bs),
        named=nepkit.format_bs_date(bs, named=True),
    )


class _ConvertResultFields(TypedDict):
    bs: BSDateOut
    ad: str
    ad_named: str


def _convert_result_fields(result: ConvertResult) -> _ConvertResultFields:
    return {
        "bs": _bs_date_out(result.bs),
        "ad": result.ad.isoformat(),
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


@app.post("/api/convert", response_model=ConvertResponse)
async def convert(payload: ConvertRequest) -> ConvertResponse:
    result = convert_date(payload.direction, payload.value)
    return ConvertResponse(input=payload.value, **_convert_result_fields(result))


@app.get("/api/today", response_model=TodayResponse)
async def today() -> TodayResponse:
    result = get_today()
    return TodayResponse(**_convert_result_fields(result))


@app.get("/api/calendar", response_model=CalendarResponse)
async def calendar(
    year: Annotated[int, Query(ge=nepkit.MIN_BS_YEAR, le=nepkit.MAX_BS_YEAR)],
    month: Annotated[int, Query(ge=1, le=12)],
) -> CalendarResponse:
    result = get_calendar_month(year, month)
    weeks = [
        [
            CalendarDayCell(
                bs_day=day,
                ad_date=ad.isoformat() if ad is not None else None,
                is_today=day is not None and day == result.today_day,
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
