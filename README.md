# KnowSights Topic Mixer

A high-performance, deterministic YouTube topic curation, daily mix, and prompt engine for the **KnowSights** channel, powered by a 4,140-idea Google Sheet database with **zero recurring AI cost**.

---

## 🌐 Live Production Application
👉 **[https://knowsights-topic-mixer.vercel.app](https://knowsights-topic-mixer.vercel.app)**

---

## 📊 Canonical Database
- **Spreadsheet ID**: `1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w`
- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w/edit](https://docs.google.com/spreadsheets/d/1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w/edit)
- **Timezone**: `Asia/Karachi` (UTC+5)

---

## 🏛️ Content Architecture

The KnowSights system separates the **structural knowledge tree** (`Master Taxonomy`) from the **expandable video inventory** (`Production Pool`):

```
Master Taxonomy (3,960 Permanent Sr. Seeds)
        │
        ├─────────────────────────────────────────┐
        │                                         │
        ▼ (1:1 Baseline Seed)                     ▼ (Optional Staging)
Production Pool (KS-T-*)                  Content Candidates (Candidate ID)
        ▲                                         │
        │ (1:Many Editorial Angles)               │ (Editorial Promotion)
        └─────────────────── KS-P-* ──────────────┘
                                │
                                ▼
                       KnowSights Web App
                                │
                   ┌────────────┴────────────┐
                   ▼                         ▼
             Daily Mixer               Production Pool
         (App Batches/Items)               Browser
                   │                         │
                   ▼                         ▼
            1-Click Script &         Mark Used (Used = TRUE)
             Prompt Packs           (Asian/Karachi Timestamp)
```

### Production Pool Inventory (4,140 Active Ideas)
- **180 Curated Signature Ideas (`KS-P-*`)**: High-priority viral video concepts with tailored curiosity hooks and premium scores.
- **3,960 Taxonomy-Ready Ideas (`KS-T-*`)**: 1-to-1 baseline ideas for every single subtopic in `Master Taxonomy` (baseline score = 82).
- **12 Subject Disciplines**: Exactly 345 ideas per subject.

---

## ⚡ Key Features

1. **Deterministic Daily Mixer**:
   - 6 Selection modes: **Balanced**, **Discovery**, **Deep Dive**, **Revisit Unused**, **Current & Emerging**, **Random**.
   - Configurable mix sizes (6, 12, 18, 24).
   - Recency cooldowns and subject balance caps.
2. **Central Business Invariant (`SHOWN != USED`)**:
   - Merely displaying an idea in a batch increments `Times Shown` without consuming it.
   - Only clicking **`✓ Mark Used`** marks the specific `Idea ID` as used.
3. **1-Click Prompt Packs**:
   - Single-click copying for individual video concepts with visual directions and source guidance.
   - Batch-level **`Copy All Ideas (Prompt Pack)`** for full-run production scripts.
4. **Research Outlines & Briefs**:
   - 1-click **`Brief`** modal with instant automatic research synthesis for any idea.
5. **Full Production Pool Browser**:
   - Real-time search, filters by subject, format, research status, and usage state across all 4,140 rows.

---

## 🛠️ Antigravity Workspace Skill

This repository includes the **`knowsights-database-expansion`** skill located at:
- Workspace: [`.agents/skills/knowsights-database-expansion/SKILL.md`](.agents/skills/knowsights-database-expansion/SKILL.md)
- Global: `~/.gemini/config/skills/knowsights-database-expansion/SKILL.md`

Use this skill whenever you or an AI agent needs to add new curriculum topics or spin off multiple video angles around an existing seed.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev

# 3. Build for production
npm run build
```

---

## 📁 Repository Structure

```
KnowSights/
├── .agents/
│   └── skills/
│       └── knowsights-database-expansion/
│           └── SKILL.md                          # Database expansion skill
├── docs/
│   └── ARCHITECTURE_AND_EXPANSION.md             # Complete architecture manual
├── scripts/
│   └── knowsights_backend.gs                     # Google Apps Script backend engine
├── src/
│   ├── components/
│   │   ├── Header.tsx                            # Navigation & live inventory counter
│   │   ├── BatchControls.tsx                     # Selection mode & mix size selector
│   │   ├── TopicCard.tsx                         # 2-row anti-overflow card with 1-click copy
│   │   └── BriefModal.tsx                        # Research brief viewer & prompt copy
│   ├── pages/
│   │   ├── DailyMixPage.tsx                      # Today's ideas & batch management
│   │   ├── BrowsePage.tsx                        # 4,140-idea searchable table
│   │   └── SettingsPage.tsx                      # Configuration & sync tools
│   ├── services/
│   │   └── api.ts                                # Google Apps Script connector
│   └── types/
│       └── index.ts                              # Schema 2.0 TypeScript interfaces
├── AGENTS.md                                     # Invariants & agent instructions
└── package.json
```
