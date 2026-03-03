output "resource_group_name" {
  description = "Name of the deployed resource group."
  value       = azurerm_resource_group.main.name
}

output "vnet_id" {
  description = "Resource ID of the virtual network."
  value       = module.networking.vnet_id
}

output "static_web_app_url" {
  description = "Default hostname of the Static Web App."
  value       = "https://${module.static_web_app.default_hostname}"
}

output "static_web_app_api_key" {
  description = "Deployment token for the Static Web App (used by CI/CD)."
  value       = module.static_web_app.api_key
  sensitive   = true
}

output "api_url" {
  description = "Public FQDN of the FastAPI Container App."
  value       = "https://${module.containers.api_fqdn}"
}

output "acr_login_server" {
  description = "Azure Container Registry login server."
  value       = module.containers.acr_login_server
}

output "acr_name" {
  description = "Azure Container Registry name."
  value       = module.containers.acr_name
}

output "cosmos_endpoint" {
  description = "Cosmos DB document endpoint URI."
  value       = module.cosmosdb.endpoint
}

output "cosmos_account_name" {
  description = "Cosmos DB account name."
  value       = module.cosmosdb.account_name
}
