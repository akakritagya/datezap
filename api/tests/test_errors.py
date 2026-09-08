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
