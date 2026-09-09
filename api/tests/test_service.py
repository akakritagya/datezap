from datetime import date

import nepkit
import pytest

from datezap_api.service import ConvertResult, convert_date, get_today, resolve_month_query


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


def test_resolve_month_query_numeric_mm_yyyy() -> None:
    assert resolve_month_query("04-2081") == (2081, 4)


def test_resolve_month_query_numeric_mm_yyyy_no_leading_zero() -> None:
    assert resolve_month_query("4-2081") == (2081, 4)


def test_resolve_month_query_month_name() -> None:
    assert resolve_month_query("Bhadra 2083") == (2083, 5)


def test_resolve_month_query_month_name_case_insensitive() -> None:
    assert resolve_month_query("shrawan 2081") == (2081, 4)


def test_resolve_month_query_month_alias() -> None:
    assert resolve_month_query("Baishakh 2081") == (2081, 1)


def test_resolve_month_query_strips_whitespace() -> None:
    assert resolve_month_query("  Bhadra   2083  ") == (2083, 5)


def test_resolve_month_query_unrecognised_month_name_raises() -> None:
    with pytest.raises(nepkit.InvalidDateError):
        resolve_month_query("Notamonth 2081")


def test_resolve_month_query_numeric_month_out_of_bounds_raises() -> None:
    with pytest.raises(nepkit.InvalidDateError):
        resolve_month_query("13-2081")


def test_resolve_month_query_garbage_raises() -> None:
    with pytest.raises(nepkit.InvalidDateError):
        resolve_month_query("not a query")


def test_resolve_month_query_year_out_of_range_raises() -> None:
    with pytest.raises(nepkit.DateOutOfRangeError):
        resolve_month_query("Baisakh 1500")
