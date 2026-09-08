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
