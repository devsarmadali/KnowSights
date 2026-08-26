# KnowSights Topic Mixer — Architecture & Database Expansion Manual

Comprehensive guide to the KnowSights system architecture, database schema, and long-term expansion procedures.

---

## Table of Contents
1. [Core Purpose](#1-core-purpose)
2. [Data Layer Architecture](#2-data-layer-architecture)
3. [Spreadsheet Tabs & Responsibilities](#3-spreadsheet-tabs--responsibilities)
4. [Permanent Identifiers & Lineage](#4-permanent-identifiers--lineage)
5. [The 3 Expansion Paths (Step-by-Step)](#5-the-3-expansion-paths-step-by-step)
6. [Daily Mixer Engine Rules](#6-daily-mixer-engine-rules)
7. [Apps Script API Reference](#7-apps-script-api-reference)

---

## 1. Core Purpose

The KnowSights web application is a deterministic idea-selection, batch-mixing, and prompt-generation engine designed for YouTube video production:
- **Retrieve curated ideas** from Google Sheets (`Production Pool`).
- **Generate daily 12-idea mixes** with recency cooldowns and subject balance.
- **Copy 1-click video prompts** formatted with hooks, visual directions, and source guidance.
- **Mark ideas Used** to consume them and update rotation status.
- **Zero AI cost**: Mix intelligence is completely algorithmic and deterministic.

---

## 2. Data Layer Architecture

```
UPSTREAM (Knowledge Planning & Discovery)
┌────────────────────────────────────────────────────────┐
│  Master Taxonomy                                       │  ← 3,960 Permanent Curriculum Seeds (Sr.)
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼ (1:1 Baseline Seed)                   ▼ (Optional Workshop)
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  Production Pool (KS-T-*)   │       │  Content Candidates (CC-*)   │
└──────────────▲───────────────┘       └──────────────┬───────────────┘
               │ (1:Many Spin-offs)                   │ (Editorial Promotion)
               └───────────────── KS-P-* ─────────────┘
                               │
DOWNSTREAM (Active Web App Engine)
┌──────────────────────────────▼──────────────────────────────┐
│  Production Pool (4,140+ Usable Ideas)                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       Daily Mix Dashboard             Production Pool Browser
     (App Batches/Batch Items)             (Full Inventory Search)
               │                               │
               ▼                               ▼
      1-Click Prompt Packs                 ✓ Mark Used (Used = TRUE)
```

---

## 3. Spreadsheet Tabs & Responsibilities

### 🟢 Active Core Engine Tabs
- **`Production Pool`** *(4,140 rows)*: Single source of truth for all active, usable video concepts (`KS-P-*` curated ideas and `KS-T-*` taxonomy baseline ideas).
- **`App Batches`**: Records daily batch metadata (`Batch ID`, `Date`, `Selection Mode`, `Size`).
- **`App Batch Items`**: Stores the 12 card slots for each daily batch, tracking `shown`, `replaced`, and `used` states.
- **`App Events`**: Immutable audit log and idempotency register (`Event ID`, `Event Type`, `Request ID`, `Timestamp`).
- **`App Config`**: System rotation parameters (`cooldown_days`, `daily_mix_size`, `max_same_subject`, `timezone: Asia/Karachi`).

### 🟡 Editorial & Reference Tabs
- **`Master Taxonomy`** *(3,960 rows)*: Permanent knowledge curriculum tree (`Sr.`, `Subject`, `Topic`, `Subtopic`).
- **`Content Candidates`**: Staging backlog for brainstorming rough ideas before editorial promotion.
- **`Source-Ready Briefs`**: Optional deep-dive research outlines. *(Note: No brief ≠ unusable idea).*

---

## 4. Permanent Identifiers & Lineage

| Entity | Primary Key | Format | Mutable? | Notes |
|---|---|---|---|---|
| Master Taxonomy | `Sr.` | Integer (`1`, `2`, `3960`) | **Never** | Permanent curriculum seed number. |
| Baseline Idea | `Idea ID` | `KS-T-003960` | **Never** | 1:1 baseline idea derived directly from `Master Taxonomy.Sr.`. |
| Curated Idea | `Idea ID` | `KS-P-0001` | **Never** | Editorial/signature spin-off idea. |
| Content Candidate | `Candidate ID` | `CC-0001` | **Never** | Staging pitch identifier. |
| Daily Batch | `Batch ID` | `BATCH-YYYYMMDD-XXXX` | **Never** | Generated daily batch instance. |
| Slot Assignment | `Batch Item ID` | `BI-XXXX` | **Never** | Single card position within a batch. |

> [!IMPORTANT]
> **Row numbers are NEVER used as identities.** Always reference `Idea ID` or `Sr.`. `Parent Sr.` provides non-destructive lineage back to the taxonomy tree.

---

## 5. The 3 Expansion Paths (Step-by-Step)

### Path 1: Add a Completely New Subject / Topic / Subtopic
1. Find highest `Sr.` in `Master Taxonomy` (e.g. `3960`).
2. Append new row with `Sr. = 3961`.
3. Add 1 corresponding baseline row to `Production Pool`:
   - `Idea ID`: `KS-T-003961`
   - `Parent Sr.`: `3961`
   - `Production Score`: `82`
   - `Used`: `FALSE`
   - `Active`: `TRUE`

### Path 2: Create Multiple Angles for an Existing Subtopic
1. Locate parent seed in `Master Taxonomy` (e.g. `Sr. 3044 — Baarle enclaves`).
2. Identify next available `KS-P` series ID (e.g. `KS-P-0181`).
3. Add multiple new rows to `Production Pool` with different curiosity hooks, formats, and titles, all pointing to `Parent Sr. = 3044`:
   - `KS-P-0181` *(Angle A: Border through restaurants)*
   - `KS-P-0182` *(Angle B: Front door citizenship paradox)*
   - `KS-P-0183` *(Angle C: Policing across 15 borders)*

### Path 3: Large-Scale Brainstorming via Content Candidates
1. Ingest 50–100 rough ideas into `Content Candidates`.
2. Review pitches; filter out duplicates or low-hook concepts.
3. Promote selected winners into `Production Pool` as `KS-P-*` rows.

---

## 6. Daily Mixer Engine Rules

1. **`SHOWN != USED`**:
   - Generating a batch increments `Times Shown` and timestamps `Last Shown`.
   - The idea remains eligible for future batches until explicitly marked `Used = TRUE`.
2. **Eligibility Criteria**:
   - `Used == FALSE`
   - `Active == TRUE`
   - `Research Status != 'Hold'`
   - `Last Shown` older than `cooldown_days` (default 3 days).
3. **Subject Diversity**:
   - A single daily mix of 12 cards will never contain more than `max_same_subject` (default 2) cards from the same subject discipline.
4. **Timezone**:
   - All batch dates and timestamps are calculated in **`Asia/Karachi`** (UTC+5).

---

## 7. Apps Script API Reference

The Google Apps Script backend (`scripts/knowsights_backend.gs`) handles requests through a JSON `doPost` dispatcher:

- `action: "get_or_create_today_batch"`: Returns or creates today's 12-idea mix.
- `action: "generate_batch"`: Generates a fresh mix using specified mode (`balanced`, `discovery`, `deep_dive`, `revisit_unused`, `current_tech`, `random`).
- `action: "replace_item"`: Replaces a specific slot position with an eligible candidate.
- `action: "mark_used"`: Sets `Used = TRUE` on `Production Pool.Idea ID`.
- `action: "undo_used"`: Reverts `Used = FALSE` on `Production Pool.Idea ID`.
- `action: "get_production_pool"`: Returns filtered inventory for the Browse page.
- `action: "get_source_ready_brief"`: Returns or synthesizes a research brief.
- `action: "get_stats"`: Returns real-time subject distribution and completion metrics.
- `action: "sync_inventory"`: Automates bulk taxonomy promotion.
