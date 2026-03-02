"""Chat router – proxies requests to Azure OpenAI and persists to Cosmos DB."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.schemas import ChatRequest, ChatResponse
from services import openai_service, cosmos_service

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    messages = [m.model_dump() for m in request.messages]

    try:
        result = openai_service.chat_completion(
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI error: {exc}") from exc

    # Persist conversation (best-effort – don't fail the request if Cosmos is down)
    try:
        all_messages = messages + [result["message"]]
        cosmos_service.save_conversation(user_id=x_user_id, messages=all_messages)
    except Exception:
        pass

    return ChatResponse(message=result["message"], usage=result["usage"])


@router.get("/history")
def get_history(x_user_id: Optional[str] = Header(default="anonymous")):
    try:
        return cosmos_service.get_conversations(user_id=x_user_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Cosmos DB error: {exc}") from exc
