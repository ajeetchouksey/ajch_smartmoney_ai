/*
  SmartMoney AI – Azure Blob Storage (Standard LRS)
  LRS = Locally Redundant Storage – lowest cost option (~$0.018/GB/month).
  Suitable for dev/non-critical file uploads.
*/

param appName string
param location string
param environment string

// Storage account names: lowercase, 3-24 chars, letters & digits only
var accountName = toLower(take(replace('${appName}st${environment}', '-', ''), 24))
var containerName = 'smartmoney-uploads'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: accountName
  location: location
  tags: {
    application: appName
    environment: environment
  }
  sku: {
    name: 'Standard_LRS'  // Cheapest redundancy option
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'          // Hot tier for frequently accessed uploads
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false  // No anonymous public access
    encryption: {
      services: {
        blob: { enabled: true }
        file: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource uploadContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: containerName
  properties: {
    publicAccess: 'None'
  }
}

var connectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${az.environment().suffixes.storage}'

output connectionString string = connectionString
output accountName string = storageAccount.name
output accountKey string = storageAccount.listKeys().keys[0].value
output containerName string = containerName
