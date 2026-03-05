export const renderNavbar = (menuItems, activePage, callback) => {
    const navMenu = document.getElementById("nav-menu");
    navMenu.innerHTML = "";
    
    menuItems.forEach(item => {
        const isActive = item.id === activePage;
        
        const a = document.createElement("a");
        a.href = "#";
        a.className = `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium ${
            isActive 
            ? "bg-[#1f2937] text-white" 
            : "text-gray-400 hover:text-gray-100 hover:bg-[#1f2937]/50"
        }`;
        
        a.innerHTML = `<i class="${item.icon} ${isActive ? 'text-blue-400' : 'text-gray-500'} w-5 text-center text-lg"></i> <span>${item.label}</span>`;
        
        a.addEventListener("click", (e) => {
            e.preventDefault();
            callback(item);
        });
        
        navMenu.appendChild(a);
    });
};

export const renderChartSkeleton = () => {
    return `
        <div class="bg-gray-100 animate-pulse h-64 rounded-xl mt-4 w-full border border-gray-200"></div>
    `;
};

export const renderKpiCard = (title, value, trend, iconClass, bgColor = "bg-white") => {
    const isPositive = trend.startsWith("+");
    const trendColorClass = isPositive ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100";
    const trendIconParams = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    
    return `
        <div class="${bgColor} rounded-xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 group">
            <div class="flex items-start justify-between mb-4">
                <p class="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">${title}</p>
                <div class="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                    <i class="${iconClass} text-lg"></i>
                </div>
            </div>
            <div>
                <div class="flex items-baseline space-x-3">
                    <h3 class="text-3xl font-bold text-[#111827] tracking-tight">${value}</h3>
                    <span class="${trendColorClass} border text-[12px] font-semibold px-2 py-0.5 rounded-full flex items-center">
                        <i class="fas ${trendIconParams} mr-1 text-[10px]"></i> ${trend}
                    </span>
                </div>
            </div>
        </div>
    `;
};

export const renderChatInterface = () => renderCopilotInterface();

export const renderCopilotInterface = () => `
    <div class="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white">
            <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-lg bg-[#111827] flex items-center justify-center">
                    <i class="fas fa-wand-magic-sparkles text-blue-400 text-[12px]"></i>
                </div>
                <div>
                    <p class="text-[14px] font-bold text-gray-900">SmartMoney Copilot</p>
                    <p class="text-[11px] text-gray-400">Powered by Azure AI Foundry</p>
                </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700"><i class="fas fa-circle text-emerald-400 text-[8px] mr-1"></i>Active</span>
        </div>

        <!-- Messages -->
        <div id="copilot-messages" class="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50">

            <!-- Welcome -->
            <div class="flex space-x-3 max-w-2xl">
                <div class="h-7 w-7 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fas fa-wand-magic-sparkles text-blue-400 text-[10px]"></i>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p class="text-[13px] font-semibold text-gray-900 mb-1">SmartMoney Copilot</p>
                    <p class="text-[13px] text-gray-700 leading-relaxed">Hi! I can add expenses, income, and answer questions about your finances. Try something like:</p>
                    <div id="copilot-chips" class="flex flex-wrap gap-2 mt-3">
                        ${[
                            'Add Netflix £12.99 monthly',
                            'I got paid £4,500 this month',
                            'Add groceries budget £400',
                            'What\'s my total fixed cost?',
                            'Add rent £1,200 due on 1st'
                        ].map(s => `<button class="copilot-chip px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[12px] font-medium transition-colors">${s}</button>`).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Input -->
        <div class="p-4 bg-white border-t border-gray-100">
            <form id="copilot-form" class="flex items-center space-x-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <input id="copilot-input" type="text" placeholder="e.g. Add Netflix £12.99 monthly or What is my savings rate?" autocomplete="off"
                    class="flex-1 bg-transparent py-2 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none">
                <button id="copilot-send" type="submit" class="bg-[#111827] hover:bg-[#1f2937] text-white h-9 w-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0">
                    <i class="fas fa-arrow-up text-xs"></i>
                </button>
            </form>
            <p class="text-center text-[11px] text-gray-400 mt-2"><i class="fas fa-shield-halved mr-1 opacity-70"></i>Copilot can make mistakes. Verify important financial entries.</p>
        </div>
    </div>
    `;

/** Renders a single chat bubble. role: 'user'|'copilot'|'system' */
export const renderCopilotMessage = (role, text) => {
    const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    if (role === 'user') {
        return `<div class="flex space-x-3 max-w-2xl ml-auto flex-row-reverse space-x-reverse">
            <div class="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold">U</div>
            <div class="bg-[#111827] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                <p class="text-[13px] leading-relaxed">${safe}</p>
            </div>
        </div>`;
    }
    if (role === 'system') {
        return `<div class="flex items-center justify-center">
            <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px]">${safe}</span>
        </div>`;
    }
    return `<div class="flex space-x-3 max-w-2xl">
        <div class="h-7 w-7 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="fas fa-wand-magic-sparkles text-blue-400 text-[10px]"></i>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p class="text-[13px] font-semibold text-gray-900 mb-1">SmartMoney Copilot</p>
            <p class="text-[13px] text-gray-700 leading-relaxed">${safe}</p>
        </div>
    </div>`;
};

/** Renders the pending-action confirmation card inside the chat. */
export const renderCopilotActionCard = (action) => {
    const intentLabel = {
        add_fixed_expense:    '📌 Add Fixed Expense',
        add_variable_expense: '📊 Add Variable Expense',
        add_income:           '💰 Add Income'
    }[action.intent] || 'Action';

    const d = action.data || {};
    const fields = [];
    if (d.name)      fields.push(['Name',      d.name]);
    if (d.amount != null)  fields.push(['Amount',    `${d.currency || ''} ${d.amount}`]);
    if (d.budget != null)  fields.push(['Budget',    `${d.currency || ''} ${d.budget}`]);
    if (d.actual != null && d.actual !== 0) fields.push(['Actual', `${d.currency || ''} ${d.actual}`]);
    if (d.category)  fields.push(['Category',  d.category]);
    if (d.frequency) fields.push(['Frequency', d.frequency]);
    if (d.due_day)   fields.push(['Due Day',   `${d.due_day}${d.due_day===1?'st':d.due_day===2?'nd':d.due_day===3?'rd':'th'} of month`]);
    if (d.country_type) fields.push(['Source',  d.country_type]);

    return `<div class="flex space-x-3 max-w-2xl" id="copilot-action-card">
        <div class="h-7 w-7 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="fas fa-wand-magic-sparkles text-blue-400 text-[10px]"></i>
        </div>
        <div class="bg-white border border-blue-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm w-full">
            <p class="text-[13px] font-semibold text-gray-900 mb-2">${intentLabel}</p>
            <div class="space-y-1 mb-3">
                ${fields.map(([k,v]) => `<div class="flex justify-between text-[12px]">
                    <span class="text-gray-500">${k}</span>
                    <span class="font-semibold text-gray-800">${v}</span>
                </div>`).join('')}
            </div>
            <div class="flex space-x-2">
                <button id="copilot-confirm" class="flex-1 py-2 bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-semibold rounded-lg transition-colors">
                    <i class="fas fa-check mr-1.5"></i>Confirm
                </button>
                <button id="copilot-cancel" class="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold rounded-lg transition-colors">
                    <i class="fas fa-times mr-1.5"></i>Cancel
                </button>
            </div>
        </div>
    </div>`;
};

