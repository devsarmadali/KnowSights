/**
 * KnowSights Standardized AI Search Agent Prompt Generator
 * 
 * Generates clean, production-ready research prompts engineered for AI search agents
 * (Perplexity, Gemini Deep Research, ChatGPT Search, Claude Research).
 * 
 * Excludes internal application metadata (e.g. "KNOWSIGHTS RESEARCH BRIEF", "Idea ID",
 * decorative ASCII bars) so the output is a pure, ready-to-execute research prompt.
 */

import type { GeneratedTopicIdea, ProductionIdea } from '../types/index';

export interface StandardizedPromptParams {
  topic: string;
  hook?: string;
  subject?: string;
  topicFamily?: string;
  format?: string;
  overview?: string;
  keyPoints?: string;
  sources?: string;
  coreQuestions?: string[];
  guidance?: string;
  articleTitle?: string;
  articleUrl?: string;
  authorityName?: string;
  originalSeed?: string;
}

/**
 * Builds the pure standardized AI search agent prompt with positioned placeholders.
 * Strictly avoids internal application wrappers or ID bookkeeping.
 */
export function buildStandardizedResearchPrompt(params: StandardizedPromptParams): string {
  const categoryStr = [params.subject, params.topicFamily].filter(Boolean).join(' / ') || 'General Knowledge & Historical Inquiries';
  const hookStr = params.hook ? `"${params.hook}"` : `Investigate the counterintuitive truth and lesser-known historical/scientific reality behind ${params.topic}.`;
  const formatStr = params.format || 'Case Study Breakdown with primary source evidence';
  const seedReferenceStr = params.sources || 'Authoritative academic publications, peer-reviewed journals, national archives, and museum catalogs.';
  const overviewStr = params.overview || `Comprehensive investigative breakdown into the origins, mechanisms, evidence, and historical/scientific implications of "${params.topic}".`;

  const seedContext = params.originalSeed
    ? `\n• BASELINE CURRICULUM SEED: "${params.originalSeed}"`
    : '';

  const keyPointsBlock = params.keyPoints && params.keyPoints.trim()
    ? `\n• KEY RESEARCH BEATS & INQUIRY ANGLES:\n${params.keyPoints.trim()}`
    : '';

  const questionsBlock = params.coreQuestions && params.coreQuestions.length > 0
    ? `\n• CORE INQUIRY QUESTIONS TO RESOLVE:\n${params.coreQuestions.map((q, idx) => `  ${idx + 1}. ${q}`).join('\n')}`
    : '';

  const articleBlock = params.articleTitle && params.articleUrl
    ? `\n• INITIAL SEED ARTICLE: "${params.articleTitle}" (${params.articleUrl})`
    : '';

  return `Act as an elite investigative documentary researcher and master storytelling fact-checker specializing in ${categoryStr}. Conduct an exhaustive, open-web, evidence-backed deep dive on the following topic, unique concept, and curiosity angle:

• TARGET TOPIC: ${params.topic}${seedContext}
• UNIQUE ANGLE & HOOK: ${hookStr}
• CORE CONCEPT & OVERVIEW: ${overviewStr}${keyPointsBlock}
• SIGNATURE FORMAT STYLE: ${formatStr}
• REFERENCE SEED (STARTING CLUE ONLY): ${seedReferenceStr}${articleBlock}
  ⚠️ CRITICAL SOURCE MANDATE: The reference above is ONLY an initial seed and context springboard. Do NOT restrict or limit your research to this single publication or domain. You are explicitly authorized and instructed to gather credible data across ALL relevant, authentic, and renowned sources on the web (peer-reviewed academic journals, museum catalogs, archaeological field reports, national archives, and university research libraries).
${questionsBlock}
CORE EDITORIAL DIRECTIVE (ACCESSIBLE TO BROAD AUDIENCES • DEEPLY RIGOROUS):
1. BROAD PUBLIC ACCESSIBILITY (ZERO ESOTERIC JARGON): The end goal is to prepare a compelling, high-retention report suitable for YouTube documentaries, video essays, social media audiences, and the curious broad public. Do NOT write in dry academic dissertation prose or bury insights under dense, impenetrable jargon. Translate complex scientific, archaeological, historical, or physical mechanisms into vivid, intuitive analogies and narrative tension—without dumbing down the underlying truth.
2. OBSESSIVE INVESTIGATIVE RIGOR & LESSER-KNOWN FACTS: Accessibility does NOT mean superficial pop-science fluff. We place the highest premium on rock-solid authenticity, deep research, and digging up lesser-known, obscure, or buried facts that 99% of mainstream media and typical YouTube summaries miss. Unearth forgotten archival logs, unusual primary source excerpts, bizarre anomalies, and specific eyewitness testimonies.
3. EXPLORE ALL ANGLES & COMPETING PERSPECTIVES: Present the complete landscape. Detail the prevailing scientific/historical consensus, credible dissenting theories, and active controversies. Explore every angle with intellectual honesty and evidence-backed nuance.
4. TANGIBLE HUMAN DRAMA & SENSORY DETAIL: Ground every claim in specific human names (discoverers, dissenters, chroniclers), exact dates, physical coordinates, artifact names, verified measurements, and what these discoveries looked, sounded, and felt like on the ground.

RESEARCH OBJECTIVES & SEARCH REQUIREMENTS:
1. COMPREHENSIVE MULTI-SOURCE WEB SWEEP: Cast a wide net across authoritative global institutions (national archives, museum registries, excavation reports, peer-reviewed journals, science libraries). Corroborate all findings across diverse, independent sources.
2. PRIMARY DISCOVERERS & HUMAN JOURNEY: Identify the exact excavators, scientists, historians, or chroniclers who made this breakthrough. Detail the human journey, fieldwork obstacles, and exact breakthrough moments.
3. LESSER-KNOWN REVELATIONS & BURIED FACTS: Unearth the hidden layer—overlooked archival anomalies, obscure primary documents, and fascinating counterintuitive details that elevate this above standard pop summaries.
4. HOW IT WORKS IN PLAIN, VIVID ENGLISH: Detail the underlying mechanism, physical principles, or historical catalysts. Use intuitive, visual analogies so a broad audience immediately grasps the mechanics.
5. CONVENTIONAL MYTH VS. VERIFIED REALITY: State the prevailing popular misconception or textbook assumption, and contrast it with the verified empirical reality.
6. RIVAL THEORIES & UNRESOLVED MYSTERIES: Outline competing hypotheses, unresolved paradoxes, or unanswered questions that keep the audience intrigued.
7. VISUAL & STORYTELLING CUES FOR VIDEO PRODUCTION: Include visualizable scene descriptions, artifact dimensions, map coordinates, and dramatic narrative beats for video editors and documentary animators.

OUTPUT FORMAT:
Generate a structured, high-retention Research Dossier organized into:
1. Executive Story Hook & The Core Mystery (The gripping premise, the widespread misconception vs. reality, and why this story captivates a broad audience)
2. Lesser-Known Revelations & Buried Archival Facts (Overlooked anomalies, obscure primary records, and surprising twists)
3. The Chronological Narrative & Key Human Figures (Pivotal milestones, discoverers, expedition drama, and the breakthrough moment)
4. How It Actually Works / Core Mechanism (Explained in lucid, vivid English with intuitive real-world analogies and hard verified data points)
5. Competing Angles, Debates & Unresolved Mysteries (Rival theories, conflicting evidence, and open questions)
6. Documentary Visual & Storytelling Asset Cues (Visual scene ideas, artifact appearances, 3D map elements, and dramatic narrative pacing)
7. Annotated Source Directory (with direct citable URLs and institutional authorities across the web, noting specific relevance for fact-checking)`.trim();
}

