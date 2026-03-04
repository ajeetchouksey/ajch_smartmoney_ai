// api_config.example.js
// ─────────────────────────────────────────────────────────────────────────────
// Template for the Container App API base URL.
// In production this file is generated automatically by the deploy-frontend
// workflow after Terraform outputs the Container App FQDN.
//
// For local development you do NOT need this file — ai_settings.js handles
// direct Azure AI Foundry calls instead.
// ─────────────────────────────────────────────────────────────────────────────

// Set by CI/CD — do not edit manually.
export const AI_API_BASE_URL = '';
