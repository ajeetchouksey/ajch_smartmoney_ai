# SmartMoney Copilot — Agent Design

## Overview

Agents are autonomous AI processes that continuously monitor user finances and act proactively. Each agent follows a **sense → plan → act** loop.

---

## Expense Agent (`src/agents/expense_agent/`)

**Responsibility**: Monitor incoming transactions, categorize them using the LLM, detect spending anomalies.

**Trigger**: New transaction event (webhook or polling).

**Actions**:
- Categorize transaction (food, transport, utilities, entertainment, etc.)
- Check if the category budget is being exceeded
- Emit a `budget_alert` event if overspending is detected
- Store enriched transaction record

**Tools used**: `get_transactions` (MCP), `get_budget` (MCP)

---

## Budget Agent (`src/agents/budget_agent/`)

**Responsibility**: Track budget consumption against user-defined limits; forecast end-of-period spend.

**Trigger**: Scheduled (daily) or on `budget_alert` event.

**Actions**:
- Aggregate spending by category for the current period
- Forecast remaining spend using historical trends
- Send notification if projected spend exceeds budget
- Suggest category adjustments

**Tools used**: `get_budget` (MCP), `get_transactions` (MCP)

---

## Portfolio Agent (`src/agents/portfolio_agent/`)

**Responsibility**: Analyze investment portfolio performance and allocation drift; suggest rebalancing.

**Trigger**: Scheduled (weekly) or on significant market movement.

**Actions**:
- Fetch current holdings and prices
- Calculate portfolio performance vs. benchmark
- Detect allocation drift beyond threshold (e.g., > 5%)
- Generate rebalancing recommendation (human-in-the-loop — never executes trades)

**Tools used**: `get_holdings` (MCP), `get_performance` (MCP), `get_price` (MCP)

---

## Security Agent (`src/agents/security_agent/`)

**Responsibility**: Detect fraudulent or anomalous transactions and access patterns.

**Trigger**: New transaction event; login event.

**Actions**:
- Score transaction risk based on amount, location, merchant category, and user history
- Flag high-risk transactions for user review
- Lock account temporarily on repeated anomalies (with user notification)

**Tools used**: `get_transactions` (MCP), `search_transactions` (MCP)

---

## Agent Communication

Agents communicate via an internal event bus (e.g., Redis pub/sub or an async message queue):

```
Transaction Event
       │
       ├──► Expense Agent ──► budget_alert event ──► Budget Agent
       │                                                    │
       └──► Security Agent                                  │
                                                            ▼
                                                   Notification Service
                                                   (Push / Email / SMS)
```

## Human-in-the-Loop Principle

> **No agent will execute any financial transaction, transfer, or trade without explicit user confirmation.**

Agents are advisory by default. Any action requiring real-world financial consequence must be approved by the user through the app interface.
