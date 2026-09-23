/**
 * KnowSights Standardized AI Search & Deep Research Investigation Prompt Generator
 * 
 * Generates an exhaustive, evidence-backed research dossier prompt engineered for
 * frontier AI search & deep research models (Perplexity, Gemini Deep Research, 
 * ChatGPT Search, Claude).
 * 
 * Specifically optimized for Evidence-First Investigation & Comprehensive Dossier Assembly:
 * - Starting leads, not established facts (claims are strengthened, corrected, or refuted)
 * - Verifiable empirical truth: Verified Fact / Strong Evidence / Interpretation / Disputed / Uncertain / Unsupported
 * - 10-part structured dossier output (Executive Summary, Findings, Key Evidence, Primary Materials, Sources)
 * - Strict research-only discipline: Zero superficial packaging (no hooks, titles, or scripts during research)
 */

import type { GeneratedTopicIdea, ProductionIdea } from '../types/index';

export interface StandardizedPromptParams {
  topic: string;
  hook?: string;
  angle?: string;
  subject?: string;
  topicFamily?: string;
  format?: string;
  overview?: string;
  keyPoints?: string;
  visualizationDirection?: string;
  sources?: string;
  coreQuestions?: string[];
  guidance?: string;
  articleTitle?: string;
  articleUrl?: string;
  authorityName?: string;
  originalSeed?: string;
}

/**
 * Builds the exhaustive, evidence-backed deep investigation prompt engineered for
 * frontier AI search & deep research agents (Perplexity, Gemini Deep Research, ChatGPT Search, Claude).
 * Dynamically populates topic metadata while strictly adhering to the standardized research dossier framework.
 */
