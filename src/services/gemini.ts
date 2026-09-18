import { AppConfig, DiscoveryArticle, DiscoverySource, GeneratedTopicIdea, BatchItem, ProductionIdea } from '../types';
import { PsychologyTopic } from '../types/psychology';
import { loadConfig } from './api';
import { buildStandardizedResearchPrompt } from '../utils/researchPrompt';

export interface GeminiRotationResult {
  success: boolean;
  data?: any;
  keyUsedIndex?: number;
  error?: string;
}

/**
 * Returns list of configured Gemini API keys (1, 2, 3)
 */
export function getConfiguredGeminiKeys(config?: AppConfig): { index: number; key: string }[] {
  const cfg = config || loadConfig();
  const keys: { index: number; key: string }[] = [];
  
  if (cfg.gemini_api_key_1 && cfg.gemini_api_key_1.trim()) {
    keys.push({ index: 1, key: cfg.gemini_api_key_1.trim() });
  }
  if (cfg.gemini_api_key_2 && cfg.gemini_api_key_2.trim()) {
    keys.push({ index: 2, key: cfg.gemini_api_key_2.trim() });
  }
  if (cfg.gemini_api_key_3 && cfg.gemini_api_key_3.trim()) {
    keys.push({ index: 3, key: cfg.gemini_api_key_3.trim() });
  }

  return keys;
}

/**
 * Pure Text-Out Flash Models list (ranked by quota & capability)
 * Note: Batch refinement does NOT require search grounding tools.
 */
/**
 * Pure Text-Out Flash Models list in strict descending version order:
 * 1. gemini-3.7-flash (tried first)
 * 2. gemini-3.6-flash
 * 3. gemini-3.5-flash
 * 4. gemini-3.5-flash-lite
 * 5. gemini-3-flash
 * 6. gemini-2.5-flash
 * 7. gemini-2.0-flash
 * 8. gemini-1.5-flash
 * Note: Batch refinement does NOT require search grounding tools.
 */
export const PREFERRED_GEMINI_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

export const BATCH_REFINEMENT_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Test a specific Gemini API Key for validity across models in descending order
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; model?: string; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "API Key is empty" };
  }

  let lastError = "";

  for (const model of PREFERRED_GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Respond with the word 'PONG' in plain text." }]
            }
          ],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (res.ok) {
        return { valid: true, model };
      }

      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      lastError = msg;

      // Only stop trying models if the key itself is invalid or expired
      const isKeyInvalid = msg.toLowerCase().includes('api_key_invalid') || 
                           msg.toLowerCase().includes('api key not valid') ||
                           msg.toLowerCase().includes('api key expired') ||
                           (res.status === 400 && msg.toLowerCase().includes('key'));
      if (isKeyInvalid) {
        return { valid: false, error: msg };
      }

      // If model not found or unsupported, continue down the descending list
    } catch (err: any) {
      lastError = err.message || "Network error testing key";
    }
  }

  return { valid: false, error: lastError || "Could not connect to Gemini API" };
}

/**
 * Calls Gemini API with automatic 3-key rotation and failover
 */
