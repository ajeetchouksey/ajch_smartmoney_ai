// aiCopilot.js
// ─────────────────────────────────────────────────────────────────────────────
// AI brain for the SmartMoney Copilot.
//
// Exports:
//   quickParseEntry(text, entryType, availableCurrencyCodes, primaryCurrency)
//     → Quick-fills a modal form from a plain-text description.
//       Returns { name, amount, currency, category, frequency, due_day?,
//                 budget?, actual?, country_type? } or null on failure.
//
//   parseNaturalLanguageCommand(text, context)
//     → Classifies user intent and extracts structured data for the copilot.
//       Returns { intent, data, reply } or a plain { intent: 'query', reply }
//
// All functions return null / 'query' gracefully if AI is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const FIXED_CATEGORIES    = ['Housing','Utilities','Insurance','Loans','Subscriptions','Transport','Other'];
const VARIABLE_CATEGORIES = ['Food','Transport','Entertainment','Shopping','Healthcare','Travel','Education','Personal Care','Other'];
const INCOME_CATEGORIES   = ['Employment','Freelance','Rental','Investment','Business','Transfer','Gift','Other'];

let _settings = null;

async function loadSettings() {
    if (_settings !== null) return _settings;
    try {
        const mod = await import('./ai_settings.js');
        _settings = mod.AI_SETTINGS || { enabled: false };
    } catch {
        _settings = { enabled: false };
    }
    return _settings;
}

