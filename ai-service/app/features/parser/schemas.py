"""Pydantic models for the parser feature.

`ParsedResume` doubles as the LLM's structured-output target — the field
descriptions are read by the model, so keep them instructive.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


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
    others: List[str] = Field(default_factory=list)


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
    tech: List[str] = Field(default_factory=list)
    link: Optional[str] = None


class ResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    links: Links = Field(default_factory=Links)
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(
        default_factory=list,
        description=(
            "Awards, rankings, competition results, and notable quantified "
            "accomplishments (e.g. 'Rank 13 at X hackathon', 'Solved 800+ DSA problems')."
        ),
    )
    spoken_languages: List[str] = Field(
        default_factory=list,
        description=(
            "Human/spoken languages only (e.g. English, Hindi, Gujarati). "
            "Leave empty if none are listed. Never put programming languages here."
        ),
    )


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
