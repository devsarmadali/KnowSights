/**
 * KnowSights Standardized AI Search Agent Prompt Generator
 * 
 * Auto-formats topic concepts, briefs, hooks, and source references into a standardized,
 * production-ready prompt engineered for AI search agents (Perplexity, Gemini Deep Research,
 * ChatGPT Search, Claude Research) to gather authentic, cited, primary research data.
 */

import { GeneratedTopicIdea, ProductionIdea } from '../types';

export interface StandardizedPromptParams {
  topic: string;
  hook?: string;
  subject?: string;
  topicFamily?: string;
  format?: string;
  overview?: string;
  sources?: string;
  coreQuestions?: string[];
  guidance?: string;
  articleTitle?: string;
  articleUrl?: string;
  authorityName?: string;
  originalSeed?: string;
}

/**
 * Builds the standardized AI search agent prompt section with positioned placeholders.
 * Explicitly instructs the AI search agent to use the provided seed/citation as an initial clue,
 * but to cast a wide net across ALL authentic, renowned, and credible sources across the web.
 */
export function buildStandardizedResearchPrompt(params: StandardizedPromptParams): string {
  const categoryStr = [params.subject, params.topicFamily].filter(Boolean).join(' / ') || 'General Knowledge & Historical Inquiries';
  const hookStr = params.hook ? `"${params.hook}"` : `Investigate the counterintuitive truth and lesser-known historical/scientific reality behind ${params.topic}.`;
  const formatStr = params.format || 'Case Study Breakdown with primary source evidence';
  const seedReferenceStr = params.sources || 'Authoritative academic publications, peer-reviewed journals, national archives, and museum catalogs.';
  const overviewStr = params.overview || `Comprehensive investigative breakdown into the origins, mechanisms, evidence, and historical/scientific implications of "${params.topic}".`;

  const seedContext = params.originalSeed
    ? `\n• BASELINE SEED TOPIC: "${params.originalSeed}"`
    : '';

  const questionsBlock = params.coreQuestions && params.coreQuestions.length > 0
    ? `\n• KEY INQUIRY QUESTIONS TO RESOLVE:\n${params.coreQuestions.map((q, idx) => `  ${idx + 1}. ${q}`).join('\n')}`
    : '';

  const articleBlock = params.articleTitle && params.articleUrl
    ? `\n• INITIAL SEED ARTICLE: "${params.articleTitle}" (${params.articleUrl})`
    : '';

  return `======================================================
🔬 STANDARDIZED AI RESEARCH AGENT PROMPT
(Paste into Perplexity, Gemini Deep Research, ChatGPT Search, or Claude)
======================================================
"Act as an elite investigative research scholar and documentary fact-checker specializing in ${categoryStr}. Conduct an exhaustive, open-web, evidence-backed deep-dive search on the following topic, unique concept, and curiosity angle:

• TARGET TOPIC: ${params.topic}${seedContext}
• UNIQUE ANGLE & HOOK: ${hookStr}
• CORE CONCEPT & OVERVIEW: ${overviewStr}
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
5. Annotated Source Directory (with direct citable URLs and institutional authorities across the web)"`;
}

/**
 * Formats full clipboard text for a Topic Card (Today's Ideas mix or Production Pool)
 */