export async function generateIdeaWithGeminiRotation(
  article: DiscoveryArticle,
  source: DiscoverySource,
  config?: AppConfig
): Promise<{ idea: GeneratedTopicIdea | null; keyUsedIndex?: number; error?: string }> {
  const keys = getConfiguredGeminiKeys(config);
  if (keys.length === 0) {
    return { idea: null, error: "No Gemini API keys configured" };
  }

  const prompt = `You are KnowSights' Senior YouTube Content Strategist and Video Topic Architect.
Analyze this publication finding and transform it into a high-retention, curiosity-driven YouTube educational video topic.

CRITICAL DIRECTIVE — FULL EDITORIAL FREEDOM TO PIVOT & REFRAME ANGLES:
- YOU HAVE 100% FREEDOM TO MODIFY, REFRAME, OR COMPLETELY PIVOT THE TOPIC ANGLE: The input article title and summary are only starting factual clues. Do NOT merely summarize or rephrase them.
- If the original reporting takes a dry, conventional, or academic angle, DISCARD IT. Pivot boldly to the single most counterintuitive paradox, hidden controversy, shocking anomaly, or dramatic revelation embedded in the discovery.
- Zoom in on the high-stakes human drama, the bizarre engineering edge-case, the forgotten archival anomaly, or the paradigm-shattering mystery that makes scrolling or clicking away impossible.
- Formulate an active, intrigue-driven YouTube title (50-80 chars) that creates an immediate pattern interrupt.
- Ground the video in authentic empirical data, but deliver a riveting narrative blueprint with a 3-beat script outline: 1. Hook & Popular Myth; 2. The Empirical Smoking Gun & Mechanism; 3. The Mind-Blowing Paradigm Climax.

---
ARTICLE DETAILS:
• Publication: ${source.name} (${source.category})
• Article Title: "${article.title}"
• Summary: "${article.summary}"
• Discipline: ${source.subjectMapping} / ${source.topicFamily}
---

Return a strictly valid JSON object matching this schema with NO markdown code fences or extra commentary:
{
  "video_idea": "Punchy, intriguing, active YouTube title (50-80 chars) focusing on the core mechanism or discovery",
  "curiosity_hook": "A high-tension curiosity hook question or premise that shatters common assumptions",
  "content_angle": "Specific contrarian or fascination angle (e.g. The Engineering Cover-up, The Counterintuitive Paradox, The Anomaly in the Archives)",
  "brief_overview": "2-3 sentence narrative premise explaining why this story grips a general audience, linking verified findings to dynamic storytelling.",
  "brief_key_points": "1. Hook & Popular Myth: What 99% misunderstand.\\n2. The Empirical Smoking Gun: The verified artifact/data that proves the reality.\\n3. Paradigm Shift: The mind-bending conclusion that changes everything.",
  "core_questions": [
    "Question 1 (Physical/Historical Evidence): What specific artifact, fossil, data, or site was uncovered?",
    "Question 2 (Underlying Mechanism/Context): What exact scientific principle, engineering feat, or historical pressure explains why this happened?",
    "Question 3 (Broader Paradigm Shift): How does this discovery alter our understanding of human history, physics, or the future?"
  ],
  "signature_format": "One of: SF01 — Hidden System, SF02 — Counterintuitive Mechanism, SF03 — Evolution Over Time, SF04 — Case Study Breakdown, SF05 — Historical Analogy, SF08 — Visualized Rules & Quirks, SF17 — Under the Hood",
  "production_score": 92,
  "priority_tier": "Tier 1",
  "visualization_direction": "Clear motion graphics and visual guidance for editors (e.g. 3D exploded diagrams, animated archival maps, interactive metric curves)"
}`;

  let lastError = "";

  for (const { index, key } of keys) {
    let keySucceeded = false;
    
    for (const model of PREFERRED_GEMINI_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
              responseMimeType: "application/json"
            }
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const errorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          lastError = `Key #${index} (${model}): ${errorMsg}`;

          // Only break to next key if the key itself is invalid
          const isKeyInvalid = errorMsg.toLowerCase().includes('api_key_invalid') || 
                               errorMsg.toLowerCase().includes('api key not valid') ||
                               errorMsg.toLowerCase().includes('api key expired') ||
                               (res.status === 400 && errorMsg.toLowerCase().includes('api key'));
          if (isKeyInvalid) {
            console.warn(`Gemini Key #${index} is invalid (${errorMsg}), rotating to next available key...`);
            break; // Key failed, move to next key
          }

          // Otherwise continue down PREFERRED_GEMINI_MODELS in descending order
          console.warn(`Model ${model} unavailable on Key #${index} (${errorMsg}), trying next descending model...`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        const initialPrompt = buildStandardizedResearchPrompt({
          topic: parsed.video_idea || article.title,
          hook: parsed.curiosity_hook,
          angle: parsed.content_angle,
          subject: source.subjectMapping,
          topicFamily: source.topicFamily,
          format: parsed.signature_format || source.defaultFormat || 'SF04 — Case Study Breakdown',
          overview: parsed.brief_overview || `${source.name} reporting on "${article.title}".`,
          keyPoints: parsed.brief_key_points,
          visualizationDirection: parsed.visualization_direction,
          sources: `Primary publication: ${source.name} (${source.officialUrl}). Article link: ${article.link || source.officialUrl}`,
          coreQuestions: (parsed.core_questions && parsed.core_questions.length === 3) ? parsed.core_questions : undefined,
          articleTitle: article.title,
          articleUrl: article.link || source.officialUrl,
          authorityName: source.name,
          originalSeed: article.title
        });

        const generated: GeneratedTopicIdea = {
          id: `GEN-AI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          original_video_idea: article.title,
          video_idea: parsed.video_idea || article.title,
          curiosity_hook: parsed.curiosity_hook || `Why did ${article.title} surprise researchers?`,
          content_angle: parsed.content_angle || undefined,
          content_brief_overview: parsed.brief_overview || undefined,
          content_brief_key_points: parsed.brief_key_points || undefined,
          core_questions: (parsed.core_questions && parsed.core_questions.length === 3) 
            ? parsed.core_questions 
            : [
                `What specific physical evidence was found in ${article.title}?`,
                `What underlying mechanism explains this finding?`,
                `How does this reshape our broader understanding?`
              ],
          signature_format: parsed.signature_format || source.defaultFormat || 'SF04 — Case Study Breakdown',
          subject: source.subjectMapping,
          topic_family: source.topicFamily,
          source_id: source.id,
          source_name: source.name,
          source_url: article.link || source.officialUrl,
          source_official_url: source.officialUrl,
          source_article_title: article.title,
          source_published_date: article.pubDate || new Date().toISOString().split('T')[0],
          source_category: source.category,
          reference_links: [
            { label: `Primary Article: ${article.title}`, url: article.link || source.officialUrl, type: 'Article' },
            { label: `Authority: ${source.name}`, url: source.officialUrl, type: 'Publication' }
          ],
          production_score: Number(parsed.production_score || 92),
          priority_tier: (parsed.priority_tier === 'Tier 1' || parsed.priority_tier === 'Tier 2') ? parsed.priority_tier : 'Tier 1',
          freshness_class: 'Recent Publication (AI Curated)',
          visualization_direction: parsed.visualization_direction || `Incorporate archival scans, 3D maps, and visual motion graphics from ${source.name}.`,
          source_family_guidance: `Primary publication: ${source.name} (${source.officialUrl}). Article link: ${article.link || source.officialUrl}. AI analyzed (${model}) from live publication stream.`,
          starting_clues: `${source.name} reporting archive (${source.officialUrl}). Lead article: "${article.title}".`,
          research_prompt: initialPrompt,
          added_to_pool: false,
          ai_refined: true,
          generated_at: new Date().toISOString(),
          generated_timestamp: Date.now()
        };

        return { idea: generated, keyUsedIndex: index };
      } catch (e: any) {
        console.warn(`Error with Gemini Key #${index}:`, e);
        lastError = `Key #${index}: ${e.message}`;
      }
    }
  }

  return { idea: null, error: `All configured Gemini keys failed. Last error: ${lastError}` };
}

export interface BatchRefinementResult {
  success: boolean;
  refinedItems: BatchItem[];
  keyUsedIndex?: number;
  modelUsed?: string;
  error?: string;
}

/**
 * Refines an entire batch of topics in a single, high-efficiency Gemini API call
 * Transforms raw academic curriculum topics into high-retention YouTube concepts with unique angles
 * Uses multi-key auto-rotation (Key 1 -> Key 2 -> Key 3) and preferred text-out flash models
 */
