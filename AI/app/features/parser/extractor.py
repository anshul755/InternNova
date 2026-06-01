"""Download a resume PDF and extract its text."""

import io

import httpx
from pypdf import PdfReader

from app.core.config import get_settings


class ExtractionError(Exception):
    """Raised when a resume cannot be downloaded or read as text."""


async def download_pdf(url: str) -> bytes:
    settings = get_settings()
    max_bytes = settings.max_pdf_mb * 1024 * 1024

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise ExtractionError(f"Failed to download resume: {exc}") from exc

    content = resp.content
    if len(content) > max_bytes:
        raise ExtractionError(f"Resume exceeds the {settings.max_pdf_mb} MB limit")

    content_type = resp.headers.get("content-type", "")
    if "pdf" not in content_type.lower() and not content.startswith(b"%PDF"):
        raise ExtractionError(f"URL did not return a PDF (content-type: {content_type!r})")

    return content


def extract_text(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
    except Exception as exc:  # pypdf raises a variety of read errors
        raise ExtractionError(f"Failed to read PDF: {exc}") from exc

    text = "\n".join(pages).strip()
    if len(text) < 30:
        raise ExtractionError(
            "Extracted text is empty or too short (scanned/image-only PDFs are not supported)"
        )
    return text
