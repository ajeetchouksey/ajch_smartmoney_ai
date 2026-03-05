import { renderNavbar, renderKpiCard, renderChartSkeleton, renderChatInterface,
         renderCopilotMessage, renderCopilotActionCard,
         renderProfileWizardShell, renderWizardStep1, renderWizardStep2, renderWizardStep3,
         renderWizardStep4, renderWizardStep5, renderProfilePage, renderAddMemberModal,
         renderExpensesPage, renderExpenseEntryModal, renderIncomeEntryModal,
         renderHoldingCard, renderAllocationChart
       } from './uiux_kit/components.js';
import { dataService, getProfileMerged, isLiveMode } from './data/dataService.js';
import { getForecast, isAIEnabled } from './ai/aiService.js';
import { inferProfileType, suggestCurrencyForCountry, generateWelcomeInsight } from './ai/aiOnboarding.js';
import { quickParseEntry, parseNaturalLanguageCommand } from './ai/aiCopilot.js';

// Application State
const state = {
    activePage: 'dashboard',
    pages: [
        { id: 'dashboard', label: 'Dashboard',   icon: 'fas fa-chart-pie' },
        { id: 'assistant', label: 'AI Assistant', icon: 'fas fa-sparkles' },
        { id: 'expenses',  label: 'Expenses',     icon: 'fas fa-receipt' },
        { id: 'portfolio', label: 'Portfolio',    icon: 'fas fa-layer-group' },
        { id: 'profile',   label: 'Profile',      icon: 'fas fa-circle-user' },
        { id: 'settings',  label: 'Settings',     icon: 'fas fa-cog' }
    ],
    // wizard transient state
    wizard: {
        type: null,
        home_country: null,
        same_country: true,
        residence_country: null,
        primary_currency: null,
        additional_currencies: [],
        member: {},
        local_data_path: '',
        // AI-generated values (promises resolved between steps)
        _aiCurrencySuggestion: null,  // Promise<{code,reason}|null>
        _aiWelcome: null              // Promise<string|null>
    },
    countriesRef: null,
    currenciesRef: null,
    copilot: {
        messages: [],        // { role: 'user'|'copilot'|'system', text: string }
        pendingAction: null  // { intent, data, reply, monthData, records }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    updateDataModeBadge();
    // Pre-load country reference data for the wizard / profile page
    try {
        const ref = await dataService.getCountries();
        state.countriesRef  = ref.countries;
        state.currenciesRef = ref.currencies;
    } catch (e) {
        console.warn('Could not load countries.json', e);
        state.countriesRef  = [];
        state.currenciesRef = [];
    }
    initNavigation();
    // Check if profile setup is needed
    const profile = await getProfileMerged();
    if (!profile.setup_complete) {
        launchProfileWizard();
    } else {
        renderPage(state.activePage);
    }
});

function initNavigation() {
    renderNavbar(state.pages, state.activePage, (selectedItem) => {
        state.activePage = selectedItem.id;
        document.getElementById('page-title').innerText = selectedItem.label;
        initNavigation(); // Re-render navbar to update active state CSS
        renderPage(state.activePage);
    });
}