export function formatTopicCardCopyText(idea: ProductionIdea): string {
  const hookLine = idea.curiosity_hook ? `\n📌 Curiosity Hook: "${idea.curiosity_hook}"` : '';
  const seedLine = idea.parent_sr ? `\n🌱 Taxonomy Seed: Master Taxonomy Sr. #${idea.parent_sr}` : '';
  const origSeedLine = (idea.original_video_idea && idea.original_video_idea !== idea.video_idea) 
    ? `\n📖 Original Subtopic Seed: "${idea.original_video_idea}"` 
    : '';
  const aiLine = idea.ai_refined ? '\n✨ Refined Angle: AI Curated YouTube Concept (Gemini)' : '';
  const visLine = idea.visualization_direction ? `\n🎨 Visual Direction: ${idea.visualization_direction}` : '';
  const srcLine = idea.source_family_guidance ? `\n📚 Source Guidance: ${idea.source_family_guidance}` : '';
  const notesLine = idea.notes ? `\n📝 Notes: ${idea.notes}` : '';

  const cardHeader = `🎬 TOPIC: ${idea.video_idea}${hookLine}
🏷️ Category: ${idea.subject} / ${idea.topic_family}
✨ Format Style: ${idea.signature_format || 'Standard Explainer'}
⭐ Production Score: ${idea.production_score} (${idea.priority_tier || 'Tier 2'})
🆔 Idea ID: ${idea.idea_id}${seedLine}${origSeedLine}${aiLine}${visLine}${srcLine}${notesLine}`;

  const prompt = buildStandardizedResearchPrompt({
    topic: idea.video_idea,
    hook: idea.curiosity_hook,
    subject: idea.subject,
    topicFamily: idea.topic_family,
    format: idea.signature_format,
    overview: idea.visualization_direction || idea.curiosity_hook || `Core concept for idea ${idea.idea_id}`,
    sources: idea.source_family_guidance || 'Authoritative historical archives, academic journals, and museum catalogs.',
    originalSeed: (idea.original_video_idea && idea.original_video_idea !== idea.video_idea) ? idea.original_video_idea : undefined
  });

  return `${cardHeader}\n\n${prompt}`.trim();
}

/**
 * Formats full clipboard text for the Source-Ready Research Brief modal
 */
export function formatBriefModalCopyText(params: {
  ideaId: string;
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
  const briefHeader = `📑 KNOWSIGHTS RESEARCH BRIEF
======================================================
Idea ID: ${params.ideaId}
Topic / Video Idea: ${params.title}
Research Status: ${params.readyStatus || 'Ready for Production'}

1. EXECUTIVE OVERVIEW
${params.overview}

2. KEY SCRIPT BEATS, FACTS & DATA
${params.keyPoints}

3. DATA SOURCES & REFERENCES
${params.sources}`;

  const prompt = buildStandardizedResearchPrompt({
    topic: params.title,
    hook: params.hook,
    subject: params.subject,
    topicFamily: params.topicFamily,
    format: params.format,
    overview: params.overview,
    sources: params.sources,
    originalSeed: params.originalSeed
  });

  return `${briefHeader}\n\n${prompt}`.trim();
}

/**
 * Formats full clipboard text for a Discovery Lab generated topic idea card
 */
export function formatDiscoveryIdeaCopyText(idea: GeneratedTopicIdea): string {
  const articleTitle = idea.source_article_title || idea.video_idea;
  const primaryUrl = idea.source_url || idea.source_official_url || '';
  const officialUrl = idea.source_official_url || (idea.source_url ? new URL(idea.source_url).origin : '');

  const conceptHeader = `🎬 VIDEO CONCEPT: ${idea.video_idea}
📌 Curiosity Hook: "${idea.curiosity_hook}"
🏷️ Category: ${idea.subject} / ${idea.topic_family}
✨ Signature Format: ${idea.signature_format}
⭐ Production Score: ${idea.production_score} (${idea.priority_tier})
🎨 Visual Direction: ${idea.visualization_direction || 'Exploded diagrams, motion graphics, and contextual archival footage.'}

📚 RESEARCH RESOURCES & REFERENCE CITATIONS:
• 📰 Primary Discovery Article: "${articleTitle}"
  🔗 Direct Article URL: ${primaryUrl}
• 🏛️ Publishing Authority: ${idea.source_name} (${idea.source_category})
  🔗 Official Publication: ${officialUrl || primaryUrl}
• 📅 Published / Documented Date: ${idea.source_published_date || 'Recent Finding'}
• 🛡️ Research Guidance: ${idea.source_family_guidance || `Refer to verified reporting from ${idea.source_name}.`}

---
❓ 3 CORE INQUIRY QUESTIONS:
1. 🔍 Evidence & Discovery:
   ${idea.core_questions[0]}

2. ⚙️ Underlying Mechanism & Context:
   ${idea.core_questions[1]}

3. 🌐 Broader Implications & Paradigm Shift:
   ${idea.core_questions[2]}`;

  const prompt = buildStandardizedResearchPrompt({
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

  return `${conceptHeader}\n\n${prompt}`.trim();
}
