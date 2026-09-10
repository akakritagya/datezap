from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo

# datezap serves Nepal's Bikram Sambat calendar, so "today" must reflect
# Nepal time -- Vercel's Python functions run in UTC, and Nepal (UTC+5:45)
# is ahead of UTC, so date.today() reports yesterday for the first ~5h45m
# of every Nepal day.
NEPAL_TZ = ZoneInfo("Asia/Kathmandu")


def today_in_nepal() -> date:
    return datetime.now(NEPAL_TZ).date()
