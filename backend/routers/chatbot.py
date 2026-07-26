"""
Generic Streaming AI Chatbot Router
Uses the official Google GenAI SDK (google.genai).
Streams token-by-token via Server-Sent Events (SSE). Stateless & client-owned history.
"""
import os, json, logging, asyncio
from typing import List, Literal
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

logger = logging.getLogger("chatbot")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# ── Model fallback chain (Priority order on 429 quota limits) ────────────────
MODEL_CHAIN = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]

_working_model_index = 0

# ── CUSTOMIZE YOUR SYSTEM PROMPT HERE ─────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are an intelligent AI assistant embedded in [YOUR_PROJECT_NAME].\n\n"
    "Target Users: [YOUR_TARGET_USERS]\n"
    "Help with: [YOUR_KEY_FEATURES_AND_TOPICS]\n\n"
    "Guidelines: Be concise, practical, and helpful. Use bullet points for multi-step answers."
)

router = APIRouter(tags=["chatbot"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: List[ChatMessage] = Field(default_factory=list, max_length=50)


def _is_quota_error(exc: Exception) -> bool:
    """Return True if exception is 429 / quota limit error."""
    msg = str(exc).lower()
    return (
        "429" in msg
        or "resource_exhausted" in msg
        or "quota" in msg
        or "too many requests" in msg
        or "rate" in msg
    )


def _friendly_error(exc: Exception) -> str:
    """Extract short, human-readable message from Gemini exception."""
    raw = str(exc)
    try:
        start = raw.find("{")
        if start != -1:
            payload = json.loads(raw[start:raw.rfind("}") + 1])
            msg = (
                payload.get("error", {}).get("message", "")
                or payload.get("message", "")
            )
            if msg:
                first_line = msg.split("\n")[0].split(".")[0].strip()
                return first_line if first_line else msg[:120]
    except Exception:
        pass
    return raw[:120] if len(raw) > 120 else raw


async def _sse_stream(req: ChatRequest):
    global _working_model_index

    contents: list[types.Content] = []
    for msg in req.history:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=req.message)]))

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.7,
        max_output_tokens=1024,
    )

    start_index = _working_model_index
    tried = 0

    while tried < len(MODEL_CHAIN):
        model_idx = (start_index + tried) % len(MODEL_CHAIN)
        model = MODEL_CHAIN[model_idx]
        tried += 1

        try:
            logger.info("[chatbot] Trying model: %s", model)
            async for chunk in await _client.aio.models.generate_content_stream(
                model=model, contents=contents, config=config
            ):
                token = chunk.text
                if token:
                    yield f"data: {json.dumps({'token': token, 'model': model}, ensure_ascii=False)}\n\n"

            _working_model_index = model_idx
            yield "data: [DONE]\n\n"
            return

        except Exception as exc:
            logger.warning("[chatbot] Model %s failed: %s", model, exc)
            if _is_quota_error(exc) and tried < len(MODEL_CHAIN):
                logger.info("[chatbot] Quota hit on %s, trying next model…", model)
                await asyncio.sleep(0.3)
                continue
            else:
                friendly = _friendly_error(exc)
                if _is_quota_error(exc):
                    friendly = "All AI models are temporarily rate-limited. Please wait 30 seconds and try again."
                yield f"data: {json.dumps({'error': friendly})}\n\n"
                yield "data: [DONE]\n\n"
                return


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Stream Gemini reply token-by-token as SSE. No server-side state."""
    if not _client:
        raise HTTPException(status_code=503, detail="Chatbot missing GEMINI_API_KEY.")
    return StreamingResponse(
        _sse_stream(req),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/chat/health")
async def chat_health():
    current_model = MODEL_CHAIN[_working_model_index]
    return {
        "status": "ok",
        "model": current_model,
        "model_chain": MODEL_CHAIN,
        "sdk": "google-genai",
        "streaming": True,
    }