export async function refineBatchWithGeminiRotation(
  items: BatchItem[],
  config?: AppConfig
): Promise<BatchRefinementResult> {
  if (!items || items.length === 0) {
    return { success: true, refinedItems: items };
  }

  const keys = getConfiguredGeminiKeys(config);
  if (keys.length === 0) {
    return { success: false, refinedItems: items, error: "No Gemini API keys configured" };
  }

  // Pure text-out models in strict descending version order:
  // 1. gemini-3.7-flash (tried first)
  // 2. gemini-3.6-flash
  // 3. gemini-3.5-flash
  // 4. gemini-3.5-flash-lite
  // 5. gemini-3-flash
  // 6. gemini-2.5-flash
  // 7. gemini-2.0-flash
  // 8. gemini-1.5-flash
  // Batch refinement strictly attempts models in descending capability order, never prioritizing 2.5 Flash over 3.7 / 3.6
  const modelsToTry = [...BATCH_REFINEMENT_MODELS];

  const promptItems = items.map((it, idx) => ({
    position: it.position || idx + 1,
    idea_id: it.idea_id,
    subject: it.idea.subject,
    topic_family: it.idea.topic_family,
    academic_seed: it.idea.subtopic_seed || it.idea.original_video_idea || it.idea.video_idea,
    current_hook: it.idea.curiosity_hook || "",
    current_format: it.idea.signature_format || "Standard"
  }));

  const prompt = `You are KnowSights' Senior YouTube Content Strategist, Investigative Researcher, and Video Topic Architect.
Transform this batch of ${items.length} academic/curriculum topics into high-retention, curiosity-driven YouTube educational video concepts and generate specific deep research parameters for each item.

CORE OPERATIONAL DIRECTIVES:
1. FULL EDITORIAL FREEDOM TO RADICALLY PIVOT, MODIFY & TRANSFORM TOPIC ANGLES:
   - YOU ARE GRANTED 100% EDITORIAL FREEDOM TO MODIFY, REFRAME, OR COMPLETELY CHANGE THE TOPIC ANGLE IF NEEDED FOR MAXIMUM YOUTUBE ENGAGEMENT.
   - The input topics are formal academic curriculum items (e.g. "Compare cloud AI with on-device AI for privacy and speed", "How transmission spectroscopy detects atmospheric water on distant worlds").
   - DO NOT merely rephrase or synonym-swap the seed! The baseline seed is only an initial topic anchor.
   - If the original angle is dry, generic, or conventional, DISCARD IT. You have full license to pivot to the most shocking conflict, bizarre edge-case, hidden vulnerability, forgotten historical rivalry, or counterintuitive paradox embedded within the subject.
   - Transform each into an active, intrigue-driven, punchy YouTube video title (50-80 chars) that creates an immediate pattern-interrupt.
2. ASSIGN A DISTINCT CONTRARIAN OR FASCINATION LENS:
   - Assign a distinct, sharp "content_angle" (e.g. "The Engineering Cover-up", "The Counterintuitive Physics Paradox", "The Hidden Flaw in Plain Sight", "The State-Sponsored Monopoly").
   - Do NOT use repetitive phrasing or formulas across the batch. Give every topic a unique, distinct angle.
3. CRAFT A COMPELLING RESEARCH & SCRIPT BRIEF (NARRATIVE RESOURCE):
   - "brief_overview": 2-3 sentence narrative overview showing why this story is gripping to a general viewer, connecting authentic ground truth to cinematic storytelling.
   - "brief_key_points": 3 concrete script/story beats for video generation:
     1. Beat 1 (Hook & Popular Myth): What 99% of people misunderstand or assume.
     2. Beat 2 (The Empirical Smoking Gun & Mechanism): The exact verified artifact, archival document, or scientific data point that reveals the truth.
     3. Beat 3 (The Mind-Blowing Climax / Takeaway): The paradigm-shifting consequence that leaves the audience in awe.
   - "core_questions": 3 inquiry questions to resolve during investigation (Physical Evidence, Underlying Mechanism, Paradigm Shift).
4. SPECIFIC STARTING CLUES & ARCHIVAL REPOSITORIES:
   - "starting_clues": Concrete starting leads, including exact museum collections, institutional databases (e.g. NASA ADS, JSTOR, British Museum, NOAA, CERN, National Archives), seminal papers/authors, or primary historical records.
5. PRESERVE SUBSTANTIVE EDUCATIONAL & EMPIRICAL VALUE:
   - The video concepts must remain 100% accurate, deeply informative, and intellectually honest. No cheap or sensationalized clickbait. Every concept must deliver genuine real-world knowledge and insight that respects the viewer's intelligence.
6. ASSIGN RELEVANT SIGNATURE FORMAT & CONCRETE VISUAL DIRECTION:
   - Signature formats: "SF01 — Hidden System", "SF02 — Counterintuitive Mechanism", "SF03 — Scale Shock", "SF04 — Case Study Breakdown", "SF08 — Visualized Rules & Quirks", "SF11 — Myth vs Measurement", "SF14 — Reverse Explanation", "SF17 — Under the Hood".
   - Provide concrete visual pacing guidance (e.g. 3D exploded diagrams, side-by-side split screen, animated archival maps, interactive metric curves) for video editors.

INPUT BATCH:
${JSON.stringify(promptItems, null, 2)}

Return a strictly valid JSON array of objects with the exact same length (${items.length}) matching this schema with NO markdown code fences or extra commentary:
[
  {
    "position": 1,
    "idea_id": "KS-T-001521",
    "video_idea": "The Invisible AI Leak: Why Cloud Intelligence Still Knows Your Secrets",
    "curiosity_hook": "Why sending a single 5-word query to cloud AI leaks hundreds of invisible metadata points that on-device models keep locked down.",
    "content_angle": "The Counterintuitive Privacy Paradox",
    "brief_overview": "While users assume enterprise AI encrypts their identity, modern cloud neural pipelines leak device telemetry and keystroke cadence through side-channel metadata.",
    "brief_key_points": "1. Hook & Popular Myth: The illusion that encrypted chat sessions protect user identity.\\n2. The Empirical Smoking Gun: Packet sniffers revealing 40+ unencrypted hardware fingerprints dispatched on every query.\\n3. Paradigm Shift: Why local SLMs are becoming an operational imperative rather than a luxury.",
    "core_questions": [
      "What exact side-channel metadata packets leak during cloud inference sessions?",
      "How do modern neural routing pipelines correlate user telemetry across distributed endpoints?",
      "What empirical performance and privacy trade-offs exist when quantizing models for on-device inference?"
    ],
    "starting_clues": "USENIX Security proceedings, IEEE Symposium on Security and Privacy papers, EFF privacy whitepapers, and Wireshark telemetry packet analyses.",
    "signature_format": "SF01 — Hidden System",
    "visualization_direction": "Side-by-side data flow diagram comparing packets leaving a phone versus local neural processor execution.",
    "production_score": 94
  }
]`;

  let lastError = "";

  for (const { index, key } of keys) {
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const errorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          lastError = `Key #${index} (${model}): ${errorMsg}`;

          // Only break to next key if the key itself is invalid or revoked
          const isKeyInvalid = errorMsg.toLowerCase().includes('api_key_invalid') || 
                               errorMsg.toLowerCase().includes('api key not valid') ||
                               errorMsg.toLowerCase().includes('api key expired') ||
                               (res.status === 400 && errorMsg.toLowerCase().includes('api key'));

          if (isKeyInvalid) {
            console.warn(`Gemini Key #${index} is invalid (${errorMsg}), rotating to next key...`);
            break; // Try next key
          }

          // Otherwise continue down the descending model list
          console.warn(`Model ${model} unavailable on Key #${index} (${errorMsg}), trying next descending model...`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
        
        let parsedArray: any[] = [];
        try {
          parsedArray = JSON.parse(cleaned);
        } catch {
          const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
          if (bracketMatch) {
            parsedArray = JSON.parse(bracketMatch[0]);
          }
        }

        if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
          throw new Error("Gemini response was not a valid array of refined topics");
        }

        // Merge refined concepts back into BatchItems while maintaining lineage & invariants
        const refinedItems: BatchItem[] = items.map((origItem, idx) => {
          const match = parsedArray.find((p: any) => 
            p.idea_id === origItem.idea_id || 
            Number(p.position) === origItem.position
          ) || parsedArray[idx];

          if (!match) {
            return origItem;
          }

          const originalTitle = origItem.idea.original_video_idea || origItem.idea.video_idea;
          const refinedTitle = match.video_idea ? String(match.video_idea).trim() : origItem.idea.video_idea;
          const refinedHook = match.curiosity_hook ? String(match.curiosity_hook).trim() : origItem.idea.curiosity_hook;
          const refinedAngle = match.content_angle ? String(match.content_angle).trim() : origItem.idea.content_angle;
          const refinedOverview = match.brief_overview ? String(match.brief_overview).trim() : origItem.idea.content_brief_overview;
          const refinedKeyPoints = match.brief_key_points ? String(match.brief_key_points).trim() : origItem.idea.content_brief_key_points;
          const refinedFormat = match.signature_format ? String(match.signature_format).trim() : origItem.idea.signature_format;
          const refinedVis = match.visualization_direction ? String(match.visualization_direction).trim() : origItem.idea.visualization_direction;
          const refinedClues = match.starting_clues ? String(match.starting_clues).trim() : (origItem.idea.starting_clues || origItem.idea.source_family_guidance);
          const refinedQuestions = (Array.isArray(match.core_questions) && match.core_questions.length > 0)
            ? match.core_questions.map(String)
            : origItem.idea.core_questions;

          // Assemble the complete ready-to-copy deep research prompt with all placeholders populated with refined info
          const refinedPrompt = buildStandardizedResearchPrompt({
            topic: refinedTitle,
            hook: refinedHook,
            angle: refinedAngle,
            subject: origItem.idea.subject,
            topicFamily: origItem.idea.topic_family,
            format: refinedFormat,
            overview: refinedOverview,
            keyPoints: refinedKeyPoints,
            visualizationDirection: refinedVis,
            sources: refinedClues || 'Authoritative historical archives, peer-reviewed scientific journals, and museum catalogs.',
            coreQuestions: refinedQuestions,
            originalSeed: originalTitle !== refinedTitle ? originalTitle : undefined
          });

          const refinedIdea: ProductionIdea = {
            ...origItem.idea,
            original_video_idea: originalTitle,
            video_idea: refinedTitle,
            curiosity_hook: refinedHook,
            content_angle: refinedAngle,
            content_brief_overview: refinedOverview,
            content_brief_key_points: refinedKeyPoints,
            signature_format: refinedFormat,
            visualization_direction: refinedVis,
            production_score: typeof match.production_score === 'number' ? match.production_score : origItem.idea.production_score,
            starting_clues: refinedClues,
            core_questions: refinedQuestions,
            research_prompt: refinedPrompt,
            ai_refined: true
          };

          return {
            ...origItem,
            idea: refinedIdea,
            ai_refined: true
          };
        });

        return {
          success: true,
          refinedItems,
          keyUsedIndex: index,
          modelUsed: model
        };
      } catch (err: any) {
        console.warn(`Error refining batch with Gemini Key #${index} (${model}):`, err);
        lastError = `Key #${index} (${model}): ${err.message}`;
      }
    }
  }

  return {
    success: false,
    refinedItems: items,
    error: `All configured Gemini keys failed. Last error: ${lastError}`
  };
}

