from datetime import date

import nepkit
import pytest

from datezap_api.calendar import get_calendar_month


def test_get_calendar_month_shrawan_2081() -> None:
    result = get_calendar_month(2081, 4, today=date(2024, 7, 30))
    assert result.title == "Shrawan 2081"
    assert result.today_day == 15
    assert result.weeks[0] == (None, None, 1, 2, 3, 4, 5)
    assert result.weeks[-1] == (27, 28, 29, 30, 31, 32, None)
    # week index 2 is (13, 14, 15, 16, 17, 18, 19); day 15 sits at position 2
    assert result.ad_weeks[2][2] == date(2024, 7, 30)
    assert result.ad_weeks[0][0] is None
    assert result.ad_weeks[0][2] == date(2024, 7, 16)


def test_get_calendar_month_today_outside_month_is_none() -> None:
    result = get_calendar_month(2081, 1, today=date(2024, 7, 30))
    assert result.today_day is None


def test_get_calendar_month_invalid_month_raises() -> None:
    with pytest.raises(nepkit.InvalidDateError):
        get_calendar_month(2081, 13, today=date(2024, 7, 30))


def test_get_calendar_month_out_of_range_year_raises() -> None:
    with pytest.raises(nepkit.DateOutOfRangeError):
        get_calendar_month(1500, 1, today=date(2024, 7, 30))


def test_get_calendar_month_devnagari_renders_title() -> None:
    result = get_calendar_month(2081, 4, today=date(2024, 7, 30), devnagari=True)
    assert result.title == nepkit.bs_month_name(4, devnagari=True) + " " + "२०८१"


def test_get_calendar_month_devnagari_leaves_subtitle_latin() -> None:
    # subtitle carries the Gregorian (AD) range -- the devnagari toggle is a
    # Nepali-date-only affordance and must not touch it.
    result = get_calendar_month(2081, 4, today=date(2024, 7, 30), devnagari=True)
    assert result.subtitle == "16 Jul - 16 Aug 2024"
