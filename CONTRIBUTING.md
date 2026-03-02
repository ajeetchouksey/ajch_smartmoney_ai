# Contributing to SmartMoney Copilot

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository and create a feature branch from `main`.
2. Follow the [project structure](./README.md#-project-structure) when adding new code.
3. Write clear, descriptive commit messages.

## Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/expense-agent` |
| Bug fix | `fix/<short-description>` | `fix/auth-token-refresh` |
| Documentation | `docs/<short-description>` | `docs/mcp-server-guide` |
| Infrastructure | `infra/<short-description>` | `infra/docker-compose` |

## Pull Request Guidelines

- Keep PRs focused on a single concern.
- Reference the related issue number in the PR description (e.g., `Closes #12`).
- Ensure all CI checks pass before requesting a review.
- Add tests for any new functionality.

## Code Style

- **Python**: Follow [PEP 8](https://peps.python.org/pep-0008/); use `black` for formatting.
- **TypeScript / JavaScript**: Follow the project ESLint/Prettier configuration.
- Keep functions small and single-purpose.
- Document public APIs with docstrings / JSDoc.

## Security

- **Never** commit secrets, API keys, or credentials to the repository.
- Use environment variables for all sensitive configuration (see `.env.example` files in each service directory).
- Report security vulnerabilities privately by opening a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

## Architecture Decision Records (ADRs)

Significant design decisions should be documented as ADRs in `docs/adr/`. Use the template at `docs/adr/template.md`.

## Questions?

Open a [GitHub Discussion](https://github.com/ajeetchouksey/ajch_smartmoney_ai/discussions) for general questions or ideas.
