terraform {
  required_version = ">= 1.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Uncomment and use with -backend-config flag during init:
  # terraform init -backend-config="key=smartmoney/dev.tfstate" (or staging/prod)
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "stsmartmoneytfstate"
    container_name       = "tfstate"
    key                  = "smartmoney/state.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

# ── Resource Group ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_prefix}"
  location = var.location
  tags     = local.common_tags
}

# ── Modules ──────────────────────────────────────────────────────────────────

module "networking" {
  source = "./modules/networking"

  name_prefix                     = local.name_prefix
  location                        = azurerm_resource_group.main.location
  resource_group_name             = azurerm_resource_group.main.name
  tags                            = local.common_tags
  vnet_address_space              = var.vnet_address_space
  container_apps_subnet_prefix    = var.container_apps_subnet_prefix
  private_endpoints_subnet_prefix = var.private_endpoints_subnet_prefix
}

module "cosmosdb" {
  source = "./modules/cosmosdb"

  name_prefix                 = local.name_prefix
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  tags                        = local.common_tags
  serverless                  = var.cosmos_serverless
  consistency_level           = var.cosmos_consistency_level
  enable_free_tier            = var.cosmos_enable_free_tier
  private_endpoints_subnet_id = module.networking.private_endpoints_subnet_id
  vnet_id                     = module.networking.vnet_id
}

module "static_web_app" {
  source = "./modules/static_web_app"

  name_prefix         = local.name_prefix
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
  sku_tier            = var.swa_sku_tier
}

module "containers" {
  source = "./modules/containers"

  name_prefix              = local.name_prefix
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  tags                     = local.common_tags
  container_apps_subnet_id = module.networking.container_apps_subnet_id
  acr_sku                  = var.acr_sku

  api_image        = var.api_image
  api_cpu          = var.api_cpu
  api_memory       = var.api_memory
  api_min_replicas = var.api_min_replicas
  api_max_replicas = var.api_max_replicas
  api_target_port  = var.api_target_port

  worker_image        = var.worker_image
  worker_cpu          = var.worker_cpu
  worker_memory       = var.worker_memory
  worker_min_replicas = var.worker_min_replicas
  worker_max_replicas = var.worker_max_replicas

  cosmos_endpoint    = module.cosmosdb.endpoint
  cosmos_primary_key = module.cosmosdb.primary_key

  foundry_endpoint    = var.foundry_endpoint
  foundry_api_key     = var.foundry_api_key
  foundry_model       = var.foundry_model
  foundry_api_version = var.foundry_api_version
}

# Allow the API container app to pull images from ACR
resource "azurerm_role_assignment" "api_acr_pull" {
  scope                = module.containers.acr_resource_id
  role_definition_name = "AcrPull"
  principal_id         = module.containers.api_identity_principal_id
}

resource "azurerm_role_assignment" "worker_acr_pull" {
  scope                = module.containers.acr_resource_id
  role_definition_name = "AcrPull"
  principal_id         = module.containers.worker_identity_principal_id
}

# Allow API/Worker managed identities to access Cosmos DB data-plane
resource "azurerm_role_assignment" "api_cosmos_data_contributor" {
  scope                = module.cosmosdb.resource_id
  role_definition_name = "Cosmos DB Built-in Data Contributor"
  principal_id         = module.containers.api_identity_principal_id
}

resource "azurerm_role_assignment" "worker_cosmos_data_contributor" {
  scope                = module.cosmosdb.resource_id
  role_definition_name = "Cosmos DB Built-in Data Contributor"
  principal_id         = module.containers.worker_identity_principal_id
}