/**
 * Formats full clipboard text for a Topic Card (Today's Ideas mix or Production Pool)
 * Returns the pure, standardized AI research prompt directly.
 */
export function formatTopicCardCopyText(idea: ProductionIdea): string {
  return buildStandardizedResearchPrompt({
    topic: idea.video_idea,
    hook: idea.curiosity_hook,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: idea.visualization_direction || idea.curiosity_hook || `Core concept for "${idea.video_idea}"`,
    sources: idea.source_family_guidance || 'Authoritative historical archives, academic journals, and museum catalogs.',
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
  subject?: string;
  topicFamily?: string;
  format?: string;
  originalSeed?: string;
}): string {
  return buildStandardizedResearchPrompt({
    topic: params.title,
    hook: params.hook,
    subject: params.subject,
    topicFamily: params.topicFamily,
    format: params.format,
    overview: params.overview,
    keyPoints: params.keyPoints,
    sources: params.sources,
    originalSeed: params.originalSeed
  });
}

/**
 * Formats full clipboard text for a Discovery Lab generated topic idea card
 * Returns the pure, standardized AI research prompt directly.
 */
export function formatDiscoveryIdeaCopyText(idea: GeneratedTopicIdea): string {
  const articleTitle = idea.source_article_title || idea.video_idea;
  const primaryUrl = idea.source_url || idea.source_official_url || '';
  const officialUrl = idea.source_official_url || (idea.source_url ? new URL(idea.source_url).origin : '');

  return buildStandardizedResearchPrompt({
    topic: idea.video_idea,
    hook: idea.curiosity_hook,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: `${idea.source_name} reporting on "${articleTitle}". ${idea.visualization_direction || ''}`,
    sources: `${idea.source_name} (${officialUrl || primaryUrl}). Article link: ${primaryUrl}`,
    coreQuestions: idea.core_questions,
    articleTitle: articleTitle,
    articleUrl: primaryUrl,
    authorityName: idea.source_name
  });
}
