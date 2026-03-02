# SmartMoney Copilot — Architecture Overview

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SmartMoney Copilot                        │
├──────────────┬──────────────────┬───────────────────────────────┤
│  Frontend    │   Backend / API  │       AI / Agent Layer        │
│  (Web / App) │   (REST / WS)    │                               │
│              │                  │  ┌──────────────────────────┐ │
│  - Dashboard │  - Auth Service  │  │   LLM (OpenAI / Azure)   │ │
│  - Chat UI   │  - Finance API   │  │   + Prompt Engineering   │ │
│  - Reports   │  - User Mgmt     │  └──────────┬───────────────┘ │
│              │  - Notification  │             │                  │
│              │    Service       │  ┌──────────▼───────────────┐ │
│              │                  │  │    Agent Orchestrator    │ │
│              │                  │  │  (Expense / Portfolio /  │ │
│              │                  │  │   Budget / Security)     │ │
│              │                  │  └──────────┬───────────────┘ │
│              │                  │             │                  │
│              │                  │  ┌──────────▼───────────────┐ │
│              │                  │  │  MCP Servers (Tools)     │ │
│              │                  │  │  - Transactions Tool     │ │
│              │                  │  │  - Portfolio Tool        │ │
│              │                  │  │  - Budget Tool           │ │
│              │                  │  │  - Market Data Tool      │ │
│              │                  │  └──────────────────────────┘ │
├──────────────┴──────────────────┴───────────────────────────────┤
│                         Data Layer                               │
│         Database (PostgreSQL)  •  Cache (Redis)                  │
│         Object Store (S3-compatible)  •  Vector DB               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### Frontend
The user-facing web and mobile application. Provides a chat interface (Copilot), dashboards for spending and portfolio, and alert management.

### Backend / API
RESTful and WebSocket API server responsible for:
- User authentication and session management
- CRUD operations for transactions, accounts, and budgets
- Triggering agent workflows
- Sending notifications (push, email, SMS)

### AI / Agent Layer
- **LLM Integration**: Connects to Azure OpenAI or OpenAI API for natural language understanding and generation.
- **Agent Orchestrator**: Manages the lifecycle of autonomous agents, routes tasks, and aggregates results.
- **Agents**: Specialized agents (expense, budget, portfolio, security) that run sense-plan-act loops.

### MCP Servers
Standardized tool servers that expose financial data and actions to any MCP-compatible AI model. Each server handles its own authorization and data masking.

### Data Layer
- **PostgreSQL**: Primary relational store for users, accounts, transactions, and portfolios.
- **Redis**: Caching and real-time pub/sub for agent events.
- **Vector DB**: Stores embeddings for semantic search over transaction history and financial documents.
- **Object Store**: Receipts, documents, and report exports.

## Data Flow: User Asks a Financial Question

```
User Message
    │
    ▼
Frontend (Chat UI)
    │  WebSocket / HTTP
    ▼
Backend API (Chat endpoint)
    │  Authenticated request
    ▼
Agent Orchestrator
    │  Determines relevant tools
    ▼
LLM with MCP Tool Calls
    │  Calls MCP servers for live data
    ▼
MCP Servers return masked financial data
    │
    ▼
LLM generates response
    │
    ▼
Backend returns response to Frontend
    │
    ▼
User sees answer in Chat UI
```
