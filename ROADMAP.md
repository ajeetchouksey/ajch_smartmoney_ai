# SmartMoney AI — Product Roadmap
## MVP: AI-Powered Personal Income & Budgeting with Multi-Currency Support

> **Current date:** March 2026  
> **Target MVP ship:** May 2026 (10 weeks)  
> **Stack:** Vanilla JS + Tailwind (frontend) · Azure Functions Python (backend AI) · Azure Static Web App (hosting)

---

## What's Already Built (Foundation ✅)

| Module | Status | Notes |
|---|---|---|
| Monthly Expenses page | ✅ Live | Income sources, fixed & variable expenses, per-month view |
| Multi-currency data model | ✅ Live | `expenses.json` per-record currency, `profile.json` currencies array |
| Profile setup wizard | ✅ Live | 5-step: type → country → currency → members → AI consent |
| AI Copilot chat UI | ✅ Live | Streaming-ready message renderer, action cards |
| Dashboard shell | ⚠️ Hardcoded | KPI cards wired to static strings, no real data |
| Currency chip switcher | ✅ Live | Per-month display currency, persists to JSON |
| Income entry modal | ✅ Live | Name, amount, currency, category, country type |
| Expense entry modal | ✅ Live | Name, amount/budget, category, due day |

---

## Milestone Overview

```
Mar 2026     Apr 2026     May 2026
│            │            │
M0──────M1───────M2───────────M3──────M4
Foundation  Live        AI Engine    Multi-FX  Launch
           Dashboard               Full Impl
```

| Milestone | Target | Focus |
|---|---|---|
| **[M0] Foundation Complete** | Mar 14 | Scaffold verified, profile wizard, local data working |
| **[M1] MVP Core — Live Budget Dashboard** | Mar 28 | Real data, budget vs actual, savings calculation |
| **[M2] AI Engine — Forecast & Insights** | Apr 18 | Azure AI endpoints, forecasts, insight cards |
| **[M3] Multi-Currency Intelligence** | May 2 | Live FX rates, tax tagging, cross-currency rollup |
| **[M4] Income Depth & Launch Polish** | May 23 | Net/gross, tax estimate, household, mobile, prod deploy |

---

## M0 — Foundation Complete  `due: Mar 14 2026`

> Verify all existing scaffold is working end-to-end in local mode.

