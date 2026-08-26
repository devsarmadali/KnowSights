---
name: knowsights-database-expansion
description: >-
  Expert guide, CLI commands, and SQL workflows for safely expanding the KnowSights
  database across Cloudflare D1 (Master Taxonomy & Production Pool) without disturbing
  existing ideas or breaking lineage.
---

# KnowSights Database Expansion Skill (Cloudflare D1 & Edge Engine)

This skill teaches AI agents and developers how to expand the **KnowSights** knowledge foundation and active video idea inventory directly in **Cloudflare D1 SQL (`knowsights-db`)**.

---

## 🏛️ Permanent Architecture & Lineage

```
Master Taxonomy (3,960+ Permanent Sr. Seeds in D1)
       │
       ├──────────────────────────────────────────┐
       │                                          │
       ▼ (1:1 Baseline Seed)                      ▼ (Discovery Workshop)
Production Pool (KS-T-*)                  Content Candidates (Staging)
       ▲                                          │
       │ (1:Many Editorial Angles)                │ (Editorial Promotion)
       └─────────────────── KS-P-* ───────────────┘
                               │
                               ▼
            KnowSights Cloudflare Edge Worker API
            (https://knowsights-api.excisetools.workers.dev)
                               │
                               ▼
            KnowSights Web App (Vercel Production)
            (https://knowsights-topic-mixer.vercel.app)
```

---

## 🔑 Core Invariants & Rules

1. **Never use row numbers as identity**:
   - `Master Taxonomy.Sr.` *(Integer, immutable primary key: `1`, `2`, ...)*
   - `Production Pool.Idea ID` *(String, immutable primary key: `KS-T-*` or `KS-P-*`)*
   - `Parent Sr.` *(Lineage pointer linking back to `Master Taxonomy.Sr.`)*
2. **`SHOWN != USED`**:
   - Showing an idea in a batch increments `times_shown` and records `last_shown`.
   - Only `used = 1` consumes an idea.
3. **1-to-Many Non-Destructive Expansion**:
   - Multiple `KS-P-*` editorial angles can point to the same `Parent Sr.`. Consuming one angle leaves the parent seed and all other angles available.
4. **Cloudflare D1 is the Primary Datastore**:
   - Database UUID: `aeea8b1e-1c49-432a-811e-f4460c51a5af` (Region: APAC).
   - Any rows inserted into D1 are immediately live in the web app without redeploying.

---

## 🛠️ Instant Expansion via CLI (`scripts/expand_database.py`)

The repository includes an automated CLI tool that executes all validations, auto-increments permanent IDs, and writes to Cloudflare D1 with a single command.

### 1. Check Current Database Status
```bash
python scripts/expand_database.py status
```

### 2. Path 1: Add a Completely New Taxonomy Pillar (Subject/Topic/Subtopic)
Adds a new curriculum seed to `master_taxonomy` with next `Sr.` and generates 1 baseline `KS-T-*` idea in `production_pool`:
```bash
python scripts/expand_database.py new-seed \
  --subject "Science & Discoveries" \
  --topic "Future Biology" \
  --subtopic "How synthetic minimal cells define the boundary of life" \
  --format "SF17 — Under the Hood" \
  --hook "What happens when you strip all non-essential DNA from an organism?"
```

### 3. Path 2: Create Multiple Angles for an Existing Seed (Editorial Expansion)
Create a JSON file with new angles (e.g. `data/new_angles.json`):
```json
[
  {
    "video_idea": "The border that runs through houses and restaurants",
    "curiosity_hook": "Why shifting a dining table moves you into a different country's tax jurisdiction.",
    "signature_format": "SF04 — Case Study Breakdown",
    "production_score": 90,
    "priority_tier": "Tier 1"
  },
  {
    "video_idea": "How residents know which country their front door belongs to",
    "curiosity_hook": "The quirky Dutch-Belgian front door rule that determines citizenship and voting.",
    "signature_format": "SF08 — Visualized Rules & Quirks",
    "production_score": 88,
    "priority_tier": "Tier 1"
  }
]
```
Execute the CLI command targeting the `Parent Sr.` (e.g. `3044`):
```bash
python scripts/expand_database.py new-angles --parent-sr 3044 --angles-json "data/new_angles.json"
```

---

## ⚡ Direct SQL Workflows (Cloudflare D1)

If executing SQL directly via Cloudflare API / MCP `cloudflare` tool:

### 1. Inserting a New Taxonomy Seed + Baseline Idea
```sql
-- Step A: Add to Master Taxonomy
INSERT INTO master_taxonomy (sr, subject, topic, subtopic)
VALUES (3961, 'Space & Astronomy', 'Exoplanet Atmospheres', 'How transmission spectroscopy detects atmospheric water');

-- Step B: Add baseline KS-T to Production Pool
INSERT INTO production_pool (
  idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format,
  video_idea, curiosity_hook, freshness_class, research_status,
  used, times_shown, production_score, priority_tier, active, brief_available
) VALUES (
  'KS-T-003961', 3961,
  'How transmission spectroscopy detects atmospheric water',
  'Space & Astronomy', 'Exoplanet Atmospheres',
  'SF01 — Hidden System',
  'How transmission spectroscopy detects atmospheric water',
  'How do we know a planet 100 light-years away has water without ever visiting it?',
  'Evergreen', 'Needs Research',
  0, 0, 82, 'Tier 2', 1, 0
);
```

### 2. Inserting Editorial Signature Ideas (`KS-P-*`)
```sql
INSERT INTO production_pool (
  idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format,
  video_idea, curiosity_hook, freshness_class, research_status,
  used, times_shown, production_score, priority_tier, active, brief_available
) VALUES (
  'KS-P-0181', 3044,
  'How Baarle became a maze of Belgian and Dutch enclaves',
  'History & Civilizations', 'Enclaves & Border Curiosities',
  'SF04 — Case Study Breakdown',
  'The border that runs through houses and restaurants',
  'Why shifting a dining table moves you into a different country tax jurisdiction.',
  'Evergreen', 'Needs Research',
  0, 0, 90, 'Tier 1', 1, 0
);
```

---

## 🧪 Validation Checklist
- [ ] `idea_id` is unique (`KS-P-XXXX` or `KS-T-XXXXXX`).
- [ ] `parent_sr` exists in `master_taxonomy.sr`.
- [ ] `used = 0` (integer boolean).
- [ ] `active = 1`.
- [ ] `production_score >= 82`.