function renderPage(pageId) {
    const contentArea = document.getElementById('app-content');
    contentArea.innerHTML = ''; // Clear previous

    if (pageId === 'dashboard') {
        contentArea.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${renderKpiCard("Total Balance", "$42,500.00", "+2.5%", "fas fa-wallet")}
                ${renderKpiCard("Monthly Spending", "$3,240.50", "-1.2%", "fas fa-credit-card")}
                ${renderKpiCard("Investment Value", "$128,400.00", "+8.4%", "fas fa-arrow-trend-up")}
                ${renderKpiCard("Credit Score", "782", "+5", "fas fa-shield-halved", "bg-white")}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-base font-semibold text-gray-900">Cash Flow Analytics</h2>
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 bg-gray-50 text-gray-600 text-[13px] font-medium rounded-md hover:bg-gray-100 transition-colors">1W</button>
                            <button class="px-3 py-1 bg-blue-50 text-blue-700 text-[13px] font-medium rounded-md shadow-sm border border-blue-100">1M</button>
                            <button class="px-3 py-1 bg-gray-50 text-gray-600 text-[13px] font-medium rounded-md hover:bg-gray-100 transition-colors">1Y</button>
                        </div>
                    </div>
                    ${renderChartSkeleton()}
                </div>
                
                <div class="bg-[#111827] text-white rounded-xl shadow-lg border border-[#1f2937] p-6 flex flex-col relative overflow-hidden">
                    <!-- Subtle glow effect inside the dark card -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>

                    <div class="flex items-center justify-between mb-6 relative z-10">
                        <h2 class="text-base font-semibold text-white">AI Insights</h2>
                        <div class="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <i class="fas fa-sparkles text-blue-400 text-sm"></i>
                        </div>
                    </div>
                    <ul class="space-y-4 flex-1 relative z-10">
                        <li class="p-4 bg-[#1f2937]/50 rounded-xl border border-[#374151] text-[13px] flex items-start space-x-3 transition-colors hover:bg-[#1f2937]">
                            <div class="mt-0.5 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></div>
                            <span class="leading-relaxed text-gray-300">You are spending <strong class="font-semibold text-white">15% more on dining</strong> this month.</span>
                        </li>
                        <li class="p-4 bg-[#1f2937]/50 rounded-xl border border-[#374151] text-[13px] flex items-start space-x-3 transition-colors hover:bg-[#1f2937]">
                            <div class="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                            <span class="leading-relaxed text-gray-300">Great job! You saved $200 towards your <strong class="font-semibold text-white">"Vacation"</strong> goal this week.</span>
                        </li>
                    </ul>
                    <button class="relative z-10 mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-[13px] flex items-center justify-center shadow-md shadow-blue-500/20">
                        Ask AI for Deep Analysis
                    </button>
                </div>
            </div>
        `;
    }
    else if (pageId === 'assistant') {
        contentArea.innerHTML = renderChatInterface();
        initCopilot(contentArea);
    }
    else if (pageId === 'expenses') {
        renderExpensesPageView();
        return;
    }
    else if (pageId === 'profile') {
        renderProfilePageView();
        return; // async fn handles content injection
    }
    else if (pageId === 'portfolio') {
        renderPortfolioPageView();
        return; // async fn handles content injection
    }
    else if (pageId === 'settings') {
        const currentMode = localStorage.getItem('smartmoney_data_mode') || 'local';
        const isLive = currentMode === 'azure';

        contentArea.innerHTML = `
            <div class="max-w-2xl space-y-6">

                <!-- Data Source -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <i class="fas fa-database text-blue-600 text-sm"></i>
                        </div>
                        <h2 class="text-base font-semibold text-gray-900">Data Source</h2>
                    </div>
                    <p class="text-[13px] text-gray-500 mb-5 ml-11">Controls where SmartMoney AI reads and writes data.</p>

                    <div class="flex items-center justify-between p-4 rounded-xl border ${isLive ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-gray-50/40'}">
                        <div>
                            <p class="text-[14px] font-medium text-gray-900">Live Azure Database</p>
                            <p class="text-[13px] text-gray-500 mt-0.5">${isLive ? 'Connected to Azure Functions API endpoints' : 'Using local mock JSON files'}</p>
                        </div>
                        <button
                            id="data-mode-toggle"
                            data-active="${isLive}"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isLive ? 'bg-emerald-500' : 'bg-gray-300'}"
                            role="switch"
                            aria-checked="${isLive}"
                        >
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isLive ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                    </div>

                    ${isLive
                        ? `<div class="mt-3 flex items-center space-x-2 text-[13px] text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg border border-emerald-100">
                            <i class="fas fa-circle-check text-emerald-500"></i>
                            <span>Live mode active &mdash; real Azure data will be used for all operations.</span>
                           </div>`
                        : `<div class="mt-3 flex items-center space-x-2 text-[13px] text-amber-700 bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-100">
                            <i class="fas fa-flask text-amber-500"></i>
                            <span>Local mode &mdash; using mock JSON data. Safe for development and testing.</span>
                           </div>`
                    }
                </div>

                <!-- Notifications -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div class="flex items-center space-x-3 mb-1">
                        <div class="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <i class="fas fa-bell text-gray-500 text-sm"></i>
                        </div>
                        <h2 class="text-base font-semibold text-gray-900">Notifications</h2>
                    </div>
                    <p class="text-[13px] text-gray-500 mb-5 ml-11">Manage alerts and spending insight delivery.</p>

                    <div class="space-y-1">
                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                                <p class="text-[14px] font-medium text-gray-900">Push Notifications</p>
                                <p class="text-[13px] text-gray-500 mt-0.5">Spending alerts and AI-driven insights</p>
                            </div>
                            <button id="notif-toggle" data-active="true" class="relative inline-flex h-6 w-11 items-center rounded-full bg-[#111827] transition-colors duration-200 focus:outline-none" role="switch" aria-checked="true">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 translate-x-6"></span>
                            </button>
                        </div>
                        <div class="flex items-center justify-between py-3">
                            <div>
                                <p class="text-[14px] font-medium text-gray-900">Weekly Summary Email</p>
                                <p class="text-[13px] text-gray-500 mt-0.5">Digest of your spending &amp; portfolio activity</p>
                            </div>
                            <button id="email-toggle" data-active="false" class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors duration-200 focus:outline-none" role="switch" aria-checked="false">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 translate-x-1"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Account -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div class="flex items-center space-x-3 mb-5">
                        <div class="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <i class="fas fa-user text-gray-500 text-sm"></i>
                        </div>
                        <h2 class="text-base font-semibold text-gray-900">Account</h2>
                    </div>
                    <div class="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div class="h-12 w-12 rounded-full bg-[#111827] flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-semibold text-base">AJ</span>
                        </div>
                        <div>
                            <p class="text-[14px] font-semibold text-gray-900">Ajeet Chouksey</p>
                            <p class="text-[13px] text-gray-500">ajeet@smartmoneyai.dev</p>
                            <span class="inline-block mt-1.5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-blue-100 text-blue-700">Pro Plan</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                        <button class="flex-1 py-2 text-[13px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">Edit Profile</button>
                        <button class="py-2 px-4 text-[13px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors">Disconnect</button>
                    </div>
                </div>

            </div>
        `;
        initSettingsEvents();
    }
    else {
        // Fallback for pages under construction (e.g. Portfolio)
        contentArea.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                <i class="fas fa-tools text-6xl mb-6 text-gray-300"></i>
                <h2 class="text-2xl font-bold text-gray-600 mb-2">${state.pages.find(p => p.id === pageId).label}</h2>
                <p>This module is under construction.</p>
            </div>
        `;
    }
}