export function buildStandardizedResearchPrompt(params: StandardizedPromptParams): string {
  const categoryStr = [params.subject, params.topicFamily].filter(Boolean).join(' / ');

  // 1. Gather all initial context, claims, notes, premise, and clues into structured background items
  const backgroundItems: string[] = [];

  if (categoryStr) {
    backgroundItems.push(`- **Domain / Field:** ${categoryStr}`);
  }

  // Prevent duplicate printing if overview was populated from hook
  const isOverviewDuplicated = params.overview && params.hook &&
    params.overview.trim().toLowerCase() === params.hook.trim().toLowerCase();

  if (params.overview && params.overview.trim() && !isOverviewDuplicated) {
    backgroundItems.push(`- **Initial Premise / Context:** ${params.overview.trim()}`);
  }

  if (params.hook && params.hook.trim()) {
    backgroundItems.push(`- **Initial Seed Claim / Working Hook:** "${params.hook.trim()}"`);
  }

  if (params.angle && params.angle.trim()) {
    backgroundItems.push(`- **Editorial Angle / Narrative Focus:** ${params.angle.trim()}`);
  }

  if (params.originalSeed && params.originalSeed.trim() && params.originalSeed.trim() !== params.topic.trim()) {
    backgroundItems.push(`- **Baseline Curriculum Seed:** "${params.originalSeed.trim()}"`);
  }

  if (params.format && params.format.trim()) {
    backgroundItems.push(`- **Target Signature Format:** ${params.format.trim()}`);
  }

  if (params.keyPoints && params.keyPoints.trim()) {
    backgroundItems.push(`- **Initial Key Notes & Hypotheses:**\n${params.keyPoints.trim()}`);
  }

  if (params.visualizationDirection && params.visualizationDirection.trim()) {
    backgroundItems.push(`- **Physical & Visual Evidence Clues:**\n${params.visualizationDirection.trim()}`);
  }

  if (params.coreQuestions && params.coreQuestions.length > 0) {
    backgroundItems.push(`- **Core Inquiry Questions Raised:**\n${params.coreQuestions.map((q, idx) => `  ${idx + 1}. ${q}`).join('\n')}`);
  }

  if (backgroundItems.length === 0) {
    backgroundItems.push(`- **Initial Premise:** Investigate the core mechanisms, verifiable evidence, chronology, and empirical facts behind "${params.topic}".`);
  }

  const backgroundBlock = backgroundItems.join('\n\n');

  // 2. Assemble reference sources and starting clues
  const referenceItems: string[] = [];

  if (params.sources && params.sources.trim()) {
    referenceItems.push(`- **Guidance & Repositories:** ${params.sources.trim()}`);
  }

  if (params.articleTitle && params.articleUrl) {
    referenceItems.push(`- **Seed Publication / Article:** "${params.articleTitle}" (${params.articleUrl})`);
  } else if (params.articleTitle) {
    referenceItems.push(`- **Seed Publication / Article:** "${params.articleTitle}"`);
  } else if (params.articleUrl) {
    referenceItems.push(`- **Reference Link:** ${params.articleUrl}`);
  }

  if (params.authorityName && params.authorityName.trim()) {
    referenceItems.push(`- **Key Authority / Publisher:** ${params.authorityName.trim()}`);
  }

  if (params.guidance && params.guidance.trim()) {
    referenceItems.push(`- **Additional Notes:** ${params.guidance.trim()}`);
  }

  if (referenceItems.length === 0) {
    referenceItems.push(`- Authoritative academic journals, institutional archives, museum records, field reports, and verified primary documentation.`);
  }

  const referenceBlock = referenceItems.join('\n\n');

  return `Conduct an exhaustive, evidence-backed investigation into the following topic:

• **TOPIC:** ${params.topic}

• **BACKGROUND / SEED INFORMATION:**
${backgroundBlock}

• **REFERENCE SOURCES / STARTING CLUES:**
${referenceBlock}

## OBJECTIVE

Build a reliable, comprehensive research dossier that can later be used for content development.

The topic may involve history, science, technology, archaeology, engineering, geopolitics, economics, discoveries, disasters, current affairs, mysteries, or any other evidence-based subject.

Treat all supplied seed information as **starting leads, not established facts**.

Independently determine the most important questions the topic raises and pursue the investigation wherever credible evidence leads.

Do not limit the research to the wording, assumptions, or direction of the seed material.

If new evidence reveals a more important question, contradiction, mechanism, person, event, cause, consequence, or angle, investigate it fully.

If a seed claim is accurate, strengthen it with evidence.
If partly accurate, correct it.
If exaggerated or unsupported, say so clearly.

## RESEARCH APPROACH

Search broadly across credible sources including:

* primary records and archives;
* official and institutional sources;
* universities, museums, and research organizations;
* peer-reviewed studies and scholarly books;
* technical, scientific, archaeological, and field reports;
* reputable specialist publications and journalism;
* historical newspapers, interviews, databases, and useful open-web sources.

Do not restrict the investigation to academic sources only. Valuable information may come from any credible source, but important claims should be independently verified where possible.

Actively pursue:

* core facts, chronology, and context;
* causes, mechanisms, and consequences;
* important people, places, events, objects, and discoveries;
* overlooked or lesser-known details;
* surprising or counterintuitive findings;
* myths versus evidence;
* contradictions and competing interpretations;
* unusual connections;
* unresolved questions and missing evidence;
* relevant dates, measurements, statistics, quotations, and primary records;
* useful visual material such as maps, documents, artifacts, photographs, diagrams, datasets, and locations.

For major claims, distinguish:

**Verified Fact / Strong Evidence / Interpretation / Disputed / Uncertain / Unsupported**

## OUTPUT

### 1. Executive Summary

What the investigation establishes overall.

### 2. Investigation Path

The most important questions that emerged during research and why they mattered.

### 3. Core Findings

The essential facts and strongest discoveries.

### 4. Detailed Research

Present the subject in the clearest logical, causal, thematic, or chronological structure.

### 5. Key Evidence

The strongest evidence supporting major findings.

### 6. Lesser-Known & Notable Findings

Important, surprising, unusual, or overlooked information uncovered during the investigation.

### 7. Causes, Mechanisms & Consequences

Where relevant, explain how and why things happened or worked and what followed.

### 8. Disputes, Gaps & Uncertainty

What remains debated, unclear, contradictory, or unsupported.

### 9. Useful Visual / Primary Materials

Relevant maps, records, artifacts, photographs, diagrams, datasets, locations, or archival materials.

### 10. Source Directory

Provide direct links to the most useful and credible sources, with a short note on what each contributes.

## FINAL RULE

Prioritize:

**ACCURACY → EVIDENCE → OPEN-ENDED INVESTIGATION → DEPTH → DISCOVERY → UNIQUE INFORMATION**

Do not write titles, hooks, scripts, CTAs, audience analysis, or content-packaging recommendations.

This stage is **research and information gathering only**.`.trim();
}

