# SmartMoney Copilot — API Reference

> This document will be populated as the API is built.

## Conventions

- Base URL: `https://api.smartmoney.example.com/v1`
- Authentication: `Authorization: Bearer <token>` header on all requests
- Response format: JSON
- Dates: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)

## Planned Endpoints

### Auth
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Authenticate and receive a JWT
- `POST /auth/refresh` — Refresh an access token
- `POST /auth/logout` — Invalidate the current session

### Accounts
- `GET /accounts` — List linked financial accounts
- `POST /accounts` — Link a new account
- `GET /accounts/{id}` — Get account details
- `DELETE /accounts/{id}` — Unlink an account

### Transactions
- `GET /transactions` — List transactions (paginated, filterable)
- `GET /transactions/{id}` — Get a single transaction
- `PATCH /transactions/{id}` — Update category or note

### Budget
- `GET /budgets` — List budgets for the current period
- `POST /budgets` — Create a budget
- `PUT /budgets/{id}` — Update a budget
- `GET /budgets/summary` — Spending vs. budget summary

### Portfolio
- `GET /portfolio/holdings` — List current holdings
- `GET /portfolio/performance` — Performance metrics
- `GET /portfolio/allocation` — Asset allocation breakdown

### Copilot (Chat)
- `POST /copilot/chat` — Send a message to the AI copilot
- `GET /copilot/history` — Retrieve conversation history

### Notifications
- `GET /notifications` — List notifications
- `PATCH /notifications/{id}/read` — Mark notification as read