function initSettingsEvents() {
    // DATA_MODE toggle — persists to localStorage and reloads to reinitialize data service factory
    const dataModeToggle = document.getElementById('data-mode-toggle');
    if (dataModeToggle) {
        dataModeToggle.addEventListener('click', () => {
            const current = localStorage.getItem('smartmoney_data_mode') || 'local';
            localStorage.setItem('smartmoney_data_mode', current === 'azure' ? 'local' : 'azure');
            window.location.reload();
        });
    }

    // Notification toggles — UI-only (no persistence in local mode)
    ['notif-toggle', 'email-toggle'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', () => {
            const next = btn.dataset.active !== 'true';
            btn.dataset.active = String(next);
            btn.setAttribute('aria-checked', String(next));
            btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${next ? 'bg-[#111827]' : 'bg-gray-300'}`;
            const knob = btn.querySelector('span');
            knob.className = `inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${next ? 'translate-x-6' : 'translate-x-1'}`;
        });
    });
}

// ---------------------------------------------------------------------------
// Monthly Expenses page controller
// ---------------------------------------------------------------------------

// In-memory working copy of all expense records for this session
let _expensesCache = null;

async function getOrLoadExpenses() {
    if (_expensesCache) return _expensesCache;
    _expensesCache = await dataService.getExpenses();
    return _expensesCache;
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getOrCreateMonthRecord(records, month, currency) {
    let rec = records.find(r => r.month === month);
    if (!rec) {
        rec = {
            id: `exp_${month.replace('-', '_')}`,
            month,
            opening_balance: 0,
            currency: currency || 'USD',
            income_sources: [],
            fixed_expenses: [],
            variable_expenses: [],
            ai_forecast: null
        };
        records.push(rec);
    }
    return rec;
}

async function renderExpensesPageView(month) {
    const contentArea = document.getElementById('app-content');
    contentArea.innerHTML = '<div class="flex items-center justify-center py-20"><i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i></div>';

    const targetMonth = month || getCurrentMonth();
    let records, aiOn, profile;
    try {
        [records, aiOn, profile] = await Promise.all([
            getOrLoadExpenses(),
            isAIEnabled(),
            getProfileMerged()
        ]);
    } catch (e) {
        contentArea.innerHTML = `<p class="text-rose-500 p-8">Failed to load expenses: ${e.message}</p>`;
        return;
    }

    const currency = profile.primary_currency || 'USD';
    const monthData = getOrCreateMonthRecord(records, targetMonth, currency);

    // Derive available currencies from profile + countries reference
    const countryCodes = [profile.home_country, profile.residence_country].filter(Boolean);
    const countriesData = state.countriesRef || {};
    const allCountries = countriesData.countries || [];
    const allCurrencies = countriesData.currencies || [];
    // Collect currency codes used by home/residence countries
    const profileCurrencyCodes = new Set([currency]);
    (profile.additional_currencies || []).forEach(c => profileCurrencyCodes.add(c));
    allCountries.filter(c => countryCodes.includes(c.code))
        .forEach(c => (c.currencies || []).forEach(cur => profileCurrencyCodes.add(cur)));
    const availableCurrencies = allCurrencies.filter(c => profileCurrencyCodes.has(c.code));
    // Ensure at least the primary currency is listed
    if (!availableCurrencies.find(c => c.code === currency)) {
        availableCurrencies.unshift({ code: currency, name: currency, symbol: currency });
    }

    // Resolve home/residence country objects with flag+name
    const homeCountry       = allCountries.find(c => c.code === profile.home_country) || null;
    const residenceCountry  = allCountries.find(c => c.code === profile.residence_country) || null;

    contentArea.innerHTML = renderExpensesPage(monthData, aiOn, availableCurrencies, homeCountry, residenceCountry);
    bindExpenseEvents(monthData, records, currency, availableCurrencies, homeCountry, residenceCountry);
}

function bindExpenseEvents(monthData, records, currency, availableCurrencies, homeCountry, residenceCountry) {
    // Month / opening balance save
    document.getElementById('exp-save-header')?.addEventListener('click', async () => {
        const newMonth   = document.getElementById('exp-month').value;
        const newBalance = parseFloat(document.getElementById('exp-opening').value) || 0;
        if (newMonth !== monthData.month) {
            _expensesCache = null;
            await renderExpensesPageView(newMonth);
            return;
        }
        monthData.opening_balance = newBalance;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        await renderExpensesPageView(monthData.month);
    });

    // Currency chip switcher
    document.getElementById('currency-chips')?.addEventListener('click', async (e) => {
        const chip = e.target.closest('.currency-chip');
        if (!chip) return;
        monthData.currency = chip.dataset.currency;
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        await renderExpensesPageView(monthData.month);
    });

    // Add income
    document.getElementById('add-income-btn')?.addEventListener('click', () =>
        showIncomeModal(monthData, records, availableCurrencies, homeCountry, residenceCountry, currency));

    // Add fixed / variable expense
    document.getElementById('add-fixed-btn')?.addEventListener('click', () =>
        showExpenseModal('fixed', monthData, records, currency, availableCurrencies));
    document.getElementById('add-variable-btn')?.addEventListener('click', () =>
        showExpenseModal('variable', monthData, records, currency, availableCurrencies));

    // Delete income (event delegation)
    document.getElementById('income-list')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-income-btn');
        if (!btn) return;
        monthData.income_sources = (monthData.income_sources || []).filter(x => x.id !== btn.dataset.id);
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        await renderExpensesPageView(monthData.month);
    });

    // Delete fixed / variable (event delegation)
    document.getElementById('fixed-list')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-exp-btn');
        if (!btn) return;
        monthData.fixed_expenses = monthData.fixed_expenses.filter(x => x.id !== btn.dataset.id);
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        await renderExpensesPageView(monthData.month);
    });
    document.getElementById('variable-list')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-exp-btn');
        if (!btn) return;
        monthData.variable_expenses = monthData.variable_expenses.filter(x => x.id !== btn.dataset.id);
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        await renderExpensesPageView(monthData.month);
    });

    // AI Forecast
    document.getElementById('run-forecast-btn')?.addEventListener('click', async () => {
        const btn  = document.getElementById('run-forecast-btn');
        const body = document.getElementById('ai-forecast-body');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i><span>Analysing…</span>';
        body.innerHTML = '<div class="flex items-center justify-center py-10"><i class="fas fa-spinner fa-spin text-gray-400 text-xl"></i></div>';
        try {
            const forecast = await getForecast({
                month: monthData.month,
                opening_balance: monthData.opening_balance,
                currency: monthData.currency || currency,
                income_sources: monthData.income_sources || [],
                fixed_expenses: monthData.fixed_expenses,
                variable_expenses: monthData.variable_expenses
            });
            monthData.ai_forecast = forecast;
            await dataService.saveExpenses(records);
            _expensesCache = records;
            await renderExpensesPageView(monthData.month);
        } catch (err) {
            body.innerHTML = `<div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px]"><i class="fas fa-circle-exclamation mr-2"></i>${err.message}</div>`;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-bolt text-xs"></i><span>Retry</span>';
        }
    });
}

