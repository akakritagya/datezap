from datetime import date

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


def test_today_returns_valid_shape() -> None:
    response = client.get("/api/today")
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"bs", "ad", "ad_named"}
    assert date.fromisoformat(body["ad"])


def test_calendar_shrawan_2081() -> None:
    response = client.get("/api/calendar", params={"year": 2081, "month": 4})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Shrawan 2081"
    assert len(body["weeks"]) == 5
    assert body["weeks"][0][0] == {"bs_day": None, "ad_date": None, "is_today": False}
    assert body["weeks"][0][2] == {"bs_day": 1, "ad_date": "2024-07-16", "is_today": False}


def test_calendar_out_of_range_year_returns_422() -> None:
    response = client.get("/api/calendar", params={"year": 1500, "month": 1})
    assert response.status_code == 422
