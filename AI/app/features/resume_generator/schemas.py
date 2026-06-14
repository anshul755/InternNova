"""Pydantic models for the resume generator feature.

Three groups of models:

1. The HTTP contract — `GenerateResumeInput` / `GenerateResumeResult` — for
   POST /pipeline/v1/generate-resume. Field names are camelCase to match the JSON
   the gateway/frontend send and expect back.

2. `TalentProfile` (and its parts) — what core-service returns from
   GET /talent/v1/profile/{talentId}/full. Mirrors the Java `Talent` entity so the
   JSON maps 1:1; unknown fields are ignored.

3. `ResumeContent` — the LLM's structured-output target. The field descriptions are
   read by the model, so they double as instructions. The LLM only rewrites/organises
   body content; factual contact details are assembled in code (never invented).
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TemplateStyle(str, Enum):
    """Supported resume styles. `academic` is reserved for a future template."""

    classic = "classic"  # ATS-friendly, single column
    modern = "modern"  # two-column with a sidebar


# ── core-service profile contract (GET /talent/v1/profile/{id}/full) ──────────


class ProfileExperience(BaseModel):
    model_config = ConfigDict(extra="ignore")

    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    isCurrent: Optional[bool] = None
    bulletPoints: List[str] = Field(default_factory=list)


class ProfileProject(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = None
    description: Optional[str] = None
    techStack: List[str] = Field(default_factory=list)
    liveUrl: Optional[str] = None
    repoUrl: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)


class ProfileCertification(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = None
    issuer: Optional[str] = None
    issueDate: Optional[str] = None
    credentialUrl: Optional[str] = None


class ProfileAchievement(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[str] = None


class TalentProfile(BaseModel):
    """The talent's full profile as returned by core-service.

    Mirrors the `Talent` entity (camelCase). Note: email and phone are NOT stored
    here (they live in auth-service), so the generator takes them from the request.
    """

    model_config = ConfigDict(extra="ignore")

    id: Optional[str] = None
    name: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    graduationYear: Optional[str] = None
    cgpa: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    resumeSummary: Optional[str] = None
    experience: List[ProfileExperience] = Field(default_factory=list)
    projects: List[ProfileProject] = Field(default_factory=list)
    certifications: List[ProfileCertification] = Field(default_factory=list)
    achievements: List[ProfileAchievement] = Field(default_factory=list)


# ── contact block (assembled in code, never by the LLM) ───────────────────────


class ContactInfo(BaseModel):
    """Factual header details, built deterministically from the profile + request.

    Kept out of the LLM's hands so an email/phone/handle can never be fabricated.
    """

    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


# ── LLM structured-output target ──────────────────────────────────────────────


class SkillGroup(BaseModel):
    """A labelled cluster of skills, e.g. category 'Languages' -> [Java, Python]."""

    category: str = Field(description="Short group label, e.g. 'Languages', 'Frameworks', 'Tools'.")
    skills: List[str] = Field(default_factory=list, description="Skills in this group.")


class ExperienceItem(BaseModel):
    company: str = Field(description="Employer/organisation name, taken verbatim from the profile.")
    role: str = Field(description="Job title/role, taken verbatim from the profile.")
    location: Optional[str] = Field(default=None, description="Location if known, else null.")
    dateRange: Optional[str] = Field(
        default=None,
        description="Human date range like 'Jun 2023 – Present', built from start/end; null if unknown.",
    )
    bullets: List[str] = Field(
        default_factory=list,
        description=(
            "2-4 concise, single-line, action-verb achievement bullets rewritten from the "
            "profile's bullet points. When a target job is provided, emphasise accomplishments "
            "and skills that match the job's requirements — surface teamwork, performance, or "
            "domain-specific bullets as relevant. Quantify ONLY with numbers already present "
            "in the profile. Never invent metrics, percentages, or counts."
        ),
    )


class ProjectItem(BaseModel):
    name: str = Field(description="Project name, taken verbatim from the profile.")
    subtitle: Optional[str] = Field(
        default=None,
        description="Optional one-line tech/role subtitle, e.g. 'React, Node.js' from the tech stack. When a target job is provided, highlight the tech most relevant to that job.",
    )
    link: Optional[str] = Field(default=None, description="A live or repo URL if present, else null.")
    bullets: List[str] = Field(
        default_factory=list,
        description=(
            "1-3 concise, single-line, action-verb bullets describing what was built/achieved, "
            "grounded in the profile's highlights/description. When a target job is provided, "
            "slant bullets toward skills and outcomes the job values."
        ),
    )


class EducationItem(BaseModel):
    institution: str = Field(description="School/university name.")
    degree: Optional[str] = Field(default=None, description="Degree and field, e.g. 'B.E. in Computer Science'.")
    dateRange: Optional[str] = Field(default=None, description="Graduation year or range if known.")
    details: Optional[str] = Field(
        default=None, description="Extra line such as GPA/CGPA if present in the profile."
    )


class CertItem(BaseModel):
    name: str = Field(description="Certification name.")
    issuer: Optional[str] = Field(default=None, description="Issuing body if known.")
    date: Optional[str] = Field(default=None, description="Issue date if known.")


class ResumeContent(BaseModel):
    """The polished, organised resume body produced by the LLM.

    The LLM MUST stay grounded in the supplied profile: it may rephrase, tighten, and
    reorder, but must not invent employers, dates, numbers, or qualifications. Contact
    details are assembled separately in code, so they are intentionally absent here.
    """

    summary: str = Field(
        description=(
            "A 2-3 sentence professional summary grounded in the candidate's real "
            "background. When a target job is provided, explicitly name the role and "
            "frame the candidate as a natural fit — slant emphasis toward it WITHOUT "
            "claiming skills or experience the profile does not show. When no target "
            "job is provided, write a balanced, general-purpose summary."
        )
    )
    skillGroups: List[SkillGroup] = Field(
        default_factory=list,
        description=(
            "The candidate's skills organised into 2-5 sensible groups (e.g. Languages, "
            "Frameworks, Tools, Cloud, Data). When a target job is provided, order groups "
            "so the most job-relevant ones appear first. Use group names that match the "
            "job description's language where truthful."
        ),
    )
    experience: List[ExperienceItem] = Field(
        default_factory=list,
        description=(
            "Work experience entries. When a target job is provided, order so the most "
            "job-relevant roles appear first. Otherwise use reverse-chronological order."
        ),
    )
    projects: List[ProjectItem] = Field(
        default_factory=list,
        description=(
            "Project entries. When a target job is provided, order so projects most "
            "relevant to the role appear first. Otherwise use reverse-chronological."
        ),
    )
    education: List[EducationItem] = Field(default_factory=list)
    certifications: List[CertItem] = Field(
        default_factory=list,
        description=(
            "Certifications. When a target job is provided, list job-relevant "
            "certifications first."
        ),
    )
    achievements: List[str] = Field(
        default_factory=list,
        description=(
            "Short one-line achievements/awards, grounded in the profile. When a target "
            "job is provided, order so the most job-relevant achievements appear first."
        ),
    )


# ── HTTP contract ─────────────────────────────────────────────────────────────


class GenerateResumeInput(BaseModel):
    """What the frontend (via the gateway) posts to generate a resume."""

    talentId: str = Field(description="The talent whose profile to render.")
    template: TemplateStyle = Field(
        default=TemplateStyle.classic, description="Which resume style to render."
    )
    # Contact fields the profile does not store — supplied by the caller (which has
    # them from the authenticated session). Optional so generation still works without.
    email: Optional[str] = None
    phone: Optional[str] = None
    # Optional job-description tailoring. When present, the summary/bullets are slanted
    # toward the role while staying grounded in the real profile.
    jobTitle: Optional[str] = None
    jobDescription: Optional[str] = None


class GenerateResumeResult(BaseModel):
    """The generated resume: the raw .tex plus the compiled PDF (base64)."""

    talentId: str
    template: TemplateStyle
    tailored: bool = Field(description="True when a job description was used to tailor the content.")
    tex: str = Field(description="The assembled LaTeX source.")
    pdfBase64: str = Field(description="The compiled PDF, base64-encoded.")
