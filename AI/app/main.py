"""FastAPI app exposing the InternNova resume pipeline.

Run with:  uvicorn app.main:app --host 0.0.0.0 --port 8000

Kept thin: it mounts the pipeline router and maps the one domain error we raise
(ExtractionError, from a bad/scanned/oversized resume PDF) to a 422 so the caller
gets a clear message instead of a 500.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.pipeline import router as pipeline_router
from app.features.parser.extractor import ExtractionError

app = FastAPI(title="InternNova AI Service", version="0.1.0")
app.include_router(pipeline_router)


@app.exception_handler(ExtractionError)
async def extraction_error_handler(request: Request, exc: ExtractionError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok"}
