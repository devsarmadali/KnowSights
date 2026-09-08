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
  const hookStr = params.hook ? `"${params.hook}"` : `Investigate the counterintuitive reality and lesser-known facts behind ${params.topic}.`;
  const seedReferenceStr = params.sources || 'Authoritative historical archives, academic publications, and museum records.';
  const overviewStr = params.overview || `Investigative breakdown into the origins, mechanisms, evidence, and historical/scientific reality of "${params.topic}".`;

  const seedContext = params.originalSeed
    ? `\n• BASELINE SEED: "${params.originalSeed}"`
    : '';

  const keyPointsBlock = params.keyPoints && params.keyPoints.trim()
    ? `\n• INQUIRY ANGLES:\n${params.keyPoints.trim()}`
    : '';

  const questionsBlock = params.coreQuestions && params.coreQuestions.length > 0
    ? `\n• CORE QUESTIONS TO RESOLVE:\n${params.coreQuestions.map((q, idx) => `  ${idx + 1}. ${q}`).join('\n')}`
    : '';

  const articleBlock = params.articleTitle && params.articleUrl
    ? `\n• SEED ARTICLE: "${params.articleTitle}" (${params.articleUrl})`
    : '';

  return `Conduct an exhaustive, evidence-backed deep-dive investigation into the following topic (${categoryStr}):

• TOPIC: ${params.topic}${seedContext}
• UNIQUE ANGLE & HOOK: ${hookStr}
• OVERVIEW & CONTEXT: ${overviewStr}${keyPointsBlock}
• REFERENCE SEED (STARTING CLUE ONLY): ${seedReferenceStr}${articleBlock}
  (Search broadly across all authentic open-web sources: national archives, museum catalogs, academic journals, and field reports. Do not limit research to the seed reference.)
${questionsBlock}
RESEARCH & TONE REQUIREMENTS:
1. ACCESSIBLE YET DEEP (ANTI-ESOTERIC): Write in clear, engaging, lucid language suitable for a broad, curious public and long-form narrative content. Avoid dry academic dissertation prose or impenetrable jargon, while maintaining uncompromising factual rigor.
2. LESSER-KNOWN FACTS & AUTHENTICITY: Dig past standard summary overviews to uncover obscure archival findings, forgotten primary records, and counterintuitive details that are rarely discussed.
3. ALL PERSPECTIVES & ACTORS: Name the key discoverers, scientists, or historical figures. Present the verified timeline and mechanism clearly, alongside competing theories and unresolved debates.

DOSSIER STRUCTURE:
1. Core Premise & Popular Misconception (The hook, what conventional wisdom gets wrong, and the verified reality)
2. Timeline & Key Figures (The chronology, primary discoverers, and pivotal breakthrough moments)
3. How It Works / Deep-Dive Evidence (The underlying mechanism and obscure verified facts explained with intuitive clarity)
4. Competing Theories & Unresolved Questions (Major debates, rival interpretations, and what remains unanswered)
5. Annotated Source Directory (with direct citable URLs and institutional authorities across the web)`.trim();
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