/**
 * Refines a single replaced topic with Gemini multi-key rotation
 */
export async function refineSingleTopicWithGeminiRotation(
  item: BatchItem,
  config?: AppConfig
): Promise<{ refinedItem: BatchItem; keyUsedIndex?: number; modelUsed?: string; error?: string }> {
  const result = await refineBatchWithGeminiRotation([item], config);
  if (result.success && result.refinedItems.length > 0) {
    return {
      refinedItem: result.refinedItems[0],
      keyUsedIndex: result.keyUsedIndex,
      modelUsed: result.modelUsed
    };
  }
  return {
    refinedItem: item,
    error: result.error
  };
}

export interface DiscoveryRefinementResult {
  success: boolean;
  refinedIdeas: GeneratedTopicIdea[];
  keyUsedIndex?: number;
  modelUsed?: string;
  error?: string;
}

/**
 * Refines an array of Discovery Lab generated topic ideas in a single Gemini rotation call
 * Transforms publication findings into high-retention, curiosity-driven YouTube video topics & script briefs
 */
export async function refineDiscoveryIdeasWithGeminiRotation(
  ideas: GeneratedTopicIdea[],
  config?: AppConfig
): Promise<DiscoveryRefinementResult> {
  if (!ideas || ideas.length === 0) {
    return { success: true, refinedIdeas: ideas };
  }

  const keys = getConfiguredGeminiKeys(config);
  if (keys.length === 0) {
    return { success: false, refinedIdeas: ideas, error: "No Gemini API keys configured" };
  }

  const modelsToTry = [...BATCH_REFINEMENT_MODELS];

  const promptItems = ideas.map((it, idx) => ({
    index: idx + 1,
    id: it.id,
    subject: it.subject,
    topic_family: it.topic_family,
    source_name: it.source_name,
    article_title: it.source_article_title || it.video_idea,
    current_title: it.video_idea,
    current_hook: it.curiosity_hook
  }));

  const prompt = `You are KnowSights' Senior YouTube Content Strategist and Video Topic Architect.
Transform this batch of ${ideas.length} breaking publication discoveries into high-retention, curiosity-driven YouTube educational video concepts.

CRITICAL DIRECTIVES:
1. FULL EDITORIAL FREEDOM TO RADICALLY PIVOT, MODIFY & REFRAME ANGLES:
   - YOU ARE GRANTED 100% EDITORIAL FREEDOM TO MODIFY, REFRAME, OR COMPLETELY CHANGE THE TOPIC ANGLE IF NEEDED FOR MAXIMUM VIRALITY AND YOUTUBE RETENTION.
   - The input publication titles and current hooks are only raw factual starting clues. DO NOT stay trapped in polite academic, journalistic, or institutional summary angles.
   - If an article is dry or conventional, DISCARD the surface angle completely. Pivot boldly to the single most compelling paradox, hidden controversy, shocking empirical finding, or forbidden mystery in the research.
   - Reframe the story around intense human drama, counterintuitive physical mechanisms, or paradigm shifts that compel viewers to click and stay hooked.
2. PUNCHY, INTRIGUE-DRIVEN YOUTUBE TITLES (50-80 chars) & HIGH-TENSION HOOKS:
   - Formulate active, suspenseful YouTube titles that shatter conventional assumptions and generate irresistible curiosity.
3. CRAFT A COMPELLING YOUTUBE BRIEF & SCRIPT BLUEPRINT:
   - "content_angle": The contrarian or fascination angle (e.g. "The Royal Cover-up", "The Counterintuitive Physics Paradox", "The Impossible Anomaly").
   - "brief_overview": 2-3 sentence narrative overview showing why this discovery grips a general viewer, connecting authentic ground truth to cinematic storytelling.
   - "brief_key_points": 3 concrete script beats:
     1. Beat 1 (Hook & Popular Myth): What 99% of people misunderstand.
     2. Beat 2 (The Empirical Smoking Gun): The exact artifact, data, or site uncovered.
     3. Beat 3 (The Mind-Blowing Climax): The paradigm shift that changes our view of history or science.
   - "core_questions": 3 inquiry questions for video narration (Physical Evidence, Underlying Mechanism, Paradigm Shift).
4. ASSIGN SIGNATURE FORMAT & CONCRETE VISUAL GUIDANCE:
   - Formats: "SF01 — Hidden System", "SF02 — Counterintuitive Mechanism", "SF04 — Case Study Breakdown", "SF08 — Visualized Rules & Quirks", "SF17 — Under the Hood".
   - "visualization_direction": Concrete visual cues for editors (3D scans, micro-CT cross-sections, motion graphics, split screens).
5. SPECIFIC STARTING CLUES & ARCHIVAL REPOSITORIES:
   - "starting_clues": Concrete starting leads, archival repositories, institutional databases, or field records relevant to this discovery (e.g. publication DOI leads, museum catalogs, expedition field records).

INPUT BATCH:
${JSON.stringify(promptItems, null, 2)}

Return a strictly valid JSON array of objects matching this schema (${ideas.length} items) with NO markdown code fences or extra commentary:
[
  {
    "id": "${ideas[0].id}",
    "video_idea": "The Lost Egyptian Glass Vault: Why Pharaohs Banned Common Colors",
    "curiosity_hook": "Why ancient Egyptian artisans suddenly buried tons of cobalt glass tiles beneath the desert sands of Amarna.",
    "content_angle": "The Forbidden Pigment Mystery",
    "brief_overview": "New excavations at Amarna revealed industrial-scale pigment furnaces operating under strict royal monopolization, overturning previous assumptions of decentralized craft.",
    "brief_key_points": "1. Hook & Myth: The belief that ancient Egyptian glass was purely ornamental and scarce.\\n2. The Smoking Gun: Industrial furnaces capable of 1,100°C temperatures uncovered in sealed residential sectors.\\n3. Paradigm Shift: Evidence of an ancient state-controlled monopoly over synthetic pigments.",
    "core_questions": [
      "What specific furnace structures and cobalt crucibles were identified at Amarna?",
      "How did craftsmen achieve temperatures exceeding 1,100°C using rudimentary charcoal drafts?",
      "Why did the royal court tightly control synthetic blue glass while other crafts remained open?"
    ],
    "starting_clues": "Egypt Exploration Society Amarna excavation reports, Journal of Archaeological Science micro-CT slag analysis, and British Museum Department of Ancient Egypt and Sudan archives.",
    "signature_format": "SF04 — Case Study Breakdown",
    "visualization_direction": "3D photogrammetry flythrough of the Amarna furnace ruins cross-referenced with micro-CT scans of cobalt glass slag.",
    "production_score": 95
  }
]`;

  let lastError = "";

  for (const { index, key } of keys) {
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const errorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          lastError = `Key #${index} (${model}): ${errorMsg}`;

          const isKeyInvalid = errorMsg.toLowerCase().includes('api_key_invalid') || 
                               errorMsg.toLowerCase().includes('api key not valid') ||
                               errorMsg.toLowerCase().includes('api key expired') ||
                               (res.status === 400 && errorMsg.toLowerCase().includes('api key'));

          if (isKeyInvalid) {
            console.warn(`Gemini Key #${index} is invalid (${errorMsg}), rotating to next key...`);
            break;
          }

          console.warn(`Model ${model} unavailable on Key #${index} (${errorMsg}), trying next descending model...`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
        
        let parsedArray: any[] = [];
        try {
          parsedArray = JSON.parse(cleaned);
        } catch {
          const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
          if (bracketMatch) {
            parsedArray = JSON.parse(bracketMatch[0]);
          }
        }

        if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
          throw new Error("Gemini response was not a valid array of refined topics");
        }

        const refinedIdeas: GeneratedTopicIdea[] = ideas.map((origIdea, idx) => {
          const match = parsedArray.find((p: any) => p.id === origIdea.id) || parsedArray[idx];
          if (!match) return origIdea;

          const refinedIdeaTitle = match.video_idea ? String(match.video_idea).trim() : origIdea.video_idea;
          const refinedHook = match.curiosity_hook ? String(match.curiosity_hook).trim() : origIdea.curiosity_hook;
          const refinedAngle = match.content_angle ? String(match.content_angle).trim() : origIdea.content_angle;
          const refinedOverview = match.brief_overview ? String(match.brief_overview).trim() : origIdea.content_brief_overview;
          const refinedKeyPoints = match.brief_key_points ? String(match.brief_key_points).trim() : origIdea.content_brief_key_points;
          const refinedFormat = match.signature_format ? String(match.signature_format).trim() : origIdea.signature_format;
          const refinedVis = match.visualization_direction ? String(match.visualization_direction).trim() : origIdea.visualization_direction;
          const refinedQuestions: [string, string, string] = (Array.isArray(match.core_questions) && match.core_questions.length === 3)
            ? [String(match.core_questions[0]), String(match.core_questions[1]), String(match.core_questions[2])]
            : origIdea.core_questions;

          const articleTitle = origIdea.source_article_title || origIdea.video_idea;
          const primaryUrl = origIdea.source_url || origIdea.source_official_url || '';
          const officialUrl = origIdea.source_official_url || (origIdea.source_url ? new URL(origIdea.source_url).origin : '');
          const refinedClues = match.starting_clues ? String(match.starting_clues).trim() : (origIdea.starting_clues || `${origIdea.source_name} (${officialUrl || primaryUrl}). Article link: ${primaryUrl}`);

          // Assemble the complete ready-to-copy deep research prompt with all placeholders populated with refined info
          const refinedPrompt = buildStandardizedResearchPrompt({
            topic: refinedIdeaTitle,
            hook: refinedHook,
            angle: refinedAngle,
            subject: origIdea.subject,
            topicFamily: origIdea.topic_family,
            format: refinedFormat,
            overview: refinedOverview || `${origIdea.source_name} reporting on "${articleTitle}". ${refinedVis || ''}`,
            keyPoints: refinedKeyPoints,
            visualizationDirection: refinedVis,
            sources: refinedClues,
            coreQuestions: refinedQuestions,
            articleTitle: articleTitle,
            articleUrl: primaryUrl,
            authorityName: origIdea.source_name,
            originalSeed: origIdea.original_video_idea
          });

          return {
            ...origIdea,
            original_video_idea: origIdea.original_video_idea || origIdea.video_idea,
            video_idea: refinedIdeaTitle,
            curiosity_hook: refinedHook,
            content_angle: refinedAngle,
            content_brief_overview: refinedOverview,
            content_brief_key_points: refinedKeyPoints,
            core_questions: refinedQuestions,
            signature_format: refinedFormat,
            visualization_direction: refinedVis,
            starting_clues: refinedClues,
            research_prompt: refinedPrompt,
            production_score: typeof match.production_score === 'number' ? match.production_score : origIdea.production_score,
            ai_refined: true
          };
        });

        return {
          success: true,
          refinedIdeas,
          keyUsedIndex: index,
          modelUsed: model
        };
      } catch (err: any) {
        console.warn(`Error refining Discovery Lab ideas with Gemini Key #${index} (${model}):`, err);
        lastError = `Key #${index} (${model}): ${err.message}`;
      }
    }
  }

  return {
    success: false,
    refinedIdeas: ideas,
    error: `All configured Gemini keys failed. Last error: ${lastError}`
  };
}

