"""
SmartMoney AI - FastAPI Backend
Integrates with Azure Cosmos DB (SQL), Azure Storage, and Azure OpenAI.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import chat, storage, health

load_dotenv()

app = FastAPI(
    title="SmartMoney AI API",
    description="AI-powered smart money management backend",
    version="1.0.0",
)

# Allow Azure Static Web App origin + local dev
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:4280,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(storage.router, prefix="/api/storage", tags=["storage"])
