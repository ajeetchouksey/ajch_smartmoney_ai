# ── SmartMoney AI — Dev Environment ──────────────────────────────────────────
# Apply: terraform apply -var-file="environments/dev.tfvars"

project        = "smartmoney"
environment    = "dev"
location       = "eastus"
location_short = "eus"

# Networking — isolated /16 per environment to avoid CIDR conflicts
vnet_address_space              = ["10.0.0.0/16"]
container_apps_subnet_prefix    = "10.0.0.0/21"   # /21 minimum for Container Apps
private_endpoints_subnet_prefix = "10.0.8.0/24"

# Cosmos DB — serverless + free tier keeps dev cost at near zero
cosmos_serverless        = true
cosmos_consistency_level = "Session"
cosmos_enable_free_tier  = true

# Static Web App — Free tier is enough for dev previews
swa_sku_tier = "Free"

# Container Registry
acr_sku = "Basic"

# FastAPI — scale to zero when idle
api_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
api_cpu          = 0.5
api_memory       = "1Gi"
api_min_replicas = 0
api_max_replicas = 3
api_target_port  = 8000

# Worker — scale to zero when no jobs queued
worker_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
worker_cpu          = 0.25
worker_memory       = "0.5Gi"
worker_min_replicas = 0
worker_max_replicas = 2

# Azure AI Foundry — fill in after creating your Foundry project
# foundry_endpoint    = "https://YOUR-PROJECT.services.ai.azure.com"
# foundry_model       = "gpt-4o-mini"
# foundry_api_version = "2024-08-01-preview"
# foundry_api_key is set via TF_VAR_foundry_api_key env var — never commit it
