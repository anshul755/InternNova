"""Pydantic models for the evaluate orchestration step.

`EvaluateInput`/`EvaluateResult` are the HTTP contract for POST /pipeline/v1/evaluate.
Field names are camelCase to match the JSON core-service (Java) sends and expects back.
"""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.features.parser.schemas import ResumeData
from app.features.shortlist.schemas import ApplicationContext, JobContext


class EvaluateInput(BaseModel):
    """What core-service posts when a talent submits an application."""

    applicationId: str
    studentId: str
    jobId: str
    resumeUrl: str
    job: JobContext
    applicationContext: Optional[ApplicationContext] = None


class EvaluateResult(BaseModel):
    """Full pipeline output: fraud verdict + advancement decision + parsed resume.

    `decision` is one of REJECTED (fake resume), UNDER_REVIEW, or SHORTLISTED.
    `resume` is the structured parse, returned so core-service can persist it.
    """

    applicationId: str
    studentId: str
    jobId: str

    is_fake: bool
    fake_confidence: float
    fake_reasons: List[str] = Field(default_factory=list)

    decision: str
    matchScore: float
    reasons: List[str] = Field(default_factory=list)

    resume: ResumeData
