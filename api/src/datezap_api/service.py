from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

import nepkit

from datezap_api.clock import today_in_nepal


@dataclass(frozen=True, slots=True)
class ConvertResult:
    bs: nepkit.BSDate
    ad: date


def convert_date(direction: Literal["bs2ad", "ad2bs"], value: str) -> ConvertResult:
    if direction == "bs2ad":
        bs = nepkit.parse_bs_date(value)
        ad = nepkit.bs_to_ad(bs)
    else:
        ad = nepkit.parse_ad_date(value)
        bs = nepkit.ad_to_bs(ad)
    return ConvertResult(bs=bs, ad=ad)


def get_today(today: date | None = None) -> ConvertResult:
    ad = today if today is not None else today_in_nepal()
    bs = nepkit.ad_to_bs(ad)
    return ConvertResult(bs=bs, ad=ad)


def resolve_month_query(query: str) -> tuple[int, int]:
    """Resolve a "MM-YYYY" or "Month YYYY" search string to (year, month).

    The month may be numeric or a name/alias recognised by
    `nepkit.parse_bs_month` -- reusing that lookup instead of duplicating
    nepkit's month-name/alias table here.
    """
    text = query.strip()
    parts = text.split() if " " in text else text.split("-")
    if len(parts) != 2:
        raise nepkit.InvalidDateError(f"{query!r} is not a recognised month/year query")
    month_text, year_text = (part.strip() for part in parts)
    if not year_text.isdecimal():
        raise nepkit.InvalidDateError(f"{query!r} is not a recognised month/year query")
    month = nepkit.parse_bs_month(month_text)
    if not 1 <= month <= 12:
        raise nepkit.InvalidDateError(f"{month_text!r} is not a valid month")
    year = int(year_text)
    if not nepkit.MIN_BS_YEAR <= year <= nepkit.MAX_BS_YEAR:
        raise nepkit.DateOutOfRangeError(
            f"{year} is outside the supported range " f"({nepkit.MIN_BS_YEAR}-{nepkit.MAX_BS_YEAR})"
        )
    return year, month
