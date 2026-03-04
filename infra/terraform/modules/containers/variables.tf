variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "location" {
  type        = string
  description = "Azure region."
}

variable "resource_group_name" {
  type        = string
  description = "Target resource group name."
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources."
  default     = {}
}

variable "container_apps_subnet_id" {
  type        = string
  description = "Subnet ID for the Container Apps Environment (delegated to Microsoft.App/environments)."
}

variable "acr_sku" {
  type        = string
  description = "Azure Container Registry SKU: Basic, Standard, or Premium."
  default     = "Basic"
}

# ── FastAPI ───────────────────────────────────────────────────────────────────

variable "api_image" {
  type        = string
  description = "Container image for the FastAPI service."
}

variable "api_cpu" {
  type        = number
  description = "vCPU allocation per API replica."
  default     = 0.5
}

variable "api_memory" {
  type        = string
  description = "Memory allocation per API replica."
  default     = "1Gi"
}

variable "api_min_replicas" {
  type        = number
  description = "Minimum API replica count."
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

# ── Worker ────────────────────────────────────────────────────────────────────

variable "worker_image" {
  type        = string
  description = "Container image for the background worker."
}

variable "worker_cpu" {
  type        = number
  description = "vCPU allocation per worker replica."
  default     = 0.25
}

variable "worker_memory" {
  type        = string
  description = "Memory allocation per worker replica."
  default     = "0.5Gi"
}

variable "worker_min_replicas" {
  type        = number
  description = "Minimum worker replica count."
  default     = 0
}

variable "worker_max_replicas" {
  type        = number
  description = "Maximum worker replica count."
  default     = 3
}

# ── Shared runtime config ─────────────────────────────────────────────────────

variable "cosmos_endpoint" {
  type        = string
  description = "Cosmos DB document endpoint URI."
}

variable "cosmos_primary_key" {
  type        = string
  description = "Cosmos DB primary key (stored as a Container App secret)."
  sensitive   = true
}

# ── Azure AI Foundry ──────────────────────────────────────────────────────────

variable "foundry_endpoint" {
  type        = string
  description = "Azure AI Foundry project endpoint URL."
  default     = ""
}

variable "foundry_model" {
  type        = string
  description = "AI model deployment name (e.g. gpt-4o-mini)."
  default     = "gpt-4o-mini"
}

variable "foundry_api_key" {
  type        = string
  description = "Azure AI Foundry API key."
  sensitive   = true
  default     = ""
}

variable "swa_hostname" {
  type        = string
  description = "Static Web App hostname (used for CORS allowed origins)."
  default     = ""
}
