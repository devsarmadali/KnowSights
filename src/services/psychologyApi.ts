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

// Dedicated Facebook Reels Viral Script Prompt Formatter
// Engineered specifically for 9:16 vertical video, 35-55s duration, fast pattern interrupts, and comment drivers
export function formatPsychologyScriptPrompt(topic: PsychologyTopic): string {
  // Extract candidate hooks or fallback to awakening truth
  const hooksList = (topic.candidate_hooks && topic.candidate_hooks.length > 0)
    ? topic.candidate_hooks.slice(0, 3).map((h, i) => `  ${i + 1}. "${h}"`).join('\n')
    : `  1. "${topic.awakening_truth || topic.prompt || 'Why do smart people fall for this every single day?'}"`;

  const primaryHook = (topic.candidate_hooks && topic.candidate_hooks[0]) 
    || topic.awakening_truth 
    || topic.prompt 
    || `The invisible psychological rule shaping how you behave without your permission.`;

  const visualScene = (topic.candidate_scenes && topic.candidate_scenes[0]) || topic.contexts || 'Familiar workplace, digital screen, or social setting';
  const visualPreset = (topic.candidate_visuals && topic.candidate_visuals[0]) || 'Fast-paced 9:16 kinetic text overlay with sudden pattern interrupt';
  const visualEnding = (topic.candidate_endings && topic.candidate_endings[0]) || topic.uncomfortable_q || 'Which side of this trap have you experienced?';
  const engagementTrigger = (topic.candidate_engagement_triggers && topic.candidate_engagement_triggers[0]) || 'Hidden mechanism reveal';
  const engagementGoal = (topic.candidate_engagement_goals && topic.candidate_engagement_goals[0]) || 'Comments & Viral Shares';
  const angleRecipe = (topic.candidate_recipes && topic.candidate_recipes[0]) || topic.angle || 'Hidden mechanism + Relatable friction';

  return `### META / FACEBOOK REELS VIRAL SCRIPT BLUEPRINT (9:16 VERTICAL)
Role: Elite behavioral psychology creator & short-form viral storyteller.
Platform Target: Facebook Reels / Meta Video (High comment-loop & shareability).
Video Length: 35–50 Seconds (~115–140 spoken words, rapid cadence).

=======================================================
1. TOPIC INTELLIGENCE & VIRAL RATINGS
=======================================================
• TOPIC ID: ${topic.id}
• PHENOMENON: ${topic.phenomenon}
• SECTOR: ${topic.sector} [${topic.category} • ${topic.type}${topic.subtype ? ` • ${topic.subtype}` : ''}]
• CORE DEFINITION: ${topic.definition}
• PSYCHOLOGICAL MECHANISM: ${topic.mechanism || topic.definition}
• RELATABLE EVERYDAY TRIGGER: ${topic.everyday_trigger || topic.contexts || 'Everyday decision friction'}
• TARGET AUDIENCE: ${topic.audience} (${topic.role_tag || 'General Public'})
• EMOTIONAL LENS: ${topic.lens || 'Startling Realization'}
• ENGAGEMENT OBJECTIVE: High ${engagementGoal} via ${engagementTrigger}
• ALGORITHM SCORES: Shock: ${topic.shock}/5 | Relatability: ${topic.relatability}/5 | Comment Potential: ${topic.comment_potential}/5

=======================================================
2. THE CONFLICT & HIDDEN DYNAMICS (THE HOOK ENGINE)
=======================================================
• THE HIDDEN ASSUMPTION: "${topic.hidden_assumption || 'People believe they make choices completely independently.'}"
• WHO BENEFITS / PROFITS: ${topic.who_benefits || 'Systemic actors / platforms / marketers'}
• WHO PAYS / BEARS THE COST: ${topic.who_pays || 'The individual via regret, financial cost, or cognitive fatigue'}
• COMMON POP-PSYCH MYTH: ${topic.myth || 'That this only happens to naïve or uneducated people.'}
• EMPIRICAL REALITY CHECK: ${topic.reality_check || topic.awakening_truth || 'This is a universal cognitive response observed across multiple replicated studies.'}
• UNCOMFORTABLE QUESTION: "${topic.uncomfortable_q || 'If everyone is watching everyone else, who is actually deciding first?'}"

=======================================================
3. A/B TEST HOOK PATTERNS (FIRST 3 SECONDS)
=======================================================
${hooksList}

=======================================================
4. EXACT 5-BEAT FACEBOOK REELS SCRIPT SPECIFICATIONS
=======================================================
Write out the verbatim spoken voiceover script, visual descriptions, and on-screen text overlays matching this high-retention structure:

[BEAT 1: 00:00 - 00:04 | THE 3-SECOND PATTERN INTERRUPT]
• Visual: 9:16 Vertical. Fast-paced visual hook (${visualPreset}).
• On-Screen Text (OST): 3–5 word bold headline in ALL CAPS.
• Spoken Voiceover: Deliver the killer hook immediately ("${primaryHook}"). No introductory pleasantries ("Hey guys" or "In this video").

[BEAT 2: 00:04 - 00:15 | THE RELATABLE SCENE SETUP]
• Visual: Relatable real-world scene (${visualScene}).
• On-Screen Text: Context subtitle.
• Spoken Voiceover: Establish the everyday trigger (${topic.everyday_trigger || topic.contexts}). Make the viewer instantly identify with the situation.

[BEAT 3: 00:15 - 00:32 | THE MECHANISM REVEAL & VALUE TENSION]
• Visual: Fast graphic breakdown or visual demonstration of the psychological trap.
• Spoken Voiceover: Name the phenomenon ("${topic.phenomenon}"). Reveal the psychological driver (${topic.mechanism}) and expose the hidden tension: Who Benefits vs Who Pays.

[BEAT 4: 00:32 - 00:43 | THE REALITY CHECK]
• Visual: Direct-to-camera or high-contrast evidence pop-up.
• Spoken Voiceover: Bust the myth (${topic.myth || 'the common belief'}) and deliver the empirical reality-check (${topic.reality_check || topic.awakening_truth}).

[BEAT 5: 00:43 - 00:50 | THE HIGH-COMMENT DEBATE CLOSING]
• Visual: Closing frame with polarizing debate question on screen.
• Spoken Voiceover: "${visualEnding}"
• Viral Comment CTA: Force the viewer into a binary opinion or asking them to tag/share someone who does this constantly.

=======================================================
5. PRODUCTION & ALGORITHM GUARDRAILS
=======================================================
• Pacing: ~2.5 words per second. Fast, punchy, zero fluff.
• Sound Design Cues: Sub-bass hit at 0:00, subtle vinyl scratch / whoosh at 0:15 reveal, rhythmic driving instrumental bed.
• Caption Style: Large kinetic yellow/white captions in middle third of screen.
• Scientific Guardrails: ${topic.safe_claim_note || 'Treat the awakening line as an empirical research seed. Do not overstate universality; respect contextual boundary conditions.'}
${topic.sources && topic.sources.length > 0 ? `• Scholarly References: ${topic.sources.join(' | ')}` : ''}`;
}
