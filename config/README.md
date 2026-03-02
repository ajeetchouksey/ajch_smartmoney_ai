# Environment Configuration

This directory contains environment-specific configuration templates.

## Structure

```
config/
├── dev/          # Local development defaults
├── staging/      # Staging environment
└── production/   # Production environment
```

## Usage

Each service directory will contain a `.env.example` file showing the required environment variables. Copy it to `.env` and fill in the values for your environment.

**Never commit `.env` files containing real secrets.** Use a secrets manager (e.g., Azure Key Vault, AWS Secrets Manager, HashiCorp Vault) for production credentials.

## Required Variables (per service)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `OPENAI_API_KEY` | OpenAI / Azure OpenAI API key |
| `JWT_SECRET` | Secret for signing JWTs |
| `MCP_SERVER_URL` | Base URL of the MCP host |
| `NOTIFICATION_API_KEY` | Key for push / email / SMS provider |
