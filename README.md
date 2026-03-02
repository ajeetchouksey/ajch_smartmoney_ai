# 💰 SmartMoney AI

AI-powered personal finance assistant built on Azure with a **minimum-budget** architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Azure Static Web App (Free)                │
│              frontend/src  ─── staticwebapp.config.json     │
│                         │                                   │
│              /api/*  proxy →  Container App API             │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
   Azure Cosmos DB      Azure Storage      Azure OpenAI
   (Serverless SQL)     (Standard LRS)    (gpt-4o-mini)
```

## Services & Minimum-Budget Choices

| Service | Tier / Mode | Why it's cheap |
|---|---|---|
| **Azure Static Web App** | Free (F1) | $0/month – global CDN + custom domains included |
| **Azure Cosmos DB** | Serverless | Pay per RU consumed; no minimum throughput charge |
| **Azure Blob Storage** | Standard LRS | ~$0.018/GB/month – lowest redundancy level |
| **Azure Container Apps** | Consumption | Scale-to-zero; pay only for active vCPU/memory seconds |
| **Azure OpenAI** | gpt-4o-mini | Cheapest capable model (~$0.15/1M input tokens) |

> **Tip:** Enable the [Cosmos DB Free Tier](https://learn.microsoft.com/azure/cosmos-db/free-tier) (one account per subscription) to get 1,000 RU/s and 25 GB free permanently.

## Project Structure

```
├── api/                        FastAPI backend
│   ├── main.py                 App entry point & CORS setup
│   ├── routers/
│   │   ├── chat.py             POST /api/chat  + GET /api/chat/history
│   │   ├── storage.py          POST /api/storage/upload  + GET /api/storage/sas
│   │   └── health.py           GET /api/health
│   ├── services/
│   │   ├── openai_service.py   Azure OpenAI wrapper
│   │   ├── cosmos_service.py   Cosmos DB SQL API wrapper
│   │   └── storage_service.py  Azure Blob Storage wrapper
│   ├── models/schemas.py       Pydantic request/response models
│   ├── tests/test_api.py       Pytest test suite (14 tests)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── index.html          Chat + file upload UI
│   │   ├── app.js              Vanilla JS – calls the API
│   │   └── styles.css          Responsive styles
│   └── staticwebapp.config.json  SWA routing & security headers
├── infra/                      Bicep IaC
│   ├── main.bicep              Orchestration template
│   ├── main.parameters.json    Parameter defaults
│   └── modules/
│       ├── staticwebapp.bicep
│       ├── cosmosdb.bicep
│       ├── storage.bicep
│       └── containerapp.bicep
└── .github/workflows/deploy.yml  CI/CD pipeline
```

## Local Development

### Prerequisites
- Python 3.11+
- Azure CLI (`az`)
- Node.js 18+ *(optional – for SWA CLI)*

### 1. Clone & configure

```bash
git clone https://github.com/ajeetchouksey/ajch_smartmoney_ai.git
cd ajch_smartmoney_ai
cp api/.env.example api/.env
# Edit api/.env with your Azure credentials
```

### 2. Run the FastAPI backend

```bash
cd api
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 3. Run the frontend with SWA CLI *(recommended)*

```bash
npm install -g @azure/static-web-apps-cli
swa start frontend/src --api-location http://localhost:8000
```

Open `http://localhost:4280`

### 4. Run tests

```bash
cd api
pytest tests/ -v
```

## Deploy to Azure

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AZURE_CREDENTIALS` | Service principal JSON (`az ad sp create-for-rbac --sdk-auth`) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA deployment token |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint |
| `ACR_LOGIN_SERVER` | Azure Container Registry login server |
| `ACR_USERNAME` | ACR username |
| `ACR_PASSWORD` | ACR password |

### One-time infrastructure provisioning

```bash
az group create --name rg-smartmoneyai --location eastus

az deployment group create \
  --resource-group rg-smartmoneyai \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json \
               openAiApiKey="<your-key>" \
               openAiEndpoint="https://<resource>.openai.azure.com/"
```

Subsequent deployments are handled automatically by the GitHub Actions workflow on every push to `main`.

## API Reference

### `GET /api/health`
Returns connectivity status of all Azure services.

### `POST /api/chat`
```json
{
  "messages": [{"role": "user", "content": "How do I save money?"}],
  "max_tokens": 512,
  "temperature": 0.7
}
```

### `POST /api/storage/upload`
Multipart form upload (max 10 MB). Returns `{ file_name, url, size }`.

### `GET /api/storage/sas?blob_name=<name>&expiry_hours=1`
Returns a time-limited SAS URL for a stored blob.

### `GET /api/chat/history`
Returns conversation history for the authenticated user (pass `x-user-id` header).

## Security Notes

- All secrets are stored as GitHub Actions secrets or Azure Key Vault references – never committed to source.
- Azure Storage has public access **disabled**; files are accessible only via SAS tokens.
- CORS is restricted to the configured `ALLOWED_ORIGINS`.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP) are set via `staticwebapp.config.json`.
