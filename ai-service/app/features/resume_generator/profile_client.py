"""Fetch a talent's full profile from core-service.

Server-to-server call authenticated with the shared internal token (X-Service-Token),
not an end-user JWT — see core-service `TalentController.getFullProfile`, which lets an
internal service read any profile when that header matches `service.internal-token`.
"""

import httpx

from app.core.config import get_settings
from app.features.resume_generator.errors import (
    ProfileNotFoundError,
    ResumeGenerationError,
)
from app.features.resume_generator.schemas import TalentProfile


async def fetch_talent_profile(talent_id: str) -> TalentProfile:
    settings = get_settings()
    url = f"{settings.core_service_base_url.rstrip('/')}/talent/v1/profile/{talent_id}/full"
    headers = {"X-Service-Token": settings.internal_service_token}

    try:
        async with httpx.AsyncClient(timeout=settings.core_request_timeout) as client:
            resp = await client.get(url, headers=headers)
    except httpx.HTTPError as exc:
        raise ResumeGenerationError(f"Could not reach core-service: {exc}") from exc

    if resp.status_code == 404:
        raise ProfileNotFoundError(f"No profile found for talent {talent_id!r}")
    if resp.status_code == 401 or resp.status_code == 403:
        raise ResumeGenerationError(
            "core-service rejected the internal token — check INTERNAL_SERVICE_TOKEN "
            "matches core-service's service.internal-token."
        )
    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ResumeGenerationError(
            f"core-service returned {resp.status_code} for the talent profile"
        ) from exc

    return TalentProfile.model_validate(resp.json())