function showExpenseModal(type, monthData, records, currency, availableCurrencies) {
    const displayCur = monthData.currency || currency;
    document.body.insertAdjacentHTML('beforeend', renderExpenseEntryModal(type, availableCurrencies, displayCur));
    const close = () => document.getElementById('exp-modal')?.remove();
    document.getElementById('close-exp-modal')?.addEventListener('click', close);
    document.getElementById('cancel-exp')?.addEventListener('click', close);

    // ── Smart Fill handler ────────────────────────────────────────────────────
    document.getElementById('exp-smart-btn')?.addEventListener('click', async () => {
        const text = document.getElementById('exp-smart-input')?.value.trim();
        const statusEl = document.getElementById('exp-smart-status');
        if (!text) return;
        const btn = document.getElementById('exp-smart-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-[10px]"></i><span>Filling…</span>';
        const curCodes = availableCurrencies.map(c => c.code);
        const parsed = await quickParseEntry(text, type, curCodes, displayCur);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles text-[10px]"></i><span>Fill</span>';
        if (parsed) {
            if (parsed.name)     document.getElementById('exp-name').value = parsed.name;
            if (parsed.category) document.getElementById('exp-category').value = parsed.category;
            if (parsed.currency) document.getElementById('exp-currency').value = parsed.currency;
            if (parsed.frequency) document.getElementById('exp-frequency').value = parsed.frequency;
            if (type === 'fixed') {
                if (parsed.amount != null) document.getElementById('exp-amount').value = parsed.amount;
                if (parsed.due_day)        document.getElementById('exp-due').value = parsed.due_day;
            } else {
                if (parsed.budget != null) document.getElementById('exp-budget').value = parsed.budget;
                if (parsed.actual != null) document.getElementById('exp-actual').value = parsed.actual;
            }
            if (statusEl) {
                statusEl.textContent = '✓ Fields filled — review and adjust if needed.';
                statusEl.classList.remove('hidden', 'text-rose-600');
                statusEl.classList.add('text-blue-600');
            }
        } else {
            if (statusEl) {
                statusEl.textContent = 'Could not parse — please fill manually.';
                statusEl.classList.remove('hidden', 'text-blue-600');
                statusEl.classList.add('text-rose-600');
            }
        }
    });

    document.getElementById('save-exp')?.addEventListener('click', async () => {
        const name = document.getElementById('exp-name')?.value.trim();
        if (!name) { alert('Please enter a name.'); return; }
        const cat  = document.getElementById('exp-category')?.value;
        const cur  = document.getElementById('exp-currency')?.value || displayCur;
        const freq = document.getElementById('exp-frequency')?.value || 'monthly';
        if (type === 'fixed') {
            const amount = parseFloat(document.getElementById('exp-amount')?.value) || 0;
            const due    = parseInt(document.getElementById('exp-due')?.value)    || null;
            monthData.fixed_expenses.push({ id: `fx_${Date.now()}`, name, amount, currency: cur, category: cat, due_day: due, frequency: freq });
        } else {
            const budget = parseFloat(document.getElementById('exp-budget')?.value) || 0;
            const actual = parseFloat(document.getElementById('exp-actual')?.value) || 0;
            monthData.variable_expenses.push({ id: `vx_${Date.now()}`, name, budget, actual, currency: cur, category: cat, frequency: freq });
        }
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        close();
        await renderExpensesPageView(monthData.month);
    });
}

function showIncomeModal(monthData, records, availableCurrencies, homeCountry, residenceCountry, currency) {
    const displayCur = monthData.currency || currency;
    document.body.insertAdjacentHTML('beforeend', renderIncomeEntryModal(availableCurrencies, homeCountry, residenceCountry, displayCur));
    const close = () => document.getElementById('income-modal')?.remove();
    document.getElementById('close-income-modal')?.addEventListener('click', close);
    document.getElementById('cancel-income')?.addEventListener('click', close);

    // ── Smart Fill handler ────────────────────────────────────────────────────
    document.getElementById('inc-smart-btn')?.addEventListener('click', async () => {
        const text = document.getElementById('inc-smart-input')?.value.trim();
        const statusEl = document.getElementById('inc-smart-status');
        if (!text) return;
        const btn = document.getElementById('inc-smart-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-[10px]"></i><span>Filling…</span>';
        const curCodes = availableCurrencies.map(c => c.code);
        const parsed = await quickParseEntry(text, 'income', curCodes, displayCur);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles text-[10px]"></i><span>Fill</span>';
        if (parsed) {
            if (parsed.name)         document.getElementById('inc-name').value = parsed.name;
            if (parsed.category)     document.getElementById('inc-category').value = parsed.category;
            if (parsed.currency)     document.getElementById('inc-currency').value = parsed.currency;
            if (parsed.amount != null) document.getElementById('inc-amount').value = parsed.amount;
            if (parsed.frequency)    document.getElementById('inc-frequency').value = parsed.frequency;
            if (parsed.country_type) document.getElementById('inc-country-type').value = parsed.country_type;
            if (statusEl) {
                statusEl.textContent = '✓ Fields filled — review and adjust if needed.';
                statusEl.classList.remove('hidden', 'text-rose-600');
                statusEl.classList.add('text-emerald-600');
            }
        } else {
            if (statusEl) {
                statusEl.textContent = 'Could not parse — please fill manually.';
                statusEl.classList.remove('hidden', 'text-emerald-600');
                statusEl.classList.add('text-rose-600');
            }
        }
    });

    document.getElementById('save-income')?.addEventListener('click', async () => {
        const name = document.getElementById('inc-name')?.value.trim();
        if (!name) { alert('Please enter a name.'); return; }
        const cat          = document.getElementById('inc-category')?.value;
        const cur          = document.getElementById('inc-currency')?.value || displayCur;
        const amount       = parseFloat(document.getElementById('inc-amount')?.value) || 0;
        const country_type = document.getElementById('inc-country-type')?.value || 'home';
        const freq         = document.getElementById('inc-frequency')?.value || 'monthly';
        if (!monthData.income_sources) monthData.income_sources = [];
        monthData.income_sources.push({ id: `inc_${Date.now()}`, name, amount, currency: cur, category: cat, country_type, frequency: freq });
        monthData.ai_forecast = null;
        await dataService.saveExpenses(records);
        _expensesCache = records;
        close();
        await renderExpensesPageView(monthData.month);
    });
}

// ---------------------------------------------------------------------------
// SmartMoney Copilot controller
// ---------------------------------------------------------------------------
function _copilotScrollToBottom() {
    const msgs = document.getElementById('copilot-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function _copilotAppend(html) {
    const msgs = document.getElementById('copilot-messages');
    if (!msgs) return;
    msgs.insertAdjacentHTML('beforeend', html);
    _copilotScrollToBottom();
}

function _copilotRemoveLoading() {
    document.getElementById('copilot-loading')?.remove();
}

function _copilotShowLoading() {
    _copilotAppend(`
        <div id="copilot-loading" class="flex items-start space-x-2 mt-4">
            <div class="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-wand-magic-sparkles text-blue-400 text-[10px]"></i>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                <span class="inline-flex space-x-1">
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
                </span>
            </div>
        </div>`);
}

function initCopilot() {
    // Reset in-memory state when page (re)loads
    state.copilot.messages = [];
    state.copilot.pendingAction = null;

    const form  = document.getElementById('copilot-form');
    const input = document.getElementById('copilot-input');
    const send  = document.getElementById('copilot-send');

    async function handleSend(text) {
        if (!text.trim()) return;
        input.value = '';
        send.disabled = true;

        // Append user bubble
        _copilotAppend(renderCopilotMessage('user', text));
        state.copilot.messages.push({ role: 'user', text });
        _copilotShowLoading();

        try {
            // Load context lazily
            const [records, profile] = await Promise.all([
                getOrLoadExpenses(),
                getProfileMerged()
            ]);
            const month = getCurrentMonth();
            const pri   = profile.primary_currency || 'USD';
            const monthData = getOrCreateMonthRecord(records, month, pri);

            const allCountries = (state.countriesRef || {}).countries || [];
            const homeCountry      = allCountries.find(c => c.code === profile.home_country) || null;
            const residenceCountry = allCountries.find(c => c.code === profile.residence_country) || null;
            const allCurrencies    = (state.countriesRef || {}).currencies || [];
            const codes = new Set([pri, ...(profile.additional_currencies || [])]);
            [homeCountry, residenceCountry].filter(Boolean)
                .forEach(c => (c.currencies || []).forEach(x => codes.add(x)));
            const availableCurrencies = allCurrencies.filter(c => codes.has(c.code));
            if (!availableCurrencies.find(c => c.code === pri)) {
                availableCurrencies.unshift({ code: pri, name: pri, symbol: pri });
            }

            const result = await parseNaturalLanguageCommand(text, {
                profile,
                availableCurrencies,
                currentMonth: monthData,
                homeCountryName:      homeCountry?.name      || profile.home_country,
                residenceCountryName: residenceCountry?.name || null
            });

            _copilotRemoveLoading();

            if (result.intent && result.intent !== 'query' && result.intent !== 'unknown' && result.data) {
                // Action intent — show reply + confirmation card
                _copilotAppend(renderCopilotMessage('copilot', result.reply));
                _copilotAppend(renderCopilotActionCard(result));
                state.copilot.pendingAction = { ...result, monthData, records };

                // Bind confirm / cancel
                document.getElementById('copilot-confirm')?.addEventListener('click', async () => {
                    const pa = state.copilot.pendingAction;
                    if (!pa) return;
                    document.getElementById('copilot-action-card')?.remove();
                    try {
                        const entry = pa.data;
                        const id    = `copi_${Date.now()}`;
                        const freq  = entry.frequency || 'monthly';
                        if (pa.intent === 'add_fixed_expense') {
                            pa.monthData.fixed_expenses.push({
                                id, name: entry.name, amount: entry.amount || 0,
                                currency: entry.currency, category: entry.category,
                                due_day: entry.due_day || null, frequency: freq
                            });
                        } else if (pa.intent === 'add_variable_expense') {
                            pa.monthData.variable_expenses.push({
                                id, name: entry.name, budget: entry.budget || 0,
                                actual: entry.actual || 0, currency: entry.currency,
                                category: entry.category, frequency: freq
                            });
                        } else if (pa.intent === 'add_income') {
                            if (!pa.monthData.income_sources) pa.monthData.income_sources = [];
                            pa.monthData.income_sources.push({
                                id, name: entry.name, amount: entry.amount || 0,
                                currency: entry.currency, category: entry.category,
                                country_type: entry.country_type || 'home', frequency: freq
                            });
                        }
                        pa.monthData.ai_forecast = null;
                        await dataService.saveExpenses(pa.records);
                        _expensesCache = pa.records;
                        state.copilot.pendingAction = null;
                        _copilotAppend(renderCopilotMessage('system', '✓ Entry saved successfully.'));
                    } catch (err) {
                        _copilotAppend(renderCopilotMessage('system', `⚠ Could not save: ${err.message}`));
                    }
                });

                document.getElementById('copilot-cancel')?.addEventListener('click', () => {
                    document.getElementById('copilot-action-card')?.remove();
                    state.copilot.pendingAction = null;
                    _copilotAppend(renderCopilotMessage('system', 'Cancelled.'));
                });
            } else {
                // Query / unknown — show text reply
                _copilotAppend(renderCopilotMessage('copilot', result.reply));
            }
            state.copilot.messages.push({ role: 'copilot', text: result.reply });
        } catch (err) {
            _copilotRemoveLoading();
            _copilotAppend(renderCopilotMessage('system', `⚠ Error: ${err.message}`));
        } finally {
            send.disabled = false;
            input.focus();
        }
    }

    // Form submit
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSend(input?.value?.trim() || '');
    });

    // Suggestion chips
    document.getElementById('copilot-chips')?.addEventListener('click', (e) => {
        const chip = e.target.closest('.copilot-chip');
        if (chip) handleSend(chip.dataset.text || chip.textContent.trim());
    });
}

function updateDataModeBadge() {
    const badge = document.getElementById('data-mode-badge');
    const isLive = (localStorage.getItem('smartmoney_data_mode') || 'local') === 'azure';
    badge.innerHTML = isLive
        ? `<span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
               <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span>Live</span>
           </span>`
        : `<span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
               <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
               <span>Local</span>
           </span>`;
}

// ---------------------------------------------------------------------------
// Profile page renderer
// ---------------------------------------------------------------------------
async function renderProfilePageView() {
    const contentArea = document.getElementById('app-content');
    contentArea.innerHTML = '<div class="flex items-center justify-center py-20"><i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i></div>';

    let profile, countries;
    try {
        [profile, { countries }] = await Promise.all([
            getProfileMerged(),
            dataService.getCountries()
        ]);
    } catch (e) {
        contentArea.innerHTML = `<p class="text-rose-500 p-8">Failed to load profile: ${e.message}</p>`;
        return;
    }

    contentArea.innerHTML = renderProfilePage(profile, countries);

    // Edit button launches wizard (re-run)
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => launchProfileWizard());

    // Add member button
    const addBtn = document.getElementById('add-member-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAddMemberModal(profile));
    }
}

