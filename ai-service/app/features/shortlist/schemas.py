"""Pydantic models for the shortlist feature.

`ShortlistDecision` doubles as the LLM's structured-output target. Field
descriptions are read by the model, so keep them instructive. Field names on
`JobContext` mirror core-service's `Job` entity so the JSON Java sends maps 1:1.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from app.features.parser.schemas import ResumeData


class JobContext(BaseModel):
    """The job DB fields the shortlist LLM compares the resume against."""

    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    skillsRequired: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    remoteOption: Optional[bool] = None
    jobType: Optional[str] = None
    duration: Optional[str] = None
    selectionCriteria: Optional[str] = None


class ApplicationContext(BaseModel):
    """Minimal applicant context used only for resume-name mismatch checks."""

    applicantName: Optional[str] = None


class ShortlistDecision(BaseModel):
    """The shortlist node's output."""

    decision: Literal["REJECTED", "UNDER_REVIEW", "SHORTLISTED"] = Field(
        description=(
            "REJECTED only for a clear applicant-name mismatch; "
            "SHORTLISTED only for a genuinely strong, evidenced fit; otherwise "
            "UNDER_REVIEW. UNDER_REVIEW is the default when unsure."
        )
    )
    match_score: int = Field(
        ge=0,
        le=100,
        description=(
            "Integer from 0 to 100 for how well the resume fits THIS job, based on required-skill "
            "overlap, relevant experience/projects, and the selection criteria."
        ),
    )
    reasons: List[str] = Field(
        default_factory=list,
        description=(
            "2-4 short, concrete reasons for the decision, grounded in the resume, "
            "job, required skills, relevant experience, selection criteria, or the "
            "applicant-name/resume-name mismatch when decision is REJECTED."
        ),
    )


class ShortlistInput(BaseModel):
    """What the shortlist step receives."""

    resume: ResumeData
    job: JobContext
    application_context: Optional[ApplicationContext] = None
