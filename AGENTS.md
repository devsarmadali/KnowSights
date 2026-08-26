# KnowSights Agent & Architecture Guidelines

This file defines the strict architectural invariants, schema rules, and guidelines for any AI agent working on the KnowSights codebase.

---

## 1. Product Scope & Invariants

KnowSights has one primary job:
**Retrieve curated content ideas from the Google Sheet → show them in deterministic daily batches → allow replacement/browsing → mark an idea Used when consumed → generate 1-click script prompts.**

- **Zero recurring AI costs inside the app**: Deterministic mixing, rotation cooldowns, and weighted scoring only.
- **`SHOWN != USED`**: Showing an idea increments `Times Shown` and records `Last Shown`. Only an explicit `Used = TRUE` marks an idea as consumed.
- **Dual ID Support**: The active `Production Pool` contains `KS-P-*` (curated signature ideas) and `KS-T-*` (baseline taxonomy ideas).
- **Lineage Integrity**: `Parent Sr.` links back to `Master Taxonomy.Sr.`. Never use row numbers as primary keys.

---

## 2. Spreadsheet Database Structure

| Tab Name | Role | Primary Key | Description |
|---|---|---|---|
| **`Master Taxonomy`** | Knowledge Foundation | `Sr.` (Integer) | 3,960 permanent curriculum subtopics across 12 disciplines. |
| **`Production Pool`** | Usable Active Inventory | `Idea ID` (`KS-P-*` / `KS-T-*`) | 4,140+ active video ideas with curiosity hooks, scores, and formats. |
| **`Content Candidates`** | Optional Staging Lab | `Candidate ID` | Backlog for raw idea brainstorming before curation. |
| **`Source-Ready Briefs`**| Optional Research | `Idea ID` | Detailed research outlines. (No brief ≠ unusable idea). |
| **`App Batches`** | Batch History | `Batch ID` | Daily mix records. |
| **`App Batch Items`** | Batch Card Slots | `Batch Item ID` | Slot positions 1–12, shown/replaced status. |
| **`App Events`** | Audit & Idempotency | `Event ID` | Immutable audit log preventing duplicate mutations. |
| **`App Config`** | System Settings | `Key` | Cooldown periods, max subject caps, timezone (`Asia/Karachi`). |

---

## 3. The 3 Approved Expansion Paths

When expanding the database, always use the `knowsights-database-expansion` skill (`.agents/skills/knowsights-database-expansion/SKILL.md`):

1. **New Knowledge Pillar**: Append to `Master Taxonomy` with next permanent `Sr.`. Create 1 baseline `KS-T-[Sr]` in `Production Pool` with `Parent Sr. = [Sr]`.
2. **Multiple Angles for Existing Seed**: Append new editorial ideas to `Production Pool` using the next available `KS-P-*` series, all referencing the same `Parent Sr.`.
3. **Bulk Discovery**: Ingest into `Content Candidates`. Promote vetted winners to `Production Pool` as `KS-P-*`.

---

## 4. Key Links
- **Google Sheet ID**: `1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w`
- **Live Production Web App**: [https://knowsights-topic-mixer.vercel.app](https://knowsights-topic-mixer.vercel.app)
- **Timezone**: `Asia/Karachi`
