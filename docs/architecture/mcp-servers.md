# SmartMoney Copilot — MCP Server Design

## Overview

Model Context Protocol (MCP) servers expose financial data and capabilities to AI models in a standardized, provider-agnostic way. Each MCP server is a lightweight service that:

1. Defines a set of **tools** (functions the LLM can call).
2. Validates authorization before returning data.
3. Masks or anonymizes sensitive fields before passing data to the LLM.

---

## MCP Server: Transactions (`src/mcp/transactions/`)

| Tool | Description | Parameters |
|---|---|---|
| `get_transactions` | Fetch recent transactions | `account_id`, `limit`, `from_date`, `to_date` |
| `search_transactions` | Semantic search over transaction history | `query`, `limit` |
| `get_transaction` | Get a single transaction by ID | `transaction_id` |

---

## MCP Server: Portfolio (`src/mcp/portfolio/`)

| Tool | Description | Parameters |
|---|---|---|
| `get_holdings` | List all investment holdings | `account_id` |
| `get_performance` | Portfolio performance over a period | `account_id`, `period` |
| `get_allocation` | Current asset allocation breakdown | `account_id` |

---

## MCP Server: Budget (`src/mcp/budget/`)

| Tool | Description | Parameters |
|---|---|---|
| `get_budget` | Get budget limits by category | `user_id`, `period` |
| `get_budget_summary` | Spending vs. budget summary | `user_id`, `period` |
| `update_budget` | Update a category budget limit | `user_id`, `category`, `amount` |

---

## MCP Server: Market Data (`src/mcp/market_data/`)

| Tool | Description | Parameters |
|---|---|---|
| `get_price` | Get current price for a symbol | `symbol` |
| `get_news` | Get recent financial news for a symbol | `symbol`, `limit` |
| `get_exchange_rate` | Get currency exchange rate | `from_currency`, `to_currency` |

---

## Security Model

- All MCP tool calls are authenticated via a bearer token scoped to the user's session.
- MCP servers never return account numbers, card numbers, or PII in raw form — these fields are masked (e.g., `****1234`).
- Rate limiting is enforced per user per tool.
- All tool invocations are audit-logged.
