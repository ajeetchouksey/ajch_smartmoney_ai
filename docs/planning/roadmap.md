# SmartMoney AI – Product Roadmap

> **Priority legend:** 🔴 P0 = must-have blocker · 🟠 P1 = must-have for iteration goal · 🟡 P2 = should-have · 🟢 P3 = nice-to-have

---

## 🏁 Iteration 0 – Foundation *(Done)*

**Goal:** Working skeleton deployed end-to-end

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 0.1 | Azure infrastructure (Bicep: SWA, Cosmos DB, Storage, Container Apps) | Task | 🔴 P0 | ✅ Done |
| 0.2 | FastAPI skeleton + health endpoint | Task | 🔴 P0 | ✅ Done |
| 0.3 | CI/CD pipeline (GitHub Actions: test → infra → build/push → deploy) | Task | 🔴 P0 | ✅ Done |

---

## 🚀 Iteration 1 – Core AI & Storage *(Done)*

**Goal:** Users can chat with AI and upload files

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 1.1 | AI Chat endpoint – Azure OpenAI `/api/chat` | Feature | 🟠 P1 | ✅ Done |
| 1.2 | Conversation persistence – Cosmos DB `/api/chat/history` | Feature | 🟠 P1 | ✅ Done |
| 1.3 | File upload – Azure Blob Storage `/api/storage/upload` | Feature | 🟠 P1 | ✅ Done |
| 1.4 | Frontend UI – Chat + file upload (Static Web App) | Feature | 🟠 P1 | ✅ Done |
| 1.5 | Security: Upgrade python-multipart CVE fix (0.0.9 → 0.0.22) | Task | 🔴 P0 | ✅ Done |

---

## 🔐 Iteration 2 – Authentication & Security *(Next)*

**Goal:** Users have secure, isolated accounts

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 2.1 | SWA built-in auth (AAD / GitHub provider) | Feature | 🟠 P1 | ❌ To do |
| 2.2 | Bind chat history and uploads to authenticated user ID | Task | 🟠 P1 | ❌ To do |
| 2.3 | API authorisation middleware (validate SWA client principal) | Task | 🟠 P1 | ❌ To do |

---

## 💰 Iteration 3 – Expense Intelligence

**Goal:** AI classifies and tracks spending

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 3.1 | Expense categorisation endpoint `/api/expenses/categorise` | Feature | 🟠 P1 | ❌ To do |
| 3.2 | Transaction ingestion – CSV / bank statement upload parser | Feature | 🟡 P2 | ❌ To do |
| 3.3 | Expense storage schema in Cosmos DB | Task | 🟠 P1 | ❌ To do |
| 3.4 | Expense list / filter API `/api/expenses` | Feature | 🟡 P2 | ❌ To do |

---

## 📊 Iteration 4 – Budgeting

**Goal:** Users set budgets and track progress

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 4.1 | Budget CRUD API `/api/budgets` | Feature | 🟠 P1 | ❌ To do |
| 4.2 | Budget vs. actual calculation service | Feature | 🟠 P1 | ❌ To do |
| 4.3 | Spending dashboard – Chart.js (budget vs. actual) | Feature | 🟡 P2 | ❌ To do |
| 4.4 | Budget alert notifications (email/push on threshold breach) | Feature | 🟢 P3 | ❌ To do |

---

## 🎯 Iteration 5 – Insights & Polish

**Goal:** Proactive financial guidance

| # | Item | Type | Priority | Status |
|---|---|---|---|---|
| 5.1 | AI-powered savings recommendations via chat | Feature | 🟡 P2 | ❌ To do |
| 5.2 | Monthly summary report (PDF export) | Feature | 🟢 P3 | ❌ To do |
| 5.3 | Mobile-responsive UI improvements | Task | 🟡 P2 | ❌ To do |
| 5.4 | Performance tuning + load testing | Task | 🟢 P3 | ❌ To do |

---

## Dependency Map

```
Iter 0 (infra + CI/CD)
  └── Iter 1 (AI + storage)
        └── Iter 2 (auth) ──────────────────────────┐
              └── Iter 3 (expense intelligence)      │
                    └── Iter 4 (budgeting) ──────────┤
                          └── Iter 5 (insights)      │
                                                      ▼
                                              All user-scoped features
                                              require auth (Iter 2) first
```

## Recommended Next Steps

1. **Start Iteration 2 (Authentication)** – gates all user-scoped data in Iterations 3 and 4.
2. **Iteration 3 (Expense Intelligence)** – core AI value-add; unblocks the dashboard.
3. **Iteration 4 (Budgeting)** – data layer and spending visibility.
4. **Iteration 5 (Insights & Polish)** – proactive guidance and UX refinement.
