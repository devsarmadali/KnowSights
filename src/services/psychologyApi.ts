import { PsychologyTopic, PsychologyFilterState, PsychologyStats, PSYCHOLOGY_SECTORS } from '../types/psychology';

const STORAGE_KEY_PSYCH_STUDIED = 'knowsights_psych_studied_v1';
const STORAGE_KEY_PSYCH_BOOKMARKS = 'knowsights_psych_bookmarks_v1';

let cachedDatabase: PsychologyTopic[] | null = null;
let loadPromise: Promise<PsychologyTopic[]> | null = null;

export async function fetchPsychologyDatabase(): Promise<PsychologyTopic[]> {
  if (cachedDatabase && cachedDatabase.length > 0) {
    return cachedDatabase;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Primary: load from public/data/psychology_database.json
      const res = await fetch('/data/psychology_database.json');
      if (!res.ok) {
        throw new Error(`Failed to fetch psychology database: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        cachedDatabase = data;
        return data;
      }
      throw new Error('Fetched psychology data is not an array');
    } catch (err) {
      console.error('Error loading psychology database:', err);
      return [];
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

// LocalStorage helpers
export function getStudiedTopicIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PSYCH_STUDIED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    return new Set();
  }
}

export function toggleStudiedTopicId(topicId: string): boolean {
  try {
    const current = getStudiedTopicIds();
    const isCurrentlyStudied = current.has(topicId);
    if (isCurrentlyStudied) {
      current.delete(topicId);
    } else {
      current.add(topicId);
    }
    localStorage.setItem(STORAGE_KEY_PSYCH_STUDIED, JSON.stringify(Array.from(current)));
    return !isCurrentlyStudied;
  } catch (e) {
    console.error('Failed to toggle studied topic in localStorage:', e);
    return false;
  }
}

export function getBookmarkedTopicIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PSYCH_BOOKMARKS);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    return new Set();
  }
}

export function toggleBookmarkedTopicId(topicId: string): boolean {
  try {
    const current = getBookmarkedTopicIds();
    const isBookmarked = current.has(topicId);
    if (isBookmarked) {
      current.delete(topicId);
    } else {
      current.add(topicId);
    }
    localStorage.setItem(STORAGE_KEY_PSYCH_BOOKMARKS, JSON.stringify(Array.from(current)));
    return !isBookmarked;
  } catch (e) {
    console.error('Failed to toggle bookmark in localStorage:', e);
    return false;
  }
}

// Search and Filter
export function filterPsychologyTopics(
  topics: PsychologyTopic[],
  filter: PsychologyFilterState,
  studiedIds: Set<string>,
  bookmarkedIds: Set<string>
): { items: PsychologyTopic[]; total: number; totalPages: number } {
  const queryLower = filter.query.trim().toLowerCase();

  const filtered = topics.filter(t => {
    // 1. Sector filter
    if (filter.sector && filter.sector !== 'all') {
      if (t.sector.toLowerCase() !== filter.sector.toLowerCase()) {
        return false;
      }
    }

    // 2. Status filter
    if (filter.status === 'studied' && !studiedIds.has(t.id)) {
      return false;
    }
    if (filter.status === 'unstudied' && studiedIds.has(t.id)) {
      return false;
    }
    if (filter.status === 'bookmarked' && !bookmarkedIds.has(t.id)) {
      return false;
    }

    // 3. Metric filters
    if (filter.minShock > 0 && t.shock < filter.minShock) {
      return false;
    }
    if (filter.minRelatability > 0 && t.relatability < filter.minRelatability) {
      return false;
    }

    // 4. Evidence only
    if (filter.evidenceOnly) {
      if (t.verified_count <= 0 && t.sources.length === 0) {
        return false;
      }
    }

    // 5. Full text search
    if (queryLower) {
      const match =
        t.phenomenon.toLowerCase().includes(queryLower) ||
        t.id.toLowerCase().includes(queryLower) ||
        t.definition.toLowerCase().includes(queryLower) ||
        t.mechanism.toLowerCase().includes(queryLower) ||
        t.contexts.toLowerCase().includes(queryLower) ||
        t.related.toLowerCase().includes(queryLower) ||
        t.category.toLowerCase().includes(queryLower) ||
        t.type.toLowerCase().includes(queryLower) ||
        t.prompt.toLowerCase().includes(queryLower) ||
        t.awakening_truth.toLowerCase().includes(queryLower) ||
        t.who_benefits.toLowerCase().includes(queryLower) ||
        t.who_pays.toLowerCase().includes(queryLower);

      if (!match) return false;
    }

    return true;
  });

  const total = filtered.length;
  const pageSize = Math.max(1, filter.pageSize || 24);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, filter.page || 1), totalPages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return { items, total, totalPages };
}

// Stats generator
export function getPsychologyStats(
  topics: PsychologyTopic[],
  studiedIds: Set<string>,
  bookmarkedIds: Set<string>
): PsychologyStats {
  const sectorCountMap: Record<string, number> = {};
  for (const t of topics) {
    sectorCountMap[t.sector] = (sectorCountMap[t.sector] || 0) + 1;
  }

  const sectors = PSYCHOLOGY_SECTORS.map(s => ({
    name: s.name,
    count: sectorCountMap[s.name] || 0,
    color: s.color
  }));

  return {
    total: topics.length,
    studiedCount: studiedIds.size,
    bookmarkedCount: bookmarkedIds.size,
    sectors
  };
}

// Diverse Random Mix Draw (e.g. Draw 6, 9, or 12 cards)
export function drawPsychologyMix(
  topics: PsychologyTopic[],
  count: number = 6,
  studiedIds: Set<string> = new Set()
): PsychologyTopic[] {
  if (!topics || topics.length === 0) return [];

  // Group by sector
  const sectorMap = new Map<string, PsychologyTopic[]>();
  for (const t of topics) {
    if (!sectorMap.has(t.sector)) {
      sectorMap.set(t.sector, []);
    }
    sectorMap.get(t.sector)!.push(t);
  }

  const sectors = Array.from(sectorMap.keys());
  // Shuffle sectors
  const shuffledSectors = [...sectors].sort(() => Math.random() - 0.5);

  const selected: PsychologyTopic[] = [];
  const selectedIds = new Set<string>();

  // Pick one from each shuffled sector until count is met
  for (const sec of shuffledSectors) {
    if (selected.length >= count) break;
    const candidates = sectorMap.get(sec) || [];
    // Prefer unstudied
    const unstudied = candidates.filter(c => !studiedIds.has(c.id));
    const pool = unstudied.length > 0 ? unstudied : candidates;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    if (randomPick && !selectedIds.has(randomPick.id)) {
      selected.push(randomPick);
      selectedIds.add(randomPick.id);
    }
  }

  // If still less than count, fill from remaining random
  while (selected.length < count && selected.length < topics.length) {
    const randomPick = topics[Math.floor(Math.random() * topics.length)];
    if (randomPick && !selectedIds.has(randomPick.id)) {
      selected.push(randomPick);
      selectedIds.add(randomPick.id);
    }
  }

  return selected;
}

// Master Investigative Research & Narrative Ignition Prompt Formatter
// Designed for ChatGPT, Gemini, and Claude to conduct deep research, expose systemic contradictions,
// uncover unseen beneficiaries, generate fables/dialogues (e.g. Sheep vs. Wolf), and craft gripping narratives.
export function formatPsychologyScriptPrompt(topic: PsychologyTopic): string {
  // Format hooks for inspiration
  const hooksList = (topic.candidate_hooks && topic.candidate_hooks.length > 0)
    ? topic.candidate_hooks.slice(0, 4).map((h, i) => `  ${i + 1}. "${h}"`).join('\n')
    : `  1. "${topic.awakening_truth || topic.prompt || 'Why do smart, rational people fall for this trap without realizing it?'}"`;

  const visualScenes = (topic.candidate_scenes && topic.candidate_scenes.length > 0)
    ? topic.candidate_scenes.slice(0, 3).join(' | ')
    : (topic.contexts || 'Workplace, digital feeds, marketplace transactions, social gatherings');

  const candidateEndings = (topic.candidate_endings && topic.candidate_endings.length > 0)
    ? topic.candidate_endings.slice(0, 3).map((e, i) => `  ${i + 1}. "${e}"`).join('\n')
    : `  1. "${topic.uncomfortable_q || 'If you realized you were being steered, could you stop yourself?'}"`;

  const angleRecipes = (topic.candidate_recipes && topic.candidate_recipes.length > 0)
    ? topic.candidate_recipes.slice(0, 3).join(' • ')
    : (topic.angle || 'Hidden mechanism + Systemic friction');

  const sourcesList = topic.sources && topic.sources.length > 0 
    ? topic.sources.join('\n• ') 
    : 'Primary academic synthesis and peer-reviewed behavioral research';

  return `================================================================================
"WISE WOLF vs. NAIVE SHEEP" MASTER STORY & RESEARCH INTELLIGENCE PROMPT
Universe: Debunking Common Myths, Systemic Traps & Cognitive Deceptions (90–120 Video Series)
Goal: High Replay Value • Viral Shareability • Premium Audience Engagement & Monetization
================================================================================

[CHANNEL VISION & CREATIVE PHILOSOPHY]
This prompt is designed for the flagship intellectual entertainment series: "Wise Wolf vs. Naive Sheep".
• THE NAIVE SHEEP: Represents comfortable conventional wisdom, mainstream consensus, the trusting public, what "everybody knows", and the consumer who internalizes self-blame.
• THE WISE WOLF: Represents the street-smart observer and critical thinker who looks beneath the surface, asks "Who told you that? Who profits when you believe it?", dismantles the illusion with calm surgical logic, and exposes the real psychological and economic game.
• TARGET RECEPTION: Viewers re-watch repeatedly to catch the depth of the insight, save the video, share it with friends/family ("You need to see this"), and spark intense debate in the comments.

[CREATIVE MANDATE FOR AI]
Do NOT restrict yourself to a rigid, second-by-second teleprompter script. Do NOT over-limit the creative scope at this stage. 
Instead, act as a master investigative researcher, behavioral psychologist, and world-class narrative architect. Provide expansive, versatile, high-impact creative raw material, sharp dialogues, deep research, and cinematic visual concepts around this topic.

--------------------------------------------------------------------------------
1. VERIFIED TOPIC DOSSIER & RAW KNOWLEDGE BASE
--------------------------------------------------------------------------------
• PHENOMENON: ${topic.phenomenon} (${topic.id})
• DISCIPLINE / SECTOR: ${topic.sector} [${topic.category} • ${topic.type}${topic.subtype ? ` • ${topic.subtype}` : ''}]
• CORE DEFINITION: ${topic.definition}
• UNDERLYING MECHANISM: ${topic.mechanism || topic.definition}
• RELATABLE EVERYDAY TRIGGER: ${topic.everyday_trigger || topic.contexts || 'Everyday decision friction'}
• TYPICAL CONTEXTS: ${topic.contexts || 'Everyday life, work, social interactions, media'}
• TARGET AUDIENCE: ${topic.audience} (${topic.role_tag || 'General Public'})
• EMOTIONAL LENS: ${topic.lens || 'Startling Realization & Provocative Curiosity'}

[THE CORE CONTRADICTION & TENSION]
• THE HIDDEN ASSUMPTION: "${topic.hidden_assumption || 'People believe they make choices with complete conscious autonomy.'}"
• WHO BENEFITS / PROFITS: ${topic.who_benefits || 'Corporate, platform, or institutional actors extracting attention, compliance, or profit'}
• WHO PAYS / BEARS THE REAL COST: ${topic.who_pays || 'The individual through regret, financial drain, or quiet cognitive burnout'}
• COMMON POP-PSYCH MYTH: ${topic.myth || 'That this only happens to gullible or weak-willed individuals.'}
• EMPIRICAL REALITY CHECK: ${topic.reality_check || topic.awakening_truth || 'This is hardwired cognitive architecture observed across cultures and demographics.'}
• PROVOCATIVE QUESTION: "${topic.uncomfortable_q || 'If everyone is watching everyone else, who is actually deciding first?'}"

[DATABASE INGREDIENTS]
• Angle Recipes: ${angleRecipes}
• Suggested Scene Environments: ${visualScenes}
• Tested Hook Seeds:
${hooksList}
• Tested Ending Angles:
${candidateEndings}
• Documented Sources & Citations:
• ${sourcesList}

--------------------------------------------------------------------------------
2. YOUR EXPLORATORY CREATIVE & RESEARCH SUITE
--------------------------------------------------------------------------------
Please generate a rich, multifaceted creative dossier across the following 5 dimensions:

DIMENSION 1: THE "WISE WOLF vs. NAIVE SHEEP" DIALOGUE SPARKS
- Write 2 distinct, witty, memorable dialogue exchanges featuring the Wise Wolf and the Naive Sheep:
  • Dialogue A (The Classic Confrontation): The Sheep confidently repeats what "everyone knows" about this topic, and the Wolf methodically exposes the hidden manipulation with sharp Socratic questions and an unexpected twist. (Think: Sheep: "Fat is bad for you!" Wolf: "Who told you that?" Sheep: "The doctors!" Wolf: "No, the sugar lobby paid the researchers in 1965 to say that.").
  • Dialogue B (The Subtle Micro-Story): A dialogue showing the Sheep caught in an everyday real-world trap, while the Wolf reveals the invisible puppet strings pulling the strings in real time.
- Make the dialogue punchy, quotable, dripping with subtext, and highly rewatchable.

DIMENSION 2: DEEP INVESTIGATIVE RESEARCH & THE MANIPULATION ENGINE
- Deep Reality Check: How is "${topic.phenomenon}" weaponized in modern society? Who builds the systems, algorithms, advertising campaigns, or workplace rules that rely on this psychological blind spot?
- The Power & Profit Dynamic: Expose the systemic contradiction. How does the system convince people that their struggles are a personal defect, while the system monetizes the outcome?
- Concrete Analogues & Case Studies: Provide 1–2 documented real-world cases, historical incidents, or industry examples demonstrating this exact mechanism in action.

DIMENSION 3: HIGH-VALUE VISUAL METAPHORS & SCENE PRESETS
- Visual Analogies: Propose 2–3 cinematic visual metaphors (e.g. split-screen contrasts, allegorical props, visual illusions, kinetic graphics, or symbolic set designs) that make the concept click instantly within 3 seconds.
- Replay Value Elements: What visual or auditory details can be subtly woven into the background or delivery so that viewers immediately want to rewatch the video?

DIMENSION 4: THREE VERSATILE NARRATIVE CONCEPTS
Develop 3 flexible mini-story concepts that can be produced in various formats (animation, live-action dialogue, or narrated short-doc):
  1. The "Deceptive System" Narrative: An investigative story tracing how an unseen institutional rule steers millions of people without their consent.
  2. The "Relatable Everyday Trap": A story following an ordinary person who feels totally in control, only to face the twist that every choice was pre-designed.
  3. The "Myth Shatterer": A story that takes the most common popular assumption and systematically turns it inside out.

DIMENSION 5: AWAKENING TRUTHS & VIRAL DEBATE IGNITERS
- The Awakening Punchline: A single, profound philosophical sentence that shifts the viewer's paradigm and begs to be quoted and shared.
- Three Debate-Sparking Questions: Formulate 3 uncomfortable questions that divide opinion or trigger deep self-reflection, designed to drive massive comment volume.
- Empirical Guardrails: State the scientific boundary conditions (${topic.safe_claim_note || 'Avoid overgeneralizing; specify context and boundary conditions.'}) so the content remains intellectually unassailable.`;
}
