---
name: knowsights-database-expansion
description: >-
  Expert guide and workflow for safely expanding the KnowSights database across
  Master Taxonomy, Content Candidates, and Production Pool without disturbing
  existing ideas or breaking lineage.
---

# KnowSights Database Expansion Skill

This skill teaches agents and developers how to safely expand the **KnowSights** content database using the 3 approved expansion paths, ensuring schema integrity, permanent identifier preservation, and seamless integration with the web application.

---

## 🏛️ Permanent Content Model

```
Master Taxonomy (Permanent Sr. seeds)
       │
       ├──────────────────────────────────────────┐
       │                                          │
       ▼ (1:1 Baseline Seed)                      ▼ (Discovery Workshop)
Production Pool (KS-T-*)                  Content Candidates (Candidate ID)
       ▲                                          │
       │ (1:Many Editorial Angles)                │ (Editorial Promotion)
       └─────────────────── KS-P-* ───────────────┘
                               │
                               ▼
                      KnowSights Web App
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
           Daily Mixer                 Production Pool
       (App Batches/Items)                 Browser
                │                             │
                ▼                             ▼
         1-Click Prompts               Mark Used (Used = TRUE)
```

---

## 🔑 Core Invariants & Rules

1. **Never use row numbers as identity**:
   - `Master Taxonomy.Sr.` *(Integer, immutable)*
   - `Production Pool.Idea ID` *(String, immutable: `KS-T-*` or `KS-P-*`)*
   - `Content Candidates.Candidate ID` *(String, immutable)*
   - `Parent Sr.` *(Lineage pointer linking back to `Master Taxonomy.Sr.`)*
2. **`SHOWN != USED`**:
   - Merely displaying an idea in a mix increments `Times Shown` and updates `Last Shown`. It does **not** consume the idea.
   - Only setting `Used = TRUE` marks an idea as consumed.
3. **Independent Idea Lifecycles**:
   - Consuming one idea (e.g. `KS-P-0181`) marks **only that specific `Idea ID`** as used.
   - The underlying topic (`Sr. 3044`) and sister angles (`KS-T-003044`, `KS-P-0182`) remain eligible for future mixes.
4. **No Brief ≠ Unusable Idea**:
   - All ideas in `Production Pool` are 100% usable directly without a manual `Source-Ready Brief`.

---

## 🚀 The 3 Expansion Paths (Procedures)

### Path 1: Add a Completely New Subject / Topic / Subtopic (Taxonomy Seed)

Use this when introducing a new evergreen knowledge area or curriculum subject.

#### Step 1: Append to `Master Taxonomy`
Find the highest current `Sr.` in `Master Taxonomy` (e.g., `3960`) and append the new row with `Sr. = 3961`:
- `Sr.`: `3961`
- `Subject`: `Science & Discoveries`
- `Topic`: `Future Biology & Synthetic Life`
- `Subtopic`: `How synthetic minimal cells define the boundary of life`

> [!CAUTION]
> Never renumber existing `Sr.` values. `Sr.` is permanent.

#### Step 2: Create 1 Baseline Idea in `Production Pool`
Add the corresponding baseline row in `Production Pool`:
- `Idea ID`: `KS-T-003961` *(format: `KS-T-` + 6-digit padded `Sr.`)*
- `Parent Sr.`: `3961`
- `Subtopic Seed`: `How synthetic minimal cells define the boundary of life`
- `Subject`: `Science & Discoveries`
- `Topic Family`: `Future Biology & Synthetic Life`
- `Video Idea`: `How synthetic minimal cells define the boundary of life`
- `Curiosity Hook`: `What happens when you strip all non-essential DNA from an organism?`
- `Signature Format`: `SF17 — Under the Hood`
- `Visualization Direction`: `Microscopic cell animation stripped down to essential gene loops`
- `Source-Family Guidance`: `Synthetic biology papers, J. Craig Venter Institute publications`
- `Freshness Class`: `Evergreen`
- `Research Status`: `Needs Research`
- `Production Score`: `82`
- `Priority Tier`: `Tier 2`
- `Used`: `FALSE`
- `Times Shown`: `0`
- `Active`: `TRUE`
- `Brief Available`: `FALSE`

