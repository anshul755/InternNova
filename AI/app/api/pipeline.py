"""HTTP routes for the resume pipeline.

A single endpoint wraps the full graph: core-service posts the application's IDs,
resume URL, and job fields; we return the fraud verdict, advancement decision, and
the parsed resume. All handlers are async — the work is I/O-bound (download + LLM).
"""

from fastapi import APIRouter

from app.features.evaluate import EvaluateInput, EvaluateResult, evaluate_application
from app.features.resume_generator import (
    GenerateResumeInput,
    GenerateResumeResult,
    generate_resume,
)

router = APIRouter(prefix="/pipeline/v1", tags=["pipeline"])


@router.post("/evaluate", response_model=EvaluateResult)
async def evaluate(payload: EvaluateInput) -> EvaluateResult:
    return await evaluate_application(payload)


@router.post("/generate-resume", response_model=GenerateResumeResult)
async def generate_resume_endpoint(payload: GenerateResumeInput) -> GenerateResumeResult:
    return await generate_resume(payload)
