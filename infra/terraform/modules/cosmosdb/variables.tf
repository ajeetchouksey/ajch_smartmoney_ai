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

variable "serverless" {
  type        = bool
  description = "Enable serverless mode. When false, throughput is managed per container."
  default     = true
}

variable "consistency_level" {
  type        = string
  description = "Default consistency level for the Cosmos DB account."
  default     = "Session"
}

variable "enable_free_tier" {
  type        = bool
  description = "Enable the Cosmos DB free tier (one account per subscription)."
  default     = false
}

variable "private_endpoints_subnet_id" {
  type        = string
  description = "Subnet ID where the Cosmos DB private endpoint will be placed."
}

variable "vnet_id" {
  type        = string
  description = "VNET ID for private DNS zone linking."
}
