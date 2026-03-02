# ADR-002: Agentic AI Architecture Using Autonomous Agents

**Date**: 2026-03-02  
**Status**: Accepted  
**Deciders**: Ajeet Chouksey

---

## Context

SmartMoney Copilot must proactively monitor user finances and take actions (alerts, recommendations, rebalancing suggestions) without waiting for the user to ask. A purely reactive chat interface is insufficient.

## Decision

Implement **autonomous AI agents** using a framework such as LangChain, AutoGen, or Semantic Kernel. Four agents are planned:

1. **Expense Agent** — Monitors and categorizes transactions in near-real-time.
2. **Budget Agent** — Tracks budget consumption and forecasts overruns.
3. **Portfolio Agent** — Analyses investment performance and drift.
4. **Security Agent** — Flags anomalous transactions or access patterns.

Each agent operates on a **sense → plan → act** loop and communicates results through the notification service.

## Consequences

- **Positive**: Proactive financial management; user receives timely nudges without manual querying.
- **Negative**: Agents add operational complexity; they must be carefully scoped to avoid unintended actions (e.g., no agent should execute real financial transactions without explicit user approval).
