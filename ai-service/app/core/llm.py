"""Provider-agnostic LLM factory.

Selecting the backend happens in exactly one place so the rest of the codebase
stays provider-neutral. Swap providers by setting LLM_PROVIDER in .env.
"""

from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama

from app.core.config import get_settings


def get_llm():
    """Return a chat model configured from settings (default: Groq)."""
    settings = get_settings()
    provider = settings.llm_provider.strip().lower()

    if provider == "groq":
        if not settings.groq_api_key:
            raise RuntimeError("LLM_PROVIDER=groq but GROQ_API_KEY is not set in .env")
        return ChatGroq(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            temperature=0,
        )

    if provider == "ollama":
        kwargs = {
            "model": settings.ollama_model,
            "base_url": settings.ollama_base_url,
            "temperature": 0,
        }
        # Ollama cloud uses a bearer token; local Ollama needs none.
        if settings.ollama_api_key:
            kwargs["client_kwargs"] = {
                "headers": {"Authorization": f"Bearer {settings.ollama_api_key}"}
            }
        return ChatOllama(**kwargs)

    raise ValueError(
        f"Unknown LLM_PROVIDER {settings.llm_provider!r} (expected 'groq' or 'ollama')"
    )
