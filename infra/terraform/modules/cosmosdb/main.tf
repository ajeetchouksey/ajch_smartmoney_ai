resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# ── Cosmos DB Account ─────────────────────────────────────────────────────────

resource "azurerm_cosmosdb_account" "main" {
  # Name must be globally unique, 3–44 chars, lowercase alphanumeric + hyphens
  name                = "cosmos-${var.name_prefix}-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.resource_group_name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  tags                = var.tags

  free_tier_enabled = var.enable_free_tier
  minimal_tls_version = "Tls12"

  consistency_policy {
    consistency_level = var.consistency_level
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }

  dynamic "capabilities" {
    for_each = var.serverless ? [1] : []
    content {
      name = "EnableServerless"
    }
  }

  backup {
    type                = "Periodic"
    interval_in_minutes = 240
    retention_in_hours  = 8
    storage_redundancy  = "Local"
  }

  identity {
    type = "SystemAssigned"
  }
}

# ── SQL Database ──────────────────────────────────────────────────────────────

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "smartmoney"
  resource_group_name = var.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
}

# ── Containers ────────────────────────────────────────────────────────────────
# Map of container name → partition key path, mirroring src/data/*.json shapes

locals {
  containers = {
    users        = "/id"      # one document per user
    transactions = "/userId"  # all transactions for a user share a partition
    portfolio    = "/userId"  # portfolio summary per user
    insights     = "/userId"  # AI insights per user
  }
}

resource "azurerm_cosmosdb_sql_container" "containers" {
  for_each = local.containers

  name                  = each.key
  resource_group_name   = var.resource_group_name
  account_name          = azurerm_cosmosdb_account.main.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = each.value
  partition_key_version = 2

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }
  }
}

# ── Private Endpoint ──────────────────────────────────────────────────────────

resource "azurerm_private_dns_zone" "cosmos" {
  name                = "privatelink.documents.azure.com"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "cosmos" {
  name                  = "pdnslink-cosmos-${var.name_prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.cosmos.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

resource "azurerm_private_endpoint" "cosmos" {
  name                = "pe-cosmos-${var.name_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoints_subnet_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-cosmos-${var.name_prefix}"
    private_connection_resource_id = azurerm_cosmosdb_account.main.id
    subresource_names              = ["Sql"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "cosmos-dns-group"
    private_dns_zone_ids = [azurerm_private_dns_zone.cosmos.id]
  }
}
