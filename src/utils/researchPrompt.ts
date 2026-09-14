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
