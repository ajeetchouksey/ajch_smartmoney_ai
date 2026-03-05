# SmartMoney AI — GitHub Project Views Setup

> **Project:** [SmartMoney #11](https://github.com/users/ajeetchouksey/projects/11)  
> **Total items:** 59 (57 issues + 2 open PRs)  
> **Fields auto-configured via script:** Priority · Size · Iteration · Status

---

## Field Reference

| Field | ID | Values |
|---|---|---|
| **Status** | `PVTSSF_...0lxE` | Backlog · Ready · In Progress · In Review · Done |
| **Priority** | `PVTSSF_...0l3k` | 🔴 P0 · 🟠 P1 · 🟡 P2 |
| **Size** | `PVTSSF_...0l3o` | XS · S · M · L · XL |
| **Iteration** | `PVTIF_...0l3w` | Iter 1–5 (2-week sprints) |
| **Start Date / End Date** | date fields | Set per issue |
| **Parent Issue** | system field | Links tasks → features → epics |
| **Sub-issues Progress** | system field | % completion badges on epics |

## Priority Assignment Logic

| Milestone | Due | Priority | Iteration |
|---|---|---|---|
| [M0] Foundation Complete | Mar 14 | **P0** 🔴 | Iteration 1 (Mar 4–17) |
| [M1] MVP Core – Live Dashboard | Mar 28 | **P0** 🔴 | Iteration 2 (Mar 18–31) |
| [M2] AI Engine – Forecast & Insights | Apr 18 | **P1** 🟠 | Iteration 3 (Apr 1–14) |
| [M3] Multi-Currency Intelligence | May 2 | **P2** 🟡 | Iteration 4 (Apr 15–28) |
| [M4] Income Depth & Launch Polish | May 23 | **P2** 🟡 | Iteration 5 (Apr 29–May 12) |

## Size Assignment Logic

| Label | Size | Rationale |
|---|---|---|
| `epic` | **XL** | Multi-week grouping of multiple features |
| `feature` | **L** | ~1 week of frontend/backend work |
| `task` | **M** | 1–2 day focused task |
| `bug` / other | **XS–S** | Small targeted fix |

---

## View Configuration Guide

The GitHub Projects v2 API does not expose view creation/update mutations.  
Configure each view manually at: **Project → Views → Add View / Edit View**

---

### View 1 — Current Iteration *(Board)*

**Purpose:** Active sprint board — what the team is working on this 2-week cycle.

| Setting | Value |
|---|---|
| Layout | **Board** |
| Group by | **Status** (Backlog → Ready → In Progress → In Review → Done) |
| Filter | `iteration:@current` |
| Visible fields | Title, Assignee, Priority, Size, Labels |
| Sort | Priority (P0 first) |

---

### View 2 — Next Iteration *(Board)*

**Purpose:** Plan the upcoming sprint — items ready to be pulled in.

| Setting | Value |
|---|---|
| Layout | **Board** |
| Group by | **Status** |
| Filter | `iteration:@next` |
| Visible fields | Title, Assignee, Priority, Size |

---

### View 3 — Prioritized Backlog *(Table)*

**Purpose:** Full ordered backlog sorted by priority and milestone for sprint planning.

| Setting | Value |
|---|---|
| Layout | **Table** |
| Sort | Priority (P0 → P2), then Milestone |
| Group by | **Priority** |
| Visible fields | Title, Status, Priority, Size, Milestone, Iteration, Labels |
| Filter | *(none — show all)* |

**Column order:** Title · Status · Priority · Size · Milestone · Iteration · Sub-issues Progress · Start Date · End Date

---

### View 4 — Roadmap *(Roadmap)*

**Purpose:** Timeline view of all work plotted against start/end dates.

| Setting | Value |
|---|---|
| Layout | **Roadmap** |
| Date field (start) | **Start Date** |
| Date field (end) | **End Date** |
| Group by | **Milestone** |
| Zoom | Month |
| Visible fields | Title, Priority, Size |

---

### View 5 — Milestone Roadmap *(Roadmap)*  ← *renamed from "In Review"*

**Purpose:** High-level epic-level roadmap grouped by milestone phase.

| Setting | Value |
|---|---|
| Layout | **Roadmap** |
| Filter | `label:epic` |
| Date field (start) | **Start Date** |
| Date field (end) | **End Date** |
| Group by | **Milestone** |
| Zoom | Month |

---

### View 6 — My Items *(Table)*

**Purpose:** Personal work queue — items assigned to the current user.

| Setting | Value |
|---|---|
| Layout | **Table** |
| Filter | `assignee:@me` |
| Sort | Priority, then Status |
| Visible fields | Title, Status, Priority, Size, Milestone |

---

### View 7 — All Items *(Table)*  ← *renamed from "View 7"*

**Purpose:** Complete project inventory — all 59 items with every field visible.

| Setting | Value |
|---|---|
| Layout | **Table** |
| Filter | *(none)* |
| Sort | Milestone, then Priority |
| Visible fields | **All fields** |
| Column order | Title · Status · Priority · Size · Milestone · Iteration · Labels · Parent Issue · Sub-issues Progress · Assignees · Linked PRs · Start Date · End Date · Estimate |

---

### View 8 — Epic Overview *(Table)*  ← *NEW — create manually*

**Purpose:** Track progress of all 8 epics with their child feature/task completion.

| Setting | Value |
|---|---|
| Layout | **Table** |
| Filter | `label:epic` |
| Sort | Milestone (M0 first) |
| Visible fields | Title, Status, Priority, Milestone, Sub-issues Progress, Start Date, End Date |
| Group by | **Milestone** |

> The **Sub-issues Progress** field shows a visual completion bar for each epic.  
> Expand any epic row to see its child features and tasks inline.

---

### View 9 — By Phase *(Board)*  ← *NEW — create manually*

**Purpose:** See all work categorised by development phase (frontend, backend, AI, data).

| Setting | Value |
|---|---|
| Layout | **Board** |
| Group by | **Labels** (choose `frontend`, `backend`, `ai`, `data`) |
| Filter | *(none)* |
| Visible fields | Title, Status, Priority, Milestone |

---

### View 10 — Sprint Review *(Board)*  ← *NEW — create manually*

**Purpose:** Sprint-end review — shows completed vs. remaining in most recent iteration.

| Setting | Value |
|---|---|
| Layout | **Board** |
| Group by | **Status** |
| Filter | `iteration:@previous OR iteration:@current` |
| Visible fields | Title, Assignee, Size, Priority |

---

## Relationship Structure (Parent → Child)

The `Parent Issue` field is already enabled. The hierarchy is:

```
Epic (#3, #4, #5, #6, #42, #47, #51, #55)
 └── Feature (#7, #8, #9, #11, #19–23, #29–32, #35–37, #43–46, etc.)
      └── Task (#12–18, #24–28, #33–34, #38–41, etc.)
```

To see the tree in the UI:
1. Open any **Epic** issue
2. The **Sub-issues** section lists its child Features
3. From a Feature, the **Sub-issues** section lists child Tasks

To navigate upward, use the **Parent Issue** field in the project table view.

---

## Scripts

Automation scripts are in `.github/scripts/`:

| Script | Purpose |
|---|---|
| `set-priorities.ps1` | Sets P0/P1/P2 on all items based on milestone |
| `enrich-items.ps1` | Sets Size, Iteration, and Status on all items |

Run after adding new issues: `pwsh -File .github/scripts/set-priorities.ps1`
