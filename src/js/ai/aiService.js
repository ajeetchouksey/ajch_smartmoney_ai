// aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// AI integration layer for SmartMoney AI.
//
// Routing logic:
//   LOCAL mode + ai_settings.js present + enabled=true
//     → calls Azure AI Foundry / Azure OpenAI directly (for local dev/testing)
//   AZURE mode OR ai_settings.js missing/disabled
//     → calls Azure Functions at /api/ai-forecast (production path)
// ─────────────────────────────────────────────────────────────────────────────

let _settings = null;
let _apiBaseUrl = null;

async function loadSettings() {
    if (_settings !== null) return _settings;
    try {
        const mod = await import('./ai_settings.js');
        _settings = mod.AI_SETTINGS || { enabled: false };
    } catch {
        // ai_settings.js not present — use production API path
        _settings = { enabled: false };
    }
    return _settings;
}

async function loadApiBaseUrl() {
    if (_apiBaseUrl !== null) return _apiBaseUrl;
    try {
        const mod = await import('./api_config.js');
        _apiBaseUrl = mod.AI_API_BASE_URL || '';
    } catch {
        // api_config.js not present — fall back to relative /api path (SWA local)
        _apiBaseUrl = '';
    }
    return _apiBaseUrl;
}

function buildForecastPrompt(expensesData) {
    const { month, opening_balance, currency, income_sources, fixed_expenses, variable_expenses } = expensesData;
    const income        = income_sources || [];
    const totalIncome   = income.filter(i => (i.currency || currency) === currency).reduce((s, i) => s + i.amount, 0);
    const totalAvail    = (opening_balance || 0) + totalIncome;
    const totalFixed    = fixed_expenses.reduce((s, e) => s + e.amount, 0);
    const totalVariable = variable_expenses.reduce((s, e) => s + (e.actual ?? e.budget ?? 0), 0);
    const projected     = totalAvail - totalFixed - totalVariable;
    const foreignIncome = income.filter(i => i.currency && i.currency !== currency)
        .map(i => `  - ${i.name} (${i.category}, ${i.country_type || 'other'}): ${i.currency} ${i.amount}`).join('\n');

    return `You are a personal finance AI. Analyse the following monthly data and respond with a JSON object only (no markdown, no extra text).

Month: ${month}
Display Currency: ${currency}
Prev. Month Savings (carried over): ${currency} ${(opening_balance||0).toFixed(2)}

Income Sources in ${currency} (total: ${currency} ${totalIncome.toFixed(2)}):
${income.filter(i=>(i.currency||currency)===currency).map(i=>`  - ${i.name} (${i.category}, ${i.country_type||'other'}): ${currency} ${i.amount}`).join('\n') || '  (none)'}
${foreignIncome ? `\nForeign Currency Income (not in totals):\n${foreignIncome}` : ''}

Total Available this month: ${currency} ${totalAvail.toFixed(2)}
Fixed Expenses (total: ${currency} ${totalFixed.toFixed(2)}):
${fixed_expenses.map(e => `  - ${e.name} (${e.category}): ${e.currency||currency} ${e.amount}`).join('\n')}

Variable Expenses (total: ${currency} ${totalVariable.toFixed(2)}):
${variable_expenses.map(e => `  - ${e.name} (${e.category}): budgeted ${e.currency||currency} ${e.budget}, actual ${e.currency||currency} ${e.actual ?? 0}`).join('\n')}

Projected closing balance: ${currency} ${projected.toFixed(2)}

Respond with exactly this JSON shape:
{
  "projected_closing": <number>,
  "savings_rate_pct": <0-100 number>,
  "risk_level": "low" | "medium" | "high",
  "summary": "<2-sentence overview>",
  "insights": [
    { "type": "warning" | "positive" | "tip", "text": "<insight text>" }
  ],
  "recommendations": [
    { "category": "<category name>", "action": "<actionable advice>", "potential_saving": <number> }
  ]
}`;
}

function parseForecastResponse(rawText, expensesData) {
    try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        // Fallback: return a basic object if the model diverged from schema
        const totalFixed    = expensesData.fixed_expenses.reduce((s, e) => s + e.amount, 0);
        const totalVariable = expensesData.variable_expenses.reduce((s, e) => s + (e.actual ?? e.budget ?? 0), 0);
        return {
            projected_closing: expensesData.opening_balance - totalFixed - totalVariable,
            savings_rate_pct: 0,
            risk_level: 'medium',
            summary: rawText.substring(0, 200),
            insights: [],
            recommendations: []
        };
    }
}

export const getForecast = async (expensesData) => {
    const cfg = await loadSettings();

    if (cfg.enabled && cfg.api_key && cfg.api_key !== 'YOUR_API_KEY_HERE') {
        // ── Local dev: call Azure AI Foundry / Azure OpenAI directly ──────────
        const url = `${cfg.endpoint}/openai/deployments/${cfg.model}/chat/completions?api-version=${cfg.api_version}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': cfg.api_key
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a precise personal finance AI. Always respond with valid JSON only.' },
                    { role: 'user',   content: buildForecastPrompt(expensesData) }
                ],
                max_tokens: 700,
                temperature: 0.2
            })
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`AI Foundry error: ${err}`);
        }
        const json = await res.json();
        return parseForecastResponse(json.choices[0].message.content, expensesData);
    }

    // ── Production: call FastAPI Container App backend ────────────────────────
    const base = await loadApiBaseUrl();
    const apiUrl = base ? `${base}/ai-forecast` : '/api/ai-forecast';
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensesData)
    });
    if (!res.ok) throw new Error('AI forecast API unavailable');
    return res.json();
};

export const isAIEnabled = async () => {
    const cfg = await loadSettings();
    return cfg.enabled === true && cfg.api_key !== 'YOUR_API_KEY_HERE';
};
