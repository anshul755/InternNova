"""Resume generator feature — renders a talent's profile into a typeset PDF resume."""

from app.features.resume_generator.errors import (
    ProfileNotFoundError,
    ResumeGenerationError,
)
from app.features.resume_generator.schemas import (
    GenerateResumeInput,
    GenerateResumeResult,
    TemplateStyle,
)
from app.features.resume_generator.service import generate_resume

__all__ = [
    "GenerateResumeInput",
    "GenerateResumeResult",
    "TemplateStyle",
    "ProfileNotFoundError",
    "ResumeGenerationError",
    "generate_resume",
]
