# ── SmartMoney AI — Production Environment ───────────────────────────────────
# Apply: terraform apply -var-file="environments/prod.tfvars"

project        = "smartmoney"
environment    = "prod"
location       = "eastus"
location_short = "eus"

# Networking — isolated /16 for production
vnet_address_space              = ["10.2.0.0/16"]
container_apps_subnet_prefix    = "10.2.0.0/21"
private_endpoints_subnet_prefix = "10.2.8.0/24"

# Cosmos DB — BoundedStaleness for stronger guarantees across reads
cosmos_serverless        = false
cosmos_consistency_level = "BoundedStaleness"
cosmos_enable_free_tier  = false

# Static Web App — Standard required for production custom domain + SLA
swa_sku_tier = "Standard"

# Container Registry — Premium enables geo-replication and content trust
acr_sku = "Premium"

# FastAPI — minimum 2 replicas for HA; scale up to 10 under load
api_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
api_cpu          = 1.0
api_memory       = "2Gi"
api_min_replicas = 2
api_max_replicas = 10
api_target_port  = 8000

# Worker — always keep 1 warm; burst to 5 during peak
worker_image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
worker_cpu          = 0.5
worker_memory       = "1Gi"
worker_min_replicas = 1
worker_max_replicas = 5
