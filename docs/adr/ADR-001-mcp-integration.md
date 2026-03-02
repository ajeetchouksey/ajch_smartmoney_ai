# ADR-001: Use Model Context Protocol (MCP) for AI Tool Integration

**Date**: 2026-03-02  
**Status**: Accepted  
**Deciders**: Ajeet Chouksey

---

## Context

SmartMoney Copilot needs AI models (LLMs) to access live financial data such as transactions, portfolio holdings, budget summaries, and market prices. Directly embedding API calls inside prompts is fragile, insecure, and not portable across different AI providers.

## Decision

Adopt **Model Context Protocol (MCP)** as the standard interface between AI models and financial data tools. Each data domain (transactions, portfolio, budget, market data) will be exposed as a dedicated MCP server. The AI model connects to the MCP host and calls standardized tools rather than making raw API calls.

Benefits:
- Provider-agnostic: works with Claude, GPT-4, Gemini, and any MCP-compatible model.
- Standardized tool definitions keep prompts clean.
- MCP servers can enforce authorization, rate limiting, and data masking before returning data to the model.

## Consequences

- **Positive**: Clean separation between AI logic and data access; easy to swap LLM providers; financial data never leaves the MCP host unmasked.
- **Negative**: Additional layer of infrastructure to maintain (MCP servers); requires familiarity with the MCP SDK.
