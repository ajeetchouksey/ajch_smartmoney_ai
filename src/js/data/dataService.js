// dataService.js — Factory
// This is the ONLY file the rest of the app should import data functions from.
// It selects the correct implementation based on DATA_MODE.
//
// Usage:
//   import { dataService } from '../data/dataService.js';
//   const user = await dataService.getUser();
//
// To switch to live Azure data: go to Settings → Enable Live Database,
// or change DATA_MODE in config.js to 'azure'.

import { DATA_MODE } from './config.js';
import * as local from './localDataService.js';
import * as azure from './azureDataService.js';

export const dataService = DATA_MODE === 'azure' ? azure : local;

// Expose current mode so UI components can show a "Live / Local" indicator
export const isLiveMode = DATA_MODE === 'azure';

// In local mode, profile may have been saved to localStorage by saveProfile().
// This helper merges localStorage with the base JSON file — localStorage wins.
export const getProfileMerged = async () => {
    const stored = localStorage.getItem('smartmoney_profile');
    if (stored) {
        try { return JSON.parse(stored).data; } catch { /* fall through */ }
    }
    return dataService.getProfile();
};
