"""Compile assembled .tex into a PDF.

Two interchangeable backends, selected by `settings.resume_latex_parser_online`:

  * offline (default): a LOCAL engine (Tectonic by default, vendored in ai-service/tools/).
    Fast (~4s) and dependency-free once its bundle is cached — no per-request network.
  * online: the hosted LaTeX.Online service — needs no local install, but is a
    third-party network dependency and slow on a cache miss (~25s).

On failure either backend raises `ResumeGenerationError` carrying the compiler log
tail, so template/escaping bugs stay debuggable.

Templates are authored to compile with stock TeX Live packages (geometry, xcolor,
enumitem, titlesec, hyperref, lato) under either pdfLaTeX or Tectonic's XeTeX engine.
"""

import asyncio
import tempfile
from pathlib import Path

import httpx

from app.core.config import get_settings
from app.features.resume_generator.errors import ResumeGenerationError

# LaTeX.Online streams the PDF back when the source compiles; it begins with %PDF.
_PDF_MAGIC = b"%PDF"


async def compile_tex(tex: str, command: str = "pdflatex") -> bytes:
    """Return compiled PDF bytes for `tex`, or raise ResumeGenerationError with the log.

    Routes to the local engine or LaTeX.Online based on `resume_latex_parser_online`.
    `command` is the engine name passed through to LaTeX.Online (online mode only).
    """
    settings = get_settings()
    if settings.resume_latex_parser_online:
        return await _compile_online(tex, command, settings)
    return await _compile_local(tex, settings)


# ── local engine (offline, default) ───────────────────────────────────────────


def _local_argv(cmd: str, src: Path, outdir: Path) -> list:
    """Build the argv for the local engine.

    Tectonic and a classic pdflatex take different flags; resumes have no
    cross-references, so a single pdflatex pass is enough.
    """
    if "tectonic" in Path(cmd).stem.lower():
        # Tectonic v2 CLI. No --only-cached so a fresh machine can self-provision
        # its bundle on first run; later runs hit the local cache (no network).
        return [cmd, "-X", "compile", str(src), "--outdir", str(outdir), "--keep-logs"]
    return [
        cmd,
        "-interaction=nonstopmode",
        "-halt-on-error",
        f"-output-directory={outdir}",
        str(src),
    ]


async def _compile_local(tex: str, settings) -> bytes:
    cmd = settings.resolved_latex_local_command
    with tempfile.TemporaryDirectory(prefix="resume_tex_") as tmp:
        tmpdir = Path(tmp)
        src = tmpdir / "resume.tex"
        src.write_text(tex, encoding="utf-8")

        try:
            proc = await asyncio.create_subprocess_exec(
                *_local_argv(cmd, src, tmpdir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            stdout, _ = await asyncio.wait_for(
                proc.communicate(), timeout=settings.latex_local_timeout
            )
        except FileNotFoundError as exc:
            raise ResumeGenerationError(
                f"Local LaTeX engine not found: '{cmd}'. Install it (run "
                f"ai-service/scripts/install_tectonic.ps1) or set LATEX_LOCAL_COMMAND, or "
                f"switch to RESUME_LATEX_PARSER_ONLINE=true."
            ) from exc
        except asyncio.TimeoutError as exc:
            proc.kill()
            raise ResumeGenerationError(
                f"Local LaTeX compile timed out after {settings.latex_local_timeout}s."
            ) from exc

        pdf_path = tmpdir / "resume.pdf"
        if proc.returncode == 0 and pdf_path.exists():
            return pdf_path.read_bytes()

        log = stdout.decode("utf-8", errors="replace") if stdout else ""
        log_file = tmpdir / "resume.log"
        if log_file.exists():
            log += "\n" + log_file.read_text("utf-8", errors="replace")
        raise ResumeGenerationError(
            f"Local LaTeX compilation failed (exit {proc.returncode}). "
            f"Compiler log tail:\n{_tail(log)}"
        )


# ── LaTeX.Online (online) ──────────────────────────────────────────────────────


async def _compile_online(tex: str, command: str, settings) -> bytes:
    params = {"text": tex, "command": command}
    try:
        async with httpx.AsyncClient(
            timeout=settings.latex_compile_timeout, follow_redirects=True
        ) as client:
            resp = await client.get(settings.latex_compile_url, params=params)
    except httpx.HTTPError as exc:
        raise ResumeGenerationError(f"LaTeX compile request failed: {exc}") from exc

    content = resp.content
    if resp.status_code == 200 and content.startswith(_PDF_MAGIC):
        return content

    log = _decode_log(content)
    raise ResumeGenerationError(
        f"LaTeX compilation failed (HTTP {resp.status_code}). "
        f"Compiler log tail:\n{_tail(log)}"
    )


# ── shared helpers ─────────────────────────────────────────────────────────────


def _decode_log(content: bytes) -> str:
    try:
        return content.decode("utf-8", errors="replace")
    except Exception:  # pragma: no cover - defensive
        return repr(content[:2000])


def _tail(log: str, lines: int = 25) -> str:
    """The end of a LaTeX log holds the actual error; keep it short for the response."""
    return "\n".join(log.strip().splitlines()[-lines:])
