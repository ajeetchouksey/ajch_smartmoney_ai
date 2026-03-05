#!/usr/bin/env pwsh
# Enriches SmartMoney project items with Size, Iteration, and Status values
# Run after set-priorities.ps1

$PROJECT_ID  = "PVT_kwHOBmF8RM4BQzwn"
$GH_TOKEN    = gh auth token
$GQL_URL     = "https://api.github.com/graphql"
$GQL_HEADERS = @{ Authorization = "bearer $GH_TOKEN"; "Content-Type" = "application/json" }

# ── Field IDs ──────────────────────────────────────────────────────────────────
$STATUS_FIELD     = "PVTSSF_lAHOBmF8RM4BQzwnzg-0lxE"
$SIZE_FIELD       = "PVTSSF_lAHOBmF8RM4BQzwnzg-0l3o"
$ITERATION_FIELD  = "PVTIF_lAHOBmF8RM4BQzwnzg-0l3w"

# ── Status option IDs ──────────────────────────────────────────────────────────
$STATUS_BACKLOG   = "f75ad846"
$STATUS_READY     = "e18bf179"
$STATUS_INPROG    = "47fc9ee4"

# ── Size option IDs ────────────────────────────────────────────────────────────
$SIZE_XS  = "911790be"  # XS — bug-fix / chore
$SIZE_S   = "b277fb01"  # S  — small task (< 0.5 day)
$SIZE_M   = "86db8eb3"  # M  — task (1-2 days)
$SIZE_L   = "853c8207"  # L  — feature (1 week)
$SIZE_XL  = "2d0801e2"  # XL — epic (multi-week)

# ── Iteration IDs ─────────────────────────────────────────────────────────────
$ITER1 = "381c7c80"   # 2026-03-04 .. 2026-03-17  (M0 — Foundation)
$ITER2 = "54cf5c95"   # 2026-03-18 .. 2026-03-31  (M1 — Live Dashboard)
$ITER3 = "d2c335bc"   # 2026-04-01 .. 2026-04-14  (M2 early)
$ITER4 = "b6a8f1bb"   # 2026-04-15 .. 2026-04-28  (M2 late / M3 early)
$ITER5 = "955c1297"   # 2026-04-29 .. 2026-05-12  (M3 / M4 early)

function Invoke-GQL($q) {
    $b = (@{ query = $q } | ConvertTo-Json -Compress)
    return Invoke-RestMethod -Uri $GQL_URL -Method Post -Headers $GQL_HEADERS -Body $b
}

function Set-Field($itemId, $fieldId, $singleSelectId) {
    $mut = "mutation{updateProjectV2ItemFieldValue(input:{projectId:`"$PROJECT_ID`",itemId:`"$itemId`",fieldId:`"$fieldId`",value:{singleSelectOptionId:`"$singleSelectId`"}}){projectV2Item{id}}}"
    $r = Invoke-GQL $mut
    return -not $r.errors
}

function Set-IterationField($itemId, $iterationId) {
    $mut = "mutation{updateProjectV2ItemFieldValue(input:{projectId:`"$PROJECT_ID`",itemId:`"$itemId`",fieldId:`"$ITERATION_FIELD`",value:{iterationId:`"$iterationId`"}}){projectV2Item{id}}}"
    $r = Invoke-GQL $mut
    return -not $r.errors
}

# ── Fetch all items with labels and milestone ─────────────────────────────────
$fetchQ = '{node(id:"PVT_kwHOBmF8RM4BQzwn"){... on ProjectV2{items(first:100){nodes{id content{... on Issue{number title labels(first:5){nodes{name}}}}fieldValues(first:15){nodes{... on ProjectV2ItemFieldMilestoneValue{milestone{title}field{... on ProjectV2Field{name}}}... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2SingleSelectField{name}}}... on ProjectV2ItemFieldIterationValue{iterationId field{... on ProjectV2IterationField{name}}}}}}}}}}' 
$resp = Invoke-GQL $fetchQ
$items = $resp.data.node.items.nodes

Write-Host "Processing $($items.Count) items..." -ForegroundColor Cyan

$ok = 0; $fail = 0

foreach ($item in $items) {
    $iid        = $item.id
    $issueNum   = $item.content.number
    $labels     = $item.content.labels.nodes.name
    $fv         = $item.fieldValues.nodes
    $ms         = ($fv | Where-Object { $_.PSObject.Properties.Name -contains "milestone" }).milestone.title
    $curStatus  = ($fv | Where-Object { $_.field.name -eq "Status" }).name
    $curIter    = ($fv | Where-Object { $_.PSObject.Properties.Name -contains "iterationId" }).iterationId

    # ── Determine Size ────────────────────────────────────────────────────────
    $sizeId = if ($labels -contains "epic")    { $SIZE_XL }
              elseif ($labels -contains "feature") { $SIZE_L }
              elseif ($labels -contains "task")    { $SIZE_M }
              else                                 { $SIZE_M }

    # ── Determine Iteration ───────────────────────────────────────────────────
    $iterationId = if    ($ms -match "\[M0\]") { $ITER1 }
                   elseif($ms -match "\[M1\]") { $ITER2 }
                   elseif($ms -match "\[M2\]") { $ITER3 }
                   elseif($ms -match "\[M3\]") { $ITER4 }
                   else                         { $ITER5 }  # M4 or none

    # ── Determine Status ──────────────────────────────────────────────────────
    # M0 items → Ready (they're in current sprint, need action now)
    # M1 items → Ready (next sprint, queued up)
    # M2+ items → keep Backlog
    $statusId = if ($ms -match "\[M0\]|\[M1\]") { $STATUS_READY } else { $STATUS_BACKLOG }

    # ── Apply: Size ───────────────────────────────────────────────────────────
    $s1 = Set-Field $iid $SIZE_FIELD $sizeId

    # ── Apply: Iteration (only if not already set) ────────────────────────────
    $s2 = if (-not $curIter) { Set-IterationField $iid $iterationId } else { $true }

    # ── Apply: Status (only change if currently Backlog + should be Ready) ────
    $s3 = if ($statusId -eq $STATUS_READY -and $curStatus -eq "Backlog") {
              Set-Field $iid $STATUS_FIELD $statusId
          } else { $true }

    $sizeLabel = switch ($sizeId) { $SIZE_XL{"XL"} $SIZE_L{"L"} $SIZE_M{"M"} $SIZE_S{"S"} default{"XS"} }
    $iterLabel = switch ($iterationId) { $ITER1{"I1"} $ITER2{"I2"} $ITER3{"I3"} $ITER4{"I4"} default{"I5"} }
    $stLabel   = if ($statusId -eq $STATUS_READY) { "Ready" } else { "Backlog" }

    if ($s1 -and $s2 -and $s3) {
        Write-Host "OK  #$issueNum | Size=$sizeLabel | Iter=$iterLabel | Status=$stLabel"
        $ok++
    } else {
        Write-Host "FAIL #$issueNum (size=$s1, iter=$s2, status=$s3)" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`n=== Done: $ok OK, $fail FAIL ===" -ForegroundColor Cyan