---

### Path 2: Create Multiple Angles for an Existing Subtopic (Editorial Expansion)

This is the most common expansion path when spinning off multiple viral hooks from a single topic.

#### Step 1: Identify the Parent Taxonomy Seed
Locate the seed in `Master Taxonomy` (e.g., `Sr. 3044 — How Baarle became a maze of Belgian and Dutch enclaves`).

#### Step 2: Determine Next `KS-P` Identifier
Check `Production Pool` for the highest existing `KS-P` ID (e.g. `KS-P-0180`). Your new angles will be `KS-P-0181`, `KS-P-0182`, etc.

#### Step 3: Add Rows to `Production Pool`
Append each new angle linked to `Parent Sr. = 3044`:

| Field | Row A | Row B | Row C |
|---|---|---|---|
| **`Idea ID`** | `KS-P-0181` | `KS-P-0182` | `KS-P-0183` |
| **`Parent Sr.`** | `3044` | `3044` | `3044` |
| **`Subtopic Seed`** | `How Baarle became a maze of enclaves` | `How Baarle became a maze of enclaves` | `How Baarle became a maze of enclaves` |
| **`Subject`** | `History & Civilizations` | `History & Civilizations` | `History & Civilizations` |
| **`Topic Family`** | `Enclaves & Border Curiosities` | `Enclaves & Border Curiosities` | `Enclaves & Border Curiosities` |
| **`Video Idea`** | `The border that runs through houses and restaurants` | `How residents know which country their front door belongs to` | `What happens to taxes and policing inside Baarle` |
| **`Curiosity Hook`** | `Why shifting a dining table moves you into a different country's tax jurisdiction.` | `The quirky Dutch-Belgian front door rule that determines citizenship and voting.` | `How police forces handle crimes that cross 15 borders on a single street.` |
| **`Signature Format`** | `SF04 — Case Study Breakdown` | `SF08 — Visualized Rules & Quirks` | `SF12 — Systems & Institutions` |
| **`Production Score`** | `90` | `88` | `86` |
| **`Priority Tier`** | `Tier 1` | `Tier 1` | `Tier 2` |
| **`Used`** | `FALSE` | `FALSE` | `FALSE` |
| **`Active`** | `TRUE` | `TRUE` | `TRUE` |

---

### Path 3: Use Content Candidates for Large-Scale Staging & Discovery

Use this for high-volume idea brainstorming before promoting to the active web app.

```
Master Taxonomy Seed
        │
        ▼ (Brainstorm 50 rough angles)
Content Candidates (Staging Backlog)
        │
        ├─► Angle 1 (Generic) ───────────► Keep in Backlog
        ├─► Angle 2 (Duplicate) ─────────► Discard
        └─► Angle 3 (Exceptional Hook) ──► PROMOTE TO PRODUCTION POOL (KS-P-XXXX)
```

1. Add raw drafts to **`Content Candidates`** with a unique `Candidate ID` (`CC-0001`...) and `Taxonomy Sr.`.
2. Review pitches. Weak or redundant ideas remain in candidates.
3. Promote approved ideas to **`Production Pool`** by assigning the next available `KS-P-*` ID and copying over metadata.

---

## 🧪 Validation Checklist Before Deploying New Rows

- [ ] `Idea ID` is unique across the entire `Production Pool`.
- [ ] `Parent Sr.` matches an existing integer in `Master Taxonomy.Sr.`.
- [ ] `Used` is strictly set to `FALSE` (boolean).
- [ ] `Active` is set to `TRUE`.
- [ ] `Times Shown` is initialized to `0`.
- [ ] `Production Score` is `>= 82` (baseline for KS-T is 82, curated KS-P is 85–95).
- [ ] `Signature Format` matches a recognized format name (e.g., `SF01` to `SF20` or standard descriptors).
