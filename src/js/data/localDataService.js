// localDataService.js
// Reads and writes data using local JSON files in src/data/
// Active when DATA_MODE = 'local' (development / offline testing)
//
// Uses fetch() — NOT import — to load JSON files. This is required for
// browser ES Module compatibility. Do NOT change this to import statements.

const BASE = '/data';

export const getUser = async () => {
    const res = await fetch(`${BASE}/user.json`);
    if (!res.ok) throw new Error('Failed to load user data');
    const json = await res.json();
    return json.data;
};

export const getTransactions = async () => {
    const res = await fetch(`${BASE}/transactions.json`);
    if (!res.ok) throw new Error('Failed to load transactions');
    const json = await res.json();
    return json.data;
};

export const saveTransaction = async (tx) => {
    // In local mode: writes are simulated. State is kept in memory only.
    // Persisting to actual JSON files requires a server; use azure mode for that.
    console.warn('[LocalDataService] saveTransaction: persisting to JSON not supported in local mode. Stored in memory only.');
    return { ...tx, id: `txn_local_${Date.now()}`, status: 'pending' };
};

export const getPortfolio = async () => {
    const res = await fetch(`${BASE}/portfolio.json`);
    if (!res.ok) throw new Error('Failed to load portfolio');
    const json = await res.json();
    return json.data;
};

export const getInsights = async () => {
    const res = await fetch(`${BASE}/insights.json`);
    if (!res.ok) throw new Error('Failed to load insights');
    const json = await res.json();
    return json.data;
};

export const getProfile = async () => {
    const res = await fetch(`${BASE}/profile.json`);
    if (!res.ok) throw new Error('Failed to load profile');
    const json = await res.json();
    return json.data;
};

// In local mode, profile is persisted to localStorage under 'smartmoney_profile'.
// This mirrors what the Azure mode would do via the API.
export const saveProfile = async (profileData) => {
    const payload = {
        schema_version: '1.0',
        last_updated: new Date().toISOString(),
        data: profileData
    };
    localStorage.setItem('smartmoney_profile', JSON.stringify(payload));
    return profileData;
};

export const getCountries = async () => {
    const res = await fetch(`${BASE}/countries.json`);
    if (!res.ok) throw new Error('Failed to load countries');
    return res.json(); // returns full object: { countries: [...], currencies: [...] }
};

export const getExpenses = async () => {
    // Check localStorage first (in-session edits override the base JSON)
    const stored = localStorage.getItem('smartmoney_expenses');
    if (stored) {
        try { return JSON.parse(stored).data; } catch { /* fall through */ }
    }
    const res = await fetch(`${BASE}/expenses.json`);
    if (!res.ok) throw new Error('Failed to load expenses');
    const json = await res.json();
    return json.data;
};

export const saveExpenses = async (expensesArray) => {
    const payload = {
        schema_version: '1.0',
        last_updated: new Date().toISOString(),
        data: expensesArray
    };
    localStorage.setItem('smartmoney_expenses', JSON.stringify(payload));
    return expensesArray;
};
