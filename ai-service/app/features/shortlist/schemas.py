"""Pydantic models for the shortlist (Is-Shortlisted) feature.

`ShortlistDecision` doubles as the LLM's structured-output target — the field
descriptions are read by the model, so keep them instructive. Field names on
`JobContext` mirror core-service's `Job` entity so the JSON Java sends maps 1:1.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from app.features.parser.schemas import ResumeData


class JobContext(BaseModel):
    """The job DB fields the shortlist LLM compares the resume against.

    Mirrors core-service `Job` (camelCase) so Java can pass the entity fields as-is.
    """

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


class ShortlistDecision(BaseModel):
    """The shortlist node's output — only ever produced for non-fake resumes."""

    decision: Literal["UNDER_REVIEW", "SHORTLISTED"] = Field(
        description=(
            "SHORTLISTED only for a genuinely strong, evidenced fit; otherwise "
            "UNDER_REVIEW. UNDER_REVIEW is the default when unsure."
        )
    )
    match_score: float = Field(
        ge=0.0,
        le=100.0,
        description=(
            "0-100 fit score of the resume against THIS job, based on required-skill "
            "overlap, relevant experience/projects, and the selection criteria."
        ),
    )
    reasons: List[str] = Field(
        default_factory=list,
        description=(
            "2-4 short, concrete reasons for the decision, grounded in the resume and "
            "job (name overlapping skills, relevant experience, or what is missing)."
        ),
    )


class ShortlistInput(BaseModel):
    """What the shortlist step receives: a parsed resume plus the job to match against."""

    resume: ResumeData
    job: JobContext
