"""Typed application settings.

Resolution order (highest priority first):
    1. explicit init args
    2. AI/.env file          <- primary source
    3. OS environment vars   <- fallback (e.g. system-wide GROQ_API_KEY / OLLAMA_API_KEY)
    4. field defaults

This makes a local .env win, while still falling back to whatever is exported in
the user's system environment.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)

# AI/.env lives two parents above this file: core -> app -> AI
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # LLM provider selection
    llm_provider: str = "groq"

    # Groq (cloud)
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    # Ollama (local, or cloud with an API key)
    ollama_api_key: str = ""
    ollama_model: str = "llama3"
    ollama_base_url: str = "http://localhost:11434"

    # PDF download guard
    max_pdf_mb: int = 20

    # core-service (Spring Boot) — the resume generator fetches the talent's full
    # profile from here. Internal, server-to-server: authenticated with a shared
    # X-Service-Token rather than an end-user JWT (see TalentController.getFullProfile).
    core_service_base_url: str = "http://localhost:8080"
    internal_service_token: str = "dev-internal-token"
    core_request_timeout: int = 30

    # LaTeX.Online compile endpoint — turns assembled .tex into a PDF without a
    # local TeX install. Overridable to a self-hosted instance.
    latex_compile_url: str = "https://latexonline.cc/compile"
    latex_compile_timeout: int = 90

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ):
        # .env (dotenv_settings) takes precedence over OS env (env_settings).
        return init_settings, dotenv_settings, env_settings, file_secret_settings


@lru_cache
def get_settings() -> Settings:
    return Settings()
