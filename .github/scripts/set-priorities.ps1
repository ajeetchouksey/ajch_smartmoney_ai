#!/usr/bin/env pwsh
# Sets Priority field on all SmartMoney GitHub Project items
# P0 = M0+M1 (March), P1 = M2 (April), P2 = M3+M4 (May)

$PROJECT_ID     = "PVT_kwHOBmF8RM4BQzwn"
$PRIORITY_FIELD = "PVTSSF_lAHOBmF8RM4BQzwnzg-0l3k"
$P0             = "79628723"
$P1             = "0a877460"
$P2             = "da944a9c"
$GH_TOKEN       = gh auth token
$GQL_URL        = "https://api.github.com/graphql"
$GQL_HEADERS    = @{ Authorization = "bearer $GH_TOKEN"; "Content-Type" = "application/json" }

function Invoke-GQL($query) {
    $bodyObj = @{ query = $query }
    $bodyJson = $bodyObj | ConvertTo-Json -Compress
    return Invoke-RestMethod -Uri $GQL_URL -Method Post -Headers $GQL_HEADERS -Body $bodyJson
}

# Fetch all items with milestone
$fetchQuery = '{node(id:"PVT_kwHOBmF8RM4BQzwn"){... on ProjectV2{items(first:100){nodes{id fieldValues(first:10){nodes{... on ProjectV2ItemFieldMilestoneValue{milestone{title}field{... on ProjectV2Field{name}}}}}}}}}}' 
$response = Invoke-GQL $fetchQuery
$items = $response.data.node.items.nodes

$count = 0; $errors = @()

foreach ($item in $items) {
    $ms = ($item.fieldValues.nodes | Where-Object { $_.PSObject.Properties.Name -contains "milestone" }).milestone.title

    $optId = if ($ms -match "\[M0\]|\[M1\]") { $P0 }
             elseif ($ms -match "\[M2\]")     { $P1 }
             else                              { $P2 }  # M3, M4, or no milestone

    $label = if ($optId -eq $P0) { "P0" } elseif ($optId -eq $P1) { "P1" } else { "P2" }
    $iid = $item.id

    $mut = "mutation{updateProjectV2ItemFieldValue(input:{projectId:`"$PROJECT_ID`",itemId:`"$iid`",fieldId:`"$PRIORITY_FIELD`",value:{singleSelectOptionId:`"$optId`"}}){projectV2Item{id}}}"
    $r = Invoke-GQL $mut
    $count++

    if ($r.errors) {
        $errors += "FAIL: $iid | $ms | $($r.errors[0].message)"
        Write-Host "FAIL #$count $label [$ms]" -ForegroundColor Red
    } else {
        Write-Host "OK   #$count $label [$ms]"
    }
}

Write-Host "`n=== Done: $count updated, $($errors.Count) errors ===" -ForegroundColor Cyan
if ($errors) { $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red } }
