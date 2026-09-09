from __future__ import annotations

import nepkit

from datezap_api.schemas import ErrorResponse

_STATUS_BY_EXCEPTION: dict[type[nepkit.NepkitError], int] = {
    nepkit.InvalidDateError: 400,
    nepkit.DateOutOfRangeError: 422,
    nepkit.CalendarDataError: 500,
}


def status_code_for(exc: nepkit.NepkitError) -> int:
    for exc_type, status in _STATUS_BY_EXCEPTION.items():
        if isinstance(exc, exc_type):
            return status
    # An unclassified NepkitError means our mapping table is out of date, not
    # that we're confident the caller's input is bad -- default to "our
    # fault" rather than asserting a claim we can't back up.
    return 500


def error_response_for(exc: nepkit.NepkitError) -> ErrorResponse:
    return ErrorResponse(error_code=type(exc).__name__, message=str(exc))
