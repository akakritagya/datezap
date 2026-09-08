# datezap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build datezap — a converter, calendar viewer, embeddable date-picker, and public API, all wrapping the `nepkit` Bikram Sambat ↔ Gregorian conversion library.

**Architecture:** One Vercel project. `api/` is a FastAPI app (Python, `nepkit` as the only date-math dependency) deployed as a single Vercel Python Function reachable at `/api/*`. The repo root is a Next.js (App Router) frontend that calls that API over `fetch`. No database, no auth, no persistence.

**Tech Stack:** Python 3.12, FastAPI, Pydantic v2, `nepkit` 0.4.x, uv/ruff/mypy/pytest/pre-commit (py-init "app" profile) for the backend; Next.js (TypeScript, App Router, Tailwind), npm for the frontend.

**Spec:** `docs/superpowers/specs/2026-09-08-datezap-design.md`

## Global Constraints

- BS date range is `nepkit.MIN_BS_YEAR` (2000) to `nepkit.MAX_BS_YEAR` (2090); AD range is `nepkit.MIN_AD_DATE` (1943-04-14) to `nepkit.MAX_AD_DATE` (2034-04-13). Never hardcode these — import them from `nepkit`.
- All backend code is fully type-hinted and passes `mypy --strict`; modern syntax (`X | None`, `Annotated[...]`) throughout.
- Backend error responses are `{error_code: str, message: str}`; `error_code` is the nepkit exception's class name (`InvalidDateError` → HTTP 400, `DateOutOfRangeError` → HTTP 422).
- No holiday data, no auth, no rate limiting, no persistence — v1 is stateless conversion/display only.
- Frontend calls the backend only via same-origin `/api/*` fetches (never hardcode a backend origin in a frontend file).

---

## File Structure

```
api/
  pyproject.toml            # uv + ruff + mypy + pytest config (py-init "app" profile)
  .gitignore                # api/ scoped only (.venv, __pycache__, etc.)
  requirements.txt          # generated via `uv export`; what Vercel deploys
  index.py                  # Vercel entrypoint: imports and re-exports `app`
  src/datezap_api/
    __init__.py
    service.py               # convert_date(), get_today()
    calendar.py              # get_calendar_month() built on nepkit.render.bs_month_grid
    schemas.py                # pydantic request/response models
    errors.py                 # nepkit exception -> (status_code, ErrorResponse) mapping
    app.py                    # FastAPI app, routes, exception handler
  tests/
    test_service.py
    test_calendar.py
    test_errors.py
    test_app.py

vercel.json                  # rewrites /api/:path* -> /api/index.py

app/
  layout.tsx                 # from create-next-app, unmodified
  globals.css                 # from create-next-app, unmodified
  page.tsx                    # converter + "today" widget
  calendar/page.tsx           # BS month grid viewer
  picker/page.tsx              # <NepaliDatePicker> demo
components/
  CalendarGrid.tsx             # shared week/day grid, used by calendar + picker
  NepaliDatePicker.tsx          # embeddable picker
lib/
  api.ts                       # typed fetch client mirroring the pydantic schemas
next.config.ts                 # dev-only proxy of /api/* to localhost:8000
README.md
```

---

### Task 1: Backend project scaffold

**Files:**
- Create: `api/pyproject.toml`
- Create: `api/.gitignore`
- Create: `api/src/datezap_api/__init__.py`
- Create: `api/tests/test_smoke.py`
- Create: `.pre-commit-config.yaml` (repo root, scoped to `api/`)

**Interfaces:**
- Produces: `datezap_api.__version__: str` — used only by this task's smoke test.

- [ ] **Step 1: Write the failing smoke test**

`api/tests/test_smoke.py`:
```python
from datezap_api import __version__


def test_version_is_set() -> None:
    assert __version__ == "0.1.0"
```

