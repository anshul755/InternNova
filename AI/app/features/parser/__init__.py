"""Parser feature — extracts a resume PDF into structured JSON and flags fakes."""

from app.features.parser.schemas import ParseInput
from app.features.parser.service import parse_resume

__all__ = ["ParseInput", "parse_resume"]
