FROM python:3.12-slim
WORKDIR /app

# ── LaTeX (replaces vendored Windows-only tectonic.exe) ─────────────────────
# texlive-xetex: XeTeX engine (Unicode/TTF support, matches Tectonic's behavior)
# texlive-latex-extra: geometry, xcolor, enumitem, titlesec, hyperref, lato, etc.
# texlive-fonts-recommended: core font packages
# --no-install-recommends keeps this ~500MB instead of ~2GB for full texlive
RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    texlive-xetex \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    fonts-lato \
    lmodern \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -fv

# ── Python dependencies ─────────────────────────────────────────────────────
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ────────────────────────────────────────────────────────
COPY app/ ./app/
COPY .env.example ./.env.example

# Non-root user (Debian — use groupadd/useradd, not Alpine addgroup/adduser)
RUN groupadd -r appgroup && useradd -r -g appgroup -s /sbin/nologin appuser

# Use xelatex for PDF generation (Tectonic-compatible Unicode/XeTeX engine)
ENV LATEX_LOCAL_COMMAND=xelatex
ENV LATEX_LOCAL_TIMEOUT=60
ENV PORT=8000

EXPOSE 8000
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
