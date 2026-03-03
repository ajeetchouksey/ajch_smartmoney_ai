output "default_hostname" {
  description = "Default hostname of the Static Web App (without https://)."
  value       = azurerm_static_web_app.main.default_host_name
}

output "api_key" {
  description = "Deployment token used by CI/CD pipelines to publish the site."
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "resource_id" {
  description = "Static Web App resource ID."
  value       = azurerm_static_web_app.main.id
}
