from datetime import date

import nepkit
from fastapi.testclient import TestClient

from datezap_api.app import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_convert_bs_to_ad() -> None:
    response = client.post("/api/convert", json={"direction": "bs2ad", "value": "2081-04-15"})
    assert response.status_code == 200
    body = response.json()
    assert body["ad"] == "2024-07-30"
    assert body["bs"] == {
        "year": 2081,
        "month": 4,
        "day": 15,
        "iso": "2081-04-15",
        "named": "15 Shrawan 2081",
    }


def test_convert_invalid_date_returns_400() -> None:
    response = client.post("/api/convert", json={"direction": "bs2ad", "value": "2081-04-33"})
    assert response.status_code == 400
    assert response.json()["error_code"] == "InvalidDateError"


def test_convert_out_of_range_returns_422() -> None:
    response = client.post("/api/convert", json={"direction": "bs2ad", "value": "1500-01-01"})
    assert response.status_code == 422
    assert response.json()["error_code"] == "DateOutOfRangeError"


def test_convert_devnagari_affects_bs_named_only() -> None:
    response = client.post(
        "/api/convert",
        json={"direction": "bs2ad", "value": "2081-04-15", "devnagari": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["bs"]["named"] == "१५ साउन २०८१"
    # devnagari is a Nepali-date-only toggle -- the Gregorian side stays Latin
    assert body["ad_named"] == "30 Jul 2024"
    # canonical/round-trippable fields stay Latin regardless of the toggle
    assert body["bs"]["iso"] == "2081-04-15"
    assert body["ad"] == "2024-07-30"


def test_today_returns_valid_shape() -> None:
    response = client.get("/api/today")
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"bs", "ad", "ad_named"}
    assert date.fromisoformat(body["ad"])


def test_today_devnagari_affects_bs_named_only() -> None:
    response = client.get("/api/today", params={"devnagari": True})
    assert response.status_code == 200
    body = response.json()
    latin_digits = set("0123456789")
    assert not (latin_digits & set(body["bs"]["named"]))
    # devnagari is a Nepali-date-only toggle -- the Gregorian side stays Latin
    assert latin_digits & set(body["ad_named"])
    # canonical fields are unaffected
    assert date.fromisoformat(body["ad"])


def test_calendar_shrawan_2081() -> None:
    response = client.get("/api/calendar", params={"year": 2081, "month": 4})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Shrawan 2081"
    assert len(body["weeks"]) == 5
    assert body["weeks"][0][0] == {
        "bs_day": None,
        "ad_date": None,
        "is_today": False,
        "day_label": None,
    }
    assert body["weeks"][0][2] == {
        "bs_day": 1,
        "ad_date": "2024-07-16",
        "is_today": False,
        "day_label": "1",
    }


def test_calendar_out_of_range_year_returns_422() -> None:
    response = client.get("/api/calendar", params={"year": 1500, "month": 1})
    assert response.status_code == 422


def test_calendar_devnagari_renders_title_and_day_labels() -> None:
    response = client.get("/api/calendar", params={"year": 2081, "month": 4, "devnagari": True})
    assert response.status_code == 200
    body = response.json()
    latin_digits = set("0123456789")
    assert not (latin_digits & set(body["title"]))
    # subtitle carries the Gregorian (AD) range -- devnagari is a
    # Nepali-date-only toggle and must not touch it.
    assert body["subtitle"] == "16 Jul - 16 Aug 2024"
    day_one_cell = body["weeks"][0][2]
    assert day_one_cell["bs_day"] == 1
    assert day_one_cell["day_label"] == "१"


def test_calendar_day_label_defaults_to_latin_digits() -> None:
    response = client.get("/api/calendar", params={"year": 2081, "month": 4})
    body = response.json()
    day_one_cell = body["weeks"][0][2]
    assert day_one_cell["day_label"] == "1"
    assert body["weeks"][0][0]["day_label"] is None


def test_range_returns_bundled_bounds() -> None:
    response = client.get("/api/range")
    assert response.status_code == 200
    assert response.json() == {
        "bs_min_year": nepkit.MIN_BS_YEAR,
        "bs_max_year": nepkit.MAX_BS_YEAR,
        "ad_min": nepkit.MIN_AD_DATE.isoformat(),
        "ad_max": nepkit.MAX_AD_DATE.isoformat(),
    }
