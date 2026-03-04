resource "random_string" "acr_suffix" {
  length  = 4
  special = false
  upper   = false
}

# ── Container Registry ────────────────────────────────────────────────────────

resource "azurerm_container_registry" "main" {
  # ACR names: alphanumeric only, 5–50 chars
  name                = "acr${replace(var.name_prefix, "-", "")}${random_string.acr_suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.acr_sku
  admin_enabled       = false
  tags                = var.tags

  identity {
    type = "SystemAssigned"
  }
}

# ── Log Analytics (Container Apps telemetry) ──────────────────────────────────

resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${var.name_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

# ── Container Apps Environment (VNET-injected) ────────────────────────────────

resource "azurerm_container_app_environment" "main" {
  name                           = "cae-${var.name_prefix}"
  location                       = var.location
  resource_group_name            = var.resource_group_name
  log_analytics_workspace_id     = azurerm_log_analytics_workspace.main.id
  infrastructure_subnet_id       = var.container_apps_subnet_id
  internal_load_balancer_enabled = false
  tags                           = var.tags
}

# ── FastAPI Container App ─────────────────────────────────────────────────────

resource "azurerm_container_app" "api" {
  name                         = "ca-api-${var.name_prefix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type = "SystemAssigned"
  }

  # Sensitive values stored as secrets — referenced by env blocks below
  secret {
    name  = "cosmos-key"
    value = var.cosmos_primary_key
  }

  dynamic "secret" {
    for_each = var.foundry_api_key != "" ? ["enabled"] : []
    content {
      name  = "foundry-api-key"
      value = var.foundry_api_key
    }
  }

  ingress {
    external_enabled = true
    target_port      = var.api_target_port

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = var.api_min_replicas
    max_replicas = var.api_max_replicas

    container {
      name   = "api"
      image  = var.api_image
      cpu    = var.api_cpu
      memory = var.api_memory

      env {
        name  = "COSMOS_ENDPOINT"
        value = var.cosmos_endpoint
      }

      env {
        name        = "COSMOS_KEY"
        secret_name = "cosmos-key"
      }

      env {
        name  = "APP_ENV"
        value = "production"
      }

      env {
        name  = "FOUNDRY_PROJECT_ENDPOINT"
        value = var.foundry_endpoint
      }

      env {
        name  = "FOUNDRY_MODEL_DEPLOYMENT_NAME"
        value = var.foundry_model
      }

      env {
        name  = "FOUNDRY_API_VERSION"
        value = var.foundry_api_version
      }

      dynamic "env" {
        for_each = var.foundry_api_key != "" ? ["enabled"] : []
        content {
          name        = "FOUNDRY_API_KEY"
          secret_name = "foundry-api-key"
        }
      }
    }

    # Scale on concurrent HTTP requests
    http_scale_rule {
      name                = "http-scale"
      concurrent_requests = "10"
    }
  }
}

# ── Worker Container App ──────────────────────────────────────────────────────

resource "azurerm_container_app" "worker" {
  name                         = "ca-worker-${var.name_prefix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type = "SystemAssigned"
  }

  secret {
    name  = "cosmos-key"
    value = var.cosmos_primary_key
  }

  dynamic "secret" {
    for_each = var.foundry_api_key != "" ? ["enabled"] : []
    content {
      name  = "foundry-api-key"
      value = var.foundry_api_key
    }
  }

  # No ingress — worker is internal only
  template {
    min_replicas = var.worker_min_replicas
    max_replicas = var.worker_max_replicas

    container {
      name   = "worker"
      image  = var.worker_image
      cpu    = var.worker_cpu
      memory = var.worker_memory

      env {
        name  = "COSMOS_ENDPOINT"
        value = var.cosmos_endpoint
      }

      env {
        name        = "COSMOS_KEY"
        secret_name = "cosmos-key"
      }

      env {
        name  = "WORKER_MODE"
        value = "background"
      }

      env {
        name  = "APP_ENV"
        value = "production"
      }

      env {
        name  = "FOUNDRY_PROJECT_ENDPOINT"
        value = var.foundry_endpoint
      }

      env {
        name  = "FOUNDRY_MODEL_DEPLOYMENT_NAME"
        value = var.foundry_model
      }

      env {
        name  = "FOUNDRY_API_VERSION"
        value = var.foundry_api_version
      }

      dynamic "env" {
        for_each = var.foundry_api_key != "" ? ["enabled"] : []
        content {
          name        = "FOUNDRY_API_KEY"
          secret_name = "foundry-api-key"
        }
      }
    }
  }
}
