/*
  SmartMoney AI – Azure Container Apps (Consumption plan)
  Consumption plan = scale-to-zero, pay only for active CPU/memory.
  Minimum cost approach: 0 replicas when idle.
*/

param appName string
param location string
param environment string

// Secrets injected from other modules
param cosmosEndpoint string
param cosmosKey string
param storageConnectionString string
param storageAccountName string
param storageAccountKey string
param openAiEndpoint string
param openAiDeploymentName string

@secure()
param openAiApiKey string = ''  // Set via GitHub secret / Azure Key Vault reference

var envName = '${appName}-cae-${environment}'
var appResourceName = '${appName}-api-${environment}'

// ── Container Apps Environment (Consumption) ─────────────────────────────────
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-11-02-preview' = {
  name: envName
  location: location
  tags: {
    application: appName
    environment: environment
  }
  properties: {
    workloadProfiles: []  // Consumption-only (no dedicated workers = cheapest)
  }
}

// ── Container App ─────────────────────────────────────────────────────────────
resource apiApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: appResourceName
  location: location
  tags: {
    application: appName
    environment: environment
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        allowInsecure: false
        traffic: [
          { weight: 100, latestRevision: true }
        ]
      }
      secrets: [
        { name: 'cosmos-key',                  value: cosmosKey }
        { name: 'storage-connection-string',   value: storageConnectionString }
        { name: 'storage-account-key',         value: storageAccountKey }
        { name: 'openai-api-key',              value: openAiApiKey }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          // Replace with your ACR / Docker Hub image after first build
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.25')    // Minimum vCPU allocation
            memory: '0.5Gi'     // Minimum memory allocation
          }
          env: [
            { name: 'COSMOS_ENDPOINT',                    value: cosmosEndpoint }
            { name: 'COSMOS_KEY',                         secretRef: 'cosmos-key' }
            { name: 'COSMOS_DATABASE',                    value: 'smartmoney' }
            { name: 'COSMOS_CONTAINER',                   value: 'conversations' }
            { name: 'AZURE_STORAGE_CONNECTION_STRING',    secretRef: 'storage-connection-string' }
            { name: 'AZURE_STORAGE_ACCOUNT_NAME',         value: storageAccountName }
            { name: 'AZURE_STORAGE_ACCOUNT_KEY',          secretRef: 'storage-account-key' }
            { name: 'AZURE_STORAGE_CONTAINER',            value: 'smartmoney-uploads' }
            { name: 'AZURE_OPENAI_ENDPOINT',              value: openAiEndpoint }
            { name: 'AZURE_OPENAI_API_KEY',               secretRef: 'openai-api-key' }
            { name: 'AZURE_OPENAI_DEPLOYMENT_NAME',       value: openAiDeploymentName }
            { name: 'AZURE_OPENAI_API_VERSION',           value: '2024-02-01' }
          ]
        }
      ]
      scale: {
        minReplicas: 0  // Scale-to-zero when idle – key for minimum cost
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '20'
              }
            }
          }
        ]
      }
    }
  }
}

output fqdn string = 'https://${apiApp.properties.configuration.ingress.fqdn}'
output containerAppResourceId string = apiApp.id
output containerAppName string = apiApp.name
output containerAppsEnvName string = containerAppsEnv.name