// ---------------------------------------------------------------------------
// Profile Setup Wizard
// A multi-step wizard rendered as a full-screen overlay (step 1–5).
// Each step is a pure string. The controller logic lives in main.js.
// ---------------------------------------------------------------------------

export const renderProfileWizardShell = () => `
    <div id="profile-wizard" class="fixed inset-0 z-50 bg-[#f0f2f5] flex items-center justify-center p-4">
        <div class="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <!-- Progress bar -->
            <div class="h-1 bg-gray-100">
                <div id="wizard-progress" class="h-1 bg-blue-600 transition-all duration-500" style="width:20%"></div>
            </div>
            <div id="wizard-body" class="p-8"></div>
        </div>
    </div>
`;

export const renderWizardStep1 = () => `
    <div class="space-y-6">
        <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Step 1 of 5</p>
            <h2 class="text-2xl font-bold text-gray-900">Welcome to SmartMoney AI</h2>
            <p class="text-[14px] text-gray-500 mt-2 leading-relaxed">Let's set up your profile. This takes about 2 minutes and helps us personalise your financial dashboard.</p>
        </div>
        <div class="space-y-3">
            <label class="text-[13px] font-semibold text-gray-700">Profile Type</label>
            <div class="grid grid-cols-2 gap-3">
                <button data-type="individual" class="profile-type-btn flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer group">
                    <div class="h-12 w-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                        <i class="fas fa-user text-blue-600 text-xl"></i>
                    </div>
                    <span class="text-[14px] font-semibold text-gray-800">Individual</span>
                    <span class="text-[12px] text-gray-500 text-center mt-1">Track your own finances</span>
                </button>
                <button data-type="family" class="profile-type-btn flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer group">
                    <div class="h-12 w-12 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                        <i class="fas fa-people-roof text-emerald-600 text-xl"></i>
                    </div>
                    <span class="text-[14px] font-semibold text-gray-800">Family</span>
                    <span class="text-[12px] text-gray-500 text-center mt-1">Aggregate family finances</span>
                </button>
            </div>
        </div>
        <!-- AI inference helper -->
        <details class="group">
            <summary class="flex items-center space-x-2 text-[12px] text-gray-400 cursor-pointer select-none hover:text-blue-500 transition-colors list-none">
                <i class="fas fa-wand-magic-sparkles text-blue-400"></i>
                <span>Not sure? Let AI choose for you</span>
                <i class="fas fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i>
            </summary>
            <div class="mt-3 space-y-2">
                <textarea id="ai-type-input" rows="2" placeholder="Describe your situation, e.g. &quot;I manage budgets for me, my partner and two kids&quot;…" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-[13px] text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"></textarea>
                <button id="ai-infer-type" class="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold rounded-lg border border-blue-200 transition-colors">
                    <i class="fas fa-wand-magic-sparkles"></i><span>Analyse with AI</span>
                </button>
                <p id="ai-type-result" class="text-[12px] text-gray-500 hidden"></p>
            </div>
        </details>
        <button id="wizard-next-1" disabled class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-[14px]">Continue</button>
    </div>
`;

export const renderWizardStep2 = (countries) => {
    const countryOptions = countries.map(c => ({
        value: c.code,
        label: c.name,
        flag: c.flag
    }));

    return `
    <div class="space-y-6">
        <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Step 2 of 5</p>
            <h2 class="text-2xl font-bold text-gray-900">Where are you from?</h2>
            <p class="text-[14px] text-gray-500 mt-2 leading-relaxed">Your home country sets the base for tax rules and reporting. Your country of residence determines available currencies.</p>
        </div>
        <div class="space-y-4">
            <div>
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Home Country (nationality)</label>
                ${renderSearchableCombobox('home-country', countryOptions, 'fas fa-flag', 'Select country…')}
            </div>
            <div class="flex items-center space-x-3 py-1">
                <input type="checkbox" id="same-country" class="h-4 w-4 rounded accent-blue-600" checked>
                <label for="same-country" class="text-[13px] text-gray-700 cursor-pointer">I currently live in my home country</label>
            </div>
            <div id="residence-row" class="hidden">
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Country of Residence</label>
                ${renderSearchableCombobox('residence-country', countryOptions, 'fas fa-location-dot', 'Select country…')}
            </div>
        </div>
        <div class="flex space-x-3">
            <button id="wizard-back-2" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[14px]">Back</button>
            <button id="wizard-next-2" disabled class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-[14px]">Continue</button>
        </div>
    </div>
    `;
};

