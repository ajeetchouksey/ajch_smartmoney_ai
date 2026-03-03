output "endpoint" {
  description = "Cosmos DB document endpoint URI."
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "primary_key" {
  description = "Cosmos DB primary read-write key."
  value       = azurerm_cosmosdb_account.main.primary_key
  sensitive   = true
}

output "account_name" {
  description = "Cosmos DB account name."
  value       = azurerm_cosmosdb_account.main.name
}

output "resource_id" {
  description = "Cosmos DB account resource ID."
  value       = azurerm_cosmosdb_account.main.id
}

output "principal_id" {
  description = "System-assigned managed identity principal ID."
  value       = azurerm_cosmosdb_account.main.identity[0].principal_id
}
