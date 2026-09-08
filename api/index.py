from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from datezap_api.app import app  # noqa: E402

__all__ = ["app"]
