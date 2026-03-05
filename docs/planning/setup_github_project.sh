#!/usr/bin/env bash
# =============================================================================
# SmartMoney AI – GitHub Project bootstrap script
#
# Prerequisites:
#   - GitHub CLI (gh) v2.40+  →  https://cli.github.com/
#   - Authenticated:  gh auth login
#   - jq installed:   apt install jq  /  brew install jq
#
# Usage:
#   chmod +x docs/planning/setup_github_project.sh
#   ./docs/planning/setup_github_project.sh
#
# What this script does:
#   1. Creates all required labels (priority + iteration + type labels)
#   2. Creates GitHub Issues for every backlog item in backlog.json
#      (skips items that are already "done")
#   3. Creates a GitHub Project (Projects v2) linked to the repo
#   4. Adds the issues to the project
#   5. Creates project custom fields: Priority, Iteration, Type, Status
#
# Notes:
#   - Done items (iterations 0 and 1) are created as closed issues so they
#     appear in the project history but don't clutter the active backlog.
#   - Re-running the script is safe: existing issues/labels are detected and
#     skipped.
# =============================================================================

set -euo pipefail

REPO="ajeetchouksey/ajch_smartmoney_ai"
BACKLOG_FILE="$(dirname "$0")/backlog.json"
PROJECT_TITLE="SmartMoney AI – Product Roadmap"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { echo -e "\033[34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[32m[OK]\033[0m    $*"; }
warn()  { echo -e "\033[33m[WARN]\033[0m  $*"; }
die()   { echo -e "\033[31m[ERROR]\033[0m $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
command -v gh  >/dev/null 2>&1 || die "GitHub CLI (gh) not found. Install from https://cli.github.com/"
command -v jq  >/dev/null 2>&1 || die "jq not found. Install with: apt install jq / brew install jq"
[[ -f "$BACKLOG_FILE" ]]        || die "backlog.json not found at: $BACKLOG_FILE"

gh auth status >/dev/null 2>&1  || die "Not authenticated. Run: gh auth login"

info "Repository : $REPO"
info "Backlog    : $BACKLOG_FILE"

# ---------------------------------------------------------------------------
# Step 1 – Create labels
# ---------------------------------------------------------------------------
info "Step 1/5 – Creating labels..."

create_label() {
  local name="$1" color="$2" description="$3"
  if gh label list --repo "$REPO" --json name --jq '.[].name' | grep -qx "$name"; then
    warn "  Label already exists: $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$description" 2>/dev/null \
      && ok "  Created label: $name" \
      || warn "  Could not create label: $name"
  fi
}

# Priority labels
create_label "P0" "B60205" "Must-have blocker"
create_label "P1" "E4E669" "Must-have for iteration goal"
create_label "P2" "0075CA" "Should-have"
create_label "P3" "CFD3D7" "Nice-to-have"

# Type labels
create_label "Feature"         "A2EEEF" "New user-facing capability"
create_label "Task"            "E4E669" "Engineering or operational work"
create_label "Bug"             "D93F0B" "Something broken"
create_label "security"        "B60205" "Security fix or hardening"

# Iteration labels
create_label "iteration-0" "F9D0C4" "Iteration 0 – Foundation"
create_label "iteration-1" "FEF2C0" "Iteration 1 – Core AI & Storage"
create_label "iteration-2" "C5DEF5" "Iteration 2 – Authentication & Security"
create_label "iteration-3" "BFD4F2" "Iteration 3 – Expense Intelligence"
create_label "iteration-4" "D4C5F9" "Iteration 4 – Budgeting"
create_label "iteration-5" "E6F6D0" "Iteration 5 – Insights & Polish"

# Domain labels
create_label "infrastructure"  "0E8A16" "Azure infra / Bicep / IaC"
create_label "ci-cd"           "0E8A16" "CI/CD pipeline"
create_label "backend"         "1D76DB" "FastAPI / Python"
create_label "frontend"        "1D76DB" "Static Web App / JS"
create_label "ai"              "6F42C1" "Azure OpenAI integration"
create_label "database"        "E4E669" "Cosmos DB"
create_label "storage"         "E4E669" "Azure Blob Storage"
create_label "auth"            "B60205" "Authentication / authorisation"
create_label "notifications"   "0075CA" "Alerts and notifications"

ok "Labels done."

# ---------------------------------------------------------------------------
# Step 2 – Create GitHub Issues from backlog.json
# ---------------------------------------------------------------------------
info "Step 2/5 – Creating issues..."

declare -A ISSUE_NUMBERS  # id -> issue number

iterations=$(jq -c '.iterations[]' "$BACKLOG_FILE")

while IFS= read -r iteration; do
  iter_id=$(echo "$iteration" | jq -r '.id')
  iter_status=$(echo "$iteration" | jq -r '.status')

  items=$(echo "$iteration" | jq -c '.items[]')
  while IFS= read -r item; do
    item_id=$(echo "$item" | jq -r '.id')
    title=$(echo "$item"   | jq -r '.title')
    body=$(echo "$item"    | jq -r '.body')
    item_status=$(echo "$item" | jq -r '.status')
    labels_json=$(echo "$item" | jq -r '.labels | join(",")')

    # Check if an issue with this title already exists
    existing=$(gh issue list --repo "$REPO" --search "\"$title\" in:title" \
               --json number,title --jq ".[] | select(.title == \"$title\") | .number" 2>/dev/null | head -1)

    if [[ -n "$existing" ]]; then
      warn "  Issue already exists (#$existing): $title"
      ISSUE_NUMBERS["$item_id"]="$existing"
    else
      # Create the issue
      extra_flags=""
      if [[ "$item_status" == "done" ]]; then
        # Create and immediately close done items
        issue_num=$(gh issue create \
          --repo "$REPO" \
          --title "$title" \
          --body "$body" \
          --label "$labels_json" \
          --json number --jq '.number')
        gh issue close "$issue_num" --repo "$REPO" --comment "Completed in iteration $iter_id." >/dev/null
        ok "  Created + closed issue #$issue_num: $title"
      else
        issue_num=$(gh issue create \
          --repo "$REPO" \
          --title "$title" \
          --body "$body" \
          --label "$labels_json" \
          --json number --jq '.number')
        ok "  Created issue #$issue_num: $title"
      fi
      ISSUE_NUMBERS["$item_id"]="$issue_num"
    fi
  done <<< "$items"
done <<< "$iterations"

ok "Issues done."

# ---------------------------------------------------------------------------
# Step 3 – Create or find the GitHub Project (Projects v2)
# ---------------------------------------------------------------------------
info "Step 3/5 – Creating GitHub Project..."

OWNER=$(echo "$REPO" | cut -d/ -f1)

existing_project_id=$(gh project list --owner "$OWNER" --format json \
  --jq ".projects[] | select(.title == \"$PROJECT_TITLE\") | .id" 2>/dev/null | head -1)

if [[ -n "$existing_project_id" ]]; then
  warn "  Project already exists (id=$existing_project_id): $PROJECT_TITLE"
  PROJECT_ID="$existing_project_id"
else
  PROJECT_ID=$(gh project create \
    --owner "$OWNER" \
    --title "$PROJECT_TITLE" \
    --format json --jq '.id')
  ok "  Created project (id=$PROJECT_ID): $PROJECT_TITLE"
fi

# Link the project to the repository
gh project link "$PROJECT_ID" --owner "$OWNER" --repo "$REPO" 2>/dev/null \
  && ok "  Linked project to $REPO" \
  || warn "  Could not link project (may already be linked)"

# ---------------------------------------------------------------------------
# Step 4 – Add issues to the project
# ---------------------------------------------------------------------------
info "Step 4/5 – Adding issues to project..."

for item_id in "${!ISSUE_NUMBERS[@]}"; do
  issue_num="${ISSUE_NUMBERS[$item_id]}"
  # Resolve full issue URL
  issue_url="https://github.com/$REPO/issues/$issue_num"
  gh project item-add "$PROJECT_ID" --owner "$OWNER" --url "$issue_url" 2>/dev/null \
    && ok "  Added #$issue_num to project" \
    || warn "  Could not add #$issue_num (may already be in project)"
done

ok "Issues added to project."

# ---------------------------------------------------------------------------
# Step 5 – Create custom fields
# ---------------------------------------------------------------------------
info "Step 5/5 – Note: custom field creation requires GitHub Projects API (GraphQL)."
info "  Run the following gh GraphQL snippets to add fields if they don't exist:"

cat <<'GRAPHQL'

# Add "Priority" single-select field
gh api graphql -f query='
mutation {
  addProjectV2Field(input: {
    projectId: "PROJECT_NODE_ID"
    dataType: SINGLE_SELECT
    name: "Priority"
  }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } }
}'

# Add "Iteration" field
gh api graphql -f query='
mutation {
  addProjectV2Field(input: {
    projectId: "PROJECT_NODE_ID"
    dataType: ITERATION
    name: "Iteration"
  }) { projectV2Field { ... on ProjectV2IterationField { id name } } }
}'

# Add "Type" single-select field
gh api graphql -f query='
mutation {
  addProjectV2Field(input: {
    projectId: "PROJECT_NODE_ID"
    dataType: SINGLE_SELECT
    name: "Type"
  }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } }
}'

GRAPHQL

info "  Replace PROJECT_NODE_ID with the node ID from:"
info "    gh project view $PROJECT_ID --owner $OWNER --format json --jq '.nodeId'"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
ok "Bootstrap complete!"
echo ""
echo "  Project URL: https://github.com/orgs/$OWNER/projects"
echo ""
echo "  Recommended views to create in the project UI:"
echo "    • Board  – group by Status (Todo / In Progress / Done)"
echo "    • Table  – group by Iteration, sort by Priority"
echo "    • Roadmap – timeline per iteration (add start/end date fields)"
echo "============================================================"
