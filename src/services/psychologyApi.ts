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

// Master Investigative Research & Narrative Intelligence Dossier Formatter
// Designed for ChatGPT, Gemini, and Claude to generate full, comprehensive intelligence reports
// for the "Wise Wolf vs. Naive Sheep" series (debunking myths, exposing systemic traps, Socratic dialogues,
// plain-English translations for the general public, and flexible runtimes from 60s reels to 5+ min deep-dives).
export function formatPsychologyScriptPrompt(topic: PsychologyTopic): string {
  // Format hooks for inspiration
  const hooksList = (topic.candidate_hooks && topic.candidate_hooks.length > 0)
    ? topic.candidate_hooks.slice(0, 4).map((h, i) => `  ${i + 1}. "${h}"`).join('\n')
    : `  1. "${topic.awakening_truth || topic.prompt || 'Why do smart, rational people fall for this trap without realizing it?'}"`;

  const visualScenes = (topic.candidate_scenes && topic.candidate_scenes.length > 0)
    ? topic.candidate_scenes.slice(0, 4).join(' | ')
    : (topic.contexts || 'Everyday workplace, digital feeds, retail stores, personal relationships');

  const candidateEndings = (topic.candidate_endings && topic.candidate_endings.length > 0)
    ? topic.candidate_endings.slice(0, 3).map((e, i) => `  ${i + 1}. "${e}"`).join('\n')
    : `  1. "${topic.uncomfortable_q || 'If you realized you were being steered, could you stop yourself?'}"`;

  const candidateAngles = (topic.candidate_angles && topic.candidate_angles.length > 0)
    ? topic.candidate_angles.slice(0, 3).map((a, i) => `  ${i + 1}. ${a}`).join('\n')
    : `  1. ${topic.angle || 'Hidden psychological mechanism + systemic friction'}`;

  const sourcesList = topic.sources && topic.sources.length > 0 
    ? topic.sources.join('\n• ') 
    : 'Primary academic synthesis and peer-reviewed behavioral research';

  return `================================================================================
"WISE WOLF vs. NAIVE SHEEP" — MASTER RESEARCH & STORY INTELLIGENCE DOSSIER
Universe: Debunking Common Myths, Exposing Cognitive Traps & Institutional Deceptions
Target Channel: "Wise Wolf vs. Naive Sheep" (90–120 Video Intellectual Entertainment Series)
Objective: Comprehensive Full Intelligence Report for High Replay, Viral Reach & Video Production
================================================================================

[MISSION & CREATIVE IDENTITY]
This dossier is engineered for the flagship intellectual entertainment series: "Wise Wolf vs. Naive Sheep".
• THE NAIVE SHEEP: Represents comfortable conventional wisdom, unquestioned mainstream consensus, what "everybody knows", trusting the default system, and the ordinary consumer who internalizes self-blame ("I must just lack discipline or willpower").
• THE WISE WOLF: Represents the street-smart, razor-sharp critical thinker. Never arrogant, never speaking down from an academic ivory tower. Speaks in plain, punchy, everyday language. Looks beneath the surface, follows the hidden incentives, asks lethal Socratic questions ("Who told you that? Who profits when you believe it?"), and systematically exposes the invisible psychological levers pulling the strings.
• ULTIMATE OUTCOME: Viewers watch repeatedly, save the video, share it with family and friends ("You need to watch this right now"), and trigger intense discussion in the comments.

[EXECUTIVE MANDATE FOR AI RESEARCHER & STORY ARCHITECT]
You are acting as an elite investigative researcher, master behavioral psychologist, and world-class narrative architect.
Your objective is to deliver a FULL, EXHAUSTIVE INTELLIGENCE REPORT AND STORY DOSSIER based on the verified topic data below.

CRITICAL GUIDELINES YOU MUST FOLLOW:
1. TARGET AUDIENCE IS THE EVERYDAY GENERAL PUBLIC:
   - Our audience is NOT a room of PhD social scientists or academic theorists.
   - Our audience consists of ordinary people scrolling social media, YouTube, and Facebook Reels.
   - STRIP AWAY all dry academic jargon, clinical abstracts, and textbook theorizing.
   - TRANSLATE complex psychological mechanisms into simple, vivid, intuitive, and mind-awakening insights that immediately click.
   - Ground every concept in relatable everyday life situations (workplaces, grocery stores, scrolling social media feeds, banking, relationships, and family dynamics).
   - Give the viewer an electrifying shock of personal recognition: "Wait... that happens to me every single day without me realizing it!"

2. COMPLETE DOSSIER — NO TRUNCATION:
   - Devise a comprehensive, end-to-end report containing all necessary background data, systemic incentive analyses, verified evidence, psychological mechanics, storytelling angles, and dialogue scripts.
   - Do NOT produce a lazy 3-sentence summary. Give us the full investigative firepower and narrative foundation so we can develop the video script seamlessly.

3. FLEXIBLE VIDEO RUNTIME FREEDOM:
   - Video length is completely flexible depending on the story's depth.
   - This dossier must equip us to produce EITHER:
     (A) A razor-sharp, punchy 60–90 second viral short / reel, OR
     (B) An expanded 3 to 7+ minute longer-form explainer video / mini-documentary if the topic's revelation, historical context, systemic manipulation, and dramatic arc require more room to be fully explained, captivating, and mind-awakening.
   - Provide enough substantive details, story beats, and dialogue depth to support both formats effortlessly.

--------------------------------------------------------------------------------
1. VERIFIED TOPIC DOSSIER & RAW KNOWLEDGE BASE
--------------------------------------------------------------------------------
• PHENOMENON / TOPIC: ${topic.phenomenon} [ID: ${topic.id}]
• SECTOR & DISCIPLINE: ${topic.sector} [${topic.category} • ${topic.type}${topic.subtype ? ` • ${topic.subtype}` : ''}]
• CORE DEFINITION: ${topic.definition}
• UNDERLYING MECHANISM: ${topic.mechanism || topic.definition}
• RELATABLE EVERYDAY TRIGGER: ${topic.everyday_trigger || topic.contexts || 'Everyday decision friction'}
• REAL-WORLD CONTEXTS: ${topic.contexts || 'Everyday life, workplace, digital algorithms, marketplaces'}
• TARGET AUDIENCE: ${topic.audience} (${topic.role_tag || 'General Public'})
• EMOTIONAL LENS: ${topic.lens || 'Startling Realization & Provocative Curiosity'}

[THE SYSTEMIC CONTRADICTION & INCENTIVE MATRIX]
• THE HIDDEN ASSUMPTION (What the public falsely believes): "${topic.hidden_assumption || 'People believe they make choices with complete conscious autonomy.'}"
• WHO BENEFITS / PROFITS (The hidden winners): ${topic.who_benefits || 'Corporate platforms, institutions, advertisers, or social hierarchies extracting compliance, time, or capital'}
• WHO PAYS / BEARS THE REAL COST (The unaware public): ${topic.who_pays || 'The individual through wasted energy, financial drain, guilt, or cognitive exhaustion'}
• POPULAR POP-PSYCH MYTH: ${topic.myth || 'That this only happens to gullible or weak-willed individuals.'}
• AWAKENING REALITY CHECK: ${topic.reality_check || topic.awakening_truth || 'This is an engineered or evolved behavioral blind spot that affects virtually everyone.'}
• UNCOMFORTABLE Socratic Question: "${topic.uncomfortable_q || 'If you realized you were being steered, could you stop yourself?'}"

[DATABASE INGREDIENTS & CITATION FOUNDATION]
• Primary Seed Angle: ${topic.angle || 'Hidden mechanism + systemic friction'}
• Candidate Angles from Curriculum:
${candidateAngles}
• Tested Hook Seeds:
${hooksList}
• Suggested Scene Environments: ${visualScenes}
• Candidate Ending Hooks:
${candidateEndings}
• Documented Sources & Empirical DOIs:
• ${sourcesList}
• Scientific Guardrail / Safe Claim Boundary: ${topic.safe_claim_note || 'Avoid sweeping absolutes; highlight conditions and everyday human context.'}

--------------------------------------------------------------------------------
2. REQUIRED DOSSIER OUTPUT DELIVERABLES
--------------------------------------------------------------------------------
Please generate a structured, publication-grade intelligence report organized into the following 6 sections:

PART 1: THE PLAIN-ENGLISH TRANSLATION & MIND-AWAKENING REVELATION
- The Street-Smart Translation: Explain "${topic.phenomenon}" in simple, magnetic, everyday language that anyone can understand without needing a dictionary.
- The "Hidden Matrix" Breakdown: Contrast the everyday illusion people live in against the shocking reality behind the curtain.
- 2 Relatable Real-World Scenarios: Detail two vivid, concrete everyday situations where an ordinary person walks right into this psychological trap (e.g. while shopping, scrolling an app, in an office meeting, or dealing with money/relationships).

PART 2: WHO BENEFITS VS. WHO PAYS — THE INCENTIVE AUDIT
- The Cui Bono ("Who Profits?"): Unpack the power dynamic. Who leverages this psychological bias (corporations, platforms, institutions, advertising, social hierarchies)? How do they quietly extract attention, compliance, or money while staying invisible?
- The Manufactured Blame: How does society or the system convince the individual that their struggle is a personal flaw (lack of willpower, discipline, or intelligence), while the environment is deliberately engineered to cause that exact result?
- Real-World Case Study: Provide 1–2 documented, concrete real-world or historical examples that demonstrate this exact mechanism in action. Ground them specifically in "${topic.phenomenon}".

PART 3: "WISE WOLF vs. NAIVE SHEEP" — MASTER SOCRATIC DIALOGUE SCRIPTS
Write 2 complete, captivating dialogue exchanges between the Wise Wolf and the Naive Sheep, tailored specifically to "${topic.phenomenon}":
- DIALOGUE 1 (The Socratic Confrontation):
  • The Sheep starts with absolute certainty, defending a common myth or conventional advice.
  • The Wolf calmly asks lethal, precision Socratic questions that unravel the Sheep's assumptions.
  • The Wolf exposes who taught the Sheep that belief, who profits from it, and what is actually happening behind the scenes.
  • End on an unforgettable mind-awakening realization where the Sheep's worldview shatters.
- DIALOGUE 2 (The Real-Time Trap):
  • Show the Sheep caught in the middle of a common daily decision, totally convinced they are acting out of free will.
  • The Wolf steps in and highlights the invisible puppet strings, subtle nudges, and calculated architecture steering the Sheep's choice in real time.
(Make both dialogues natural, punchy, witty, dramatic, and intensely quotable. Zero academic jargon.)

PART 4: MULTI-FORMAT STORYTELLING BLUEPRINTS (FLEXIBLE RUNTIMES)
To give us complete creative freedom in video production, provide full narrative blueprints for two distinct runtimes:
- BLUEPRINT A: 60–90 SECOND VIRAL SHORT / REEL FORMAT
  • The 3-Second Visual & Verbal Hook (pattern interrupt)
  • Rapid Disruption of Consensus (shattering the common assumption)
  • The Wolf's Revelation & Demonstration
  • The Awakening Punchline & Comment Ignition Call-to-Action
- BLUEPRINT B: 3 TO 5+ MINUTE EXPANDED EXPLAINER / MINI-DOCUMENTARY FORMAT
  • Act 1: The Illusion of Normalcy (an intriguing mystery or paradox hiding in plain sight)
  • Act 2: The Hidden Machinery (how the psychological mechanism works in plain English)
  • Act 3: The Beneficiaries & The Playbook (who engineered or monetizes this behavior)
  • Act 4: The Human Toll (the hidden cost on an ordinary person's wallet, time, or mental peace)
  • Act 5: The Awakening & Mental Armor (how the viewer can spot the trap, break free, and cultivate the Wolf's mindset)

PART 5: HIGH-VALUE VISUAL METAPHORS & CINEMATIC REPLAY HOOKS
- 3 Cinematic Visual Metaphors: Propose visual imagery, split screens, practical props, or animation concepts that illustrate "${topic.phenomenon}" in a way that viewers can understand in a single glance.
- Replay-Value Clues & Hidden Details: What visual cues, dual-meaning phrases, or subtle background elements should be planted so that viewers will immediately want to rewatch the video 2–3 times to catch what they missed?
- On-Screen Typography & Audio Cues: Specify dynamic text overlays, sound design hits, and pacing markers to maximize viewer retention.

PART 6: VIRAL SPARKS, DEBATE IGNITERS & MENTAL ARMOR
- The Awakening Punchline: One unforgettable, philosophical quote that encapsulates the core truth of this topic — crafted to be screenshotted, saved, and shared.
- 3 High-Engagement Debate Questions: Formulate 3 provocative, boundary-pushing questions designed to spark heated, thoughtful debates in the comment section.
- The Practical "Wolf Mindset" Takeaway: One actionable, street-smart rule of thumb an everyday person can use today to protect themselves from this trap.`;
}
