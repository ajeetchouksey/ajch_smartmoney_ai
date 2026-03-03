// DATA_MODE controls which data backend is active.
// 'local' → reads/writes JSON files in src/data/ (for dev/testing with no Azure infra)
// 'azure' → calls real Azure Functions API endpoints (for production)
//
// This can also be toggled at runtime from User Settings → Enable Live Database,
// which persists the user's choice to localStorage and overrides this default.

export const DATA_MODE = localStorage.getItem('smartmoney_data_mode') || 'local';
