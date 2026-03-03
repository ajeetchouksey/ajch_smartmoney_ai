variable "name_prefix" {
  type        = string
  description = "Resource name prefix (e.g. smartmoney-dev-eus)."
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

variable "vnet_address_space" {
  type        = list(string)
  description = "VNET address space CIDR block(s)."
}

variable "container_apps_subnet_prefix" {
  type        = string
  description = "Subnet CIDR for Container Apps Environment (/21 minimum)."
}

variable "private_endpoints_subnet_prefix" {
  type        = string
  description = "Subnet CIDR for private endpoints."
}
