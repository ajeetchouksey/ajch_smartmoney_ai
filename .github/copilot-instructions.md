# GitHub Copilot Instructions — SmartMoney AI

This file defines the rules, conventions, and standards that GitHub Copilot must follow across this entire repository.

---

## 1. Project Overview

**SmartMoney AI** is a personal finance intelligence application with:
- A **static frontend** (`src/`) built in vanilla HTML, Tailwind CSS, and ES Module JavaScript
- A **Python AI backend** (`api/`) intended to run as Azure Functions
- A reusable **frontend UI/UX component kit** (`src/js/uiux_kit/`) — all components live HERE and nowhere else
- A legacy **Python component kit** (`uiux_kit/`) — kept for reference only, do NOT extend

---

## 2. Design System — Non-Negotiable Rules

### Color Palette
Always use these exact colors. Never introduce new ad-hoc colors.

| Token         | Hex Value  | Usage                                         |
|---------------|-----------|-----------------------------------------------|
| `bg-primary`  | `#f0f2f5`  | Page background                               |
| `bg-surface`  | `#ffffff`  | Cards, panels, modals                         |
| `bg-dark`     | `#111827`  | Sidebar, dark accent cards, primary buttons   |
| `bg-dark-soft`| `#1f2937`  | Dark card hover states, borders               |
| `accent-blue` | `#2563eb`  | Interactive elements, highlights, CTA buttons  |
| `text-primary`| `#111827`  | Body text, headings                           |
| `text-muted`  | `#6b7280`  | Labels, subtitles                             |
| `text-light`  | `#d1d5db`  | Text on dark surfaces                         |
| `success`     | Emerald-50/700 | Positive trends/ statuses                 |
| `danger`      | Rose-50/700    | Negative trends / alerts                  |

### Typography
- **Headings**: `font-semibold`, `tracking-tight`, `text-gray-900`
- **Labels / Metadata**: `text-[13px]`, `font-semibold`, `uppercase`, `tracking-wide`, `text-gray-500`
- **Body text**: `text-[14px]` or `text-[15px]`, `leading-relaxed`
- **Font family**: System `font-sans` (Tailwind default). Do NOT import Google Fonts.

### Component Shape Language
- Cards: `rounded-xl`, `border border-gray-200`, `shadow-sm`
- Buttons (primary): `rounded-lg`, `bg-[#111827]` or `bg-blue-600`
- Inputs: `rounded-xl`, `border border-gray-300`, `focus-within:ring-2 focus-within:ring-blue-500/20`
- Sidebar nav items: `rounded-lg`, active state = `bg-[#1f2937] text-white`

---

## 3. Repository Structure Rules

```
ajch_smartmoney_ai/
├── src/                         # Static frontend (Azure Static Web App)
│   ├── index.html               # App shell — routing is JS-driven, single page
│   ├── css/
│   │   └── style.css            # Custom overrides only. Tailwind via CDN.
│   └── js/
│       ├── main.js              # App router, page renderers, state
│       └── uiux_kit/
│           └── components.js    # ← ALL reusable UI components live here
├── api/                         # Azure Functions (Python) — backend AI logic
│   └── ...
├── uiux_kit/                    # Legacy Python kit — DO NOT modify or extend
├── app.py                       # Legacy Streamlit entry — DO NOT modify
└── .github/
    └── copilot-instructions.md  # This file
```

### Rules:
- **Never add inline styles** (`style="..."`) to HTML — use Tailwind classes only
- **Never use `<script>` blocks in `index.html`** for logic — all JS goes in `src/js/`
- **All new UI components** must be exported from `src/js/uiux_kit/components.js`
- **`main.js`** is the only file that imports from `uiux_kit/components.js`
- **`index.html` only handles** the shell layout (sidebar, header, content container); all dynamic HTML is rendered by `main.js`

---

## 4. JavaScript Conventions

- Use **ES Modules** (`import` / `export`) — no CommonJS (`require`)
- Use `const` by default; `let` only when reassignment is needed. Never `var`
- All component functions must be **pure string-returning functions**:
  ```js
  // ✅ Correct
  export const renderMyCard = (data) => `<div class="...">...</div>`;
  
  // ❌ Wrong — do not directly manipulate DOM inside a component function
  export const renderMyCard = (data) => { document.querySelector('#x').innerHTML = ... }
  ```
- DOM manipulation happens **only in `main.js`**, not in component files
- Use **template literals** for all HTML construction. No `document.createElement` except in `renderNavbar`

---

## 5. Python / Backend Conventions

- Python version: **3.10+**
- Always use a **virtual environment** — never install into global Python
- Backend API lives in `api/` as **Azure Functions (HTTP Trigger)**
- Use `azure-functions` SDK. No Flask or FastAPI
- Environment variables go in `api/local.settings.json` (local) and Azure App Settings (production)
- Never hardcode API keys, tokens, or secrets anywhere in source code

---

## 6. AI & LLM Integration Rules

