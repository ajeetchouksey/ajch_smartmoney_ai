// azureDataService.js
// Reads and writes data by calling Azure Functions HTTP API endpoints.
// Active when DATA_MODE = 'azure' (production / live database mode)
//
// All paths are relative (/api/...) — never hardcode full Azure URLs here.
// The Azure Static Web App runtime will route /api/* to the Azure Functions backend.

const API = '/api';

const _post = async (endpoint, body) => {
    const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`[AzureDataService] ${endpoint} failed: ${err}`);
    }
    return res.json();
};

const _get = async (endpoint) => {
    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`[AzureDataService] ${endpoint} failed: ${err}`);
    }
    return res.json();
};

export const getUser = async () => {
    return _get('get-user');
};

export const getTransactions = async () => {
    return _get('get-transactions');
};

export const saveTransaction = async (tx) => {
    return _post('save-transaction', tx);
};

export const getPortfolio = async () => {
    return _get('get-portfolio');
};

export const getInsights = async () => {
    return _get('get-insights');
};

export const getProfile = async () => {
    return _get('get-profile');
};

export const saveProfile = async (profileData) => {
    return _post('save-profile', profileData);
};

export const getCountries = async () => {
    // Countries/currencies are static reference data — always served locally
    const res = await fetch('/data/countries.json');
    if (!res.ok) throw new Error('Failed to load countries');
    return res.json();
};

export const getExpenses = async () => {
    return _get('get-expenses');
};

export const saveExpenses = async (expensesArray) => {
    return _post('save-expenses', expensesArray);
};
