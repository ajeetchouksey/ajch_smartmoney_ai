// aiOnboarding.js
// ─────────────────────────────────────────────────────────────────────────────
// AI helper functions specific to the onboarding wizard.
//
// All functions are non-blocking: if AI is unavailable or the API call fails,
// they return null and the wizard continues with normal form behaviour.
// ─────────────────────────────────────────────────────────────────────────────

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

async function callAI(userMessage, maxTokens = 150) {
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
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful onboarding assistant for a personal finance app called SmartMoney AI. Be warm, encouraging, and concise. Respond in JSON only when explicitly asked.'
                },
                { role: 'user', content: userMessage }
            ],
            max_tokens: maxTokens,
            temperature: 0.4
        })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
}

/**
 * Given the user's home and residence countries, suggest the best primary currency.
 * Returns { code: string, reason: string } or null if AI is unavailable/fails.
 *
 * @param {string} homeCountryName      - Full name of the user's home country
 * @param {string|null} residenceCountryName - Full name of country of residence (or null if same as home)
 * @param {string[]} availableCurrencyCodes  - Array of currency codes to choose from
 */
export const suggestCurrencyForCountry = async (homeCountryName, residenceCountryName, availableCurrencyCodes) => {
    const location = residenceCountryName && residenceCountryName !== homeCountryName
        ? `living in ${residenceCountryName} (originally from ${homeCountryName})`
        : `from ${homeCountryName}`;

    const prompt = `A user is ${location}. The available currencies are: ${availableCurrencyCodes.join(', ')}.
Which single currency should be their primary currency for day-to-day personal finance tracking? Consider where they live, earn, and spend most.
Respond with JSON only — no markdown, no explanation outside the JSON:
{"code":"<CURRENCY_CODE>","reason":"<one brief sentence why>"}`;

    try {
        const raw = await callAI(prompt, 120);
        if (!raw) return null;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.code && availableCurrencyCodes.includes(parsed.code)) {
            return { code: parsed.code, reason: parsed.reason || '' };
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Generate a personalised 2-sentence welcome message for the user.
 * Returns a plain-text string or null if AI is unavailable/fails.
 *
 * @param {string} firstName         - User's first name
 * @param {'individual'|'family'} profileType
 * @param {string} primaryCurrency   - e.g. "GBP"
 * @param {string} homeCountryName   - e.g. "United Kingdom"
 */
export const generateWelcomeInsight = async (firstName, profileType, primaryCurrency, homeCountryName) => {
    const typeDesc = profileType === 'family'
        ? 'managing family finances together'
        : 'taking control of personal finances';

    const prompt = `Write a warm, personalised 2-sentence welcome for ${firstName}, who is ${typeDesc} in ${homeCountryName} with ${primaryCurrency} as their primary currency. Mention one specific thing SmartMoney AI will help them achieve. Be encouraging and direct. Plain text only — no quotes, no markdown.`;

    try {
        return await callAI(prompt, 130);
    } catch {
        return null;
    }
};

/**
 * Infer profile type from a free-text description.
 * Returns 'individual', 'family', or null if AI is unavailable/inconclusive.
 *
 * @param {string} description - Free-text the user typed
 */
export const inferProfileType = async (description) => {
    const prompt = `Based on this short description about a person's financial situation, decide if they are managing finances for themselves alone (individual) or for a family/household (family).

Description: "${description}"

Respond with JSON only: {"type":"individual"} or {"type":"family"}`;

    try {
        const raw = await callAI(prompt, 30);
        if (!raw) return null;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return (parsed.type === 'individual' || parsed.type === 'family') ? parsed.type : null;
    } catch {
        return null;
    }
};
