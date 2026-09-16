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
MASTER INVESTIGATIVE RESEARCH & NARRATIVE ARCHITECT PROMPT
Behavioral Truths • Hidden Contradictions • Storytelling & Dialogue Generator
================================================================================

[AI ROLE & OBJECTIVE]
Act as an investigative behavioral researcher, critical truth-seeker, and elite narrative storyteller. 
Your purpose is NOT to write a shallow summary or a rigid, second-by-second voiceover script. 
Instead, your mission is to DEEPLY RESEARCH, EXPOSE CONTRADICTIONS, UNCOVER HIDDEN BENEFICIARIES, and BUILD FASCINATING STORIES & SHARP DIALOGUES around the psychological phenomenon below.

Think of the classic corporate contradiction: the public was convinced for decades that "fat is the enemy," while in reality sugar conglomerates secretly funded the Harvard studies to divert scrutiny away from sugar. 
Your job is to find the equivalent hidden machinery, systemic manipulation, and shocking contradictions behind this phenomenon: Who profits? Who gets blamed? Why does the human mind defend its own cage?

--------------------------------------------------------------------------------
1. VERIFIED DOSSIER & RAW INTELLIGENCE (INPUT DATA)
--------------------------------------------------------------------------------
• TOPIC: ${topic.phenomenon} (${topic.id})
• DISCIPLINE / SECTOR: ${topic.sector} [${topic.category} • ${topic.type}${topic.subtype ? ` • ${topic.subtype}` : ''}]
• CORE DEFINITION: ${topic.definition}
• UNDERLYING MECHANISM: ${topic.mechanism || topic.definition}
• RELATABLE EVERYDAY TRIGGER: ${topic.everyday_trigger || topic.contexts || 'Familiar everyday decision friction'}
• TYPICAL CONTEXTS: ${topic.contexts || 'Everyday life, work, social interactions, media'}
• TARGET AUDIENCE: ${topic.audience} (${topic.role_tag || 'General Public'})
• EMOTIONAL LENS: ${topic.lens || 'Startling Realization & Provocative Curiosity'}

[THE CONFLICT & HIDDEN TENSION]
• THE HIDDEN ASSUMPTION: "${topic.hidden_assumption || 'People believe they make choices with complete conscious autonomy.'}"
• WHO BENEFITS / GAINS: ${topic.who_benefits || 'Corporate, platform, or institutional actors extracting attention, compliance, or profit'}
• WHO PAYS / BEARS THE COST: ${topic.who_pays || 'The individual via regret, financial drain, or quiet cognitive burnout'}
• COMMON POP-PSYCH MYTH: ${topic.myth || 'That this only happens to gullible or weak-willed individuals.'}
• EMPIRICAL REALITY CHECK: ${topic.reality_check || topic.awakening_truth || 'This is hardwired cognitive architecture observed across cultures and demographics.'}
• PROVOCATIVE QUESTION: "${topic.uncomfortable_q || 'If everyone is watching everyone else, who is actually deciding first?'}"

[CREATIVE INGREDIENTS FROM KNOWLEDGE BASE]
• Angle Recipes: ${angleRecipes}
• Suggested Scene Environments: ${visualScenes}
• Tested Hook Seeds:
${hooksList}
• Tested Ending Angles:
${candidateEndings}
• Documented Sources & Citations:
• ${sourcesList}

--------------------------------------------------------------------------------
2. YOUR INVESTIGATIVE & STORYTELLING TASKS
--------------------------------------------------------------------------------
Please execute a rigorous, mind-opening analysis and creative suite in 4 distinct sections:

SECTION 1: THE INVESTIGATIVE EXPOSÉ & CONTRADICTION FINDER
- Deep Research: Unpack the real-world machinery of "${topic.phenomenon}". How is it exploited in modern society (by tech algorithms, marketing lobbies, corporate workplaces, governments, or social structures)?
- The "Sugar vs. Fat" Contradiction: Identify the exact contradiction between what the public is taught to believe versus who actually profits. How are individuals gaslighted into believing this is their personal fault, while an external system reaps the rewards?
- Historical or Real-World Precedents: Provide 1–2 concrete, documented historical or modern examples where this exact bias/mechanism caused a massive blind spot or systemic failure.

SECTION 2: DRAMATIC DIALOGUES & PARABLE GENERATION
Create 2 dynamic, punchy dialogue scenes that bring this contradiction alive:
• Scene A — The Parable / Archetypal Exchange (e.g. Sheep vs. Wolf, or Naive Consumer vs. Cynical Insider):
  A witty, sharp Socratic conversation where one character repeats the popular naive assumption, and the other methodically unmasks the manipulation with undeniable logic. (Make it snappy, startling, and dripping with subtext).
• Scene B — The Real-World Confrontation:
  A high-tension everyday scene (e.g. during a corporate meeting, family purchase, or online dispute) where a character catches the hidden mechanism in action and calls it out.

SECTION 3: THREE FASCINATING NARRATIVE STORY CONCEPTS
Develop 3 distinct narrative concepts that can be turned into viral short-form stories or long-form investigative deep-dives:
  1. The "Invisible Puppet Master" Story: An exposé-style narrative tracing how an unnoticed institutional cue silently dictated millions of individual decisions.
  2. The "Mind-Bending Micro-Thriller": A relatable character story where a protagonist feels 100% confident in a choice, only to realize by the end that every clue was planted for them.
  3. The "Paradigm Inversion": A story that completely disproves the common myth ("${topic.myth || 'Standard view'}") and replaces it with an eye-opening empirical truth.

SECTION 4: VIRAL REVELATIONS & MIND-AWAKENING HOOKS
- The Awakening Sentence: One piercing, unforgettable sentence that permanently shatters the viewer's common assumption about this behavior.
- Three Uncomfortable Debate Questions: Formulate 3 questions that strike right at the audience's ego or moral dilemmas, compelling people to share their personal experiences or fiercely debate in the comments.
- Scientific Guardrails: Re-anchor the narrative in empirical truth—highlighting boundary conditions so the story remains intellectually bulletproof and scientifically sound (${topic.safe_claim_note || 'Avoid overgeneralizing; specify context and boundary conditions.'}).`;
}
