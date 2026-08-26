# KnowSights Topic Mixer — Architecture & Database Expansion Manual

Comprehensive guide to the KnowSights system architecture, database schema, and long-term expansion procedures.

---

## Table of Contents
1. [Core Purpose](#1-core-purpose)
2. [Data Layer Architecture](#2-data-layer-architecture)
3. [Cloudflare D1 SQL Schema](#3-cloudflare-d1-sql-schema)
4. [Permanent Identifiers & Lineage](#4-permanent-identifiers--lineage)
5. [The 3 Expansion Paths (CLI & SQL)](#5-the-3-expansion-paths-cli--sql)
6. [Daily Mixer Engine Rules](#6-daily-mixer-engine-rules)
7. [Cloudflare Edge Worker API Reference](#7-cloudflare-edge-worker-api-reference)

---

## 1. Core Purpose

The KnowSights web application is a deterministic idea-selection, batch-mixing, and prompt-generation engine designed for YouTube video production:
- **Retrieve curated ideas** from Cloudflare D1 (`production_pool`).
- **Generate daily 12-idea mixes** with recency cooldowns and subject balance.
- **Copy 1-click video prompts** formatted with hooks, visual directions, and source guidance.
- **Mark ideas Used** to consume them and update rotation status.
- **Zero AI cost**: Mix intelligence is completely algorithmic and deterministic.

---

## 2. Data Layer Architecture

```
UPSTREAM (Knowledge Planning & Discovery)
┌────────────────────────────────────────────────────────┐
│  Master Taxonomy                                       │  ← 3,960 Permanent Curriculum Seeds (Sr.) in D1
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
│  Cloudflare D1 SQL Database (`knowsights-db`)               │
│  UUID: aeea8b1e-1c49-432a-811e-f4460c51a5af (APAC)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Cloudflare Edge Worker API                                 │
│  https://knowsights-api.excisetools.workers.dev             │
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

## 3. Cloudflare D1 SQL Schema

### 🟢 Core Production Tables
- **`master_taxonomy`** *(3,960 rows)*:
  `sr` (INTEGER PRIMARY KEY), `subject` (TEXT), `topic` (TEXT), `subtopic` (TEXT).
- **`production_pool`** *(4,140 rows)*:
  `idea_id` (TEXT PRIMARY KEY), `parent_sr` (INTEGER), `subtopic_seed` (TEXT), `subject` (TEXT), `topic_family` (TEXT), `signature_format` (TEXT), `video_idea` (TEXT), `curiosity_hook` (TEXT), `visualization_direction` (TEXT), `source_family_guidance` (TEXT), `freshness_class` (TEXT), `research_status` (TEXT), `used` (INTEGER), `used_date` (TEXT), `times_shown` (INTEGER), `last_shown` (TEXT), `production_score` (INTEGER), `priority_tier` (TEXT), `notes` (TEXT), `active` (INTEGER), `hold_reason` (TEXT), `brief_available` (INTEGER).
- **`app_batches`**:
  `batch_id` (TEXT PRIMARY KEY), `date` (TEXT), `selection_mode` (TEXT), `requested_size` (INTEGER), `subject_filter` (TEXT), `created_at` (TEXT).
- **`app_batch_items`**:
  `batch_item_id` (TEXT PRIMARY KEY), `batch_id` (TEXT), `idea_id` (TEXT), `position` (INTEGER), `status` (TEXT), `selected_at` (TEXT).
- **`app_events`**:
  `event_id` (TEXT PRIMARY KEY), `event_type` (TEXT), `request_id` (TEXT UNIQUE), `payload` (TEXT), `created_at` (TEXT).
- **`app_config`**:
  `key` (TEXT PRIMARY KEY), `value` (TEXT).

---

## 4. Permanent Identifiers & Lineage

| Entity | Primary Key | Format | Mutable? | Notes |
|---|---|---|---|---|
| Master Taxonomy | `sr` | Integer (`1`, `2`, `3960`) | **Never** | Permanent curriculum seed number. |
| Baseline Idea | `idea_id` | `KS-T-003960` | **Never** | 1:1 baseline idea derived directly from `master_taxonomy.sr`. |
| Curated Idea | `idea_id` | `KS-P-0001` | **Never** | Editorial/signature spin-off idea. |
| Daily Batch | `batch_id` | `BATCH-YYYYMMDD-XXXX` | **Never** | Generated daily batch instance. |
| Slot Assignment | `batch_item_id` | `BI-XXXX` | **Never** | Single card position within a batch. |

---

## 5. The 3 Expansion Paths (CLI & SQL)

### Automated CLI Tool: `scripts/expand_database.py`

#### 1. Check Status
```bash
python scripts/expand_database.py status
```

#### 2. Path 1: Add a New Subject/Topic/Subtopic
```bash
python scripts/expand_database.py new-seed \
  --subject "Science & Discoveries" \
  --topic "Future Biology" \
  --subtopic "How synthetic minimal cells define the boundary of life"
```

#### 3. Path 2: Add Editorial Angles for Existing Seed
```bash
python scripts/expand_database.py new-angles --parent-sr 3044 --angles-json "data/new_angles.json"
```

---

## 6. Daily Mixer Engine Rules

1. **`SHOWN != USED`**:
   - Generating a batch increments `times_shown` and timestamps `last_shown`.
   - The idea remains eligible for future batches until explicitly marked `used = 1`.
2. **Eligibility Criteria**:
   - `used = 0`
   - `active = 1`
   - `LOWER(research_status) != 'hold'`
   - Rotation cooldown dynamically weighted.
3. **Subject Diversity**:
   - Max 2 ideas per subject discipline in a 12-idea mix.
4. **Timezone**:
   - All batch dates and timestamps are calculated in **`Asia/Karachi`** (UTC+5).

---

## 7. Cloudflare Edge Worker API Reference

Endpoint: `https://knowsights-api.excisetools.workers.dev`

- `action: "get_or_create_today_batch"`: Returns or creates today's 12-idea mix.
- `action: "generate_batch"`: Generates a fresh mix using specified mode (`BALANCED`, `DISCOVERY`, `DEEP_DIVE`, `REVISIT_UNUSED`, `RANDOM`).
- `action: "replace_item"`: Replaces a specific slot position with an eligible candidate.
- `action: "mark_used"`: Sets `used = 1` on `production_pool.idea_id`.
- `action: "undo_used"`: Reverts `used = 0` on `production_pool.idea_id`.
- `action: "search"` / `get_production_pool`: Returns filtered inventory for the Browse page.
- `action: "get_brief"`: Returns or synthesizes a research brief.
- `action: "get_stats"`: Returns real-time subject distribution and completion metrics.
