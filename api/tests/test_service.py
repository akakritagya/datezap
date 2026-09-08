from datetime import date

import nepkit
import pytest

from datezap_api.service import ConvertResult, convert_date, get_today


def test_convert_bs_to_ad() -> None:
    result = convert_date("bs2ad", "2081-04-15")
    assert result == ConvertResult(bs=nepkit.BSDate(2081, 4, 15), ad=date(2024, 7, 30))


def test_convert_ad_to_bs() -> None:
    result = convert_date("ad2bs", "2024-07-30")
    assert result == ConvertResult(bs=nepkit.BSDate(2081, 4, 15), ad=date(2024, 7, 30))


def test_convert_bs_to_ad_natural_language() -> None:
    result = convert_date("bs2ad", "15 Shrawan 2081")
    assert result.ad == date(2024, 7, 30)


def test_convert_bs_to_ad_invalid_date_raises() -> None:
    with pytest.raises(nepkit.InvalidDateError):
        convert_date("bs2ad", "2081-04-33")


def test_convert_bs_to_ad_out_of_range_raises() -> None:
    with pytest.raises(nepkit.DateOutOfRangeError):
        convert_date("bs2ad", "1500-01-01")


def test_get_today_with_explicit_date() -> None:
    result = get_today(today=date(2024, 7, 30))
    assert result.bs == nepkit.BSDate(2081, 4, 15)
    assert result.ad == date(2024, 7, 30)