- [ ] **Step 2: Create the package files (test still fails: module doesn't exist)**

`api/src/datezap_api/__init__.py`:
```python
__version__ = "0.1.0"
```

`api/pyproject.toml`:
```toml
[project]
name = "datezap-api"
version = "0.1.0"
description = "FastAPI backend wrapping nepkit for datezap"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115,<1",
    "pydantic>=2.9,<3",
    "nepkit>=0.4,<0.5",
]

[dependency-groups]
dev = [
    "ruff>=0.8,<1",
    "mypy>=1.13,<2",
    "pytest>=8.3,<9",
    "pytest-cov>=6.0,<7",
    "httpx>=0.27,<1",
    "pre-commit>=4.0,<5",
]

[tool.ruff]
line-length = 100
src = ["src", "tests"]

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]

[tool.mypy]
python_version = "3.12"
strict = true
mypy_path = "src"

[tool.pytest.ini_options]
addopts = "--cov=datezap_api --cov-report=term-missing"
testpaths = ["tests"]
pythonpath = ["src"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/datezap_api"]
```

`api/.gitignore`:
```
.venv/
__pycache__/
*.pyc
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/
.coverage
```

- [ ] **Step 3: Install and run the test**

Run:
```bash
cd api
uv sync
uv run pytest -v
```
Expected: `test_version_is_set` PASSES (1 passed).

- [ ] **Step 4: Run lint and type checks**

Run:
```bash
cd api
uv run ruff check .
uv run mypy src
```
Expected: both report no errors (no source files under `src` yet besides `__init__.py`, so this just confirms the tools run cleanly).

- [ ] **Step 5: Add pre-commit config and install the hook**

`.pre-commit-config.yaml` (repo root):
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.4
    hooks:
      - id: ruff
        files: ^api/
        args: [--fix]
      - id: ruff-format
        files: ^api/
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks:
      - id: mypy
        files: ^api/src/
        args: ["--config-file=api/pyproject.toml"]
        additional_dependencies: ["fastapi>=0.115", "pydantic>=2.9", "nepkit>=0.4"]
```

Run (from repo root):
```bash
pip install --user pre-commit || pipx install pre-commit
pre-commit install
pre-commit run --all-files
```
Expected: hooks run and pass (nothing to fix yet beyond what's already clean).

- [ ] **Step 6: Commit**

```bash
git add api/pyproject.toml api/.gitignore api/src api/tests .pre-commit-config.yaml
git commit -m "Scaffold backend with uv/ruff/mypy/pytest/pre-commit (py-init app profile)"
```

---

### Task 2: Service layer — date conversion

**Files:**
- Create: `api/src/datezap_api/service.py`
- Test: `api/tests/test_service.py`

**Interfaces:**
- Consumes: `nepkit.{BSDate, parse_bs_date, parse_ad_date, bs_to_ad, ad_to_bs}` (installed package, no wrapper needed).
- Produces: `ConvertResult` (dataclass, fields `bs: nepkit.BSDate`, `ad: datetime.date`); `convert_date(direction: Literal["bs2ad", "ad2bs"], value: str) -> ConvertResult`; `get_today(today: date | None = None) -> ConvertResult`. Both raise `nepkit.InvalidDateError` / `nepkit.DateOutOfRangeError` uncaught — Task 5 handles translation to HTTP.

- [ ] **Step 1: Write the failing tests**

`api/tests/test_service.py`:
```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && uv run pytest tests/test_service.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'datezap_api.service'`.

- [ ] **Step 3: Implement**

`api/src/datezap_api/service.py`:
```python
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && uv run pytest tests/test_service.py -v`
Expected: 6 passed.

- [ ] **Step 5: Lint and type-check**

Run: `cd api && uv run ruff check . && uv run mypy src`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add api/src/datezap_api/service.py api/tests/test_service.py
git commit -m "Add service layer for BS/AD date conversion"
```

---

### Task 3: Service layer — calendar month grid

**Files:**
- Create: `api/src/datezap_api/calendar.py`
- Test: `api/tests/test_calendar.py`

**Interfaces:**
- Consumes: `nepkit.render.bs_month_grid(year, month, *, today=None) -> MonthGrid` (fields `title: str`, `subtitle: str`, `weeks: tuple[tuple[int | None, ...], ...]`, `today: int | None`); `nepkit.{BSDate, ad_to_bs, bs_to_ad}`.
- Produces: `CalendarMonth` (dataclass: `year: int`, `month: int`, `title: str`, `subtitle: str`, `weeks: tuple[tuple[int | None, ...], ...]`, `ad_weeks: tuple[tuple[date | None, ...], ...]`, `today_day: int | None`); `get_calendar_month(year: int, month: int, today: date | None = None) -> CalendarMonth`. Raises `nepkit.InvalidDateError` (bad month) / `nepkit.DateOutOfRangeError` (bad year) uncaught.

- [ ] **Step 1: Write the failing tests**

`api/tests/test_calendar.py`:
```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && uv run pytest tests/test_calendar.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'datezap_api.calendar'`.

- [ ] **Step 3: Implement**

`api/src/datezap_api/calendar.py`:
```python
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && uv run pytest tests/test_calendar.py -v`
Expected: 4 passed.

- [ ] **Step 5: Lint and type-check**

Run: `cd api && uv run ruff check . && uv run mypy src`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add api/src/datezap_api/calendar.py api/tests/test_calendar.py
git commit -m "Add calendar month grid service built on nepkit.render.bs_month_grid"
```

---

### Task 4: Pydantic schemas and error taxonomy

**Files:**
- Create: `api/src/datezap_api/schemas.py`
- Create: `api/src/datezap_api/errors.py`
- Test: `api/tests/test_errors.py`

**Interfaces:**
- Consumes: `nepkit.{NepkitError, InvalidDateError, DateOutOfRangeError}`.
- Produces (schemas.py): `BSDateOut`, `ConvertRequest`, `ConvertResponse`, `TodayResponse`, `CalendarDayCell`, `CalendarResponse`, `ErrorResponse` (pydantic `BaseModel`s — field names below are load-bearing for Task 5 and Task 7's TypeScript client).
- Produces (errors.py): `status_code_for(exc: nepkit.NepkitError) -> int`; `error_response_for(exc: nepkit.NepkitError) -> ErrorResponse`.

- [ ] **Step 1: Write the failing test**

`api/tests/test_errors.py`:
```python
import nepkit

from datezap_api.errors import error_response_for, status_code_for


def test_invalid_date_error_maps_to_400() -> None:
    exc = nepkit.InvalidDateError("BS month 13 is outside [1, 12]")
    assert status_code_for(exc) == 400
    response = error_response_for(exc)
    assert response.error_code == "InvalidDateError"
    assert response.message == "BS month 13 is outside [1, 12]"


def test_out_of_range_error_maps_to_422() -> None:
    exc = nepkit.DateOutOfRangeError("BS year 1500 is outside the bundled range [2000, 2090]")
    assert status_code_for(exc) == 422
    assert error_response_for(exc).error_code == "DateOutOfRangeError"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && uv run pytest tests/test_errors.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'datezap_api.errors'`.

- [ ] **Step 3: Implement schemas.py**

`api/src/datezap_api/schemas.py`:
```python
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
```

- [ ] **Step 4: Implement errors.py**

`api/src/datezap_api/errors.py`:
```python
from __future__ import annotations

import nepkit

from datezap_api.schemas import ErrorResponse

_STATUS_BY_EXCEPTION: dict[type[nepkit.NepkitError], int] = {
    nepkit.InvalidDateError: 400,
    nepkit.DateOutOfRangeError: 422,
}


def status_code_for(exc: nepkit.NepkitError) -> int:
    for exc_type, status in _STATUS_BY_EXCEPTION.items():
        if isinstance(exc, exc_type):
            return status
    return 400


def error_response_for(exc: nepkit.NepkitError) -> ErrorResponse:
    return ErrorResponse(error_code=type(exc).__name__, message=str(exc))
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd api && uv run pytest tests/test_errors.py -v`
Expected: 2 passed.

- [ ] **Step 6: Lint and type-check**

Run: `cd api && uv run ruff check . && uv run mypy src`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add api/src/datezap_api/schemas.py api/src/datezap_api/errors.py api/tests/test_errors.py
git commit -m "Add pydantic schemas and nepkit-error-to-HTTP mapping"
```

---

### Task 5: FastAPI app and routes

**Files:**
- Create: `api/src/datezap_api/app.py`
- Test: `api/tests/test_app.py`

**Interfaces:**
- Consumes: `datezap_api.service.{convert_date, get_today, ConvertResult}`, `datezap_api.calendar.get_calendar_month`, `datezap_api.errors.{status_code_for, error_response_for}`, `datezap_api.schemas.*` (all from prior tasks).
- Produces: `app: fastapi.FastAPI` with routes `GET /api/health`, `POST /api/convert`, `GET /api/today`, `GET /api/calendar` — this is what Task 6's Vercel entrypoint imports.

- [ ] **Step 1: Write the failing tests**

`api/tests/test_app.py`:
```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && uv run pytest tests/test_app.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'datezap_api.app'`.

- [ ] **Step 3: Implement**

`api/src/datezap_api/app.py`:
```python
from __future__ import annotations

from typing import Annotated

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


def _convert_result_fields(result: ConvertResult) -> dict[str, object]:
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
```

Note: `year`/`month` on `/api/calendar` are constrained directly by FastAPI's `Query(ge=..., le=...)`, so out-of-range values there return FastAPI's default validation-error body (`{"detail": [...]}), not our `{error_code, message}` shape — deliberate: this endpoint only ever receives values the frontend computes internally (never raw user text), unlike `/api/convert`. Task 7's client handles both shapes defensively.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && uv run pytest tests/test_app.py -v`
Expected: 7 passed.

- [ ] **Step 5: Run the full backend test suite, lint, and type-check**

Run:
```bash
cd api
uv run pytest -v
uv run ruff check .
uv run mypy src
```
Expected: all tests pass (19 total across Tasks 1-5), no lint/type errors.

- [ ] **Step 6: Commit**

```bash
git add api/src/datezap_api/app.py api/tests/test_app.py
git commit -m "Add FastAPI app with convert/today/calendar routes and error handling"
```

---

### Task 6: Vercel Python entrypoint and deploy config

**Files:**
- Create: `api/index.py`
- Create: `vercel.json` (repo root)
- Create/Modify: `api/requirements.txt` (generated, not hand-written)

**Interfaces:**
- Consumes: `datezap_api.app.app` (Task 5).
- Produces: `api/index.py` exposing module-level `app` — the ASGI callable Vercel's Python runtime loads.

- [ ] **Step 1: Create the entrypoint**

`api/index.py`:
```python
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from datezap_api.app import app  # noqa: E402

__all__ = ["app"]
```

- [ ] **Step 2: Verify the entrypoint imports and serves correctly**

Run:
```bash
cd api
uv run python -c "
import sys
sys.path.insert(0, '.')
import index
print(type(index.app).__name__)
"
```
Expected output: `FastAPI`

Then verify it actually serves:
```bash
cd api
uv run uvicorn index:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!
sleep 1
curl -sf http://127.0.0.1:8000/api/health
kill "$SERVER_PID"
```
Expected: `{"status":"ok"}` printed by curl, then the server is killed cleanly.

- [ ] **Step 3: Generate requirements.txt for Vercel's Python builder**

Run:
```bash
cd api
uv export --no-hashes --no-dev -o requirements.txt
cat requirements.txt
```
Expected: file contains `fastapi`, `pydantic`, `nepkit`, and their transitive dependencies — no `ruff`/`mypy`/`pytest`/`pre-commit` lines.

- [ ] **Step 4: Add the Vercel rewrite**

`vercel.json` (repo root):
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.py" }
  ]
}
```

This guarantees every `/api/*` request reaches the single FastAPI app regardless of Vercel's default per-file Python routing granularity.

- [ ] **Step 5: Commit**

```bash
git add api/index.py api/requirements.txt vercel.json
git commit -m "Add Vercel Python entrypoint, generated requirements.txt, and API rewrite"
```

---

### Task 7: Next.js scaffold and typed API client

**Files:**
- Create: (via `create-next-app`) `app/layout.tsx`, `app/globals.css`, `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc`/`eslint.config.*`, `.gitignore` (root), `public/`
- Modify: `next.config.ts` (replace generated content)
- Create: `lib/api.ts`

**Interfaces:**
- Consumes: the JSON shapes from Task 5's routes (`ConvertResponse`, `TodayResponse`, `CalendarResponse`, `ErrorResponse` — mirrored here as TypeScript types with identical field names).
- Produces: `ApiError` (class, `.message: string`, `.errorCode: string`), `convertDate(direction, value) -> Promise<ConvertResponse>`, `getToday() -> Promise<TodayResponse>`, `getCalendarMonth(year, month) -> Promise<CalendarResponse>` — consumed by Tasks 8-10.

- [ ] **Step 1: Scaffold into a temp directory, then move into the repo root**

The repo root already has `.git`, `docs/`, and `api/`, which trips `create-next-app`'s "directory not empty" check — scaffold into an empty sibling directory first, then move the generated files up. Because the temp directory is nested inside our already-initialized git repo, `create-next-app` detects the existing repo and will not run its own `git init`.

Run (from repo root):
```bash
npx --yes create-next-app@latest datezap-web-tmp \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --use-npm
shopt -s dotglob nullglob
mv datezap-web-tmp/* .
rmdir datezap-web-tmp
```
Expected: `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, `node_modules/` now exist at the repo root; `docs/` and `api/` are untouched.

- [ ] **Step 2: Verify the scaffold builds**

Run: `npm run build`
Expected: build succeeds (default Next.js starter page).

- [ ] **Step 3: Replace next.config.ts with a dev-only API proxy**

The frontend calls same-origin `/api/*` everywhere (Global Constraints). In production, Vercel routes `/api/*` to the Python function directly (Task 6's `vercel.json`). Locally, `next dev` has no such routing, so proxy to a uvicorn instance on port 8000 — dev-only, so it never affects the production path.

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Add the typed API client**

`lib/api.ts`:
```ts
export type BSDate = {
  year: number;
  month: number;
  day: number;
  iso: string;
  named: string;
};

export type ConvertDirection = "bs2ad" | "ad2bs";

export type ConvertResponse = {
  input: string;
  bs: BSDate;
  ad: string;
  ad_named: string;
};

export type TodayResponse = {
  bs: BSDate;
  ad: string;
  ad_named: string;
};

export type CalendarDayCell = {
  bs_day: number | null;
  ad_date: string | null;
  is_today: boolean;
};

export type CalendarResponse = {
  year: number;
  month: number;
  title: string;
  subtitle: string;
  weeks: CalendarDayCell[][];
};

type ApiErrorBody = {
  error_code?: unknown;
  message?: unknown;
};

export class ApiError extends Error {
  errorCode: string;

  constructor(errorCode: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiErrorBody & T;
  if (!response.ok) {
    const errorCode = typeof body.error_code === "string" ? body.error_code : "RequestError";
    const message = typeof body.message === "string" ? body.message : response.statusText;
    throw new ApiError(errorCode, message);
  }
  return body;
}

export async function convertDate(
  direction: ConvertDirection,
  value: string,
): Promise<ConvertResponse> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction, value }),
  });
  return parseJsonOrThrow<ConvertResponse>(response);
}

export async function getToday(): Promise<TodayResponse> {
  const response = await fetch("/api/today");
  return parseJsonOrThrow<TodayResponse>(response);
}

export async function getCalendarMonth(year: number, month: number): Promise<CalendarResponse> {
  const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
  return parseJsonOrThrow<CalendarResponse>(response);
}
```

- [ ] **Step 5: Verify the client compiles**

Run: `npm run build`
Expected: succeeds (type-checks `lib/api.ts`; nothing references it yet so no runtime change).

- [ ] **Step 6: Commit**

```bash
git add app public package.json package-lock.json tsconfig.json next.config.ts \
  next-env.d.ts .gitignore eslint.config.mjs postcss.config.mjs lib/api.ts
git commit -m "Scaffold Next.js frontend and add typed API client"
```

(Adjust the exact config file names in the `git add` list to whatever `create-next-app` generated — `eslint.config.mjs`/`.eslintrc.json` and `postcss.config.mjs`/`.js` vary by version; `git status` shows the actual names.)

---

### Task 8: Converter page

**Files:**
- Modify: `app/page.tsx` (replace `create-next-app`'s default content)

**Interfaces:**
- Consumes: `ApiError`, `convertDate`, `getToday` and types `ConvertDirection`, `ConvertResponse`, `TodayResponse` from `@/lib/api` (Task 7).

- [ ] **Step 1: Implement the converter page**

`app/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError, convertDate, getToday } from "@/lib/api";
import type { ConvertDirection, ConvertResponse, TodayResponse } from "@/lib/api";

export default function HomePage() {
  const [direction, setDirection] = useState<ConvertDirection>("bs2ad");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<TodayResponse | null>(null);

  useEffect(() => {
    getToday()
      .then(setToday)
      .catch(() => setToday(null));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    try {
      const response = await convertDate(direction, value);
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">datezap</h1>

      {today && (
        <p className="text-sm text-gray-600">
          Today: {today.bs.named} &middot; {today.ad_named}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Direction</span>
          <select
            value={direction}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setDirection(event.target.value as ConvertDirection)
            }
            className="rounded border border-gray-300 p-2"
          >
            <option value="bs2ad">Bikram Sambat to Gregorian</option>
            <option value="ad2bs">Gregorian to Bikram Sambat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Date</span>
          <input
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
            placeholder={direction === "bs2ad" ? "2081-04-15 or 15 Shrawan 2081" : "2024-07-30"}
            className="rounded border border-gray-300 p-2"
          />
        </label>

        <button
          type="submit"
          disabled={value.trim().length === 0}
          className="rounded bg-black p-2 text-white disabled:opacity-50"
        >
          Convert
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded border border-gray-200 p-4 text-sm">
          <p>
            BS: {result.bs.named} ({result.bs.iso})
          </p>
          <p>
            AD: {result.ad_named} ({result.ad})
          </p>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Add converter page with today widget"
```

---

### Task 9: Calendar grid component and viewer page

**Files:**
- Create: `components/CalendarGrid.tsx`
- Create: `app/calendar/page.tsx`

**Interfaces:**
- Consumes: `CalendarDayCell` type (`@/lib/api`, Task 7); `getCalendarMonth`, `ApiError`, `CalendarResponse` (Task 7).
- Produces: `CalendarGrid({ weeks: CalendarDayCell[][], onDayClick?: (cell: CalendarDayCell) => void })` — a React component reused by Task 10's picker.

- [ ] **Step 1: Implement the grid component**

`components/CalendarGrid.tsx`:
```tsx
import type { CalendarDayCell } from "@/lib/api";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarGridProps = {
  weeks: CalendarDayCell[][];
  onDayClick?: (cell: CalendarDayCell) => void;
};

export function CalendarGrid({ weeks, onDayClick }: CalendarGridProps) {
  return (
    <table className="w-full table-fixed border-collapse text-center text-sm">
      <thead>
        <tr>
          {WEEKDAY_HEADERS.map((day) => (
            <th key={day} className="p-2 font-medium text-gray-500">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                title={cell.ad_date ?? undefined}
                onClick={() => cell.bs_day !== null && onDayClick?.(cell)}
                className={[
                  "p-2",
                  cell.bs_day === null ? "text-transparent" : "cursor-pointer hover:bg-gray-100",
                  cell.is_today ? "rounded bg-black text-white hover:bg-black" : "",
                ].join(" ")}
              >
                {cell.bs_day ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Implement the calendar page**

`app/calendar/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth } from "@/lib/api";
import type { CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";

const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2090;

function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}

function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

export default function CalendarPage() {
  const [year, setYear] = useState(2081);
  const [month, setMonth] = useState(4);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCalendarMonth(year, month)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, [year, month]);

  function goToPrevious() {
    const [nextYear, nextMonthValue] = previousMonth(year, month);
    if (nextYear < MIN_BS_YEAR) return;
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  function goToNext() {
    const [nextYear, nextMonthValue] = nextMonth(year, month);
    if (nextYear > MAX_BS_YEAR) return;
    setYear(nextYear);
    setMonth(nextMonthValue);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <button onClick={goToPrevious} className="rounded border px-3 py-1">
          &larr; Prev
        </button>
        <h1 className="text-lg font-semibold">{data?.title ?? "Loading..."}</h1>
        <button onClick={goToNext} className="rounded border px-3 py-1">
          Next &rarr;
        </button>
      </div>

      {data && <p className="text-center text-sm text-gray-500">{data.subtitle}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      {data && <CalendarGrid weeks={data.weeks} />}
    </main>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/CalendarGrid.tsx app/calendar/page.tsx
git commit -m "Add calendar month grid viewer"
```

---

### Task 10: Embeddable date picker and demo page

**Files:**
- Create: `components/NepaliDatePicker.tsx`
- Create: `app/picker/page.tsx`

**Interfaces:**
- Consumes: `CalendarGrid` (Task 9); `getCalendarMonth`, `ApiError`, `CalendarDayCell`, `CalendarResponse` (Task 7).
- Produces: `NepaliDateSelection` (type: `{ bs: string, ad: string }`); `NepaliDatePicker({ initialYear?, initialMonth?, onSelect: (selection: NepaliDateSelection) => void })`.

- [ ] **Step 1: Implement the picker component**

`components/NepaliDatePicker.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { ApiError, getCalendarMonth } from "@/lib/api";
import type { CalendarDayCell, CalendarResponse } from "@/lib/api";
import { CalendarGrid } from "@/components/CalendarGrid";

export type NepaliDateSelection = {
  bs: string;
  ad: string;
};

type NepaliDatePickerProps = {
  initialYear?: number;
  initialMonth?: number;
  onSelect: (selection: NepaliDateSelection) => void;
};

export function NepaliDatePicker({
  initialYear = 2081,
  initialMonth = 1,
  onSelect,
}: NepaliDatePickerProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCalendarMonth(year, month)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      });
  }, [year, month]);

  function goToPreviousMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleDayClick(cell: CalendarDayCell) {
    if (cell.bs_day === null || cell.ad_date === null) return;
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(cell.bs_day).padStart(2, "0")}`;
    onSelect({ bs: iso, ad: cell.ad_date });
  }

  return (
    <div className="w-72 rounded border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button onClick={goToPreviousMonth} aria-label="Previous month">
          &larr;
        </button>
        <span>{data?.title ?? "Loading..."}</span>
        <button onClick={goToNextMonth} aria-label="Next month">
          &rarr;
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {data && <CalendarGrid weeks={data.weeks} onDayClick={handleDayClick} />}
    </div>
  );
}
```

- [ ] **Step 2: Implement the demo page**

`app/picker/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import type { NepaliDateSelection } from "@/components/NepaliDatePicker";

export default function PickerDemoPage() {
  const [selected, setSelected] = useState<NepaliDateSelection | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-8">
      <h1 className="text-lg font-semibold">Embeddable date picker demo</h1>
      <p className="text-sm text-gray-600">Click a day to select it, as a form might.</p>
      <NepaliDatePicker onSelect={setSelected} />
      {selected && (
        <p className="text-sm">
          Selected: {selected.bs} (BS) / {selected.ad} (AD)
        </p>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/NepaliDatePicker.tsx app/picker/page.tsx
git commit -m "Add embeddable NepaliDatePicker component and demo page"
```

---

### Task 11: End-to-end manual verification and README

**Files:**
- Create: `README.md` (repo root)

**Interfaces:**
- Consumes: everything from Tasks 1-10. This task adds no new code — it verifies the assembled app actually works and documents how to run it.

- [ ] **Step 1: Start both dev servers**

```bash
cd api && uv run uvicorn index:app --host 127.0.0.1 --port 8000 &
cd .. && npm run dev &
```
Expected: uvicorn on `:8000`, Next.js on `:3000`.

- [ ] **Step 2: Verify the API directly**

```bash
curl -sf http://127.0.0.1:8000/api/health
curl -sf -X POST http://127.0.0.1:8000/api/convert -H "Content-Type: application/json" -d '{"direction":"bs2ad","value":"2081-04-15"}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/api/convert -H "Content-Type: application/json" -d '{"direction":"bs2ad","value":"2081-04-33"}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/api/convert -H "Content-Type: application/json" -d '{"direction":"bs2ad","value":"1500-01-01"}'
curl -sf "http://127.0.0.1:8000/api/calendar?year=2081&month=4"
```
Expected: health `{"status":"ok"}`; convert returns `"ad":"2024-07-30"`; invalid returns `400`; out-of-range returns `422`; calendar returns the Shrawan 2081 grid.

- [ ] **Step 3: Verify each page in a real browser**

Open `http://localhost:3000/` — confirm the "today" widget shows a plausible BS/AD date, convert `2081-04-15` (bs2ad) and see `30 Jul 2024`, then try `2081-04-33` and `1500-01-01` and confirm the specific inline error messages from Step 2 appear (not a generic failure).

Open `http://localhost:3000/calendar` — confirm the Shrawan 2081 grid renders with the correct day-of-week alignment, Prev/Next navigate months, and navigating past BS 2000/2090 is a no-op rather than erroring.

Open `http://localhost:3000/picker` — click a day and confirm the "Selected" line shows the matching BS and AD dates.

- [ ] **Step 4: Stop both dev servers**

```bash
kill %1 %2
```

- [ ] **Step 5: Write the README**

`README.md`:
```markdown
# datezap

A small web app showcasing real-world use cases for
[nepkit](https://github.com/akakritagya/nepkit)
([PyPI](https://pypi.org/project/nepkit/)), a typed Bikram Sambat (BS)
<-> Gregorian (AD) date conversion library for Python.

- `/` — single-date converter (BS<->AD, ISO or natural language) + a
  "today in BS" widget
- `/calendar` — BS month grid viewer, AD date on hover
- `/picker` — demo of an embeddable `<NepaliDatePicker>` form component
- `/api/docs` — the FastAPI-generated API reference (once the backend
  is running)

See `docs/superpowers/specs/2026-09-08-datezap-design.md` for the
full design.

## Backend (api/)

```bash
cd api
uv sync
uv run pytest      # tests
uv run uvicorn index:app --reload --port 8000
```

## Frontend

```bash
npm install
npm run dev         # http://localhost:3000, proxies /api/* to :8000 in dev
```

## Deploy

Push to a repo Vercel is watching, or run `vercel deploy` (or `vercel deploy --prod`)
from the repo root. Vercel builds the Next.js frontend and the
`api/index.py` Python function together; `vercel.json` routes `/api/*`
to that function.
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Add project README with setup and deploy instructions"
```

---

## Self-Review Notes

- **Spec coverage:** converter (Task 8), calendar viewer (Task 9), embeddable picker (Task 10), public API via `/api/docs` (Task 5's FastAPI app auto-generates it, linked from Task 11's README) — all four use cases from the spec are covered. Error taxonomy (Task 4), type hints (all backend tasks use `from __future__ import annotations` + full annotations), py-init tooling (Task 1), Vercel deploy shape (Task 6) — all covered.
- **Type consistency checked:** `ConvertResult`, `CalendarMonth`, and every pydantic field name are used identically across Tasks 2-10 (verified `bs_day`/`ad_date`/`is_today` match between `schemas.py`, `app.py`'s route, and `lib/api.ts`'s `CalendarDayCell`).
- **No placeholders:** every step has literal file content or a literal command with an expected result.
