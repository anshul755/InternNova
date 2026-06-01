"""HTTP routes for the resume pipeline.

A single endpoint wraps the full graph: core-service posts the application's IDs,
resume URL, and job fields; we return the fraud verdict, advancement decision, and
the parsed resume. All handlers are async — the work is I/O-bound (download + LLM).
"""

from fastapi import APIRouter

from app.features.evaluate import EvaluateInput, EvaluateResult, evaluate_application

router = APIRouter(prefix="/pipeline/v1", tags=["pipeline"])


@router.post("/evaluate", response_model=EvaluateResult)
async def evaluate(payload: EvaluateInput) -> EvaluateResult:
    return await evaluate_application(payload)
