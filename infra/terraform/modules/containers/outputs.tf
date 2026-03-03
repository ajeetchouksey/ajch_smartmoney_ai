output "api_fqdn" {
  description = "Public FQDN of the FastAPI Container App (without https://)."
  value       = azurerm_container_app.api.latest_revision_fqdn
}

output "acr_login_server" {
  description = "Azure Container Registry login server."
  value       = azurerm_container_registry.main.login_server
}

output "acr_name" {
  description = "Azure Container Registry name."
  value       = azurerm_container_registry.main.name
}

output "acr_resource_id" {
  description = "Azure Container Registry resource ID."
  value       = azurerm_container_registry.main.id
}

output "container_app_environment_id" {
  description = "Resource ID of the Container Apps Environment."
  value       = azurerm_container_app_environment.main.id
}

output "api_identity_principal_id" {
  description = "Managed identity principal ID of the API Container App."
  value       = azurerm_container_app.api.identity[0].principal_id
}

output "worker_identity_principal_id" {
  description = "Managed identity principal ID of the Worker Container App."
  value       = azurerm_container_app.worker.identity[0].principal_id
}
