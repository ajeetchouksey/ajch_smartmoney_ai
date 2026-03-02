/*
  SmartMoney AI – Main Bicep template
  Minimum-budget configuration:
    • Azure Static Web App  → Free (F1) tier
    • Azure Cosmos DB       → Serverless (no provisioned RU/s, pay-per-request)
    • Azure Blob Storage    → Standard LRS (cheapest redundancy)
    • Azure Container Apps  → Consumption plan (scale-to-zero)
    • Azure OpenAI          → Provisioned via existing resource or S0 tier
*/

targetScope = 'resourceGroup'

@description('Base name for all resources (lowercase, no spaces).')
param appName string = 'smartmoneyai'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Environment tag (dev / staging / prod).')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure OpenAI resource endpoint (existing resource).')
param openAiEndpoint string

@description('Azure OpenAI deployment name (e.g. gpt-4o-mini).')
param openAiDeploymentName string = 'gpt-4o-mini'

// ── Modules ──────────────────────────────────────────────────────────────────

module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'cosmosdb'
  params: {
    appName: appName
    location: location
    environment: environment
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    appName: appName
    location: location
    environment: environment
  }
}

module containerApp 'modules/containerapp.bicep' = {
  name: 'containerapp'
  params: {
    appName: appName
    location: location
    environment: environment
    cosmosEndpoint: cosmosDb.outputs.endpoint
    cosmosKey: cosmosDb.outputs.primaryKey
    storageConnectionString: storage.outputs.connectionString
    storageAccountName: storage.outputs.accountName
    storageAccountKey: storage.outputs.accountKey
    openAiEndpoint: openAiEndpoint
    openAiDeploymentName: openAiDeploymentName
  }
}

module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp'
  params: {
    appName: appName
    location: location
    environment: environment
    apiBackendResourceId: containerApp.outputs.containerAppResourceId
  }
}

// ── Outputs ──────────────────────────────────────────────────────────────────

output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output apiUrl string = containerApp.outputs.fqdn
output cosmosEndpoint string = cosmosDb.outputs.endpoint
output storageAccountName string = storage.outputs.accountName
