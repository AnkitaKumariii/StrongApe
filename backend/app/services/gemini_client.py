import logging
from typing import Any

from google import genai
from google.genai import types
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def model_candidates() -> list[str]:
    models = [settings.GEMINI_MODEL]
    if settings.GEMINI_FALLBACK_MODELS:
        models.extend(
            m.strip()
            for m in settings.GEMINI_FALLBACK_MODELS.split(",")
            if m.strip()
        )
    seen: set[str] = set()
    ordered: list[str] = []
    for model in models:
        if model not in seen:
            seen.add(model)
            ordered.append(model)
    return ordered


def is_quota_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(
        token in message
        for token in ("429", "quota", "resource_exhausted", "rate limit", "limit: 0")
    )


def friendly_quota_message(last_error: Exception) -> str:
    if "limit: 0" in str(last_error).lower():
        return (
            "Gemini API quota is unavailable for your project. "
            "Use gemini-2.5-flash in backend/.env, or enable billing at "
            "https://aistudio.google.com/apikey"
        )
    return (
        "Gemini API rate limit reached. Please wait a minute and try again, "
        "or switch to gemini-2.5-flash-lite in backend/.env for higher free-tier limits."
    )


def _build_contents(parts: list[Any]) -> list[types.Part]:
    """Convert mixed list of str/dict parts into google.genai types.Part objects."""
    contents: list[types.Part] = []
    for part in parts:
        if isinstance(part, str):
            contents.append(types.Part.from_text(text=part))
        elif isinstance(part, dict) and "mime_type" in part and "data" in part:
            contents.append(
                types.Part.from_bytes(data=part["data"], mime_type=part["mime_type"])
            )
        else:
            # Already a types.Part or similar — pass through
            contents.append(part)
    return contents


def _generate_with_model(model_name: str, parts: list[Any], system_instruction: str | None) -> str:
    client = get_client()
    contents = _build_contents(parts)

    config: types.GenerateContentConfig | None = None
    if system_instruction:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
        )

    response = client.models.generate_content(
        model=model_name,
        contents=contents,
        config=config,
    )
    return response.text or ""


def generate_text(prompt: str, *, system_instruction: str | None = None) -> str:
    return generate_with_parts([prompt], system_instruction=system_instruction)


def generate_with_parts(parts: list[Any], *, system_instruction: str | None = None) -> str:
    models = model_candidates()
    last_error: Exception | None = None

    for model_name in models:
        try:
            logger.info("Calling Gemini model: %s", model_name)
            text = _generate_with_model(model_name, parts, system_instruction).strip()
            if text:
                logger.info("Gemini request succeeded with model: %s", model_name)
                return text
            last_error = ValueError(f"Model {model_name} returned empty results")
        except Exception as exc:
            last_error = exc
            if is_quota_error(exc):
                logger.warning(
                    "Quota/rate limit for %s, trying next model: %s", model_name, exc
                )
                continue
            logger.error("Gemini API error with %s: %s", model_name, exc)
            raise HTTPException(
                status_code=500,
                detail=f"Error calling Gemini API ({model_name}): {exc}",
            ) from exc

    if last_error and is_quota_error(last_error):
        raise HTTPException(status_code=429, detail=friendly_quota_message(last_error))

    raise HTTPException(
        status_code=500,
        detail=f"Error calling Gemini API: {last_error}",
    )
