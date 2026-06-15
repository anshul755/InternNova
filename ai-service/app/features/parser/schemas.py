"""Pydantic models for the parser feature.

`ParsedResume` doubles as the LLM's structured-output target — the field
descriptions are read by the model, so keep them instructive.

Collection fields accept `null` at the JSON-schema level (Optional[...]) so
that Groq's tool-use validation doesn't reject a response where the model
outputs null for an unused field. A model validator immediately normalises
None → [] or {} so downstream code always sees concrete defaults.
"""

from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class ParseInput(BaseModel):
    """What the pipeline hands the parser step."""

    resumeUrl: str
    applicationId: str
    studentId: str
    jobId: str


class Links(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    others: Optional[List[str]] = Field(default_factory=list)


class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    gpa: Optional[str] = None


class Experience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tech: Optional[List[str]] = Field(default_factory=list)
    link: Optional[str] = None


class ResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    links: Optional[Links] = Field(default_factory=Links)
    summary: Optional[str] = None
    skills: Optional[List[str]] = Field(default_factory=list)
    education: Optional[List[Education]] = Field(default_factory=list)
    experience: Optional[List[Experience]] = Field(default_factory=list)
    projects: Optional[List[Project]] = Field(default_factory=list)
    certifications: Optional[List[str]] = Field(default_factory=list)
    achievements: Optional[List[str]] = Field(
        default_factory=list,
        description=(
            "Awards, rankings, competition results, and notable quantified "
            "accomplishments (e.g. 'Rank 13 at X hackathon', 'Solved 800+ DSA problems')."
        ),
    )
    spoken_languages: Optional[List[str]] = Field(
        default_factory=list,
        description=(
            "Human/spoken languages only (e.g. English, Hindi, Gujarati). "
            "Leave empty if none are listed. Never put programming languages here."
        ),
    )

    @model_validator(mode="before")
    @classmethod
    def _normalise_nulls(cls, data: dict) -> dict:
        """Coerce null collection/object fields to empty defaults.

        Groq's structured-output validation may accept null for ``Optional[List]``
        fields, leaving ``None`` in the data dict. We convert those to ``[]`` or
        ``{}`` so that downstream code never has to guard against ``None``.
        """
        if not isinstance(data, dict):
            return data
        for field_name, field_info in cls.model_fields.items():
            if field_name not in data or data[field_name] is not None:
                continue
            annotation = field_info.annotation
            # Determine the origin type (list / Links / etc.) — Pydantic stores
            # Optional[X] as Union[X, None]; unwrap the non-None branch.
            origin = _unwrap_optional(annotation)
            if origin is None:
                continue
            if hasattr(origin, "model_fields"):
                data[field_name] = {}
            elif origin is list or getattr(origin, "__origin__", None) is list:
                data[field_name] = []
        return data


class ParsedResume(BaseModel):
    """The parser step's full output: a fake verdict plus the structured resume."""

    is_fake: bool = Field(
        description=(
            "True if the resume looks fabricated, internally inconsistent, "
            "keyword-stuffed, or is not actually a resume."
        )
    )
    fake_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence from 0 to 1 that the resume is fake.",
    )
    fake_reasons: List[str] = Field(
        default_factory=list,
        description="Short reasons supporting the is_fake decision; empty when genuine.",
    )
    resume: ResumeData = Field(
        default_factory=ResumeData,
        description="Structured resume content extracted strictly from the text.",
    )


def _unwrap_optional(annotation):
    """If `annotation` is Optional[X], return X; otherwise return None."""
    import typing

    origin = getattr(annotation, "__origin__", None)
    if origin is typing.Union:
        args = [a for a in annotation.__args__ if a is not type(None)]
        if len(args) == 1:
            return args[0]
    return None
