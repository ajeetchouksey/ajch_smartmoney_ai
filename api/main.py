"""
SmartMoney AI — FastAPI Backend
Handles AI forecast requests by proxying to Azure AI Foundry.
Credentials stay server-side; the API key is never exposed to the browser.
"""

import os
import json
import logging
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SmartMoney AI API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the SWA origin (and localhost for dev). Pass ALLOWED_ORIGINS as a
# comma-separated env var; defaults to wildcard when not set.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# ── AI Foundry config ─────────────────────────────────────────────────────────
FOUNDRY_ENDPOINT    = os.getenv("FOUNDRY_ENDPOINT", "").rstrip("/")
FOUNDRY_MODEL       = os.getenv("FOUNDRY_MODEL", "")
FOUNDRY_API_KEY     = os.getenv("FOUNDRY_API_KEY", "")
FOUNDRY_API_VERSION = os.getenv("FOUNDRY_API_VERSION", "2024-08-01-preview")

AI_ENABLED = bool(FOUNDRY_ENDPOINT and FOUNDRY_MODEL and FOUNDRY_API_KEY)


def _build_prompt(data: dict) -> str:
    month            = data.get("month", "")
    currency         = data.get("currency", "USD")
    opening_balance  = data.get("opening_balance", 0)
    income_sources   = data.get("income_sources", [])
    fixed_expenses   = data.get("fixed_expenses", [])
    variable_expenses = data.get("variable_expenses", [])

    total_income   = sum(i["amount"] for i in income_sources if i.get("currency", currency) == currency)
    total_avail    = opening_balance + total_income
    total_fixed    = sum(e["amount"] for e in fixed_expenses)
    total_variable = sum(e.get("actual", e.get("budget", 0)) for e in variable_expenses)
    projected      = total_avail - total_fixed - total_variable

    foreign_lines = "\n".join(
        f"  - {i['name']} ({i.get('category','')}): {i.get('currency','')} {i['amount']}"
        for i in income_sources if i.get("currency") and i["currency"] != currency
    )

    inc_lines = "\n".join(
        f"  - {i['name']} ({i.get('category','')}): {currency} {i['amount']}"
        for i in income_sources if i.get("currency", currency) == currency
    ) or "  (none)"

    fixed_lines = "\n".join(
        f"  - {e['name']} ({e.get('category','')}): {e.get('currency',currency)} {e['amount']}"
        for e in fixed_expenses
    )

    var_lines = "\n".join(
        f"  - {e['name']} ({e.get('category','')}): budgeted {e.get('currency',currency)} {e.get('budget',0)}, "
        f"actual {e.get('currency',currency)} {e.get('actual',0)}"
        for e in variable_expenses
    )

    return f"""You are a personal finance AI. Analyse the following monthly data and respond with a JSON object only (no markdown, no extra text).

Month: {month}
Display Currency: {currency}
Prev. Month Savings (carried over): {currency} {opening_balance:.2f}

Income Sources in {currency} (total: {currency} {total_income:.2f}):
{inc_lines}
{f"Foreign Currency Income (not in totals):{chr(10)}{foreign_lines}" if foreign_lines else ""}

Total Available this month: {currency} {total_avail:.2f}
Fixed Expenses (total: {currency} {total_fixed:.2f}):
{fixed_lines}

Variable Expenses (total: {currency} {total_variable:.2f}):
{var_lines}

Projected closing balance: {currency} {projected:.2f}

Respond with exactly this JSON shape:
{{
  "projected_closing": <number>,
  "savings_rate_pct": <0-100 number>,
  "risk_level": "low" | "medium" | "high",
  "summary": "<2-sentence overview>",
  "insights": [
    {{ "type": "warning" | "positive" | "tip", "text": "<insight text>" }}
  ],
  "recommendations": [
    {{ "category": "<category name>", "action": "<actionable advice>", "potential_saving": <number> }}
  ]
}}"""


@app.post("/ai-forecast")
async def ai_forecast(request: Request):
    if not AI_ENABLED:
        raise HTTPException(status_code=503, detail="AI not configured on this server")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    url = (
        f"{FOUNDRY_ENDPOINT}/openai/deployments/{FOUNDRY_MODEL}"
        f"/chat/completions?api-version={FOUNDRY_API_VERSION}"
    )
    payload = {
        "messages": [
            {"role": "system", "content": "You are a precise personal finance AI. Always respond with valid JSON only."},
            {"role": "user",   "content": _build_prompt(body)},
        ],
        "max_tokens": 700,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers={"Content-Type": "application/json", "api-key": FOUNDRY_API_KEY},
            json=payload,
        )

    if response.status_code != 200:
        logger.error("Foundry error %s: %s", response.status_code, response.text[:500])
        raise HTTPException(status_code=502, detail="AI service error")

    raw = response.json()["choices"][0]["message"]["content"]
    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return JSONResponse(content=json.loads(cleaned))
    except Exception:
        raise HTTPException(status_code=502, detail="AI returned unparseable response")


@app.get("/health")
def health():
    return {"status": "ok"}
