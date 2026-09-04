import { AppConfig, DiscoveryArticle, DiscoverySource, GeneratedTopicIdea, BatchItem, ProductionIdea } from '../types';
import { loadConfig } from './api';

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
  "core_questions": [
    "Question 1 (Physical/Historical Evidence): What specific artifact, fossil, data, or site was uncovered?",
    "Question 2 (Underlying Mechanism/Context): What exact scientific principle, engineering feat, or historical pressure explains why this happened?",
    "Question 3 (Broader Paradigm Shift): How does this discovery alter our understanding of human history, physics, or the future?"
  ],
  "signature_format": "One of: SF01 — Hidden System, SF02 — Counterintuitive Mechanism, SF03 — Evolution Over Time, SF04 — Case Study Breakdown, SF05 — Historical Analogy, SF08 — Visualized Rules & Quirks, SF17 — Under the Hood",
  "production_score": 92,
  "priority_tier": "Tier 1",
  "visualization_direction": "Clear motion graphics and visual guidance for editors (e.g. 3D maps, micro-CT cross-sections, timeline animations)"
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
              maxOutputTokens: 1000,
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

        const generated: GeneratedTopicIdea = {
          id: `GEN-AI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          video_idea: parsed.video_idea || article.title,
          curiosity_hook: parsed.curiosity_hook || `Why did ${article.title} surprise researchers?`,
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
          production_score: Number(parsed.production_score || 90),
          priority_tier: (parsed.priority_tier === 'Tier 1' || parsed.priority_tier === 'Tier 2') ? parsed.priority_tier : 'Tier 1',
          freshness_class: 'Recent Publication (AI Curated)',
          visualization_direction: parsed.visualization_direction || `Incorporate archival scans, 3D maps, and visual motion graphics from ${source.name}.`,
          source_family_guidance: `Primary publication: ${source.name} (${source.officialUrl}). Article link: ${article.link || source.officialUrl}. AI analyzed (${model}) from live publication stream.`,
          added_to_pool: false,
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

  const prompt = `You are KnowSights' Senior YouTube Content Strategist and Video Topic Architect.
Transform this batch of ${items.length} academic/curriculum topics into high-retention, curiosity-driven YouTube educational video concepts.

IMPORTANT OPERATIONAL DIRECTIVES:
1. DITCH ACADEMIC STIFF PHRASING:
   - The input topics are formal academic curriculum items (e.g. "Compare cloud AI with on-device AI for privacy and speed", "How transmission spectroscopy detects atmospheric water on distant worlds").
   - Transform each into an active, intrigue-driven, punchy YouTube video title (50-80 chars) that creates an immediate pattern-interrupt.
2. GIVE EACH TOPIC A UNIQUE, COMPELLING ANGLE:
   - Identify the counterintuitive tension, hidden mechanism, real-world paradox, or unasked question inside each concept.
   - Do NOT use repetitive phrasing or formulas across the batch. Give every topic a unique, distinct angle.
3. PRESERVE SUBSTANTIVE EDUCATIONAL VALUE:
   - The video concepts must remain 100% accurate, deeply informative, and intellectually honest. No cheap or sensationalized clickbait. Every concept must deliver genuine real-world knowledge and insight that respects the viewer's intelligence.
4. ASSIGN RELEVANT SIGNATURE FORMAT & CONCRETE VISUAL DIRECTION:
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
    "signature_format": "SF01 — Hidden System",
    "visualization_direction": "Side-by-side data flow diagram comparing packets leaving a phone versus local neural processor execution.",
    "production_score": 92
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

          // Otherwise (404 not found, 400 model unsupported, 503 high demand spike, 429 rate limit, 500 error),
          // continue down the descending model list (3.7 -> 3.6 -> 3.5 -> 3.5-lite -> 3.0 -> 2.5 -> 2.0 -> 1.5)
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
          const refinedIdea: ProductionIdea = {
            ...origItem.idea,
            original_video_idea: originalTitle,
            video_idea: match.video_idea ? String(match.video_idea).trim() : origItem.idea.video_idea,
            curiosity_hook: match.curiosity_hook ? String(match.curiosity_hook).trim() : origItem.idea.curiosity_hook,
            signature_format: match.signature_format ? String(match.signature_format).trim() : origItem.idea.signature_format,
            visualization_direction: match.visualization_direction ? String(match.visualization_direction).trim() : origItem.idea.visualization_direction,
            production_score: typeof match.production_score === 'number' ? match.production_score : origItem.idea.production_score,
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

