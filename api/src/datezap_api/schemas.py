from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class BSDateOut(BaseModel):
    year: int
    month: int
    day: int
    iso: str
    named: str


class ConvertRequest(BaseModel):
    direction: Literal["bs2ad", "ad2bs"]
    value: str


class ConvertResponse(BaseModel):
    input: str
    bs: BSDateOut
    ad: str
    ad_named: str


class TodayResponse(BaseModel):
    bs: BSDateOut
    ad: str
    ad_named: str


class CalendarDayCell(BaseModel):
    bs_day: int | None
    ad_date: str | None
    is_today: bool


class CalendarResponse(BaseModel):
    year: int
    month: int
    title: str
    subtitle: str
    weeks: list[list[CalendarDayCell]]


class ErrorResponse(BaseModel):
    error_code: str
    message: str
