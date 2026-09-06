/**
 * KnowSights Standardized AI Search Agent Prompt Generator
 * 
 * Generates clean, production-ready research prompts engineered for AI search agents
 * (Perplexity, Gemini Deep Research, ChatGPT Search, Claude Research).
 * 
 * Excludes internal application metadata (e.g. "KNOWSIGHTS RESEARCH BRIEF", "Idea ID",
 * decorative ASCII bars) so the output is a pure, ready-to-execute research prompt.
 */

import { GeneratedTopicIdea, ProductionIdea } from '../types';

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

  return `Act as an elite investigative research scholar and documentary fact-checker specializing in ${categoryStr}. Conduct an exhaustive, open-web, evidence-backed deep-dive search on the following topic, unique concept, and curiosity angle:

• TARGET TOPIC: ${params.topic}${seedContext}
• UNIQUE ANGLE & HOOK: ${hookStr}
• CORE CONCEPT & OVERVIEW: ${overviewStr}${keyPointsBlock}
• SIGNATURE FORMAT STYLE: ${formatStr}
• REFERENCE SEED (STARTING CLUE ONLY): ${seedReferenceStr}${articleBlock}
  ⚠️ CRITICAL SOURCE MANDATE: The reference above is ONLY an initial seed and context springboard. Do NOT restrict or limit your research to this single publication or domain. You are explicitly authorized and instructed to gather credible data across ALL relevant, authentic, and renowned sources on the web (peer-reviewed academic journals, museum catalogs, archaeological field reports, national archives, and university research libraries).
${questionsBlock}
RESEARCH OBJECTIVES & SEARCH REQUIREMENTS:
1. COMPREHENSIVE MULTI-SOURCE INQUIRY: Cast a wide net across all authoritative, credible, and renowned resources. Do NOT limit your search to any single cited website. Gather corroborating and diverse evidence from global scholarly institutions, archives, and specialized research bodies.
2. PRIMARY EVIDENCE & VERIFIED DISCOVERERS: Identify by name the exact primary excavators, scientists, archival historians, or chroniclers who made this discovery or investigated this event. Cite original field logs, excavation papers, and academic monographs.
3. HARD FACTS, TIMELINES & MEASUREMENTS: Extract exact dates, physical locations, artifact/manuscript names, verified measurements, statistics, and chronological milestones. Avoid vague generalizations.
4. UNDERLYING MECHANISM & CAUSALITY: Explain precisely HOW and WHY this event, anomaly, or discovery unfolded. Detail the technological, geological, economic, or physical mechanism driving it.
5. COUNTERINTUITIVE INSIGHTS & MYTH BUSTING: Identify the prevailing popular misconception or conventional textbook assumption that this evidence overturns. What is the surprising, verified reality?
6. SCHOLARLY CONSENSUS & ONGOING DEBATES: Detail what modern academic specialists agree upon, and highlight any remaining unresolved controversies or active scientific debates.
7. MULTI-SOURCE CITATIONS & CITABLE DIRECTORY: Provide direct citable links, publication titles, DOIs, or official repository references (e.g., Nature, Science, Antiquity, JSTOR, British Museum, Library of Congress, archaeological institutes) for every key assertion.

OUTPUT FORMAT:
Generate a structured, fact-dense Research Dossier organized into:
1. Executive Summary & Historical/Scientific Context
2. Chronological Timeline of Pivotal Events & Key Figures
3. Core Mechanism / Deep Dive Evidence (with verified data points)
4. Surprising Anomalies / Myth-Busting Findings
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
