import { AppConfig, DiscoveryArticle, DiscoverySource, GeneratedTopicIdea } from '../types';
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

export const PREFERRED_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Test a specific Gemini API Key for validity
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

      // If key is invalid (400 or 403 API key error), stop trying other models
      if (res.status === 400 || res.status === 403 || msg.toLowerCase().includes('api_key_invalid') || msg.toLowerCase().includes('api key not valid')) {
        return { valid: false, error: msg };
      }
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
          const errorMsg = errJson?.error?.message || `HTTP ${res.status}`;
          // If model not found (404), try next model in PREFERRED_GEMINI_MODELS
          if (res.status === 404) {
            continue;
          }
          console.warn(`Gemini Key #${index} failed (${errorMsg}), rotating to next available key...`);
          lastError = `Key #${index}: ${errorMsg}`;
          break; // Key failed, move to next key
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
