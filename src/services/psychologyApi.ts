import { 
  PsychologyTopic, 
  PsychologyFilterState, 
  PsychologyStats, 
  PSYCHOLOGY_SECTORS,
  PSYCHOLOGY_DIMENSIONS 
} from '../types/psychology';

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

    // 1b. Systemic Dimension filter
    if (filter.dimension && filter.dimension !== 'all') {
      const targetDim = filter.dimension.toLowerCase();
      const topicDim = (t.dimension || '').toLowerCase();
      const matchedConfig = PSYCHOLOGY_DIMENSIONS.find(d => 
        d.name.toLowerCase() === targetDim || d.slug.toLowerCase() === targetDim
      );
      if (matchedConfig) {
        if (topicDim !== matchedConfig.name.toLowerCase()) {
          return false;
        }
      } else if (topicDim !== targetDim) {
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
  const dimensionCountMap: Record<string, number> = {};

  for (const t of topics) {
    sectorCountMap[t.sector] = (sectorCountMap[t.sector] || 0) + 1;
    if (t.dimension) {
      dimensionCountMap[t.dimension] = (dimensionCountMap[t.dimension] || 0) + 1;
    }
  }

  const sectors = PSYCHOLOGY_SECTORS.map(s => ({
    name: s.name,
    count: sectorCountMap[s.name] || 0,
    color: s.color
  }));

  const dimensions = PSYCHOLOGY_DIMENSIONS.map(d => ({
    name: d.name,
    slug: d.slug,
    count: dimensionCountMap[d.name] || 0,
    color: d.color,
    badgeClass: d.badgeClass
  }));

  return {
    total: topics.length,
    studiedCount: studiedIds.size,
    bookmarkedCount: bookmarkedIds.size,
    sectors,
    dimensions
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
• CRITICAL SYSTEMIC DIMENSION: ${topic.dimension || 'Psychological Manipulation & Systemic Dynamics'}
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

// Master 15–20 Minute YouTube Narrative Story & Investigative Deep-Dive Prompt Formatter
// Engineered for ChatGPT, Claude, and Gemini to autonomously conduct deep research, uncover shrouded angles,
// systemic contradictions, and hidden manipulation playbooks, producing a complete 15-20 min video essay script
// (~2,500–3,500 words) tailored to the curious general public.
export function formatPsychologyNarrativeStoryPrompt(topic: PsychologyTopic): string {
  const hooksList = (topic.candidate_hooks && topic.candidate_hooks.length > 0)
    ? topic.candidate_hooks.slice(0, 4).map((h, i) => `  ${i + 1}. "${h}"`).join('\n')
    : `  1. "${topic.awakening_truth || topic.prompt || 'Why do smart, rational people fall for this trap without realizing it?'}"`;

  const visualScenes = (topic.candidate_scenes && topic.candidate_scenes.length > 0)
    ? topic.candidate_scenes.slice(0, 4).join(' | ')
    : (topic.contexts || 'Supermarket checkout aisles, late-night smartphone feeds, workplace cubicles, banking portals');

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
MASTER INVESTIGATIVE STORYTELLING PROMPT: 15–20 MINUTE YOUTUBE DOCUMENTARY
Target Format: Long-Form High-Retention YouTube Video Essay / Story Narration
Target Runtime: 15 to 20 Minutes (~2,500 to 3,500 Spoken Script Words + Scene Direction)
Universe: Hidden Realities, Choice Architecture, and Unconscious Manipulation
Objective: Deep-Dive Investigative Research Dossier + Complete Turnkey Video Script
================================================================================

[YOUR INVESTIGATIVE & STORYTELLING IDENTITY]
You are an elite investigative documentary director, master behavioral psychologist, and world-class YouTube narrative architect (combining the hypnotic narrative pacing of Johnny Harris and MagnatesMedia, the systemic forensic eye of Vox and Coffeezilla, and the behavioral clarity of Daniel Kahneman and Robert Cialdini).

Your assignment is to conduct an exhaustive multi-source investigation into the verified topic below, and synthesize your findings into a riveting, cinematic, 15 to 20-minute narration-driven YouTube video script and intelligence dossier.

--------------------------------------------------------------------------------
[CRITICAL CREATIVE DIRECTIVES — READ CAREFULLY BEFORE WRITING]
--------------------------------------------------------------------------------
1. WRITTEN FOR THE CURIOUS GENERAL PUBLIC (ZERO ACADEMIC JARGON):
   - Our audience is NOT an auditorium of university professors or psychology PhDs.
   - Our audience consists of ordinary, curious human beings who want to understand why the world feels rigged, exhausting, or confusing.
   - STRIP AWAY all sterile clinical terminology, dry statistical abstractions, and textbook theorizing.
   - Speak in a magnetic, conversational, street-smart tone. Use visceral, evocative language that immediately connects.
   - Deliver constant "shocks of recognition" where the viewer stops in their tracks and realizes: "Wait... this happened to me this morning and I thought it was completely my own decision!"

2. UNMASKING INVISIBLE CHOICE ARCHITECTURE (DERIVE TOPIC-SPECIFIC EVERYDAY ANALOGIES):
   - You have complete investigative freedom to discover and craft the most compelling, organic everyday analogy tailored specifically to "${topic.phenomenon}".
   - Core Philosophy: In modern society, environments and systems are deliberately engineered to steer human decisions beneath conscious awareness. Whether it is retail stores positioning impulse triggers at decision-fatigue choke points, smartphone apps timing notifications when cognitive resistance is lowest, workplace policies manufacturing compliance through subtle peer friction, or banks designing default options to extract recurring fees—every psychological and systemic dynamic has its own distinct everyday playground.
   - Do NOT force a rigid or fixed analogy across topics. Instead, examine the core mechanism of "${topic.phenomenon}" and derive a bespoke, intuitive everyday parallel:
     • Where in modern life does an ordinary person walk right into this trap?
     • What psychological fatigue points, cognitive blind spots, or environmental tripwires are engineered to manipulate them?
     • How does the design trick them into believing they acted with 100% conscious free will?

3. SEPARATING LAZY PARANOIA FROM DOCUMENTED SYSTEMIC REALITY:
   - We do NOT deal in baseless, amateur conspiracy fantasies.
   - Instead, expose the far more chilling, DOCUMENTED reality: the patents, commercial consulting playbooks, corporate incentive structures, casino math, and algorithmic loops that manipulate human decisions in broad daylight because they are legally, mathematically, and culturally institutionalized.

4. 15–20 MINUTE AUDIENCE RETENTION ARCHITECTURE:
   - YouTube viewers drop off if a video gets repetitive or preachy. You must structure this with relentless narrative momentum:
     • Pattern interrupts every 90 seconds (visual shifts, audio cues, perspective flips).
     • Nested curiosity loops: Introduce an unsettling mystery before resolving the previous revelation.
     • Concrete micro-demonstrations that challenge the viewer to test their own reaction right in their chair.
     • Dynamic escalation: Start with a relatable, tiny everyday trap, zoom out to corporate billions and historical blueprints, and climax with a profound awakening of personal autonomy.

--------------------------------------------------------------------------------
1. VERIFIED TOPIC DOSSIER & RAW INTELLIGENCE FOUNDATION
--------------------------------------------------------------------------------
• CORE PHENOMENON / SUBJECT: ${topic.phenomenon} [ID: ${topic.id}]
• CRITICAL SYSTEMIC DIMENSION: ${topic.dimension || 'Psychological Manipulation & Systemic Dynamics'}
• SECTOR & DISCIPLINE: ${topic.sector} [${topic.category} • ${topic.type}${topic.subtype ? ` • ${topic.subtype}` : ''}]
• FORMAL DEFINITION: ${topic.definition}
• UNDERLYING MECHANISM: ${topic.mechanism || topic.definition}
• RELATABLE EVERYDAY TRIGGER: ${topic.everyday_trigger || topic.contexts || 'Everyday decision friction'}
• REAL-WORLD ARENAS: ${topic.contexts || 'Retail environments, digital feeds, corporate workplaces, financial apps'}
• TARGET AUDIENCE: ${topic.audience} (${topic.role_tag || 'General Public'})
• EMOTIONAL LENS: ${topic.lens || 'Startling Realization & Provocative Curiosity'}

[THE INCENTIVE AUDIT & CONTRADICTION MATRIX]
• THE POPULAR ILLUSION (What the public assumes): "${topic.hidden_assumption || 'People believe they make choices with complete conscious autonomy.'}"
• WHO PROFITS / THE ARCHITECTS: ${topic.who_benefits || 'Corporate platforms, institutions, advertisers, or social hierarchies extracting compliance, time, or capital'}
• WHO BEARS THE COST (The unaware public): ${topic.who_pays || 'The individual through wasted energy, financial drain, guilt, or cognitive exhaustion'}
• POPULAR POP-PSYCH MYTH: ${topic.myth || 'That this only happens to gullible or weak-willed individuals.'}
• AWAKENING REALITY CHECK: ${topic.reality_check || topic.awakening_truth || 'This is an engineered or evolved behavioral blind spot that affects virtually everyone.'}
• UNCOMFORTABLE CORE QUESTION: "${topic.uncomfortable_q || 'If you realized you were being steered, could you stop yourself?'}"

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
2. REQUIRED OUTPUT DELIVERABLES — EXECUTE ALL 3 PHASES IN FULL
--------------------------------------------------------------------------------

PHASE 1: THE INVESTIGATIVE INTELLIGENCE DOSSIER (DEEP RESEARCH & ANGLES)
Conduct an exhaustive investigative breakdown of "${topic.phenomenon}":
1. The Hidden Architecture & Cognitive Vulnerabilities:
   - In plain English, how does this mechanism hijack human cognition?
   - What biological, neurological, or evolutionary vulnerabilities does it exploit (e.g. ego depletion, default biases, loss aversion, hyperbolic discounting)?
2. Bespoke Everyday Manipulation Analogy & Walkthrough:
   - Formulate a tailored, highly relatable real-world situation that naturally fits "${topic.phenomenon}". Walk the viewer step-by-step through how an ordinary person walks right into this psychological trap today, convinced it was their own spontaneous idea. Break down each subtle nudge, cognitive friction, or environmental trigger along the journey.
3. Sub-Applications Across 4 Core Arenas:
   - Demonstrate how "${topic.phenomenon}" is systematically applied across:
     (a) Retail, Consumer Goods & E-Commerce
     (b) Smartphone Apps, Social Feeds & Digital Algorithms
     (c) Corporate Workplaces, Banking & Institutional Systems
     (d) Interpersonal Relationships, Social Proof & Dating/Family Dynamics
4. The Paper Trail & Historical Roots:
   - Uncover the historical origins: What experiments, psychological studies, corporate consulting firms, or patents first weaponized this mechanism?
5. The Incentive Audit & "Manufactured Guilt":
   - Follow the money: Who monetizes this behavior, and how much is extracted?
   - How does the system condition people to blame their own "weak willpower" or "bad habits" rather than the engineered choice architecture around them?

PHASE 2: COMPLETE 15–20 MINUTE YOUTUBE MASTER SCRIPT (SCENE-BY-SCENE)
Write a full, cinematic narration script (~2,500 – 3,500 words of spoken voiceover + detailed visual and pacing cues) divided into the following timed chapters:

• PROLOGUE: THE INVISIBLE TRIPWIRE (0:00 – 2:30)
  - Visuals / B-Roll: An unsettling, relatable everyday scene unfolding in cinematic detail.
  - Narration: An electrifying pattern interrupt challenging the viewer's belief in their own decision-making autonomy.
  - The Micro-Demonstration: An interactive thought experiment or brain test that immediately catches the viewer off-guard.
  - The Core Stakes: State the shocking question this documentary will investigate.

• CHAPTER 1: THE ANATOMY OF THE TRAP (2:30 – 6:00)
  - Visuals / Cues: Dynamic kinetic typography, graphic split-screens, behavioral animations.
  - Narration: Peel back the curtain. Explain "${topic.phenomenon}" in crisp, street-smart terms.
  - Relatable Story: Walk through a concrete everyday scenario showing how the trap operates beneath conscious awareness.
  - The Core Glitch: Why smart, educated people walk right into this trap every day.

• CHAPTER 2: THE ARCHITECTS & THE PLAYBOOK (6:00 – 10:00)
  - Visuals / Cues: Archival footage, patent diagrams, leaked corporate documents, dark aesthetic.
  - Narration: Who designed this? How did consumer science, casino architects, or tech engineers turn a human quirk into a multi-billion dollar harvesting machine?
  - Debunking the Myth: Shatter the conventional wisdom and pop-psych excuse ("${topic.myth || 'Only weak people fall for this'}").

• CHAPTER 3: THE EXPANDING WEB — CROSS-INDUSTRY MANIPULATIONS (10:00 – 14:00)
  - Visuals / Cues: Fast-paced montage across modern life (supermarkets, smartphones, banking apps, office meetings).
  - Narration: Show how the same exact lever from Chapter 1 is stealthily deployed across completely different aspects of the viewer's life without them connecting the dots.
  - Systemic Contradictions & Shrouded Angles: Expose the perverse incentives and hidden societal costs that nobody talks about.

• CHAPTER 4: THE CUI BONO — WHO PROFITS & WHO PAYS (14:00 – 17:00)
  - Visuals / Cues: Financial flow charts, stark minimalist graphics, emotional human close-ups.
  - Narration: Follow the money and power. The chilling contrast between the billions extracted by institutions and the silent exhaustion, anxiety, and drained bank accounts of the public.
  - Dismantling the Blame: Liberate the viewer from manufactured self-blame by proving the game was rigged before they walked into the room.

• CHAPTER 5: BREAKING THE SPELL — MENTAL ARMOR & THE AWAKENING (17:00 – 20:00)
  - Visuals / Cues: Warmer lighting, empowering visual motifs, crisp typography.
  - Narration: Transition from exposure to empowerment.
  - The 3-Step Reality Check: Tactical, concrete rules of thumb the viewer can use starting today to spot the invisible tripwires in real time.
  - The Philosophical Epiphany: An unforgettable closing monologue on free will, conscious attention, and regaining sovereignty in an engineered world.
  - Call to Action & Community Discussion Hook.

PHASE 3: YOUTUBE ALGORITHM PACKAGING & RETENTION ACCELERATOR
1. 5 High-CTR Curiosity-Driven Video Titles:
   - Provide 5 distinct title angles (The Expose, The Systemic Trap, The Psychological Reveal, The Everyday Mystery, The Provocative Question).
2. 3 High-Conversion Thumbnail Concepts:
   - Visual layout, visual contrast points, face/object juxtaposition, and high-impact text overlay (under 4 words).
3. Viral Pinned Comment & Community Debate Igniter:
   - A provocative, boundary-pushing question designed to spark 500+ comments and fuel the YouTube recommendation algorithm.
4. 3 Tangible Visual Metaphors for Video Editors:
   - Practical props, visual motifs, or graphic metaphors that make the invisible mechanism immediately visual and unforgettable.`;
}