### Deliverables
- [ ] Profile wizard completes and persists to `profile.json` — [#61](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/61)
- [ ] Expenses page loads, entries add/delete/persist to `expenses.json` — [#62](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/62)
- [ ] Currency chip switches display currency and persists — [#63](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/63)
- [ ] AI Copilot chat sends message (mock response in local mode) — [#64](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/64)
- [ ] All nav routes load without 404 or JS errors — [#65](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/65)
- [ ] Mobile display passes visual review at 375px — [#66](https://github.com/ajeetchouksey/ajch_smartmoney_ai/issues/66)

### Definition of Done
A new user can complete the wizard, log their first income source, add expenses, and see the copilot chat — all offline with local JSON.

---

## M1 — MVP Core: Live Budget Dashboard  `due: Mar 28 2026`

> Replace all hardcoded dashboard values with real data. Make budget vs actual visible and meaningful.

### Features

#### 1.1 Dashboard Live Data Wiring
Wire all 4 KPI cards to `dataService.getExpenses()` + `getUser()`:
- **Total Balance** = `opening_balance + total_income - total_expenses`
- **Monthly Income** = sum of `income_sources[].amount` (in primary currency)
- **Total Expenses** = fixed + variable actual spend
- **Savings Rate** = `(income - expenses) / income × 100`

#### 1.2 Budget vs Actual Panel
New component `renderBudgetSummary()`:
- Per-category progress bar (actual vs budget)
- Colour: green < 80%, amber 80–100%, red > 100%
- Total surplus / deficit badge at top
- Drill-down: click category → filtered expense list

#### 1.3 Cash Flow Chart (Real Data)
Replace `renderChartSkeleton()` with live SVG bar chart:
- X-axis: last 6 months extracted from all expense records
- Grouped bars: Income (blue) vs Expenses (rose)
- Hover tooltip: exact values
- No external charting library

#### 1.4 Overspend Alerts
Inline alert banners driven by data:
- Variable expense > budget → amber warning row
- Total expenses > total income → red banner at page top
- Savings rate < 10% → suggestion card

### Data Changes
- `expenses.json` — no schema change required
- `dataService.js` — add `getSummary(month)` computed helper

---

## M2 — AI Engine: Forecast & Insights  `due: Apr 18 2026`

> Connect Azure AI to generate real forecasts and spending pattern insights.

### Features

#### 2.1 Monthly Budget Forecast (AI)
New Azure Function: `POST /api/ai-forecast`
- Input: last 3 months of expense data
- Output: `{ predicted_total, categories: [{ name, predicted, confidence }], narrative }`
- Frontend: `renderForecastCard()` — shows 30-day projection per category with confidence band
- Fallback: if AI off or offline → show last month's actuals as baseline

#### 2.2 AI Insight Cards (Pattern Detection)
`POST /api/ai-insights` endpoint:
- Detects: spending creep, weekend dining spikes, income timing gaps, dormant subscriptions
- Returns: array of insight objects `{ type, severity, title, detail, action_label }`
- Rendered in Dashboard AI Insights panel (replaces hardcoded static items)
- Severity colour: info=blue, warning=amber, critical=rose

#### 2.3 AI Budget Recommendation
Within the Budget vs Actual panel:
- AI suggests optimal budget redistribution: "Cut dining by £40 → save an extra £480/year"
- Triggered on page load if `ai_forecast === null` for the current month
- Streamed token-by-token into a dedicated insight card

#### 2.4 Copilot Budget Q&A
Copilot chat understands expense data context:
- User asks: "How much did I spend on food this month?"
- AI has access to sanitised expense summary (no merchant names, no raw amounts)
- Responds with computed answer + a follow-up suggestion

### Azure Functions Required
| Function | Method | Auth |
|---|---|---|
| `api/ai-forecast` | POST | Function key |
| `api/ai-insights` | POST | Function key |
| `api/ai-chat` | POST (streaming) | Function key |

### Security
- All AI calls gated by `profile.ai_consent === true`
- Expense data shared with AI: category totals only — never merchant names, account numbers, or raw transaction IDs
- API keys in `local.settings.json` (local) / Azure Key Vault reference (prod)

---

## M3 — Multi-Currency Intelligence  `due: May 2 2026`

> Make multi-currency a first-class feature, not just a display option.

### Features

#### 3.1 Exchange Rate Service
New module `src/js/data/fxService.js`:
- **Local mode**: static rate table in `src/data/fx_rates.json` (updated weekly in repo)
- **Azure mode**: `GET /api/fx-rates?base=USD` — wraps a free FX API (ExchangeRate-API or similar)
- Rates cached in `localStorage` for 24 hours
- `fxService.convert(amount, fromCurrency, toCurrency)` — single conversion function

#### 3.2 Cross-Currency Income View
Income sources that come from a different currency than the primary:
- Show original amount + converted amount side-by-side
- Flag icon next to currency code (from `countries.json`)
- "Income from abroad" section auto-grouped in Income panel

#### 3.3 Tax Type Tagging
Extend `income_sources` schema:
```json
{ "tax_type": "PAYE" | "self-assessment" | "freelance" | "rental" | "investment" | "other" }
```
- UI: tag badge on each income row
- Copilot understands tax type context when answering questions
- Filter income list by tax type

#### 3.4 Monthly Rollup in Primary Currency
All budget summaries, KPI cards, and charts display in the user's primary currency by default:
- FX conversion applied at the rate stored at expense entry time (`fx_rate_at_entry`)
- Toggle: "Show in original currencies" splits rows by currency

#### 3.5 Budget Rules Across Currencies
Extend variable expense budget rules to support a budget currency:
```json
{ "budget": 300, "budget_currency": "GBP", "actual": 275, "actual_currency": "EUR" }
```
- Variance shown in both currencies

---

## M4 — Income Depth & Launch Polish  `due: May 23 2026`

> Complete the income management story and ship to production.

### Features

#### 4.1 Gross vs Net Income Toggle
Per income source:
- `gross_amount` + `net_amount` fields
- Toggle in header: "Show Gross / Show Net"
- All KPI calculations based on net by default

#### 4.2 Tax Estimation
Simple rule-based estimator (not financial advice):
- Input: gross income, tax type, country
- Output: estimated tax band + rough deduction
- Displayed as: "Est. tax ~£1,200 (20% band)" below gross amount
- Flagged clearly as an estimate, not advice

#### 4.3 Multi-Member Household Income
When `profile.type === 'household'`:
- Income sources tagged by member name
- Dashboard shows household total + per-member breakdown
- Budget is shared but income visibility can be toggled per-member

#### 4.4 6-Month Income Trend
Card below Dashboard KPIs:
- Line chart: total income per month (last 6)
- Overlaid: total expenses line
- Shows: months where expenses exceeded income (highlighted)

#### 4.5 Mobile Responsive Audit
- All pages verified at 375px, 414px, 768px
- Modals scroll correctly on iOS Safari
- Touch-friendly tap targets (min 44px)

#### 4.6 Production Deployment
- Azure Static Web App deploy via `azd up`
- Azure Functions deployed to consumption plan
- KV references for all AI secrets
- Smoke test: profile wizard → expenses → AI forecast → export data

---

## Out of Scope for MVP

These are deliberately deferred:

| Feature | Reason |
|---|---|
| Bank/Open Banking integration | Requires FCA regulation consideration (UK) |
| Real-time stock prices in portfolio | Scope creep — portfolio MVP is Phase 2 |
| Shared expense splitting | Complex UX — belongs in household Phase 2 |
| Multi-language / i18n | Out of scope for english-first MVP |
| Recurring transaction auto-import | Depends on Open Banking (deferred) |
| Native mobile app | Web-first MVP, PWA wrapper post-launch |

---

## AI Safety Principles (All Phases)

1. **No raw PII to AI** — only category totals and metadata
2. **Consent-gated** — all AI features off until user opts in
3. **Estimate labelling** — all AI outputs labelled "AI estimate" with disclaimer
4. **Offline fallback** — every AI feature degrades gracefully to static data
5. **No financial advice** — copilot responses include "this is not financial advice" footer

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/js/main.js` | SPA router + all page controllers |
| `src/js/uiux_kit/components.js` | All pure HTML-returning UI components |
| `src/js/data/dataService.js` | Data access factory (local ↔ azure) |
| `src/js/data/localDataService.js` | Local JSON reads via fetch() |
| `src/js/ai/aiService.js` | All AI API calls + consent gating |
| `src/data/expenses.json` | Monthly income + expense records |
| `src/data/profile.json` | User profile, countries, currencies, members |
| `src/data/countries.json` | Country + currency reference data |
| `api/` | Azure Functions Python (AI endpoints) |