export const renderWizardStep3 = (availableCurrencies, aiSuggestion = null) => {
    const currencyOptions = availableCurrencies.map(c => ({
        value: c.code,
        label: `${c.code} — ${c.name}`,
        flag: c.symbol
    }));

    return `
    <div class="space-y-6">
        <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Step 3 of 5</p>
            <h2 class="text-2xl font-bold text-gray-900">Your Currencies</h2>
            <p class="text-[14px] text-gray-500 mt-2 leading-relaxed">Select your primary currency for reports. You can also add additional currencies if you hold accounts in multiple currencies.</p>
        </div>
        ${aiSuggestion ? `
        <div class="flex items-start space-x-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <i class="fas fa-wand-magic-sparkles text-blue-500 mt-0.5 text-sm"></i>
            <div>
                <p class="text-[12px] font-semibold text-blue-700">AI Recommended: <span class="font-bold">${aiSuggestion.code}</span></p>
                <p class="text-[11px] text-blue-600 mt-0.5 leading-relaxed">${aiSuggestion.reason}</p>
            </div>
        </div>` : `
        <div id="ai-currency-loading" class="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <i class="fas fa-circle-notch fa-spin text-blue-400 text-sm"></i>
            <p class="text-[12px] text-gray-500">AI is analysing your location to suggest a currency…</p>
        </div>`}
        <div class="space-y-4">
            <div>
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Primary Currency</label>
                ${renderSearchableCombobox('primary-currency', currencyOptions, 'fas fa-dollar-sign', 'Select currency…')}
            </div>
            <div>
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Additional Currencies <span class="font-normal text-gray-400">(optional)</span></label>
                <div class="space-y-2 max-h-48 overflow-y-auto pr-1" id="extra-currencies">
                    ${availableCurrencies.map(c => `
                        <label class="flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer extra-currency-row border border-transparent hover:border-gray-200">
                            <input type="checkbox" value="${c.code}" class="h-4 w-4 rounded accent-blue-600">
                            <span class="text-[13px] text-gray-700"><span class="font-semibold">${c.code}</span> — ${c.name} <span class="text-gray-400">(${c.symbol})</span></span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="flex space-x-3">
            <button id="wizard-back-3" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[14px]">Back</button>
            <button id="wizard-next-3" disabled class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-[14px]">Continue</button>
        </div>
    </div>
`;
};

export const renderWizardStep4 = (profileType) => `
    <div class="space-y-6">
        <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Step 4 of 5</p>
            <h2 class="text-2xl font-bold text-gray-900">Your Details</h2>
            <p class="text-[14px] text-gray-500 mt-2 leading-relaxed">${profileType === 'family' ? 'Set up the primary account holder. You can add family members on the next step.' : 'Tell us a bit about yourself.'}</p>
        </div>
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">First Name</label>
                    <input id="member-first" type="text" placeholder="e.g. Ajeet" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
                <div>
                    <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Last Name</label>
                    <input id="member-last" type="text" placeholder="e.g. Chouksey" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            <div>
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Email</label>
                <input id="member-email" type="email" placeholder="you@example.com" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            </div>
            <div>
                <label class="text-[13px] font-semibold text-gray-700 block mb-1.5">Role</label>
                <select id="member-role" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="primary">Primary Account Holder</option>
                    ${profileType === 'family' ? '<option value="spouse">Spouse / Partner</option><option value="dependent">Dependent</option>' : ''}
                </select>
            </div>
        </div>
        <div class="flex space-x-3">
            <button id="wizard-back-4" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[14px]">Back</button>
            <button id="wizard-next-4" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-[14px]">Continue</button>
        </div>
    </div>
`;

export const renderWizardStep5 = (isLocalMode, aiWelcome = null) => `
    <div class="space-y-6">
        <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Step 5 of 5</p>
            <h2 class="text-2xl font-bold text-gray-900">Almost Done!</h2>
            <p class="text-[14px] text-gray-500 mt-2 leading-relaxed">Your profile is ready. ${isLocalMode ? 'Since you\'re in Local mode, choose where to keep your data files on this device.' : 'Your data will be stored in the connected Azure database.'}</p>
        </div>
        ${aiWelcome ? `
        <div class="p-4 rounded-xl bg-gradient-to-br from-[#111827] to-[#1f2937] border border-gray-700 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
            <div class="flex items-start space-x-3 relative z-10">
                <div class="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-wand-magic-sparkles text-blue-400 text-xs"></i>
                </div>
                <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-1.5">AI Welcome</p>
                    <p class="text-[13px] text-gray-200 leading-relaxed">${aiWelcome}</p>
                </div>
            </div>
        </div>` : `
        <div id="ai-welcome-loading" class="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <i class="fas fa-circle-notch fa-spin text-blue-400"></i>
            <p class="text-[13px] text-gray-500">Preparing your personalised welcome…</p>
        </div>`}
        ${isLocalMode ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div class="flex items-start space-x-3">
                <i class="fas fa-folder-open text-amber-500 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-[13px] font-semibold text-amber-800 mb-2">Local Data Storage Path</p>
                    <p class="text-[12px] text-amber-700 mb-3 leading-relaxed">SmartMoney AI will keep your JSON data files here. You can change this later in Settings. This option disappears once you connect a live database.</p>
                    <div class="flex space-x-2">
                        <input id="local-data-path" type="text" placeholder="e.g. C:\\Users\\YourName\\SmartMoneyData" class="flex-1 px-3 py-2.5 rounded-lg border border-amber-300 bg-white text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400">
                        <button id="use-default-path" type="button" class="px-3 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[12px] font-semibold rounded-lg border border-amber-300 transition-colors whitespace-nowrap">Use Default</button>
                    </div>
                    <p class="text-[11px] text-amber-600 mt-2"><i class="fas fa-info-circle mr-1"></i>Note: Browser security prevents direct file system writes. This path is saved for when you later connect to a local API server mode.</p>
                </div>
            </div>
        </div>
        ` : `
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
            <i class="fas fa-cloud text-emerald-500 text-lg"></i>
            <div>
                <p class="text-[13px] font-semibold text-emerald-800">Connected to Azure Database</p>
                <p class="text-[12px] text-emerald-700 mt-0.5">Your profile and transactions will be saved securely to your Azure backend.</p>
            </div>
        </div>
        `}
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p class="text-[12px] font-semibold text-blue-700 uppercase tracking-wide mb-2">Profile Summary</p>
            <div id="wizard-summary" class="space-y-1 text-[13px] text-gray-700"></div>
        </div>
        <div class="flex space-x-3">
            <button id="wizard-back-5" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[14px]">Back</button>
            <button id="wizard-finish" class="flex-1 py-3 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-xl transition-all text-[14px] flex items-center justify-center space-x-2">
                <i class="fas fa-check-circle"></i><span>Finish Setup</span>
            </button>
        </div>
    </div>
`;

// ---------------------------------------------------------------------------
// User Profile Page (post-setup view)
// ---------------------------------------------------------------------------

export const renderProfilePage = (profile, countries) => {
    const homeCountry  = countries.find(c => c.code === profile.home_country)  || {};
    const resCountry   = countries.find(c => c.code === profile.residence_country) || {};
    const primaryMember = profile.members.find(m => m.role === 'primary') || {};
    const initials = [(primaryMember.first_name || '?')[0], (primaryMember.last_name || '?')[0]].join('').toUpperCase();

    return `
        <div class="max-w-3xl space-y-6">

            <!-- Header card -->
            <div class="bg-[#111827] rounded-2xl p-6 flex items-center space-x-5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]"></div>
                <div class="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg shadow-blue-500/20 z-10">
                    ${initials}
                </div>
                <div class="z-10">
                    <h2 class="text-xl font-bold text-white">${(primaryMember.first_name || '') + ' ' + (primaryMember.last_name || '')}</h2>
                    <p class="text-[13px] text-gray-400 mt-0.5">${primaryMember.email || ''}</p>
                    <div class="flex items-center space-x-3 mt-2">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold uppercase tracking-wide">
                            ${profile.type === 'family' ? '<i class="fas fa-people-roof mr-1.5"></i>Family' : '<i class="fas fa-user mr-1.5"></i>Individual'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold uppercase tracking-wide">
                            ${profile.primary_currency}
                        </span>
                    </div>
                </div>
                <button id="edit-profile-btn" class="ml-auto z-10 flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium transition-colors border border-white/10">
                    <i class="fas fa-pen text-xs"></i><span>Edit</span>
                </button>
            </div>

            <!-- Location row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Home Country</p>
                    <div class="flex items-center space-x-3">
                        <span class="text-3xl">${homeCountry.flag || '🌍'}</span>
                        <div>
                            <p class="text-[15px] font-semibold text-gray-900">${homeCountry.name || '—'}</p>
                            <p class="text-[12px] text-gray-500">${profile.home_country || ''}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Country of Residence</p>
                    <div class="flex items-center space-x-3">
                        <span class="text-3xl">${profile.same_country ? (homeCountry.flag || '🌍') : (resCountry.flag || '🌍')}</span>
                        <div>
                            <p class="text-[15px] font-semibold text-gray-900">${profile.same_country ? (homeCountry.name || '—') : (resCountry.name || '—')}</p>
                            ${profile.same_country ? '<p class="text-[12px] text-gray-500">Same as home country</p>' : `<p class="text-[12px] text-gray-500">${profile.residence_country || ''}</p>`}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Currencies -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Currencies</p>
                <div class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[13px] font-semibold">
                        <i class="fas fa-star text-[10px] text-blue-500"></i><span>${profile.primary_currency}</span><span class="text-[11px] font-normal text-blue-600">primary</span>
                    </span>
                    ${(profile.additional_currencies || []).map(c =>
                        `<span class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[13px] font-semibold">${c}</span>`
                    ).join('')}
                </div>
            </div>

            <!-- Members (family mode) -->
            ${profile.type === 'family' ? `
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div class="flex items-center justify-between mb-4">
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Family Members</p>
                    <button id="add-member-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-medium transition-colors">
                        <i class="fas fa-plus text-[10px]"></i><span>Add Member</span>
                    </button>
                </div>
                <div class="space-y-2" id="members-list">
                    ${profile.members.map(m => `
                        <div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div class="h-9 w-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                ${((m.first_name || '?')[0] + (m.last_name || '?')[0]).toUpperCase()}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[14px] font-semibold text-gray-900 truncate">${m.first_name} ${m.last_name}</p>
                                <p class="text-[12px] text-gray-500">${m.email || ''}</p>
                            </div>
                            <span class="px-2 py-0.5 rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600 capitalize">${m.role}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

        </div>
    `;
};

export const renderAddMemberModal = () => `
    <div id="add-member-modal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-5">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">Add Family Member</h3>
                <button id="close-member-modal" class="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">First Name</label>
                    <input id="new-first" type="text" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Last Name</label>
                    <input id="new-last" type="text" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Email</label>
                <input id="new-email" type="email" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            </div>
            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Role</label>
                <select id="new-role" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="spouse">Spouse / Partner</option>
                    <option value="dependent">Dependent</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="flex space-x-3 pt-2">
                <button id="cancel-member" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[13px]">Cancel</button>
                <button id="save-member" class="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-xl transition-all text-[13px]">Add Member</button>
            </div>
        </div>
    </div>
`;

// ---------------------------------------------------------------------------
// Monthly Expenses Page
// ---------------------------------------------------------------------------

const FIXED_CATEGORIES    = ['Housing','Utilities','Insurance','Loans','Subscriptions','Transport','Other'];
const VARIABLE_CATEGORIES = ['Food','Transport','Entertainment','Shopping','Healthcare','Travel','Education','Personal Care','Other'];
const INCOME_CATEGORIES   = ['Employment','Freelance','Rental','Investment','Business','Transfer','Gift','Other'];

// availableCurrencies: [{ code, name, symbol }]
// homeCountry / residenceCountry: { code, name, flag } | null
export const renderExpensesPage = (monthData, aiEnabled, availableCurrencies, homeCountry, residenceCountry) => {
    const displayCur  = monthData.currency || 'USD';
    const currencies  = availableCurrencies && availableCurrencies.length > 1 ? availableCurrencies : null;

    // Income calculations (only entries in displayCur)
    const income       = monthData.income_sources || [];
    const homeIncome   = income.filter(i => i.country_type === 'home');
    const resIncome    = income.filter(i => i.country_type === 'residence');
    const totalIncomeDC = income.filter(i => (i.currency || displayCur) === displayCur)
                               .reduce((s, i) => s + (i.amount || 0), 0);

    const totalFixed    = monthData.fixed_expenses.reduce((s, e) => s + e.amount, 0);
    const totalVariable = monthData.variable_expenses.reduce((s, e) => s + (e.actual ?? e.budget ?? 0), 0);
    const totalAvail    = (monthData.opening_balance || 0) + totalIncomeDC;
    const projected     = totalAvail - totalFixed - totalVariable;
    const projectedCls  = projected >= 0 ? 'text-emerald-600' : 'text-rose-600';
    const savingsRate   = totalAvail > 0 ? Math.max(0, (projected / totalAvail) * 100).toFixed(1) : '0.0';

    // Foreign-currency income groups
    const foreignIncomeByCur = income.reduce((acc, i) => {
        const c = i.currency || displayCur;
        if (c !== displayCur) { acc[c] = (acc[c] || 0) + i.amount; }
        return acc;
    }, {});
    const foreignSummary = Object.entries(foreignIncomeByCur)
        .map(([c, a]) => `<span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">${c} ${a.toLocaleString('en-US',{minimumFractionDigits:2})}</span>`)
        .join('');

    return `
    <div class="space-y-6 max-w-5xl">

        <!-- Header row: month picker + prev savings + currency chips -->
        <div class="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div class="flex-1 min-w-[160px]">
                <label class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Month</label>
                <input id="exp-month" type="month" value="${monthData.month}" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prev. Month Savings (${displayCur})</label>
                <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-[14px]">${displayCur}</span>
                    <input id="exp-opening" type="number" min="0" step="0.01" value="${monthData.opening_balance}" class="w-full pl-14 pr-4 py-2.5 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            ${currencies ? `
            <div class="flex-1 min-w-[160px]">
                <label class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Display Currency</label>
                <div id="currency-chips" class="flex flex-wrap gap-2">
                    ${currencies.map(c => `
                        <button data-currency="${c.code}" class="currency-chip px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${c.code === displayCur ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}">${c.code}</button>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            <button id="exp-save-header" class="px-5 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-xl text-[13px] transition-colors whitespace-nowrap">Save</button>
        </div>

        <!-- Income Sources card -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div class="flex items-center space-x-2">
                    <div class="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center"><i class="fas fa-arrow-down text-emerald-600 text-xs"></i></div>
                    <h3 class="text-[14px] font-semibold text-gray-900">Income Sources</h3>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">${income.length}</span>
                    ${homeCountry ? `<span class="text-[11px] text-gray-400">${homeCountry.flag} ${homeCountry.name}</span>` : ''}
                    ${residenceCountry && residenceCountry.code !== (homeCountry && homeCountry.code) ? `<span class="text-[11px] text-gray-400">/ ${residenceCountry.flag} ${residenceCountry.name}</span>` : ''}
                </div>
                <button id="add-income-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium transition-colors">
                    <i class="fas fa-plus text-[10px]"></i><span>Add Income</span>
                </button>
            </div>
            <div id="income-list" class="divide-y divide-gray-50">
                ${income.map(i => _incomeRow(i, displayCur, homeCountry, residenceCountry)).join('')
                  || '<p class="text-[13px] text-gray-400 text-center py-6">No income sources yet. Add your salary, freelance income, etc.</p>'}
            </div>
            <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center space-x-2 flex-wrap gap-2">
                    <span class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Total Income</span>
                    ${foreignSummary}
                </div>
                <span class="text-[15px] font-bold text-emerald-700">${displayCur} ${totalIncomeDC.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
            </div>
        </div>

        <!-- Summary KPI strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${_expKpi('Total Available', displayCur + ' ' + totalAvail.toLocaleString('en-US',{minimumFractionDigits:2}), 'fas fa-wallet', 'blue')}
            ${_expKpi('Fixed Expenses', displayCur + ' ' + totalFixed.toLocaleString('en-US',{minimumFractionDigits:2}), 'fas fa-lock', 'gray')}
            ${_expKpi('Variable Expenses', displayCur + ' ' + totalVariable.toLocaleString('en-US',{minimumFractionDigits:2}), 'fas fa-chart-bar', 'amber')}
            ${_expKpi('Projected Closing', displayCur + ' ' + projected.toLocaleString('en-US',{minimumFractionDigits:2}), 'fas fa-arrow-trend-' + (projected >= 0 ? 'up' : 'down'), projected >= 0 ? 'emerald' : 'rose')}
        </div>

        <!-- Savings rate progress bar -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center space-x-4">
            <span class="text-[13px] font-semibold text-gray-600 whitespace-nowrap">Savings rate</span>
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-2 rounded-full transition-all duration-500 ${parseFloat(savingsRate) >= 20 ? 'bg-emerald-500' : parseFloat(savingsRate) >= 10 ? 'bg-amber-400' : 'bg-rose-500'}" style="width:${Math.min(100,savingsRate)}%"></div>
            </div>
            <span class="text-[14px] font-bold ${projectedCls} tabular-nums">${savingsRate}%</span>
        </div>

        <!-- Two columns: Fixed | Variable -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Fixed Expenses -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div class="flex items-center space-x-2">
                        <div class="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center"><i class="fas fa-lock text-gray-500 text-xs"></i></div>
                        <h3 class="text-[14px] font-semibold text-gray-900">Fixed Expenses</h3>
                        <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">${monthData.fixed_expenses.length}</span>
                    </div>
                    <button id="add-fixed-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-medium transition-colors">
                        <i class="fas fa-plus text-[10px]"></i><span>Add</span>
                    </button>
                </div>
                <div id="fixed-list" class="divide-y divide-gray-50">
                    ${monthData.fixed_expenses.map(e => _fixedExpRow(e, displayCur)).join('') || '<p class="text-[13px] text-gray-400 text-center py-8">No fixed expenses yet.</p>'}
                </div>
                <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Total Fixed</span>
                    <span class="text-[15px] font-bold text-gray-900">${displayCur} ${totalFixed.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
                </div>
            </div>

            <!-- Variable Expenses -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div class="flex items-center space-x-2">
                        <div class="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center"><i class="fas fa-chart-bar text-amber-500 text-xs"></i></div>
                        <h3 class="text-[14px] font-semibold text-gray-900">Variable Expenses</h3>
                        <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">${monthData.variable_expenses.length}</span>
                    </div>
                    <button id="add-variable-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-medium transition-colors">
                        <i class="fas fa-plus text-[10px]"></i><span>Add</span>
                    </button>
                </div>
                <div id="variable-list" class="divide-y divide-gray-50">
                    ${monthData.variable_expenses.map(e => _variableExpRow(e, displayCur)).join('') || '<p class="text-[13px] text-gray-400 text-center py-8">No variable expenses yet.</p>'}
                </div>
                <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Total Variable</span>
                    <span class="text-[15px] font-bold text-gray-900">${displayCur} ${totalVariable.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
                </div>
            </div>
        </div>

        <!-- AI Forecast Panel -->
        <div class="bg-[#111827] text-white rounded-xl shadow-lg border border-[#1f2937] overflow-hidden">
            <div class="flex items-center justify-between px-6 py-5 border-b border-[#1f2937]">
                <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <i class="fas fa-sparkles text-blue-400 text-sm"></i>
                    </div>
                    <div>
                        <h3 class="text-[14px] font-semibold text-white">AI Forecast &amp; Insights</h3>
                        <p class="text-[12px] text-gray-400">Powered by Azure AI Foundry</p>
                    </div>
                </div>
                <button id="run-forecast-btn" class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold transition-colors shadow-md shadow-blue-500/20 ${!aiEnabled ? 'opacity-60' : ''}">
                    <i class="fas fa-bolt text-xs"></i>
                    <span>${!aiEnabled ? 'Configure AI first' : 'Generate Forecast'}</span>
                </button>
            </div>
            <div id="ai-forecast-body" class="px-6 py-5">
                ${monthData.ai_forecast ? _renderForecastResult(monthData.ai_forecast, displayCur) : _renderForecastPlaceholder(aiEnabled)}
            </div>
        </div>

        ${!aiEnabled ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3">
            <i class="fas fa-triangle-exclamation text-amber-500 mt-0.5"></i>
            <div class="text-[13px] text-amber-800">
                <span class="font-semibold">AI not configured.</span>
                Copy <code class="font-mono bg-amber-100 px-1 rounded">src/js/ai/ai_settings.example.js</code> →
                <code class="font-mono bg-amber-100 px-1 rounded">src/js/ai/ai_settings.js</code>,
                fill in your Azure AI Foundry endpoint and key, then set <code class="font-mono bg-amber-100 px-1 rounded">enabled: true</code>.
            </div>
        </div>
        ` : ''}
    </div>
    `;
};

const _expKpi = (label, value, icon, color) => {
    const colors = {
        blue:    'bg-blue-50 text-blue-600',
        gray:    'bg-gray-100 text-gray-500',
        amber:   'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose:    'bg-rose-50 text-rose-600'
    };
    return `
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center space-x-3">
        <div class="h-10 w-10 rounded-xl ${colors[color]} flex items-center justify-center flex-shrink-0">
            <i class="${icon} text-lg"></i>
        </div>
        <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 truncate">${label}</p>
            <p class="text-[15px] font-bold text-gray-900 truncate">${value}</p>
        </div>
    </div>`;
};

const _fixedExpRow = (e, displayCur) => {
    const entCur  = e.currency || displayCur;
    const foreign = entCur !== displayCur;
    return `
    <div class="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors group" data-id="${e.id}" data-type="fixed">
        <div class="flex-1 min-w-0">
            <p class="text-[14px] font-medium text-gray-900 truncate">${e.name}</p>
            <div class="flex items-center space-x-2 mt-0.5">
                <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">${e.category}</span>
                ${e.due_day ? `<span class="text-[11px] text-gray-400">Due day ${e.due_day}</span>` : ''}
                ${foreign ? `<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-bold">${entCur}</span>` : ''}
            </div>
        </div>
        <span class="text-[14px] font-semibold text-gray-900 ml-3 tabular-nums">${entCur} ${e.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
        <button class="delete-exp-btn ml-3 opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-all" data-id="${e.id}" data-type="fixed">
            <i class="fas fa-trash text-rose-500 text-xs pointer-events-none"></i>
        </button>
    </div>
`;};

const _variableExpRow = (e, displayCur) => {
    const entCur  = e.currency || displayCur;
    const foreign = entCur !== displayCur;
    const pct  = e.budget > 0 ? Math.min(100, ((e.actual ?? 0) / e.budget) * 100) : 0;
    const over  = (e.actual ?? 0) > e.budget;
    return `
    <div class="px-5 py-3 hover:bg-gray-50 transition-colors group" data-id="${e.id}" data-type="variable">
        <div class="flex items-center">
            <div class="flex-1 min-w-0">
                <p class="text-[14px] font-medium text-gray-900 truncate">${e.name}</p>
                <div class="flex items-center space-x-2 mt-0.5">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">${e.category}</span>
                    ${foreign ? `<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-bold">${entCur}</span>` : ''}
                </div>
            </div>
            <div class="text-right ml-3">
                <p class="text-[14px] font-semibold ${over ? 'text-rose-600' : 'text-gray-900'} tabular-nums">${entCur} ${(e.actual ?? 0).toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                <p class="text-[11px] text-gray-400">of ${entCur} ${e.budget.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
            </div>
            <button class="delete-exp-btn ml-3 opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-all" data-id="${e.id}" data-type="variable">
                <i class="fas fa-trash text-rose-500 text-xs pointer-events-none"></i>
            </button>
        </div>
        <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-1.5 rounded-full transition-all duration-500 ${over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-400' : 'bg-emerald-500'}" style="width:${pct}%"></div>
        </div>
    </div>`;
};

const _incomeRow = (i, displayCur, homeCountry, residenceCountry) => {
    const entCur  = i.currency || displayCur;
    const foreign = entCur !== displayCur;
    const ctypeLabel = i.country_type === 'home'
        ? (homeCountry ? `${homeCountry.flag} Home` : 'Home')
        : i.country_type === 'residence'
        ? (residenceCountry ? `${residenceCountry.flag} Residence` : 'Residence')
        : 'Other';
    const ctypeColor = i.country_type === 'home' ? 'bg-violet-100 text-violet-700'
        : i.country_type === 'residence' ? 'bg-teal-100 text-teal-700'
        : 'bg-gray-100 text-gray-500';
    return `
    <div class="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors group" data-id="${i.id}" data-type="income">
        <div class="flex-1 min-w-0">
            <p class="text-[14px] font-medium text-gray-900 truncate">${i.name}</p>
            <div class="flex items-center space-x-2 mt-0.5 flex-wrap gap-1">
                <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">${i.category}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${ctypeColor}">${ctypeLabel}</span>
                ${foreign ? `<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-bold">${entCur}</span>` : ''}
            </div>
        </div>
        <span class="text-[14px] font-semibold text-emerald-700 ml-3 tabular-nums">${entCur} ${(i.amount || 0).toLocaleString('en-US',{minimumFractionDigits:2})}</span>
        <button class="delete-income-btn ml-3 opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-all" data-id="${i.id}">
            <i class="fas fa-trash text-rose-500 text-xs pointer-events-none"></i>
        </button>
    </div>
`;};

const _renderForecastPlaceholder = (aiEnabled) => `
    <div class="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <div class="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <i class="fas fa-brain text-blue-400 text-2xl"></i>
        </div>
        <p class="text-[14px] font-semibold text-gray-300">${aiEnabled ? 'Ready to forecast' : 'AI not configured'}</p>
        <p class="text-[13px] text-gray-500 max-w-sm leading-relaxed">
            ${aiEnabled
                ? 'Click "Generate Forecast" to analyse your expenses and get AI-powered insights and savings recommendations.'
                : 'Set up your AI connection in <code class="text-blue-400">ai_settings.js</code> to enable forecasts.'}
        </p>
    </div>
`;

const _renderForecastResult = (forecast, currency) => {
    const riskColor = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-rose-400' };
    const typeIcon  = { warning: 'fa-triangle-exclamation text-amber-400', positive: 'fa-circle-check text-emerald-400', tip: 'fa-lightbulb text-blue-400' };
    return `
    <div class="space-y-5">
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-[#1f2937] rounded-xl p-4 border border-[#374151]">
                <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Projected Closing</p>
                <p class="text-[18px] font-bold text-white">${currency} ${(forecast.projected_closing || 0).toLocaleString('en-US',{minimumFractionDigits:2})}</p>
            </div>
            <div class="bg-[#1f2937] rounded-xl p-4 border border-[#374151]">
                <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Savings Rate</p>
                <p class="text-[18px] font-bold text-emerald-400">${forecast.savings_rate_pct || 0}%</p>
            </div>
            <div class="bg-[#1f2937] rounded-xl p-4 border border-[#374151]">
                <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Risk Level</p>
                <p class="text-[18px] font-bold ${riskColor[forecast.risk_level] || 'text-white'} capitalize">${forecast.risk_level || '—'}</p>
            </div>
        </div>
        ${forecast.summary ? `<p class="text-[13px] text-gray-300 leading-relaxed border-l-2 border-blue-500 pl-4">${forecast.summary}</p>` : ''}
        ${(forecast.insights || []).length > 0 ? `
        <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Insights</p>
            ${forecast.insights.map(i => `
                <div class="flex items-start space-x-3 p-3 bg-[#1f2937]/60 rounded-xl border border-[#374151]">
                    <i class="fas ${typeIcon[i.type] || 'fa-circle text-gray-400'} mt-0.5 flex-shrink-0"></i>
                    <p class="text-[13px] text-gray-300 leading-relaxed">${i.text}</p>
                </div>
            `).join('')}
        </div>` : ''}
        ${(forecast.recommendations || []).length > 0 ? `
        <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Recommendations</p>
            ${forecast.recommendations.map(r => `
                <div class="flex items-center justify-between p-3 bg-[#1f2937]/60 rounded-xl border border-[#374151]">
                    <div class="flex items-center space-x-3 min-w-0">
                        <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold">${r.category}</span>
                        <p class="text-[13px] text-gray-300 truncate">${r.action}</p>
                    </div>
                    ${r.potential_saving ? `<span class="text-emerald-400 text-[13px] font-semibold ml-3 whitespace-nowrap flex-shrink-0">Save ${currency} ${r.potential_saving}</span>` : ''}
                </div>
            `).join('')}
        </div>` : ''}
    </div>
    `;
};

// availableCurrencies: [{ code, name }] — if only one, currency row is hidden
export const renderExpenseEntryModal = (type, availableCurrencies, displayCur) => {
    const cats  = type === 'fixed' ? FIXED_CATEGORIES : VARIABLE_CATEGORIES;
    const title = type === 'fixed' ? 'Add Fixed Expense' : 'Add Variable Expense';
    const curs  = availableCurrencies && availableCurrencies.length > 1 ? availableCurrencies : null;
    const freqOptions = ['Monthly','Weekly','Yearly','One-time'];
    return `
    <div id="exp-modal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">${title}</h3>
                <button id="close-exp-modal" class="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"><i class="fas fa-times"></i></button>
            </div>

            <!-- Smart Fill -->
            <div class="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                <p class="text-[11px] font-semibold text-blue-700 uppercase tracking-wide"><i class="fas fa-wand-magic-sparkles mr-1"></i>Smart Fill with AI</p>
                <div class="flex space-x-2">
                    <input id="exp-smart-input" type="text" placeholder='e.g. "Netflix £12.99 monthly" or "Rent 1200 due 1st"'
                        class="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-white text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder-gray-400">
                    <button id="exp-smart-btn" type="button" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap flex items-center space-x-1.5">
                        <i class="fas fa-wand-magic-sparkles text-[10px]"></i><span>Fill</span>
                    </button>
                </div>
                <p id="exp-smart-status" class="text-[11px] text-blue-600 hidden"></p>
            </div>

            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Name</label>
                <input id="exp-name" type="text" placeholder="e.g. Netflix" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Category</label>
                    <select id="exp-category" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Frequency</label>
                    <select id="exp-frequency" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        ${freqOptions.map(f => `<option value="${f.toLowerCase().replace(' ','-')}">${f}</option>`).join('')}
                    </select>
                </div>
            </div>
            ${curs ? `
            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Currency</label>
                ${renderSearchableCombobox(
                    'exp-currency',
                    curs.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` })),
                    'fas fa-coins',
                    'Select currency…'
                )}
            </div>
            ` : `<input type="hidden" id="exp-currency" value="${displayCur || 'USD'}">`}
            ${type === 'fixed' ? `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Amount</label>
                    <input id="exp-amount" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Due Day (1–31)</label>
                    <input id="exp-due" type="number" min="1" max="31" placeholder="1" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            ` : `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Budget</label>
                    <input id="exp-budget" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Actual Spent</label>
                    <input id="exp-actual" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            `}
            <div class="flex space-x-3 pt-2">
                <button id="cancel-exp" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[13px]">Cancel</button>
                <button id="save-exp" class="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-xl transition-all text-[13px]">Add Expense</button>
            </div>
        </div>
    </div>
    `;
};

// availableCurrencies: [{ code, name }]
// homeCountry / residenceCountry: { code, name, flag } | null
export const renderIncomeEntryModal = (availableCurrencies, homeCountry, residenceCountry, displayCur) => {
    const curs = availableCurrencies && availableCurrencies.length > 0 ? availableCurrencies : [{ code: displayCur || 'USD', name: displayCur || 'USD' }];
    const homeLabel = homeCountry ? `${homeCountry.flag} Home (${homeCountry.name})` : 'Home Country';
    const resLabel  = residenceCountry ? `${residenceCountry.flag} Residence (${residenceCountry.name})` : 'Residence Country';
    const showRes   = residenceCountry && (!homeCountry || residenceCountry.code !== homeCountry.code);
    const freqOptions = [['monthly','Monthly'],['bi-weekly','Bi-weekly'],['weekly','Weekly'],['yearly','Yearly'],['one-time','One-time']];
    return `
    <div id="income-modal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">Add Income Source</h3>
                <button id="close-income-modal" class="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"><i class="fas fa-times"></i></button>
            </div>

            <!-- Smart Fill -->
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                <p class="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide"><i class="fas fa-wand-magic-sparkles mr-1"></i>Smart Fill with AI</p>
                <div class="flex space-x-2">
                    <input id="inc-smart-input" type="text" placeholder='e.g. "Salary £4500 monthly" or "Freelance AED 2000"'
                        class="flex-1 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 placeholder-gray-400">
                    <button id="inc-smart-btn" type="button" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap flex items-center space-x-1.5">
                        <i class="fas fa-wand-magic-sparkles text-[10px]"></i><span>Fill</span>
                    </button>
                </div>
                <p id="inc-smart-status" class="text-[11px] text-emerald-600 hidden"></p>
            </div>

            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Name</label>
                <input id="inc-name" type="text" placeholder="e.g. Salary" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Category</label>
                    <select id="inc-category" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        ${INCOME_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Frequency</label>
                    <select id="inc-frequency" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        ${freqOptions.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Currency</label>
                    ${renderSearchableCombobox(
                        'inc-currency',
                        curs.map(c => ({ value: c.code, label: `${c.code} — ${c.name || c.code}` })),
                        'fas fa-coins',
                        'Select currency…'
                    )}
                </div>
                <div>
                    <label class="text-[12px] font-semibold text-gray-600 block mb-1">Amount</label>
                    <input id="inc-amount" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                </div>
            </div>
            <div>
                <label class="text-[12px] font-semibold text-gray-600 block mb-1">Country Association</label>
                ${renderSearchableCombobox(
                    'inc-country-type',
                    [
                        { value: 'home', label: homeLabel },
                        ...(showRes ? [{ value: 'residence', label: resLabel }] : []),
                        { value: 'other', label: 'Other / International' }
                    ],
                    'fas fa-location-dot',
                    'Select association…'
                )}
            </div>
            <div class="flex space-x-3 pt-2">
                <button id="cancel-income" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-[13px]">Cancel</button>
                <button id="save-income" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all text-[13px]">Add Income</button>
            </div>
        </div>
    </div>
    `;
};

// ---------------------------------------------------------------------------
// Portfolio Page
// ---------------------------------------------------------------------------

export const renderHoldingCard = (holding) => {
    const isPositive = holding.gain_loss_pct >= 0;
    const badgeColor = isPositive 
        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
        : 'bg-rose-50 border-rose-100 text-rose-700';
    const trendIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const gainLoss = holding.gain_loss_pct >= 0 
        ? `+${holding.gain_loss_pct.toFixed(1)}%`
        : `${holding.gain_loss_pct.toFixed(1)}%`;

    return `
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-[15px] font-bold text-gray-900">${holding.ticker}</h3>
                    <p class="text-[13px] text-gray-500 mt-0.5">${holding.name}</p>
                </div>
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full border ${badgeColor} text-[12px] font-semibold">
                    <i class="fas ${trendIcon} text-[10px]"></i>
                    <span>${gainLoss}</span>
                </span>
            </div>
            
            <!-- Body -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Shares</p>
                    <p class="text-[15px] font-bold text-gray-900">${holding.shares.toLocaleString(undefined, {maximumFractionDigits: 4})}</p>
                </div>
                <div>
                    <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Avg Cost</p>
                    <p class="text-[15px] font-bold text-gray-900">$${holding.avg_cost.toFixed(2)}</p>
                </div>
                <div>
                    <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Price</p>
                    <p class="text-[15px] font-bold text-gray-900">$${holding.current_price.toFixed(2)}</p>
                </div>
                <div>
                    <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Value</p>
                    <p class="text-[15px] font-bold text-gray-900">$${holding.value.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            
            <!-- Sector badge -->
            <div class="flex items-center space-x-2 pt-3 border-t border-gray-100">
                <i class="fas fa-tag text-[11px] text-gray-400"></i>
                <span class="text-[12px] text-gray-600">${holding.sector}</span>
            </div>
        </div>
    `;
};

export const renderAllocationChart = (holdings) => {
    if (!holdings || holdings.length === 0) {
        return `
            <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <p class="text-[13px] text-gray-500">No holdings to display.</p>
            </div>
        `;
    }

    // Group by sector
    const bySector = {};
    holdings.forEach(h => {
        if (!bySector[h.sector]) bySector[h.sector] = 0;
        bySector[h.sector] += h.value;
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const sectors = Object.entries(bySector).sort((a, b) => b[1] - a[1]);

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-purple-600', 'bg-cyan-600'];

    return `
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 class="text-[14px] font-bold text-gray-900 mb-5">Allocation by Sector</h3>
            <div class="space-y-4">
                ${sectors.map(([sector, value], idx) => {
                    const pct = ((value / totalValue) * 100).toFixed(1);
                    const color = colors[idx % colors.length];
                    return `
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center space-x-2">
                                    <div class="h-3 w-3 rounded-full ${color}"></div>
                                    <p class="text-[13px] font-semibold text-gray-900">${sector}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[13px] font-bold text-gray-900">$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                                    <p class="text-[11px] text-gray-500">${pct}%</p>
                                </div>
                            </div>
                            <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div class="${color} h-full" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// ---------------------------------------------------------------------------
// Searchable Combobox (Autocomplete Dropdown)
// Vanilla JS implementation — no external library dependencies
// ---------------------------------------------------------------------------

export const renderSearchableCombobox = (id, options = [], iconClass = null, placeholder = "Search...") => {
    const optionsHtml = options.map((opt, idx) => 
        `<div class="combobox-option" data-value="${opt.value}" data-index="${idx}" role="option" tabindex="-1">
            ${opt.flag ? `<span class="mr-2">${opt.flag}</span>` : ''}
            <span class="combobox-option-text">${opt.label}</span>
        </div>`
    ).join('');

    return `
        <div class="combobox-wrapper relative" data-combobox-id="${id}">
            <!-- Input with icon -->
            <div class="relative">
                ${iconClass ? `<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><i class="${iconClass}"></i></span>` : ''}
                <input
                    id="${id}"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded="false"
                    aria-controls="${id}-listbox"
                    placeholder="${placeholder}"
                    class="w-full ${iconClass ? 'pl-9' : 'pl-4'} pr-4 py-3 rounded-xl border border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white combobox-input"
                >
            </div>

            <!-- Dropdown options -->
            <div
                id="${id}-listbox"
                role="listbox"
                class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-50 hidden max-h-60 overflow-y-auto combobox-listbox"
            >
                ${optionsHtml}
            </div>

            <!-- Hidden select for form submission (accessibility fallback) -->
            <select id="${id}-fallback" class="hidden" aria-hidden="true">
                <option value="">Select...</option>
                ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
        </div>
    `;
};