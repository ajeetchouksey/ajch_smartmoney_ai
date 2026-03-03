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

variable "sku_tier" {
  type        = string
  description = "Static Web App SKU tier: Free or Standard."
  default     = "Free"
}
