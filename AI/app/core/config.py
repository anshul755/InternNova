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

    # Resume PDF compilation — two interchangeable backends:
    #   * offline (default): a local Tectonic engine, fast (~1s) and dependency-free
    #     once installed. No network per request.
    #   * online: the hosted LaTeX.Online service — needs no local install, but is a
    #     third-party network dependency and slow on a cache miss (~25s).
    # Toggle with RESUME_LATEX_PARSER_ONLINE: False (default) = offline/local,
    # True = online. "Parser" here is the .tex -> PDF compiler.
    resume_latex_parser_online: bool = False

    # Local engine (offline mode). Empty => the Tectonic binary vendored in
    # AI/tools/tectonic.exe, falling back to a `tectonic` on PATH. Override with
    # LATEX_LOCAL_COMMAND to point at a system pdflatex/tectonic.
    latex_local_command: str = ""
    latex_local_timeout: int = 60

    # LaTeX.Online compile endpoint (online mode). Overridable to a self-hosted instance.
    latex_compile_url: str = "https://latexonline.cc/compile"
    latex_compile_timeout: int = 90

    @property
    def resolved_latex_local_command(self) -> str:
        """The local LaTeX engine to invoke in offline mode.

        Prefers an explicit override, then the vendored Tectonic binary, then a
        `tectonic` discovered on PATH.
        """
        if self.latex_local_command:
            return self.latex_local_command
        # AI/ is two parents above app/core/config.py.
        vendored = Path(__file__).resolve().parents[2] / "tools" / "tectonic.exe"
        if vendored.exists():
            return str(vendored)
        return "tectonic"

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
