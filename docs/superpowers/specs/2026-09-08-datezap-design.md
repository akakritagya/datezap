# datezap — Design Spec

Date: 2026-09-08

## Purpose

datezap is a small web app that showcases real-world use cases for
[nepkit](https://github.com/akakritagya/nepkit)
([PyPI](https://pypi.org/project/nepkit/)), a typed Bikram Sambat (BS) ↔
Gregorian (AD) date conversion library for Python covering BS 2000–2090
(AD 1943-04-14 – 2034-04-13).

Four use cases, sharing one backend core:

1. Single-date converter (BS↔AD, ISO or natural-language input)
2. Nepali calendar viewer (BS month grid with AD dates alongside)
3. Embeddable Nepali date-picker component (for forms)
4. A public HTTP API for other developers (via FastAPI's
   auto-generated OpenAPI/Swagger docs)

Out of scope for v1: holiday/event data (not part of nepkit — would
require a separately maintained dataset), authentication, rate
limiting, persistence of any kind.

## Architecture

Single Vercel project, single repo:

- Root: Next.js (App Router, TypeScript, Tailwind) frontend.
- `/api/index.py`: one FastAPI app, `nepkit` listed in
  `api/requirements.txt`. Vercel builds Next.js and `/api/*.py` as
  separate build targets within the same deployment automatically —
  no `vercel.json`/`vercel.ts` routing config needed for this.
- All backend logic lives behind this one FastAPI app so there is a
  single source of truth wrapping nepkit; the frontend contains no
  date-math of its own.

## Backend (FastAPI, all routes under `/api`)

- `GET /api/health` → `{status: "ok"}`
- `POST /api/convert`
  body: `{direction: "bs2ad" | "ad2bs", value: string}`
  `value` accepts ISO (`YYYY-MM-DD`) or natural language (e.g. `"15
  Shrawan 2081"`) for the BS side, ISO or common date strings for AD.
  → `{input, result: {bs: {...}, ad: {...}}, formatted}`
- `GET /api/today` → `{ad: "...", bs: {year, month, day}, formatted}`
- `GET /api/calendar?calendar=bs&year=&month=`
  → month grid: list of weeks, each a list of day cells
  `{bs_day, ad_date, weekday, in_month}` for the requested BS
  year/month (used by both the calendar viewer and the date picker).

FastAPI's automatic docs at `/api/docs` (Swagger UI) serve as the
public API documentation — no hand-written docs page to maintain.

## Backend tooling

Scaffolded with the `py-init` toolchain, `app` profile (it's a
service, not a library or ML experiment):

- **uv** for dependency management (`fastapi`, `pydantic`, `nepkit`
  as runtime deps).
- **ruff** for linting and formatting.
- **mypy** for static type checking — route handlers, pydantic
  models, and nepkit's own typed API (`BSDate` etc.) are all fully
  annotated (see Type hints below), so this should run clean.
- **pytest** (+ coverage) for the backend test suite.
- **pre-commit** running all of the above before each commit.
- Layout: `api/pyproject.toml` + `api/src/datezap_api/` package,
  consistent with py-init's standard structure, adapted to live
  under `api/` alongside the Vercel Python function entrypoint.

Deployment note: Vercel's Python function builder reads
`api/requirements.txt`, not `pyproject.toml`. We keep `pyproject.toml`
+ uv as the source of truth for local dev/tooling, and generate
`api/requirements.txt` via `uv export --no-hashes` as a build step (or
committed artifact) for what Vercel actually installs.

## Type hints

All backend code is fully type-hinted (mypy-checked per above):
route handlers annotate parameters and return types (return types
drive the documented OpenAPI response schema); pydantic model fields
are all typed (e.g. `direction: Literal["bs2ad", "ad2bs"]`); modern
syntax throughout — `Annotated[int, Query(ge=2000, le=2090)]` for
constrained query params, PEP 604 unions (`str | None`) over
`Optional[str]`. Handler bodies pass/return nepkit's own typed objects
(`BSDate`) directly rather than re-stringifying by hand.

## Frontend (Next.js pages)

- `/` — converter: BS↔AD conversion form + a "today" widget.
- `/calendar` — BS month grid viewer with prev/next month navigation.
- `/picker` — demo page for a reusable `<NepaliDatePicker>` component
  (built on `/api/calendar`), showing embedding in a plain form; on
  day click it emits `{bs, ad}` via a callback prop.
- API docs: link out to `/api/docs` rather than a maintained page.

## Data flow

Page load or user action → `fetch('/api/...')` (same-origin, no CORS
needed since frontend and API share one Vercel deployment) → FastAPI
validates input → calls nepkit → JSON response → React renders result
or grid.

## Error handling

nepkit distinguishes invalid-date errors from out-of-range errors.
FastAPI maps these to structured JSON: `{error_code, message}`, with
HTTP 400 for invalid input (bad format / nonexistent date, e.g. day 32
of a 30-day month) and 422 for out-of-range input (outside BS
2000–2090). The frontend surfaces the specific `message` inline next
to the offending field rather than a generic failure state.

## Testing

- Backend: pytest + FastAPI `TestClient` covering each endpoint,
  including boundary years (BS 2000 and 2090), invalid natural-language
  input, and variable month-length edge cases.
- Frontend: no automated test framework for v1; verified manually via
  the dev server (golden path + edge cases: invalid date, boundary
  years, natural-language input) before considering work complete.
- No e2e framework for v1 given project size.

## Deployment

Vercel, matching the environment this project is being built in.
Python via Vercel's Fluid Compute Python runtime; Next.js as the
framework preset.