/**
 * Formats full clipboard text for a Topic Card (Today's Ideas mix or Production Pool)
 * Returns the pure, standardized AI research prompt directly.
 */
export function formatTopicCardCopyText(idea: ProductionIdea): string {
  if (idea.research_prompt && idea.research_prompt.trim()) {
    return idea.research_prompt.trim();
  }

  return buildStandardizedResearchPrompt({
    topic: idea.video_idea,
    hook: idea.curiosity_hook,
    angle: idea.content_angle,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: idea.content_brief_overview || idea.visualization_direction || idea.curiosity_hook || `Core concept for "${idea.video_idea}"`,
    keyPoints: idea.content_brief_key_points,
    visualizationDirection: idea.visualization_direction,
    sources: idea.starting_clues || idea.source_family_guidance || 'Authoritative historical archives, academic journals, and museum catalogs.',
    coreQuestions: idea.core_questions,
    originalSeed: (idea.original_video_idea && idea.original_video_idea !== idea.video_idea) ? idea.original_video_idea : undefined
  });
}

/**
 * Formats a 15–20 Minute YouTube Narrative Story & Deep-Dive Investigative Script Prompt for a ProductionIdea
 */
export function formatProductionIdeaStoryPrompt(idea: ProductionIdea): string {
  const coreQuestionsText = (idea.core_questions && idea.core_questions.length > 0)
    ? idea.core_questions.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')
    : `  1. "Why is the real truth behind this topic kept hidden from the public?"`;

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
   - Our audience consists of ordinary, curious human beings who want to understand why the world feels rigged, exhausting, or confusing.
   - STRIP AWAY all sterile clinical terminology, dry statistical abstractions, and textbook theorizing.
   - Speak in a magnetic, conversational, street-smart tone. Use visceral, evocative language that immediately connects.
   - Deliver constant "shocks of recognition" where the viewer stops in their tracks and realizes: "Wait... this happens all the time and I never noticed!"

2. THE "CHECKOUT CANDY" EFFECT (EXPOSING INVISIBLE CHOICE ARCHITECTURE):
   - Consider the classic supermarket checkout counter: You meticulously checked off every item on your grocery list. But while standing in the narrow checkout chute waiting to pay, your willpower has been depleted by dozens of micro-decisions throughout the store. Right at eye level—at arm's reach of exhausted adults and restless children—they deliberately place brightly colored chocolates and candies. It was never on your list, but you buy it to soothe immediate craving and fatigue.
   - Apply this exact investigative lens to "${idea.video_idea}":
     • What is the invisible architecture steering human behavior?
     • What psychological fatigue points, cognitive vulnerabilities, or subtle environmental tripwires are engineered to manipulate ordinary people into acting against their best interests while convinced they acted with complete free will?

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
1. TOPIC DOSSIER & RAW INTELLIGENCE FOUNDATION
--------------------------------------------------------------------------------
• CORE TOPIC / PHENOMENON: ${idea.video_idea} [ID: ${idea.idea_id}]
• SUBJECT & FAMILY: ${idea.subject} [${idea.topic_family}]
• CURIOSITY HOOK: "${idea.curiosity_hook || 'What is hiding in plain sight?'}"
• CONTENT ANGLE: ${idea.content_angle || 'Hidden mechanisms and systemic contradictions'}
• OVERVIEW & CONTEXT: ${idea.content_brief_overview || idea.visualization_direction || 'Everyday decision environments and institutional design'}
• KEY BEATS & EVIDENCE: ${idea.content_brief_key_points || 'Primary systemic tensions and behavioral nudges'}
• VISUAL DIRECTION: ${idea.visualization_direction || 'Cinematic documentary style, real-world case studies, dynamic motion graphics'}
• STARTING CLUES & ARCHIVES: ${idea.starting_clues || idea.source_family_guidance || 'Academic literature, patent databases, and historical declassifications'}
• CORE INVESTIGATIVE QUESTIONS:
${coreQuestionsText}

--------------------------------------------------------------------------------
2. REQUIRED OUTPUT DELIVERABLES — EXECUTE ALL 3 PHASES IN FULL
--------------------------------------------------------------------------------

PHASE 1: THE INVESTIGATIVE INTELLIGENCE DOSSIER (DEEP RESEARCH & ANGLES)
Conduct an exhaustive investigative breakdown of "${idea.video_idea}":
1. The Hidden Architecture & Cognitive Vulnerabilities (how human cognition is quietly exploited).
2. The Everyday Manipulation Exemplar (The "Checkout Candy" Parallel applied to this topic).
3. Sub-Applications Across 4 Core Arenas (Retail/Commerce, Apps/Algorithms, Workplace/Institutions, Social Dynamics).
4. The Paper Trail & Historical Roots (patents, behavioral experiments, leaked corporate memos).
5. The Incentive Audit & "Manufactured Guilt" (who profits, who bears the real cost, and why victims blame themselves).

PHASE 2: COMPLETE 15–20 MINUTE YOUTUBE MASTER SCRIPT (SCENE-BY-SCENE)
Write a full, cinematic narration script (~2,500 – 3,500 words of spoken voiceover + detailed visual and pacing cues):
• PROLOGUE: THE INVISIBLE TRIPWIRE (0:00 – 2:30)
• CHAPTER 1: THE ANATOMY OF THE TRAP (2:30 – 6:00)
• CHAPTER 2: THE ARCHITECTS & THE PLAYBOOK (6:00 – 10:00)
• CHAPTER 3: THE EXPANDING WEB — CROSS-INDUSTRY MANIPULATIONS (10:00 – 14:00)
• CHAPTER 4: THE CUI BONO — WHO PROFITS & WHO PAYS (14:00 – 17:00)
• CHAPTER 5: BREAKING THE SPELL — MENTAL ARMOR & THE AWAKENING (17:00 – 20:00)

PHASE 3: YOUTUBE ALGORITHM PACKAGING & RETENTION ACCELERATOR
1. 5 High-CTR Curiosity-Driven Video Titles.
2. 3 High-Conversion Thumbnail Concepts (contrast, composition, text < 4 words).
3. Viral Pinned Comment & Community Debate Igniter.
4. 3 Tangible Visual Metaphors for Video Editors.`;
}


/**
 * Formats full clipboard text for the Source-Ready Research Brief modal
 * Returns the pure, standardized AI research prompt incorporating the brief's overview and key beats.
 */
export function formatBriefModalCopyText(params: {
  ideaId?: string;
  title: string;
  overview: string;
  keyPoints: string;
  sources: string;
  readyStatus?: string;
  hook?: string;
  angle?: string;
  subject?: string;
  topicFamily?: string;
  format?: string;
  visualizationDirection?: string;
  originalSeed?: string;
  researchPrompt?: string;
  coreQuestions?: string[];
}): string {
  if (params.researchPrompt && params.researchPrompt.trim()) {
    return params.researchPrompt.trim();
  }

  return buildStandardizedResearchPrompt({
    topic: params.title,
    hook: params.hook,
    angle: params.angle,
    subject: params.subject,
    topicFamily: params.topicFamily,
    format: params.format,
    overview: params.overview,
    keyPoints: params.keyPoints,
    visualizationDirection: params.visualizationDirection,
    sources: params.sources,
    coreQuestions: params.coreQuestions,
    originalSeed: params.originalSeed
  });
}

/**
 * Formats full clipboard text for a Discovery Lab generated topic idea card
 * Returns the pure, standardized AI research prompt directly.
 */
export function formatDiscoveryIdeaCopyText(idea: GeneratedTopicIdea): string {
  if (idea.research_prompt && idea.research_prompt.trim()) {
    return idea.research_prompt.trim();
  }

  const articleTitle = idea.source_article_title || idea.video_idea;
  const primaryUrl = idea.source_url || idea.source_official_url || '';
  const officialUrl = idea.source_official_url || (idea.source_url ? new URL(idea.source_url).origin : '');

  return buildStandardizedResearchPrompt({
    topic: idea.video_idea,
    hook: idea.curiosity_hook,
    angle: idea.content_angle,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: idea.content_brief_overview || `${idea.source_name} reporting on "${articleTitle}". ${idea.visualization_direction || ''}`,
    keyPoints: idea.content_brief_key_points,
    visualizationDirection: idea.visualization_direction,
    sources: idea.starting_clues || `${idea.source_name} (${officialUrl || primaryUrl}). Article link: ${primaryUrl}`,
    coreQuestions: idea.core_questions,
    articleTitle: articleTitle,
    articleUrl: primaryUrl,
    authorityName: idea.source_name,
    originalSeed: idea.original_video_idea
  });
}
