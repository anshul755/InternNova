"""Domain errors for the resume generator.

`main.py` maps these to clean HTTP responses instead of generic 500s:
  - ProfileNotFoundError -> 404 (no such talent / profile)
  - ResumeGenerationError -> 502 (LaTeX compile failed or core-service unreachable)
"""


class ResumeGenerationError(Exception):
    """A step in the pipeline failed (profile fetch, compile, etc.)."""


class ProfileNotFoundError(ResumeGenerationError):
    """core-service returned 404 for the requested talent profile."""
