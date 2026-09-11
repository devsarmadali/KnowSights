/**
 * KnowSights Standardized AI Search Agent Prompt Generator
 * 
 * Generates clean, production-ready research prompts engineered for AI search agents
 * (Perplexity, Gemini Deep Research, ChatGPT Search, Claude Research).
 * 
 * Specifically optimized as a Content Resource for YouTube Video Generation & Social Storytelling:
 * - Ditching dry academic dissertation prose in favor of high-retention narrative framing
 * - Uncovering authentic empirical evidence (archival proofs, exact dates, discoverers, verified data)
 * - Organizing research into a 6-part YouTube video production blueprint
 * - Excluding internal application metadata (e.g. "KNOWSIGHTS RESEARCH BRIEF", "Idea ID")
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
 * Builds the pure standardized AI search agent prompt engineered for YouTube video generation.
 * Strictly avoids internal application wrappers or ID bookkeeping.
 */
export function buildStandardizedResearchPrompt(params: StandardizedPromptParams): string {
  const categoryStr = [params.subject, params.topicFamily].filter(Boolean).join(' / ') || 'General Knowledge & Historical Inquiries';
  const hookStr = params.hook ? `"${params.hook}"` : `Investigate the counterintuitive reality and lesser-known facts behind ${params.topic}.`;
  const angleStr = params.angle ? `\n• UNIQUE STORYTELLING ANGLE: ${params.angle}` : '';
  const formatStr = params.format ? `\n• SIGNATURE VIDEO FORMAT: ${params.format}` : '';
  const seedReferenceStr = params.sources || 'Authoritative historical archives, academic publications, and museum records.';
  const overviewStr = params.overview || `Investigative breakdown into the origins, mechanisms, evidence, and historical/scientific reality of "${params.topic}".`;

  const seedContext = params.originalSeed
    ? `\n• BASELINE SEED: "${params.originalSeed}"`
    : '';

  const keyPointsBlock = params.keyPoints && params.keyPoints.trim()
    ? `\n• KEY SCRIPT BEATS & INQUIRY ANGLES:\n${params.keyPoints.trim()}`
    : '';

  const visBlock = params.visualizationDirection && params.visualizationDirection.trim()
    ? `\n• VISUAL & PACING DIRECTION (FOR EDITORS):\n  ${params.visualizationDirection.trim()}`
    : '';

  const questionsBlock = params.coreQuestions && params.coreQuestions.length > 0
    ? `\n• CORE QUESTIONS TO RESOLVE IN VIDEO:\n${params.coreQuestions.map((q, idx) => `  ${idx + 1}. ${q}`).join('\n')}`
    : '';

  const articleBlock = params.articleTitle && params.articleUrl
    ? `\n• SEED ARTICLE: "${params.articleTitle}" (${params.articleUrl})`
    : '';

  return `Conduct an exhaustive, evidence-backed deep-dive investigation to build a YouTube Video Production Dossier & Narrative Resource for the following topic (${categoryStr}):

• VIDEO TITLE & CORE CONCEPT: ${params.topic}${seedContext}
• YOUTUBE HOOK & PATTERN INTERRUPT: ${hookStr}${angleStr}${formatStr}
• NARRATIVE PREMISE & OVERVIEW: ${overviewStr}${keyPointsBlock}${visBlock}
• REFERENCE EVIDENCE SEED (STARTING CLUE ONLY): ${seedReferenceStr}${articleBlock}
  (Search broadly across all authentic open-web sources: national archives, museum catalogs, academic journals, and field reports. Do not limit research to the seed reference.)
${questionsBlock}
RESEARCH & PRODUCTION REQUIREMENTS (YOUTUBE & SOCIAL CONTENT ORIENTATION):
1. ANTI-ACADEMIC TONE (NARRATIVE RETENTION): Present all findings in vivid, visceral, engaging language suitable for high-retention video narration. Avoid dry syllabus lectures, textbook summaries, or impenetrable academic jargon, while maintaining 100% empirical rigor.
2. AUTHENTIC EMPIRICAL EVIDENCE & OBSCURITY: Ground the narrative in rock-solid ground truth—exact dates, primary archival records, verified measurements, discoverer names, and published field reports. Uncover the counterintuitive details and obscure anomalies that conventional overviews skip.
3. VISUAL STORYTELLING & METAPHORS: Highlight concrete visual metaphors, split-screen comparisons, 3D exploded diagram opportunities, and motion graphics cues that video editors can animate.

YOUTUBE PRODUCTION DOSSIER STRUCTURE:
1. The Hook & Popular Myth (0:00 - 0:45 Retention Anchor: What 99% of people get wrong, the unasked question, and the shocking premise)
2. Timeline, Discoverers & Key Figures (The chronology, pivotal breakthrough moments, and real human stakes)
3. The Empirical Smoking Gun & How It Works (Step-by-step mechanism, verified proof, and mind-bending archival evidence explained with intuitive clarity)
4. Visual Storytelling & Concrete Demonstrations (Specific visual cues, animated motion graphics directions, and side-by-side analogies)
5. The Paradigm Shift & Closing Climax (The bigger revelation: how this discovery shatters existing models and what it means for the future)
6. Annotated Authentic Primary Sources Directory (Direct citable URLs, institutional authorities, museum records, and peer-reviewed citations across the web)`.trim();
}

/**
 * Formats full clipboard text for a Topic Card (Today's Ideas mix or Production Pool)
 * Returns the pure, standardized AI research prompt directly.
 */
export function formatTopicCardCopyText(idea: ProductionIdea): string {
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
  angle?: string;
  subject?: string;
  topicFamily?: string;
  format?: string;
  visualizationDirection?: string;
  originalSeed?: string;
}): string {
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
    angle: idea.content_angle,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: idea.content_brief_overview || `${idea.source_name} reporting on "${articleTitle}". ${idea.visualization_direction || ''}`,
    keyPoints: idea.content_brief_key_points,
    visualizationDirection: idea.visualization_direction,
    sources: `${idea.source_name} (${officialUrl || primaryUrl}). Article link: ${primaryUrl}`,
    coreQuestions: idea.core_questions,
    articleTitle: articleTitle,
    articleUrl: primaryUrl,
    authorityName: idea.source_name,
    originalSeed: idea.original_video_idea
  });
}
