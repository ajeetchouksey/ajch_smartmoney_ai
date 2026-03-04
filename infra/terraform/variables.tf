# ── Project identity ─────────────────────────────────────────────────────────

variable "project" {
  type        = string
  description = "Short project name used as a prefix in every resource name."
  default     = "smartmoney"
}

variable "environment" {
  type        = string
  description = "Deployment environment: dev, staging, or prod."
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "location" {
  type        = string
  description = "Azure region for all resources."
  default     = "eastus2"
}

variable "location_short" {
  type        = string
  description = "Short region code used in resource names (e.g. eus, wus2, neu)."
  default     = "eus"
}

# ── Networking ───────────────────────────────────────────────────────────────

variable "vnet_address_space" {
  type        = list(string)
  description = "VNET address space CIDR block(s)."
  default     = ["10.0.0.0/16"]
}

variable "container_apps_subnet_prefix" {
  type        = string
  description = "Subnet CIDR for the Container Apps Environment (/21 minimum)."
  default     = "10.0.0.0/21"
}

variable "private_endpoints_subnet_prefix" {
  type        = string
  description = "Subnet CIDR for private endpoints (CosmosDB, etc.)."
  default     = "10.0.8.0/24"
}

# ── Cosmos DB ────────────────────────────────────────────────────────────────

variable "cosmos_serverless" {
  type        = bool
  description = "Enable serverless mode for Cosmos DB. Overrides provisioned throughput."
  default     = true
}

variable "cosmos_consistency_level" {
  type        = string
  description = "Default consistency level: Eventual, Session, BoundedStaleness, Strong, ConsistentPrefix."
  default     = "Session"
}

variable "cosmos_enable_free_tier" {
  type        = bool
  description = "Enable the Cosmos DB free tier (limit: one account per subscription)."
  default     = false
}

# ── Static Web App ───────────────────────────────────────────────────────────

variable "swa_sku_tier" {
  type        = string
  description = "Static Web App SKU: Free or Standard."
  default     = "Free"
  validation {
    condition     = contains(["Free", "Standard"], var.swa_sku_tier)
    error_message = "swa_sku_tier must be Free or Standard."
  }
}

# ── Container Registry ───────────────────────────────────────────────────────

variable "acr_sku" {
  type        = string
  description = "Azure Container Registry SKU: Basic, Standard, or Premium."
  default     = "Basic"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "acr_sku must be Basic, Standard, or Premium."
  }
}

# ── Container Apps — FastAPI ─────────────────────────────────────────────────

variable "api_image" {
  type        = string
  description = "Container image for the FastAPI service (repository/image:tag)."
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "api_cpu" {
  type        = number
  description = "vCPU allocation for each API replica."
  default     = 0.5
}

variable "api_memory" {
  type        = string
  description = "Memory allocation for each API replica (e.g. '1Gi')."
  default     = "1Gi"
}

variable "api_min_replicas" {
  type        = number
  description = "Minimum API replica count (0 = scale to zero)."
  default     = 0
}

variable "api_max_replicas" {
  type        = number
  description = "Maximum API replica count."
  default     = 5
}

variable "api_target_port" {
  type        = number
  description = "Port the FastAPI container listens on."
  default     = 8000
}

# ── Container Apps — Worker ──────────────────────────────────────────────────

variable "worker_image" {
  type        = string
  description = "Container image for the background worker (repository/image:tag)."
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "worker_cpu" {
  type        = number
  description = "vCPU allocation for each worker replica."
  default     = 0.25
}

variable "worker_memory" {
  type        = string
  description = "Memory allocation for each worker replica (e.g. '0.5Gi')."
  default     = "0.5Gi"
}

variable "worker_min_replicas" {
  type        = number
  description = "Minimum worker replica count (0 = scale to zero when idle)."
  default     = 0
}

variable "worker_max_replicas" {
  type        = number
  description = "Maximum worker replica count."
  default     = 3
}
