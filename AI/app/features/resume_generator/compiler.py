"""Compile assembled .tex into a PDF via LaTeX.Online.

Keeps the service free of a local TeX install: we POST/GET the source to a hosted
LaTeX.Online instance and get PDF bytes back. On failure the service returns the
compiler log (plain text), which we surface so template/escaping bugs are debuggable.

Templates are authored to compile with `pdflatex` and stock TeX Live packages
(geometry, xcolor, paracol, enumitem, titlesec, hyperref, fontawesome5).
"""

import httpx

from app.core.config import get_settings
from app.features.resume_generator.errors import ResumeGenerationError

# LaTeX.Online compiles to PDF when the source begins with %PDF in the response body.
_PDF_MAGIC = b"%PDF"


async def compile_tex(tex: str, command: str = "pdflatex") -> bytes:
    """Return compiled PDF bytes for `tex`, or raise ResumeGenerationError with the log."""
    settings = get_settings()
    params = {"text": tex, "command": command}

    try:
        async with httpx.AsyncClient(
            timeout=settings.latex_compile_timeout, follow_redirects=True
        ) as client:
            resp = await client.get(settings.latex_compile_url, params=params)
    except httpx.HTTPError as exc:
        raise ResumeGenerationError(f"LaTeX compile request failed: {exc}") from exc

    content = resp.content

    # A successful compile streams the PDF back. Anything else is an error log.
    if resp.status_code == 200 and content.startswith(_PDF_MAGIC):
        return content

    log = _decode_log(content)
    raise ResumeGenerationError(
        f"LaTeX compilation failed (HTTP {resp.status_code}). "
        f"Compiler log tail:\n{_tail(log)}"
    )


def _decode_log(content: bytes) -> str:
    try:
        return content.decode("utf-8", errors="replace")
    except Exception:  # pragma: no cover - defensive
        return repr(content[:2000])


def _tail(log: str, lines: int = 25) -> str:
    """The end of a LaTeX log holds the actual error; keep it short for the response."""
    return "\n".join(log.strip().splitlines()[-lines:])
