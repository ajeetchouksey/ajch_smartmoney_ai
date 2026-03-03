// ai_settings.example.js
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE for local AI testing. Copy this file to ai_settings.js and fill in
// your values. ai_settings.js is gitignored — never commit the real file.
//
// How to set up:
//   1. cp src/js/ai/ai_settings.example.js src/js/ai/ai_settings.js
//   2. Fill in your Azure AI Foundry (or Azure OpenAI) endpoint and key below.
//   3. Run the app locally — AI Forecast will use these credentials directly.
//
// In production (Azure mode), the app calls /api/ai-forecast instead and this
// file is not used — credentials live in Azure App Settings on the server.
// ─────────────────────────────────────────────────────────────────────────────

export const AI_SETTINGS = {
    enabled: false, // set to true after filling in your details

    // Azure AI Foundry project endpoint
    // Found in: AI Foundry portal → your project → Overview → Endpoint
    endpoint: 'https://YOUR-FOUNDRY-PROJECT.services.ai.azure.com',

    // Model deployment name (e.g. 'gpt-4o', 'gpt-4o-mini')
    model: 'gpt-4o-mini',

    // API Key — Azure AI Foundry → your project → Keys and Endpoints
    api_key: 'YOUR_API_KEY_HERE',

    // Azure OpenAI API version
    api_version: '2024-08-01-preview'
};
