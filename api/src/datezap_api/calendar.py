from __future__ import annotations

from dataclasses import dataclass
from datetime import date

import nepkit
from nepkit.render import bs_month_grid


@dataclass(frozen=True, slots=True)
class CalendarMonth:
    year: int
    month: int
    title: str
    subtitle: str
    weeks: tuple[tuple[int | None, ...], ...]
    ad_weeks: tuple[tuple[date | None, ...], ...]
    today_day: int | None


def get_calendar_month(year: int, month: int, today: date | None = None) -> CalendarMonth:
    today_ad = today if today is not None else date.today()
    today_bs = nepkit.ad_to_bs(today_ad)
    grid = bs_month_grid(year, month, today=today_bs)
    ad_weeks = tuple(
        tuple(
            nepkit.bs_to_ad(nepkit.BSDate(year, month, day)) if day is not None else None
            for day in week
        )
        for week in grid.weeks
    )
    return CalendarMonth(
        year=year,
        month=month,
        title=grid.title,
        subtitle=grid.subtitle,
        weeks=grid.weeks,
        ad_weeks=ad_weeks,
        today_day=grid.today,
    )