async function callAI(messages, maxTokens = 400) {
    const cfg = await loadSettings();
    if (!cfg.enabled || !cfg.api_key || cfg.api_key === 'YOUR_API_KEY_HERE') {
        return null;
    }
    const url = `${cfg.endpoint}/openai/deployments/${cfg.model}/chat/completions?api-version=${cfg.api_version}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': cfg.api_key
        },
        body: JSON.stringify({ messages, max_tokens: maxTokens, temperature: 0.2 })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
}

function safeParseJson(raw) {
    try {
        return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
        return null;
    }
}

// ─── Currency symbol → code mapping ────────────────────────────────────────
const SYMBOL_MAP = { '£': 'GBP', '€': 'EUR', '¥': 'JPY', '₹': 'INR', '₦': 'NGN', 'AED': 'AED', 'zł': 'PLN' };

function detectCurrencyFromText(text, availableCodes, primaryCurrency) {
    for (const [sym, code] of Object.entries(SYMBOL_MAP)) {
        if (text.includes(sym) && availableCodes.includes(code)) return code;
    }
    // Explicit 3-letter code in text
    const match = text.toUpperCase().match(/\b([A-Z]{3})\b/);
    if (match && availableCodes.includes(match[1])) return match[1];
    return primaryCurrency || availableCodes[0] || 'USD';
}

// ─── Quick-fill a modal form from plain text ─────────────────────────────────
/**
 * @param {string} text                    - e.g. "Netflix £12.99 monthly"
 * @param {'fixed'|'variable'|'income'} entryType
 * @param {string[]} availableCurrencyCodes
 * @param {string}   primaryCurrency
 */
export const quickParseEntry = async (text, entryType, availableCurrencyCodes, primaryCurrency) => {
    const cats = entryType === 'fixed' ? FIXED_CATEGORIES
        : entryType === 'variable' ? VARIABLE_CATEGORIES
        : INCOME_CATEGORIES;

    const freqOptions = entryType === 'income'
        ? ['monthly', 'bi-weekly', 'weekly', 'yearly', 'one-time']
        : ['monthly', 'weekly', 'yearly', 'one-time'];

    const predetectedCurrency = detectCurrencyFromText(text, availableCurrencyCodes, primaryCurrency);

    const prompt = `Parse this financial entry description and respond with JSON only (no markdown).
Description: "${text}"
Entry type: ${entryType}
Available currencies: ${availableCurrencyCodes.join(', ')} (prefer ${predetectedCurrency})
Categories: ${cats.join(', ')}
Frequency options: ${freqOptions.join(', ')}

${entryType === 'fixed' ? `JSON shape:
{"name":"<string>","amount":<number>,"currency":"<code>","category":"<category>","frequency":"<freq>","due_day":<1-31 or null>}` : ''}
${entryType === 'variable' ? `JSON shape:
{"name":"<string>","budget":<number>,"actual":<number or 0>,"currency":"<code>","category":"<category>","frequency":"<freq>"}` : ''}
${entryType === 'income' ? `JSON shape:
{"name":"<string>","amount":<number>,"currency":"<code>","category":"<category>","frequency":"<freq>","country_type":"home"}` : ''}

Rules:
- Detect currency from symbols (£=GBP, €=EUR, $=primaryCurrency) or explicit codes
- Infer the most appropriate category from the description
- Infer frequency: "monthly","every month" → monthly; "weekly" → weekly; yearly/annual → yearly; no mention → monthly for fixed/income, monthly for variable
- Set amount/budget to 0 if not found in text`;

    const raw = await callAI([
        { role: 'system', content: 'You are a precise data extraction AI. Respond with JSON only, no explanation.' },
        { role: 'user', content: prompt }
    ], 200);

    if (!raw) return null;
    const parsed = safeParseJson(raw);
    if (!parsed || !parsed.name) return null;
    // Ensure currency is valid
    if (!availableCurrencyCodes.includes(parsed.currency)) {
        parsed.currency = primaryCurrency || availableCurrencyCodes[0] || 'USD';
    }
    return parsed;
};

// ─── Copilot: parse a full NL command ───────────────────────────────────────
/**
 * context: {
 *   profile: { primary_currency, type, home_country },
 *   availableCurrencies: [{ code, name }],
 *   currentMonth: { month, fixed_expenses, variable_expenses, income_sources, opening_balance, currency },
 *   homeCountryName: string,
 *   residenceCountryName: string|null
 * }
 *
 * Returns:
 *   { intent: 'add_fixed_expense'|'add_variable_expense'|'add_income', data: {...}, reply: string }
 *   { intent: 'query', reply: string }
 *   { intent: 'unknown', reply: string }
 */
export const parseNaturalLanguageCommand = async (text, context) => {
    const { profile, availableCurrencies, currentMonth, homeCountryName, residenceCountryName } = context;
    const curCodes = (availableCurrencies || []).map(c => c.code).join(', ');
    const primaryCur = profile?.primary_currency || 'USD';

    // Build a financial summary for context
    const totalFixed     = (currentMonth?.fixed_expenses || []).reduce((s, e) => s + e.amount, 0);
    const totalVariable  = (currentMonth?.variable_expenses || []).reduce((s, e) => s + (e.actual ?? e.budget ?? 0), 0);
    const totalIncome    = (currentMonth?.income_sources || []).filter(i => (i.currency || primaryCur) === primaryCur).reduce((s, i) => s + i.amount, 0);
    const fixedNames     = (currentMonth?.fixed_expenses || []).map(e => `${e.name} (${e.currency || primaryCur} ${e.amount})`).join(', ') || 'none';
    const variableNames  = (currentMonth?.variable_expenses || []).map(e => `${e.name} (budget ${e.currency || primaryCur} ${e.budget})`).join(', ') || 'none';
    const incomeNames    = (currentMonth?.income_sources || []).map(i => `${i.name} (${i.currency || primaryCur} ${i.amount})`).join(', ') || 'none';

    const systemPrompt = `You are SmartMoney Copilot, an intelligent personal finance assistant. The user wants you to take an action or answer a question.

USER PROFILE:
- Primary currency: ${primaryCur}
- Available currencies: ${curCodes}
- Profile type: ${profile?.type || 'individual'}
- Home country: ${homeCountryName || 'Unknown'}
${residenceCountryName ? `- Residence country: ${residenceCountryName}` : ''}

CURRENT MONTH (${currentMonth?.month || 'this month'}):
- Fixed expenses: ${fixedNames}
- Variable expenses: ${variableNames}
- Income sources: ${incomeNames}
- Total fixed: ${primaryCur} ${totalFixed.toFixed(2)}
- Total variable: ${primaryCur} ${totalVariable.toFixed(2)}
- Total income: ${primaryCur} ${totalIncome.toFixed(2)}

RULES:
1. If the user wants to ADD an expense or income → respond with a JSON action.
2. If the user wants to know something about their finances → respond WITH PLAIN TEXT (no JSON).
3. Currency symbols: £=GBP, €=EUR, $=${primaryCur}, ¥=JPY, ₹=INR, AED=AED.
4. If no currency is specified, use the primary currency (${primaryCur}).
5. Keep replies friendly and concise (1-2 sentences).

For ACTIONS, respond with JSON (no markdown):
{
  "intent": "add_fixed_expense" | "add_variable_expense" | "add_income",
  "reply": "<1-2 sentence confirmation of what you'll add>",
  "data": {
    // add_fixed_expense fields: name, amount (number), currency, category (one of: Housing/Utilities/Insurance/Loans/Subscriptions/Transport/Other), frequency (monthly/weekly/yearly/one-time), due_day (1-31 or null)
    // add_variable_expense fields: name, budget (number), actual (number, default 0), currency, category (one of: Food/Transport/Entertainment/Shopping/Healthcare/Travel/Education/Personal Care/Other), frequency (monthly/weekly/yearly/one-time)
    // add_income fields: name, amount (number), currency, category (one of: Employment/Freelance/Rental/Investment/Business/Transfer/Gift/Other), frequency (monthly/bi-weekly/weekly/yearly/one-time), country_type (home/residence/other)
  }
}

For QUERIES, respond with plain text only — no JSON at all.`;

    const raw = await callAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
    ], 450);

    if (!raw) {
        return { intent: 'query', reply: 'AI is not available right now. Please check your AI settings.' };
    }

    // Try to parse as JSON action
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
        const parsed = safeParseJson(trimmed);
        if (parsed && parsed.intent && parsed.data) {
            // Validate currency
            const validCodes = (availableCurrencies || []).map(c => c.code);
            if (parsed.data.currency && !validCodes.includes(parsed.data.currency)) {
                parsed.data.currency = primaryCur;
            }
            return { intent: parsed.intent, data: parsed.data, reply: parsed.reply || 'Ready to add this entry.' };
        }
    }

    // Plain text answer
    return { intent: 'query', reply: raw };
};
