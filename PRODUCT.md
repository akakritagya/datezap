# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: developers evaluating or integrating [nepkit](https://pypi.org/project/nepkit/), a typed Python library for Bikram Sambat (BS) ↔ Gregorian (AD) date conversion, into their own apps. They arrive to see what the library can do before adopting it, and expect to find a link to the API reference (`/api/docs`).

Secondary: anyone who needs to convert a date between BS and AD, browse a Nepali calendar month, or see how an embeddable Nepali date picker behaves in a form — the same four pages double as genuinely useful tools, not just a pitch.

## Product Purpose

datezap is a small showcase app demonstrating four real-world use cases built on one shared FastAPI backend that wraps nepkit:

1. Single-date converter (BS↔AD, ISO or natural-language input) with a "today in BS" widget.
2. Nepali calendar viewer (BS month grid, AD date alongside each day).
3. Embeddable `<NepaliDatePicker>` form component demo.
4. A public HTTP API for other developers, documented via FastAPI's auto-generated OpenAPI/Swagger UI at `/api/docs`.

Success means a visiting developer understands nepkit's capabilities and API surface within a minute of arriving, and a casual visitor can convert or browse a date without friction.

## Positioning

Nepali BS↔AD conversion libraries and tools exist, but datezap pairs a fully typed Python library (`nepkit`) with a live, interactive demonstration of every use case the library enables — converter, calendar, embeddable picker, and public API — in one deployment. A neighboring product could not truthfully claim the "typed, tested, and demonstrated end-to-end" combination.

## Operating Context

- Single Vercel deployment: Next.js (App Router, TypeScript, Tailwind) frontend + one FastAPI Python function at `/api/*`, same origin (no CORS).
- Frontend contains no date-math of its own; all conversion logic lives behind the FastAPI layer wrapping nepkit.
- Three frontend routes today: `/` (converter), `/calendar` (month grid), `/picker` (embeddable picker demo) — not yet cross-linked.
- `/api/docs` (Swagger UI) is the API reference; the frontend should link out to it rather than duplicate documentation.

## Capabilities and Constraints

- Covers BS 2000–2090 (AD 1943-04-14 – 2034-04-13) only; dates outside that range are a distinct out-of-range error (HTTP 422) from invalid-format input (HTTP 400).
- `POST /api/convert` accepts ISO or natural-language BS input (e.g. "15 Shrawan 2081") and ISO/common AD input; returns both BS and AD representations plus a formatted string.
- `GET /api/today` and `GET /api/calendar?calendar=bs&year=&month=` back the "today" widget and both the calendar viewer and the picker's month grid.
- Out of scope for v1: holiday/event data, authentication, rate limiting, persistence of any kind.
- Error messages from the API are specific per-field messages (not generic failure text) and should surface inline next to the offending input.
- No automated frontend test framework for v1; frontend correctness is verified manually (golden path + edge cases: invalid date, boundary years, natural-language input).

## Brand Commitments

None. "datezap" and "nepkit" exist only as plain-text names today — no logo, palette, or reference site to preserve. The redesign is free to establish a new visual identity.

## Evidence on Hand

- `README.md` and `docs/superpowers/specs/2026-09-08-datezap-design.md` — original design spec and route/endpoint list.
- Working backend (`api/`) and frontend (`app/`, `components/`, `lib/api.ts`) already implement all four use cases; treat as functional ground truth, not visual ground truth (current styling is the unmodified create-next-app scaffold).

## Product Principles

1. Every page should read as a live demonstration of nepkit, not just a form — the developer audience is evaluating the library through the app.
2. Never duplicate what `/api/docs` already documents; link to it instead.
3. Keep the frontend free of date-math — all conversion logic stays behind the API.
4. Surface real, specific error messages inline; never flatten backend errors into a generic failure state.
5. The three tool pages (converter, calendar, picker) are one coherent product, not three disconnected demos — they should share navigation and a visual system.
