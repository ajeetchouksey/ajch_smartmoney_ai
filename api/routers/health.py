"""Health check router."""

import os
from fastapi import APIRouter
from models.schemas import HealthResponse
from services import cosmos_service, storage_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    cosmos_ok = "ok" if cosmos_service.ping() else "unavailable"
    storage_ok = "ok" if storage_service.ping() else "unavailable"
    openai_ok = "ok" if os.getenv("AZURE_OPENAI_ENDPOINT") else "not configured"
    return HealthResponse(
        status="ok",
        cosmos_db=cosmos_ok,
        azure_storage=storage_ok,
        openai=openai_ok,
    )
