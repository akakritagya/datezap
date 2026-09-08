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