function showAddMemberModal(profile) {
    document.body.insertAdjacentHTML('beforeend', renderAddMemberModal());
    document.getElementById('close-member-modal')?.addEventListener('click', () => {
        document.getElementById('add-member-modal')?.remove();
    });
    document.getElementById('cancel-member')?.addEventListener('click', () => {
        document.getElementById('add-member-modal')?.remove();
    });
    document.getElementById('save-member')?.addEventListener('click', async () => {
        const first = document.getElementById('new-first').value.trim();
        const last  = document.getElementById('new-last').value.trim();
        if (!first || !last) { alert('Please enter first and last name.'); return; }
        const newMember = {
            id: `m_${Date.now()}`,
            first_name: first,
            last_name: last,
            email: document.getElementById('new-email').value.trim(),
            role: document.getElementById('new-role').value
        };
        profile.members.push(newMember);
        await dataService.saveProfile(profile);
        document.getElementById('add-member-modal')?.remove();
        renderProfilePageView();
    });
}

// ---------------------------------------------------------------------------
// Portfolio page renderer (Task #14, #15, #16)
// ---------------------------------------------------------------------------
async function renderPortfolioPageView() {
    const contentArea = document.getElementById('app-content');
    contentArea.innerHTML = '<div class="flex items-center justify-center py-20"><i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i></div>';

    let portfolio;
    try {
        portfolio = await dataService.getPortfolio();
    } catch (e) {
        contentArea.innerHTML = `<p class="text-rose-500 p-8">Failed to load portfolio: ${e.message}</p>`;
        return;
    }

    const holdings = portfolio?.holdings || [];
    const totalValue = portfolio?.total_value || 0;
    const dayChange = portfolio?.day_change || 0;
    const dayChangePct = portfolio?.day_change_pct || 0;

    // Build the page HTML
    const HTML = `
        <div class="space-y-6 max-w-6xl">
            <!-- Header: Summary KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                ${renderKpiCard("Portfolio Value", `$${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`, dayChangePct >= 0 ? `+${dayChangePct.toFixed(2)}%` : `${dayChangePct.toFixed(2)}%`, "fas fa-briefcase", "bg-white")}
                ${renderKpiCard("Holdings Count", holdings.length.toString(), "+0%", "fas fa-list", "bg-white")}
                ${renderKpiCard("Day Change", `$${Math.abs(dayChange).toFixed(2)}`, dayChange >= 0 ? `+${dayChange.toFixed(2)}` : `${dayChange.toFixed(2)}`, "fas fa-chart-line", "bg-white")}
            </div>

            <!-- Two-column layout: Holdings + Allocation -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left: Holdings cards -->
                <div class="lg:col-span-2">
                    <h2 class="text-[18px] font-bold text-gray-900 mb-4">Holdings</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${holdings.map(h => renderHoldingCard(h)).join('')}
                    </div>
                </div>

                <!-- Right: Allocation chart -->
                <div>
                    <h2 class="text-[18px] font-bold text-gray-900 mb-4">Allocation</h2>
                    ${renderAllocationChart(holdings)}
                </div>
            </div>
        </div>
    `;

    contentArea.innerHTML = HTML;
}

// ---------------------------------------------------------------------------
// Profile Setup Wizard controller
// ---------------------------------------------------------------------------
function launchProfileWizard() {
    document.body.insertAdjacentHTML('beforeend', renderProfileWizardShell());
    goToWizardStep(1);
}

function setWizardProgress(step) {
    const bar = document.getElementById('wizard-progress');
    if (bar) bar.style.width = `${(step / 5) * 100}%`;
}

function goToWizardStep(step) {
    const body = document.getElementById('wizard-body');
    if (!body) return;
    setWizardProgress(step);

    if (step === 1) {
        body.innerHTML = renderWizardStep1();
        const nextBtn = document.getElementById('wizard-next-1');

        // Card-based selection
        body.querySelectorAll('.profile-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                body.querySelectorAll('.profile-type-btn').forEach(b => {
                    b.classList.remove('border-blue-500', 'bg-blue-50');
                    b.classList.add('border-gray-200');
                });
                btn.classList.add('border-blue-500', 'bg-blue-50');
                btn.classList.remove('border-gray-200');
                state.wizard.type = btn.dataset.type;
                nextBtn.disabled = false;
            });
        });

        // AI inference helper
        document.getElementById('ai-infer-type')?.addEventListener('click', async () => {
            const input = document.getElementById('ai-type-input');
            const result = document.getElementById('ai-type-result');
            const text = input?.value?.trim();
            if (!text) return;
            const btn = document.getElementById('ai-infer-type');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Analysing…</span>';
            const inferred = await inferProfileType(text);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i><span>Analyse with AI</span>';
            if (inferred) {
                // Auto-select the inferred type
                state.wizard.type = inferred;
                body.querySelectorAll('.profile-type-btn').forEach(b => {
                    b.classList.remove('border-blue-500', 'bg-blue-50');
                    b.classList.add('border-gray-200');
                });
                const match = body.querySelector(`.profile-type-btn[data-type="${inferred}"]`);
                if (match) {
                    match.classList.add('border-blue-500', 'bg-blue-50');
                    match.classList.remove('border-gray-200');
                }
                nextBtn.disabled = false;
                if (result) {
                    result.textContent = `✓ AI detected: ${inferred.charAt(0).toUpperCase() + inferred.slice(1)}`;
                    result.classList.remove('hidden', 'text-red-500');
                    result.classList.add('text-blue-600');
                }
            } else {
                if (result) {
                    result.textContent = 'Could not determine — please select manually above.';
                    result.classList.remove('hidden', 'text-blue-600');
                    result.classList.add('text-red-500');
                }
            }
        });

        nextBtn.addEventListener('click', () => goToWizardStep(2));
    }

    else if (step === 2) {
        body.innerHTML = renderWizardStep2(state.countriesRef || []);
        const homeSelect = document.getElementById('home-country');
        const sameChk    = document.getElementById('same-country');
        const resRow     = document.getElementById('residence-row');
        const nextBtn    = document.getElementById('wizard-next-2');

        function checkStep2Valid() {
            const homeOk = !!homeSelect.value;
            const resOk  = sameChk.checked || !!document.getElementById('residence-country')?.value;
            nextBtn.disabled = !(homeOk && resOk);
        }

        homeSelect.addEventListener('change', () => {
            state.wizard.home_country = homeSelect.value;
            checkStep2Valid();
        });
        sameChk.addEventListener('change', () => {
            state.wizard.same_country = sameChk.checked;
            resRow.classList.toggle('hidden', sameChk.checked);
            checkStep2Valid();
        });
        resRow.addEventListener('change', (e) => {
            state.wizard.residence_country = e.target.value;
            checkStep2Valid();
        });

        document.getElementById('wizard-back-2').addEventListener('click', () => goToWizardStep(1));
        nextBtn.addEventListener('click', () => {
            state.wizard.home_country = homeSelect.value;
            state.wizard.same_country = sameChk.checked;
            if (!sameChk.checked) {
                state.wizard.residence_country = document.getElementById('residence-country')?.value;
            }

            // Fire AI currency suggestion in the background while user transitions
            const countries = state.countriesRef || [];
            const home = countries.find(c => c.code === state.wizard.home_country);
            const res  = !state.wizard.same_country && state.wizard.residence_country
                ? countries.find(c => c.code === state.wizard.residence_country)
                : null;
            const allCurrencies = state.currenciesRef || [];
            const relevantCodes = new Set();
            if (home) home.currencies.forEach(c => relevantCodes.add(c));
            if (res)  res.currencies.forEach(c => relevantCodes.add(c));
            ['USD','EUR','GBP','AED','SGD','AUD','CAD','CHF'].forEach(c => relevantCodes.add(c));
            const available = allCurrencies.filter(c => relevantCodes.has(c.code));
            state.wizard._aiCurrencySuggestion = suggestCurrencyForCountry(
                home?.name || state.wizard.home_country,
                res?.name || null,
                available.map(c => c.code)
            );

            goToWizardStep(3);
        });
    }

    else if (step === 3) {
        // Derive available currencies from home + residence countries
        const relevantCodes = new Set();
        const countries = state.countriesRef || [];
        const home = countries.find(c => c.code === state.wizard.home_country);
        if (home) home.currencies.forEach(c => relevantCodes.add(c));
        if (!state.wizard.same_country) {
            const res = countries.find(c => c.code === (state.wizard.residence_country || state.wizard.home_country));
            if (res) res.currencies.forEach(c => relevantCodes.add(c));
        }
        // Always offer a set of common majors too
        ['USD','EUR','GBP','AED','SGD','AUD','CAD','CHF'].forEach(c => relevantCodes.add(c));
        const allCurrencies = state.currenciesRef || [];
        const available = allCurrencies.filter(c => relevantCodes.has(c.code));

        // Render step immediately (with loading pill while AI resolves)
        body.innerHTML = renderWizardStep3(available, null);
        const primarySel = document.getElementById('primary-currency');
        const nextBtn    = document.getElementById('wizard-next-3');

        primarySel.addEventListener('change', () => {
            state.wizard.primary_currency = primarySel.value;
            nextBtn.disabled = !primarySel.value;
        });

        document.getElementById('wizard-back-3').addEventListener('click', () => goToWizardStep(2));
        nextBtn.addEventListener('click', () => {
            state.wizard.primary_currency = primarySel.value;
            state.wizard.additional_currencies = [...document.querySelectorAll('#extra-currencies input:checked')]
                .map(el => el.value)
                .filter(v => v !== state.wizard.primary_currency);
            goToWizardStep(4);
        });

        // Resolve AI currency suggestion and update UI
        if (state.wizard._aiCurrencySuggestion) {
            state.wizard._aiCurrencySuggestion.then(suggestion => {
                const loadingPill = document.getElementById('ai-currency-loading');
                if (!loadingPill) return; // user already moved on
                if (suggestion) {
                    // Replace loading pill with recommendation card
                    loadingPill.outerHTML = `
                        <div class="flex items-start space-x-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <i class="fas fa-wand-magic-sparkles text-blue-500 mt-0.5 text-sm"></i>
                            <div>
                                <p class="text-[12px] font-semibold text-blue-700">AI Recommended: <span class="font-bold">${suggestion.code}</span></p>
                                <p class="text-[11px] text-blue-600 mt-0.5 leading-relaxed">${suggestion.reason}</p>
                            </div>
                        </div>`;
                    // Pre-select the suggested currency
                    if (primarySel) {
                        primarySel.value = suggestion.code;
                        state.wizard.primary_currency = suggestion.code;
                        nextBtn.disabled = false;
                    }
                } else {
                    // Remove loading pill quietly — user picks manually
                    loadingPill.remove();
                }
            }).catch(() => {
                document.getElementById('ai-currency-loading')?.remove();
            });
        } else {
            document.getElementById('ai-currency-loading')?.remove();
        }
    }

    else if (step === 4) {
        body.innerHTML = renderWizardStep4(state.wizard.type);
        document.getElementById('wizard-back-4').addEventListener('click', () => goToWizardStep(3));
        document.getElementById('wizard-next-4').addEventListener('click', () => {
            const first = document.getElementById('member-first').value.trim();
            const last  = document.getElementById('member-last').value.trim();
            if (!first || !last) { alert('Please enter your first and last name.'); return; }
            state.wizard.member = {
                id: `m_${Date.now()}`,
                first_name: first,
                last_name: last,
                email: document.getElementById('member-email').value.trim(),
                role: document.getElementById('member-role').value
            };

            // Fire AI welcome generation in the background while user transitions to step 5
            const countries = state.countriesRef || [];
            const home = countries.find(c => c.code === state.wizard.home_country);
            state.wizard._aiWelcome = generateWelcomeInsight(
                first,
                state.wizard.type,
                state.wizard.primary_currency,
                home?.name || state.wizard.home_country
            );

            goToWizardStep(5);
        });
    }

    else if (step === 5) {
        body.innerHTML = renderWizardStep5(!isLiveMode, null);
        // Populate summary
        const countries = state.countriesRef || [];
        const home = countries.find(c => c.code === state.wizard.home_country);
        const res  = countries.find(c => c.code === state.wizard.residence_country);
        const summary = document.getElementById('wizard-summary');
        if (summary) {
            const rows = [
                ['Type',          state.wizard.type === 'family' ? '👨‍👩‍👧 Family' : '👤 Individual'],
                ['Home Country',  home ? `${home.flag} ${home.name}` : state.wizard.home_country],
                ['Residence',     state.wizard.same_country ? 'Same as home' : (res ? `${res.flag} ${res.name}` : state.wizard.residence_country)],
                ['Primary',       state.wizard.primary_currency],
                ['Extra',         state.wizard.additional_currencies.join(', ') || 'None'],
                ['Name',          `${state.wizard.member.first_name} ${state.wizard.member.last_name}`]
            ];
            summary.innerHTML = rows.map(([k, v]) =>
                `<div class="flex justify-between"><span class="text-gray-500">${k}</span><span class="font-semibold text-gray-800 ml-4 text-right">${v}</span></div>`
            ).join('');
        }

        // Resolve AI welcome and inject it when ready
        if (state.wizard._aiWelcome) {
            state.wizard._aiWelcome.then(msg => {
                const loadingEl = document.getElementById('ai-welcome-loading');
                if (!loadingEl) return; // user already moved on
                if (msg) {
                    loadingEl.outerHTML = `
                        <div class="p-4 rounded-xl bg-gradient-to-br from-[#111827] to-[#1f2937] border border-gray-700 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
                            <div class="flex items-start space-x-3 relative z-10">
                                <div class="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-wand-magic-sparkles text-blue-400 text-xs"></i>
                                </div>
                                <div>
                                    <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-1.5">AI Welcome</p>
                                    <p class="text-[13px] text-gray-200 leading-relaxed">${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                                </div>
                            </div>
                        </div>`;
                } else {
                    loadingEl.remove();
                }
            }).catch(() => {
                document.getElementById('ai-welcome-loading')?.remove();
            });
        } else {
            document.getElementById('ai-welcome-loading')?.remove();
        }

        // Use default path
        document.getElementById('use-default-path')?.addEventListener('click', () => {
            document.getElementById('local-data-path').value = `${window.navigator.platform || 'Local'}/SmartMoneyData`;
        });

        document.getElementById('wizard-back-5').addEventListener('click', () => goToWizardStep(4));
        document.getElementById('wizard-finish').addEventListener('click', async () => {
            const pathInput = document.getElementById('local-data-path');
            state.wizard.local_data_path = pathInput ? pathInput.value.trim() : '';

            const profilePayload = {
                setup_complete: true,
                type: state.wizard.type,
                home_country: state.wizard.home_country,
                same_country: state.wizard.same_country,
                residence_country: state.wizard.same_country ? state.wizard.home_country : state.wizard.residence_country,
                primary_currency: state.wizard.primary_currency,
                additional_currencies: state.wizard.additional_currencies,
                local_data_path: state.wizard.local_data_path,
                members: [state.wizard.member]
            };

            try {
                await dataService.saveProfile(profilePayload);
            } catch (e) {
                console.warn('Could not persist profile', e);
            }

            document.getElementById('profile-wizard')?.remove();
            state.activePage = 'profile';
            document.getElementById('page-title').innerText = 'Profile';
            initNavigation();
            renderProfilePageView();
        });
    }
}