- Use **Microsoft Agent Framework** (`agent-framework-azure-ai`) for all AI agent logic
- Model configuration goes via `.env` using:
  ```
  FOUNDRY_PROJECT_ENDPOINT=<endpoint>
  FOUNDRY_MODEL_DEPLOYMENT_NAME=<model>
  ```
- Never call OpenAI/Azure OpenAI SDK directly — go through the Agent Framework abstraction
- All AI responses must be **streamed** when displayed in the chat UI

---

## 7. Security Rules (OWASP Compliant)

- **No secrets in source code** — use environment variables exclusively
- **All user input** displayed in the DOM must be **HTML-escaped** to prevent XSS:
  ```js
  // Always sanitize before inserting user content into innerHTML
  const escape = (str) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  ```
- **No `eval()`** or `innerHTML` with raw, unescaped user-provided strings
- **CORS** on the Azure Functions API must be explicitly configured — no wildcard `*` in production
- Financial data must never be logged to the console in production builds

---

## 8. Naming Conventions

| Context              | Convention          | Example                          |
|----------------------|---------------------|----------------------------------|
| JS component functions | `camelCase`, verb-prefixed | `renderKpiCard`, `renderChatInterface` |
| JS files             | `kebab-case`        | `main.js`, `components.js`       |
| CSS classes          | Tailwind utilities only | `rounded-xl bg-blue-600`     |
| Python functions     | `snake_case`        | `get_spending_summary()`         |
| Azure Function dirs  | `kebab-case`        | `api/chat-completion/`           |
| Env variables        | `UPPER_SNAKE_CASE`  | `FOUNDRY_PROJECT_ENDPOINT`       |

---

## 9. Data Layer Architecture — Dual-Mode (Local ↔ Azure)

### Principle
All data access MUST go through the **Data Service Layer** abstraction. Never read/write data directly from page logic or components. This enables seamless switching between local JSON mode (for development/testing) and real Azure database mode (for production) via a single config flag.

### Data Mode Flag
Controlled by `src/js/data/config.js`:
```js
// 'local' = reads/writes JSON files in src/data/
// 'azure' = calls the Azure Functions API endpoints
export const DATA_MODE = 'local'; // change to 'azure' for production
```
This flag can also be toggled at runtime via **User Settings → Enable Live Database**.

### Directory Structure
```
src/
├── data/                        # Local JSON mock data (used when DATA_MODE = 'local')
│   ├── user.json
│   ├── transactions.json
│   ├── portfolio.json
│   └── insights.json
└── js/
    └── data/
        ├── config.js            # DATA_MODE flag
        ├── localDataService.js  # Reads/writes src/data/*.json via fetch()
        ├── azureDataService.js  # Calls Azure Functions API endpoints
        └── dataService.js       # Factory — exports the active service based on DATA_MODE
```

### Data Service Interface
Both `localDataService` and `azureDataService` MUST implement the **exact same function signatures**:
```js
export const getUser           = async () => { ... }
export const getTransactions   = async () => { ... }
export const saveTransaction   = async (tx) => { ... }
export const getPortfolio      = async () => { ... }
export const getInsights       = async () => { ... }
```

### Factory Pattern (dataService.js)
```js
import { DATA_MODE } from './config.js';
import * as local from './localDataService.js';
import * as azure from './azureDataService.js';

export const dataService = DATA_MODE === 'azure' ? azure : local;
```

### Rules Copilot MUST follow for data:
- **Always import from `dataService.js`**, never directly from `localDataService` or `azureDataService`
  ```js
  // ✅ Correct
  import { dataService } from '../data/dataService.js';
  const txns = await dataService.getTransactions();

  // ❌ Wrong — bypasses the abstraction
  import { getTransactions } from '../data/localDataService.js';
  ```
- **JSON schema files** in `src/data/` are the source of truth for data shapes. Any new field added to a JSON file must also be reflected in the corresponding Azure Function response.
- **`localDataService.js`** must use `fetch()` to load JSON files — do NOT use `import` for JSON data files (breaks browser ES Module rules).
- **`azureDataService.js`** calls `/api/<endpoint>` relative paths only — never hardcode full Azure URLs.
- When adding a new data entity, always create: the JSON file, add the function to both services, and update `dataService.js` exports.

### JSON Schema Conventions
All local JSON files must follow this envelope:
```json
{
  "schema_version": "1.0",
  "last_updated": "<ISO timestamp>",
  "data": [ ... ]
}
```

---

## 10. What Copilot Should NEVER Do

- ❌ Suggest Streamlit code for the `src/` frontend
- ❌ Add new color values outside the defined palette
- ❌ Create new JS files outside `src/js/` (except for tests)
- ❌ Use CDN libraries other than Tailwind CSS and FontAwesome (already in `index.html`)
- ❌ Suggest `node_modules` or `npm install` — the frontend uses CDN only
- ❌ Use `document.write()`
- ❌ Add `console.log` statements with sensitive financial data
- ❌ Modify `uiux_kit/` (Python) or `app.py` — they are legacy files
- ❌ Read data directly in page logic — always go through `dataService.js`
- ❌ Hardcode Azure URLs or connection strings anywhere in frontend JS
