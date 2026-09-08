from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

import nepkit


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
    ad = today if today is not None else date.today()
    bs = nepkit.ad_to_bs(ad)
    return ConvertResult(bs=bs, ad=ad)
