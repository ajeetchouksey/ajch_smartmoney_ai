# ── SmartMoney AI — Staging Environment ──────────────────────────────────────
# Apply: terraform apply -var-file="environments/staging.tfvars"

project        = "smartmoney"
environment    = "staging"
location       = "eastus"
location_short = "eus"

# Networking — separate /16 from dev
vnet_address_space              = ["10.1.0.0/16"]
container_apps_subnet_prefix    = "10.1.0.0/21"
private_endpoints_subnet_prefix = "10.1.8.0/24"

# Cosmos DB — provisioned throughput (set at container level), no free tier
cosmos_serverless        = false
cosmos_consistency_level = "Session"
cosmos_enable_free_tier  = false

# Static Web App — Standard enables custom domains + pre-prod environments
swa_sku_tier = "Standard"

# Container Registry
acr_sku = "Standard"

# FastAPI — keep at least 1 warm replica in staging
api_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
api_cpu          = 0.5
api_memory       = "1Gi"
api_min_replicas = 1
api_max_replicas = 5
api_target_port  = 8000

# Worker
worker_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
worker_cpu          = 0.5
worker_memory       = "1Gi"
worker_min_replicas = 0
worker_max_replicas = 3
