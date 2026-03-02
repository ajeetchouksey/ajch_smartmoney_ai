"""Pydantic schemas for request/response models."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: int = Field(default=512, ge=1, le=2048)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class ChatResponse(BaseModel):
    message: ChatMessage
    usage: dict


class ConversationRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    messages: List[ChatMessage]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UploadResponse(BaseModel):
    file_name: str
    url: str
    size: int


class HealthResponse(BaseModel):
    status: str
    cosmos_db: str
    azure_storage: str
    openai: str