/**
 * Refines a single Discovery Lab topic idea with Gemini multi-key rotation
 */
export async function refineSingleDiscoveryIdeaWithGeminiRotation(
  idea: GeneratedTopicIdea,
  config?: AppConfig
): Promise<{ refinedIdea: GeneratedTopicIdea; keyUsedIndex?: number; modelUsed?: string; error?: string }> {
  const result = await refineDiscoveryIdeasWithGeminiRotation([idea], config);
  if (result.success && result.refinedIdeas.length > 0) {
    return {
      refinedIdea: result.refinedIdeas[0],
      keyUsedIndex: result.keyUsedIndex,
      modelUsed: result.modelUsed
    };
  }
  return {
    refinedIdea: idea,
    error: result.error
  };
}

/**
 * Generates high-depth Psychology Topics across critical systemic dimensions (e.g. Manipulation,
 * Behavioral Control, System Traps, Consumerism Manipulation, Sale of Fear, etc.) using Gemini multi-key rotation.
 */
export async function generatePsychologyTopicsWithGeminiRotation(
  dimension: string,
  count: number = 3,
  focusPrompt?: string,
  startIdNumber: number = 1201,
  config?: AppConfig
): Promise<{ success: boolean; topics: PsychologyTopic[]; keyUsedIndex?: number; modelUsed?: string; error?: string }> {
  const keys = getConfiguredGeminiKeys(config);
  if (keys.length === 0) {
    return {
      success: false,
      topics: [],
      error: 'No Gemini API keys configured. Please configure an API key in Settings or App Config.'
    };
  }

  const prompt = `You are the Lead Behavioral Scientist and Story Architect for "Wise Wolf vs. Naive Sheep" — a premier intellectual entertainment series exposing cognitive blindspots, institutional deceptions, and hidden systemic levers.

Generate exactly ${count} deep, publication-grade psychology topics specifically focused on the critical dimension: "${dimension}".
${focusPrompt && focusPrompt.trim() ? `Additional User Focus / Angle Directives: "${focusPrompt.trim()}"` : ''}

CRITICAL EDITORIAL & SYSTEMIC DIRECTIVES:
1. THEMATIC DEPTH: Topics must expose how human psychology is nudged, exploited, or conditioned by modern institutions, digital platforms, market architectures, or social hierarchies.
2. CORE PHILOSOPHY: Contrast the "Naive Sheep" (who accepts the default, blames themselves, or falls for comfortable illusions) with the "Wise Wolf" (who asks lethal Socratic questions: "Who profits when you believe this? Who engineered this choice architecture?").
3. ACCURACY & EVIDENCE: Ground each topic in authentic behavioral economics, cybernetics, social psychology, or systems theory (e.g., Kahneman, Cialdini, Donella Meadows, B.F. Skinner, Neil Postman, Herbert Simon).
4. GROUNDED REALISM: Every concept must feature a visceral, relatable everyday scenario (workplaces, checkout lines, notification pings, financial choices, dating, family dynamics).

OUTPUT FORMAT: Return ONLY a raw JSON array containing exactly ${count} objects (no markdown code blocks, no preamble, no commentary).
Each object MUST strictly adhere to this format:
[
  {
    "phenomenon": "Name of the psychological bias, trap, or systemic lever (e.g. Algorithmic Operant Conditioning)",
    "dimension": "${dimension}",
    "sector": "Choose closest: Cognitive Biases & Decision-Making | Social Influence & Conformity | Crowd & Mass Behavior | Consumer & Pricing Psychology | Corporate Deception & Dark Patterns | Media & Information Psychology | Social Media & Digital Behavior | Memory, Attention & Perception | Learning & Habit | Motivation & Self-Regulation | Identity, Status & Self | Relationships & Interpersonal Behavior | Workplace & Organizations | Ethics, Morality & Responsibility | Risk, Fear & Crisis Behavior | Persuasion, Scams & Compliance",
    "category": "High level category (e.g. Behavioral Economics)",
    "type": "Specific mechanism type (e.g. Cognitive Nudge)",
    "subtype": "Subtype (e.g. Feedback Loop)",
    "definition": "Sharp, punchy definition of what this phenomenon actually is.",
    "mechanism": "The precise psychological or neuro-chemical reason why humans fall into this trap.",
    "contexts": "Where this happens in daily life (e.g. Grocery aisles, corporate performance reviews, dating apps)",
    "related": "2-3 related psychological or economic phenomena",
    "audience": "General Public",
    "role_tag": "Consumer / Citizen",
    "angle": "Provocative storytelling angle for a YouTube video",
    "lens": "Startling Realization & Hidden Puppet Strings",
    "prompt": "The core question or dilemma that starts the script",
    "question": "Socratic question that challenges the viewer",
    "story": "A 2-sentence micro-story illustrating the trap in everyday life",
    "awakening_truth": "The mind-blowing realization when the illusion falls away",
    "hidden_assumption": "What people falsely assume is happening",
    "uncomfortable_q": "An uncomfortable question that shatters conventional wisdom",
    "who_benefits": "Who quietly profits or gains compliance from this phenomenon",
    "who_pays": "Who bears the invisible financial, emotional, or time cost",
    "everyday_trigger": "The exact everyday cue that activates this bias",
    "myth": "The popular misconception people tell themselves",
    "reality_check": "The harsh, verified behavioral truth",
    "surprise_type": "Counter-Intuitive",
    "status": "Published",
    "evidence": "Empirical backing summary",
    "controversy": "Low",
    "sensitivity": "Low",
    "verification": "Peer-Reviewed Literature",
    "sources": ["2 reputable academic papers or seminal books"],
    "verified_count": 2,
    "shock": 4,
    "relatability": 5,
    "visualizability": 4,
    "comment_potential": 5,
    "sensationalism_risk": 1,
    "safe_claim_note": "A scientific nuance boundary to prevent oversimplification",
    "primary_prompt": "1-sentence hook prompt",
    "candidate_angles": ["Angle 1", "Angle 2", "Angle 3"],
    "candidate_questions": ["Question 1?", "Question 2?"],
    "candidate_hooks": ["Hook 1", "Hook 2", "Hook 3"],
    "candidate_endings": ["Ending 1", "Ending 2"],
    "candidate_perspectives": ["Wolf perspective", "Sheep perspective"],
    "candidate_stakeholders": ["The System", "The Consumer"],
    "candidate_scenes": ["Scene 1", "Scene 2"],
    "candidate_visuals": ["Visual metaphor 1", "Visual metaphor 2"],
    "candidate_ethics": ["Ethical boundary"],
    "candidate_series": ["Wise Wolf vs. Naive Sheep"],
    "candidate_recipes": ["Myth-Buster"],
    "candidate_seeds": ["Behavioral Economics"],
    "candidate_engagement_triggers": ["Personal recognition"],
    "candidate_engagement_goals": ["Trigger shares"],
    "candidate_psychographics": ["Truth-seekers"],
    "audience_guardrails": ["Avoid conspiratorial extremes; maintain rigorous empirical grounding."],
    "audience_guidance": "Speak directly to everyday relatable life without academic jargon."
  }
]`;

  let lastError = '';

  for (const { index, key } of keys) {
    for (const model of PREFERRED_GEMINI_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 8192
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          lastError = msg;

          const isKeyInvalid = msg.toLowerCase().includes('api_key_invalid') ||
                               msg.toLowerCase().includes('api key not valid') ||
                               msg.toLowerCase().includes('api key expired');
          if (isKeyInvalid) {
            break; // Try next key
          }
          continue; // Try next model
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (!rawText) {
          lastError = 'No text in Gemini response';
          continue;
        }

        // Clean markdown backticks if present
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.slice(0, -3);
        }
        cleaned = cleaned.trim();

        // Extract JSON array
        const startIdx = cleaned.indexOf('[');
        const endIdx = cleaned.lastIndexOf(']');
        if (startIdx === -1 || endIdx === -1) {
          lastError = 'Could not find JSON array in Gemini response';
          continue;
        }

        const jsonStr = cleaned.slice(startIdx, endIdx + 1);
        const parsedArray = JSON.parse(jsonStr);

        if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
          lastError = 'Parsed Gemini output is not a non-empty array';
          continue;
        }

        const formattedTopics: PsychologyTopic[] = parsedArray.map((item: any, idx: number) => {
          const assignedId = `TOP-${startIdNumber + idx}`;
          return {
            id: assignedId,
            phenomenon: item.phenomenon || `Topic ${assignedId}`,
            dimension: item.dimension || dimension,
            sector: item.sector || 'Cognitive Biases & Decision-Making',
            category: item.category || 'Behavioral Economics',
            type: item.type || 'Cognitive Nudge',
            subtype: item.subtype || 'Feedback Loop',
            definition: item.definition || '',
            mechanism: item.mechanism || item.definition || '',
            contexts: item.contexts || 'Everyday life',
            related: item.related || '',
            audience: item.audience || 'General Public',
            role_tag: item.role_tag || 'Consumer / Citizen',
            angle: item.angle || 'Hidden behavioral dynamic',
            lens: item.lens || 'Startling Realization & Hidden Puppet Strings',
            prompt: item.prompt || item.definition || '',
            question: item.question || 'Why do we fall for this?',
            story: item.story || '',
            awakening_truth: item.awakening_truth || item.definition || '',
            hidden_assumption: item.hidden_assumption || 'People believe they make choices with pure free will.',
            uncomfortable_q: item.uncomfortable_q || 'If you knew you were being steered, could you stop yourself?',
            who_benefits: item.who_benefits || 'Architects of the system and commercial platforms',
            who_pays: item.who_pays || 'The individual consumer through lost attention and autonomy',
            everyday_trigger: item.everyday_trigger || item.contexts || 'Daily micro-decisions',
            myth: item.myth || 'That this only affects uneducated or gullible people.',
            reality_check: item.reality_check || 'It is an engineered systemic friction that affects everyone.',
            surprise_type: item.surprise_type || 'Counter-Intuitive',
            status: item.status || 'Published',
            evidence: item.evidence || 'Empirical behavioral research',
            controversy: item.controversy || 'Low',
            sensitivity: item.sensitivity || 'Low',
            verification: item.verification || 'Peer-Reviewed Literature',
            sources: Array.isArray(item.sources) ? item.sources : ['Peer-reviewed behavioral science literature'],
            verified_count: typeof item.verified_count === 'number' ? item.verified_count : 2,
            shock: typeof item.shock === 'number' ? item.shock : 4,
            relatability: typeof item.relatability === 'number' ? item.relatability : 5,
            visualizability: typeof item.visualizability === 'number' ? item.visualizability : 4,
            comment_potential: typeof item.comment_potential === 'number' ? item.comment_potential : 5,
            sensationalism_risk: typeof item.sensationalism_risk === 'number' ? item.sensationalism_risk : 1,
            safe_claim_note: item.safe_claim_note || 'Avoid sweeping absolutes; preserve human nuance.',
            primary_prompt: item.primary_prompt || item.prompt || '',
            candidate_angles: Array.isArray(item.candidate_angles) ? item.candidate_angles : [item.angle || 'Systemic trap'],
            candidate_questions: Array.isArray(item.candidate_questions) ? item.candidate_questions : [item.question || 'Why does this occur?'],
            candidate_hooks: Array.isArray(item.candidate_hooks) ? item.candidate_hooks : [item.prompt || 'Are you aware of this invisible lever?'],
            candidate_endings: Array.isArray(item.candidate_endings) ? item.candidate_endings : [item.uncomfortable_q || 'What will you do differently next time?'],
            candidate_perspectives: Array.isArray(item.candidate_perspectives) ? item.candidate_perspectives : ['Wolf perspective', 'Sheep perspective'],
            candidate_stakeholders: Array.isArray(item.candidate_stakeholders) ? item.candidate_stakeholders : ['The Institution', 'The Public'],
            candidate_scenes: Array.isArray(item.candidate_scenes) ? item.candidate_scenes : ['Daily routine environment'],
            candidate_visuals: Array.isArray(item.candidate_visuals) ? item.candidate_visuals : ['Split screen contrast'],
            candidate_ethics: Array.isArray(item.candidate_ethics) ? item.candidate_ethics : ['Empirical clarity'],
            candidate_series: Array.isArray(item.candidate_series) ? item.candidate_series : ['Wise Wolf vs. Naive Sheep'],
            candidate_recipes: Array.isArray(item.candidate_recipes) ? item.candidate_recipes : ['Socratic Breakdown'],
            candidate_seeds: Array.isArray(item.candidate_seeds) ? item.candidate_seeds : ['Behavioral Economics'],
            candidate_engagement_triggers: Array.isArray(item.candidate_engagement_triggers) ? item.candidate_engagement_triggers : ['Personal recognition'],
            candidate_engagement_goals: Array.isArray(item.candidate_engagement_goals) ? item.candidate_engagement_goals : ['Trigger shares'],
            candidate_psychographics: Array.isArray(item.candidate_psychographics) ? item.candidate_psychographics : ['Truth-seekers'],
            audience_guardrails: Array.isArray(item.audience_guardrails) ? item.audience_guardrails : ['Avoid conspiratorial extremes.'],
            audience_guidance: item.audience_guidance || 'Ground in everyday language without academic jargon.'
          };
        });

        return {
          success: true,
          topics: formattedTopics,
          keyUsedIndex: index,
          modelUsed: model
        };
      } catch (err: any) {
        console.warn(`Error generating psychology topics with Gemini Key #${index} (${model}):`, err);
        lastError = `Key #${index} (${model}): ${err.message}`;
      }
    }
  }

  return {
    success: false,
    topics: [],
    error: `All configured Gemini keys failed. Last error: ${lastError}`
  };
}



