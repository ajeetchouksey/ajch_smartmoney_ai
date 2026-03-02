/*
  SmartMoney AI – Azure Static Web App (Free tier)
  Free tier supports custom domains, global CDN, and auth integration.
*/

param appName string
param location string
param environment string
@description('Azure resource ID of the Container App to link as the API backend.')
param apiBackendResourceId string

var resourceName = '${appName}-swa-${environment}'

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: resourceName
  location: location
  tags: {
    application: appName
    environment: environment
  }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Disabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'src'
    }
  }
}

// Link the FastAPI Container App as the backend API
resource apiLink 'Microsoft.Web/staticSites/linkedBackends@2023-01-01' = {
  parent: staticWebApp
  name: 'backend'
  properties: {
    backendResourceId: apiBackendResourceId
    region: location
  }
}

output defaultHostname string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppName string = staticWebApp.name
