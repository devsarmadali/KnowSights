import { 
  DailyBatch, 
  BatchItem, 
  SystemStats, 
  SelectionMode, 
  AppConfig, 
  ProductionIdea, 
  IdeaBrief,
  DiscoverySource,
  DiscoveryArticle,
  GeneratedTopicIdea,
  ResearchCycleState
} from '../types';

const STORAGE_KEY_CONFIG = 'knowsights_config_v2';
const STORAGE_KEY_LOCAL_POOL = 'knowsights_local_pool_v2';
const STORAGE_KEY_GENERATED_IDEAS = 'knowsights_generated_ideas_v1';
const STORAGE_KEY_RESEARCH_CYCLE = 'knowsights_research_cycle_v1';

export const CLOUDFLARE_EDGE_API_URL = 'https://knowsights-api.excisetools.workers.dev';
export const GOOGLE_SHEETS_FALLBACK_URL = 'https://script.google.com/macros/s/AKfycbzrJo3mT73UlHp5EbXwzteWdebFzMQunRIV0YY_44j_OvVhDhXRcvFqMieE2FrsL4kK_g/exec';
export const DEFAULT_WEB_APP_URL = CLOUDFLARE_EDGE_API_URL;

export const DEFAULT_CONFIG: AppConfig = {
  daily_mix_size: 12,
  cooldown_days: 7,
  max_same_subject: 2,
  max_same_topic: 1,
  max_same_signature_format: 2,
  minimum_production_score: 0,
  prefer_never_shown: true,
  allow_previously_shown: true,
  exclude_used: true,
  timezone: 'Asia/Karachi',
  default_mode: 'BALANCED',
  auto_generate_daily: true,
  google_web_app_url: DEFAULT_WEB_APP_URL,
  gemini_api_key_1: '',
  gemini_api_key_2: '',
  gemini_api_key_3: '',
  theme: 'dark'
};

export function normalizeToProductionIdea(raw: any, idx: number = 0): ProductionIdea {
  if (!raw) {
    return {
      idea_id: `KS-P-${String(idx + 1).padStart(4, '0')}`,
      subject: "General",
      topic_family: "General",
      signature_format: "Standard",
      video_idea: "Curated Content Idea",
      curiosity_hook: "",
      freshness_class: "Evergreen",
      research_status: "Ready",
      used: false,
      used_date: null,
      times_shown: 0,
      last_shown: null,
      production_score: 85,
      priority_tier: "Tier 1",
      notes: "",
      active: true,
      brief_available: false
    };
  }

  const ideaId = raw.idea_id || (raw.sr ? `KS-P-${String(raw.sr).padStart(4, '0')}` : `KS-P-${String(idx + 1).padStart(4, '0')}`);
  return {
    idea_id: String(ideaId),
    parent_sr: raw.parent_sr || raw['parent sr.'] || raw.parent_sr_num || undefined,
    subtopic_seed: raw.subtopic_seed || raw['subtopic seed'] || raw.subtopic || undefined,
    subject: String(raw.subject || "General").trim(),
    topic_family: String(raw.topic_family || raw.topic || "General").trim(),
    signature_format: String(raw.signature_format || raw.angle || "Standard").trim(),
    video_idea: String(raw.video_idea || raw.subtopic_text || raw.subtopic || raw.text || raw.title || ideaId).trim(),
    curiosity_hook: String(raw.curiosity_hook || raw.hook || raw['research hook'] || "").trim(),
    visualization_direction: String(raw.visualization_direction || raw['visualization direction'] || "").trim(),
    source_family_guidance: String(raw.source_family_guidance || raw['source-family guidance'] || raw['source family guidance'] || "").trim(),
    freshness_class: String(raw.freshness_class || raw['freshness classification'] || "Evergreen").trim(),
    research_status: String(raw.research_status || raw.status || "Ready").trim(),
    used: (raw.used === true || String(raw.used).toLowerCase() === "true" || raw.used === 1),
    used_date: raw.used_date || raw.used_at || null,
    times_shown: raw.times_shown !== undefined ? Number(raw.times_shown) : Number(raw.previous_times_shown || 0),
    last_shown: raw.last_shown || raw.last_shown_at || null,
    production_score: Number(raw.production_score || raw.score || 82),
    priority_tier: String(raw.priority_tier || (Number(raw.production_score || raw.score || 82) >= 90 ? "Tier 1" : "Tier 2")).trim(),
    notes: String(raw.notes || "").trim(),
    active: raw.active !== false && String(raw.active).toLowerCase() !== "false",
    hold_reason: raw.hold_reason || "",
    brief_available: raw.brief_available !== undefined ? (raw.brief_available === true || String(raw.brief_available).toLowerCase() === "true") : false
  };
}

export function normalizeStats(raw: any): SystemStats {
  if (!raw) return { total_ideas: 0, available_ideas: 0, used_ideas: 0, used_percentage: 0, used_today: 0, subjects_coverage: [] };
  const s = raw.stats || raw;
  const total = s.total_ideas ?? s.total_subtopics ?? 0;
  const available = s.available_ideas ?? s.available_subtopics ?? 0;
  const used = s.used_ideas ?? s.used_subtopics ?? 0;
  const percentage = s.used_percentage ?? (total > 0 ? Math.round((used / total) * 1000) / 10 : 0);
  const usedToday = s.used_today ?? 0;
  const subjects = s.subjects_coverage || (s.subjects_progress ? s.subjects_progress.map((sub: any) => ({
    subject: sub.subject,
    total: sub.total,
    used: sub.used,
    available: sub.available,
    used_percentage: sub.used_percentage
  })) : []);

  return {
    total_ideas: total,
    available_ideas: available,
    used_ideas: used,
    used_percentage: percentage,
    used_today: usedToday,
    subjects_coverage: subjects
  };
}

export function normalizeBatch(raw: any): DailyBatch | null {
  if (!raw) return null;
  const b = raw.today_batch || raw.batch || raw.latest_batch || raw;
  if (!b || !b.items || !Array.isArray(b.items)) return null;

  return {
    batch_id: String(b.batch_id || `batch_${Date.now()}`),
    date: String(b.date || new Date().toISOString().slice(0, 10)),
    selection_mode: String(b.selection_mode || 'BALANCED'),
    requested_size: Number(b.requested_size) || b.items.length,
    created_at: b.created_at || new Date().toISOString(),
    items: b.items.map((it: any, idx: number) => {
      const position = Number(it.position) || (idx + 1);
      const ideaObj = it.idea ? normalizeToProductionIdea(it.idea, idx) : normalizeToProductionIdea(it, idx);
      return {
        batch_item_id: String(it.batch_item_id || `item_${idx + 1}`),
        batch_id: String(it.batch_id || b.batch_id),
        idea_id: ideaObj.idea_id,
        position,
        status: (it.status || 'shown') as any,
        selected_at: it.selected_at || new Date().toISOString(),
        idea: ideaObj
      };
    })
  };
}

// Generate unique Request ID for mutation idempotency
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Load / Save Config
export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.google_web_app_url || parsed.google_web_app_url.includes('example') || parsed.google_web_app_url.includes('script.google.com')) {
        parsed.google_web_app_url = CLOUDFLARE_EDGE_API_URL;
        saveConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error("Error reading config", e);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

// Load / Save Generated Topic Ideas across reloads
export function loadGeneratedIdeas(): GeneratedTopicIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GENERATED_IDEAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading generated ideas from storage", e);
  }
  return [];
}

export function saveGeneratedIdeas(ideas: GeneratedTopicIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GENERATED_IDEAS, JSON.stringify(ideas));
  } catch (e) {
    console.error("Error saving generated ideas to storage", e);
  }
}

export function clearGeneratedIdeas(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_GENERATED_IDEAS);
  } catch (e) {
    console.error("Error clearing generated ideas", e);
  }
}

// Load / Save / Reset Research Cycle State (for 2-resource batching)
export function loadResearchCycle(): ResearchCycleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESEARCH_CYCLE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.researchedSourceIds)) {
        return {
          researchedSourceIds: parsed.researchedSourceIds,
          lastResetAt: parsed.lastResetAt || new Date().toISOString(),
          lastRunAt: parsed.lastRunAt || undefined,
          completedCycles: typeof parsed.completedCycles === 'number' ? parsed.completedCycles : 0
        };
      }
    }
  } catch (e) {
    console.error("Error reading research cycle state", e);
  }
  return {
    researchedSourceIds: [],
    lastResetAt: new Date().toISOString(),
    completedCycles: 0
  };
}

export function saveResearchCycle(state: ResearchCycleState): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESEARCH_CYCLE, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving research cycle state", e);
  }
}

export function resetResearchCycle(): ResearchCycleState {
  const current = loadResearchCycle();
  const nextState: ResearchCycleState = {
    researchedSourceIds: [],
    lastResetAt: new Date().toISOString(),
    completedCycles: current.completedCycles + 1
  };
  saveResearchCycle(nextState);
  return nextState;
}

// Built-in Seed Production Pool for offline fallback/testing
const SAMPLE_PRODUCTION_POOL: ProductionIdea[] = [
  {
    idea_id: "KS-P-0001",
    subject: "Current Affairs",
    topic_family: "Population & Megacities",
    signature_format: "Geopolitical Breakdown",
    video_idea: "Why Urban Housing Shortages Become National Political Crises",
    curiosity_hook: "How three global capitals ran out of space and what governments did about it",
    freshness_class: "Emerging Trend",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 92,
    priority_tier: "Tier 1",
    notes: "Focus on Tokyo, London and Cairo case comparisons",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0002",
    subject: "Science & Discoveries",
    topic_family: "Microbiology",
    signature_format: "Visualized Timeline",
    video_idea: "The Secret Chemistry of Gut Microbes and Neurotransmitters",
    curiosity_hook: "Why 90% of serotonin is manufactured outside your brain",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 88,
    priority_tier: "Tier 1",
    notes: "Requires molecular graphics and diagram animations",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0003",
    subject: "History & Civilizations",
    topic_family: "Empires & Trade",
    signature_format: "Case Study & Map",
    video_idea: "How the Mongol Postal Relay Network (Yam) Connected Eurasia",
    curiosity_hook: "The medieval pony express that moved messages 200 miles a day",
    freshness_class: "Historical Anchor",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 85,
    priority_tier: "Tier 1",
    notes: "Include passport (Paiza) artifacts",
    active: true,
    brief_available: false
  },
  {
    idea_id: "KS-P-0004",
    subject: "Artificial Intelligence",
    topic_family: "Autonomous Systems",
    signature_format: "Myth vs Reality",
    video_idea: "Can an AI Solve an Unfamiliar Mechanical Puzzle Without Training?",
    curiosity_hook: "Testing spatial reasoning benchmarks against human toddlers",
    freshness_class: "Breakthrough",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 94,
    priority_tier: "Tier 1",
    notes: "Reference 2026 ARC-AGI benchmarks",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0005",
    subject: "Geography & Countries",
    topic_family: "Subterranean Geology",
    signature_format: "Explainer & Cross-Section",
    video_idea: "Why Underground Rivers Disappear and Emerge Hundreds of Miles Away",
    curiosity_hook: "The lost waters of karst landscapes and hidden sinkhole networks",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 80,
    priority_tier: "Tier 2",
    notes: "Show 3D geological cross sections",
    active: true,
    brief_available: false
  },
  {
    idea_id: "KS-P-0006",
    subject: "Technology & Future Innovations",
    topic_family: "Aerospace",
    signature_format: "Engineering Deep Dive",
    video_idea: "How Reusable Rocket Heat Shields Survive 3,000°F Atmospheric Reentry",
    curiosity_hook: "The thermal tile physics that keeps orbital boosters reusable",
    freshness_class: "Emerging Tech",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 91,
    priority_tier: "Tier 1",
    notes: "Include Starship and Falcon 9 tile breakdown",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0007",
    subject: "General Knowledge",
    topic_family: "World Curiosities",
    signature_format: "Rankings & Oddities",
    video_idea: "The World's Most Bizarre Border Tripoints and Enclaves",
    curiosity_hook: "Where stepping three feet puts you in three different legal jurisdictions",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 79,
    priority_tier: "Tier 2",
    notes: "Baarle-Hertog / Baarle-Nassau and Cooch Behar",
    active: true,
    brief_available: false
  },
  {
    idea_id: "KS-P-0008",
    subject: "Fitness & Human Body",
    topic_family: "Biomechanics",
    signature_format: "Actionable Blueprint",
    video_idea: "The Exact Muscle Temperature Curve That Prevents Tendon Tears",
    curiosity_hook: "Why 5 minutes of specific dynamic mobility alters joint viscosity",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 83,
    priority_tier: "Tier 2",
    notes: "Highlight synovial fluid temperature data",
    active: true,
    brief_available: false
  },
  {
    idea_id: "KS-P-0009",
    subject: "History & Civilizations",
    topic_family: "Ancient Engineering",
    signature_format: "Architectural Breakdown",
    video_idea: "How Roman Concrete Survived 2,000 Years Underwater While Modern Concrete Crumbles",
    curiosity_hook: "The volcanic pozzolana chemistry that self-heals in saltwater",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 95,
    priority_tier: "Tier 1",
    notes: "Include mineral lime clast analysis",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0010",
    subject: "Current Affairs",
    topic_family: "Semiconductor Geopolitics",
    signature_format: "Strategic Map",
    video_idea: "The 3 Companies That Monopolize the Entire World's Microchip Lithography",
    curiosity_hook: "Why a single laser mirror in the Netherlands holds the global economy hostage",
    freshness_class: "High Impact",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 97,
    priority_tier: "Tier 1",
    notes: "Focus on ASML, Zeiss, and TSMC",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0011",
    subject: "Space & Astronomy",
    topic_family: "Deep Space Mysteries",
    signature_format: "Astrophysics Visualized",
    video_idea: "The Boötes Void: Why There is a 330-Million-Light-Year Hole in the Universe",
    curiosity_hook: "If our galaxy were in the center, we wouldn't have known other galaxies existed until the 1960s",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 90,
    priority_tier: "Tier 1",
    notes: "Visualize scale comparison",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0012",
    subject: "Science & Discoveries",
    topic_family: "Quantum Mechanics",
    signature_format: "Thought Experiment",
    video_idea: "Quantum Eraser: How Measuring a Particle in the Future Changes Its Past Path",
    curiosity_hook: "The double-slit experiment variation that breaks classical causality",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 93,
    priority_tier: "Tier 1",
    notes: "Delayed choice quantum eraser diagram",
    active: true,
    brief_available: true
  },
  {
    idea_id: "KS-P-0013",
    subject: "Interesting Facts",
    topic_family: "Evolutionary Biology",
    signature_format: "Biological Enigma",
    video_idea: "Carcinisation: Why Nature Has Turned Animals Into Crabs 5 Separate Times",
    curiosity_hook: "The evolutionary convergence phenomenon that keeps creating identical crustacean forms",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 86,
    priority_tier: "Tier 1",
    notes: "Include false crabs vs true crabs breakdown",
    active: true,
    brief_available: false
  },
  {
    idea_id: "KS-P-0014",
    subject: "Visualized Concepts",
    topic_family: "Historical Timelines",
    signature_format: "Comparative Timeline",
    video_idea: "Oxford University is Older Than the Aztec Empire: 10 Timeline Mindbenders",
    curiosity_hook: "Historical events you thought happened centuries apart that actually happened simultaneously",
    freshness_class: "Evergreen",
    research_status: "Ready",
    used: false,
    used_date: null,
    times_shown: 0,
    last_shown: null,
    production_score: 89,
    priority_tier: "Tier 1",
    notes: "Animated timeline overlay",
    active: true,
    brief_available: true
  }
];

function getLocalPool(): ProductionIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_POOL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading local pool", e);
  }
  localStorage.setItem(STORAGE_KEY_LOCAL_POOL, JSON.stringify(SAMPLE_PRODUCTION_POOL));
  return SAMPLE_PRODUCTION_POOL;
}

function saveLocalPool(pool: ProductionIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_POOL, JSON.stringify(pool));
  } catch (e) {}
}

// Universal API Dispatcher (Connects to Cloudflare D1 Edge Worker with Google Sheets fallback)
async function callApi(action: string, payload: Record<string, any> = {}): Promise<any> {
  const config = loadConfig();
  const primaryUrl = (config.google_web_app_url || DEFAULT_WEB_APP_URL)?.trim();
  const urlsToTry = [primaryUrl];

  if (primaryUrl !== GOOGLE_SHEETS_FALLBACK_URL && GOOGLE_SHEETS_FALLBACK_URL) {
    urlsToTry.push(GOOGLE_SHEETS_FALLBACK_URL);
  }

  for (const url of urlsToTry) {
    if (!url || url.includes('example')) continue;
    try {
      if (url.includes('workers.dev') || url.includes('cloudflare')) {
        // Cloudflare Edge Worker API (Ultra-Fast REST)
        const isMutation = ['generate_batch', 'replace_item', 'mark_used', 'undo_used', 'save_config', 'update_config', 'add_production_idea'].includes(action);
        const reqPayload = { action, ...payload };

        if (isMutation) {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqPayload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success !== false) return data;
          }
        } else {
          const qParams = new URLSearchParams();
          qParams.set('action', action);
          for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined && v !== null) {
              qParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
            }
          }
          const res = await fetch(`${url}?${qParams.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success !== false) return data;
          }
        }
      } else if (url.includes('script.google.com')) {
        // Google Apps Script API
        const queryParams = new URLSearchParams();
        queryParams.set('action', action);
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined && v !== null) {
            queryParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
          }
        }
        const res = await fetch(`${url}?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success !== false) return json;
        }
      }
    } catch (err) {
      console.warn(`API call failed for ${url}, trying next fallback:`, err);
    }
  }

  // Fallback to local Schema 2.0 deterministic engine
  return executeLocalEngine(action, payload, config);
}

// Local Fallback Engine
function executeLocalEngine(action: string, payload: Record<string, any>, config: AppConfig): any {
  const pool = getLocalPool();

  if (action === 'get_initial_data' || action === 'get_stats') {
    const total = pool.length;
    const usedCount = pool.filter(p => p.used).length;
    return {
      success: true,
      config,
      stats: {
        total_ideas: total,
        available_ideas: total - usedCount,
        used_ideas: usedCount,
        used_percentage: total > 0 ? Math.round((usedCount / total) * 1000) / 10 : 0,
        used_today: 0,
        subjects_coverage: []
      },
      today_batch: null
    };
  }

  if (action === 'get_today_batch' || action === 'generate_batch') {
    const size = payload.size || config.daily_mix_size || 12;
    const mode = payload.mode || config.default_mode || 'BALANCED';
    const eligible = pool.filter(p => !p.used && p.active && p.research_status.toLowerCase() !== 'hold');

    const selected = eligible.slice(0, size);
    selected.forEach(s => {
      s.times_shown += 1;
      s.last_shown = new Date().toISOString();
    });
    saveLocalPool(pool);

    const batchId = `batch_${Date.now()}`;
    const items: BatchItem[] = selected.map((item, idx) => ({
      batch_item_id: `item_${batchId}_${idx + 1}`,
      batch_id: batchId,
      idea_id: item.idea_id,
      position: idx + 1,
      status: 'shown',
      selected_at: new Date().toISOString(),
      idea: { ...item }
    }));

    return {
      success: true,
      batch: {
        batch_id: batchId,
        date: new Date().toISOString().slice(0, 10),
        selection_mode: mode,
        requested_size: size,
        created_at: new Date().toISOString(),
        items
      }
    };
  }

  if (action === 'replace_item') {
    const eligible = pool.filter(p => !p.used && p.active && p.research_status.toLowerCase() !== 'hold');
    if (!eligible.length) return { success: false, error: "No replacement available" };
    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    chosen.times_shown += 1;
    chosen.last_shown = new Date().toISOString();
    saveLocalPool(pool);

    return {
      success: true,
      new_item: {
        batch_item_id: `item_rep_${Date.now()}`,
        batch_id: payload.batch_id || 'batch_local',
        idea_id: chosen.idea_id,
        position: payload.position || 1,
        status: 'shown',
        selected_at: new Date().toISOString(),
        idea: { ...chosen }
      }
    };
  }

  if (action === 'mark_used') {
    const ideaId = payload.idea_id;
    const target = pool.find(p => p.idea_id === ideaId);
    if (target) {
      target.used = true;
      target.used_date = new Date().toISOString().slice(0, 10);
      saveLocalPool(pool);
      return { success: true, idea_id: ideaId, used: true, used_date: target.used_date };
    }
    return { success: false, error: "Idea not found" };
  }

  if (action === 'undo_used') {
    const ideaId = payload.idea_id;
    const target = pool.find(p => p.idea_id === ideaId);
    if (target) {
      target.used = false;
      target.used_date = null;
      saveLocalPool(pool);
      return { success: true, idea_id: ideaId, used: false, used_date: null };
    }
    return { success: false, error: "Idea not found" };
  }

  if (action === 'get_brief') {
    const ideaId = payload.idea_id;
    return {
      success: true,
      brief: {
        idea_id: ideaId,
        title: `Research Brief for ${ideaId}`,
        overview: "Detailed curated research summary extracted from source documents.",
        key_points: "1. Core premise & thesis\n2. Key historical/technical data points\n3. Counter-intuitive hooks\n4. Verified conclusions",
        sources: "Academic papers, peer-reviewed journals, verified statistical databases.",
        ready_status: "Ready"
      }
    };
  }

  if (action === 'browse_production_pool' || action === 'search') {
    const q = (payload.query || '').toLowerCase().trim();
    const subj = payload.subject ? payload.subject.toLowerCase() : '';
    const status = payload.status || 'all';

    const matched = pool.filter(p => {
      if (subj && p.subject.toLowerCase() !== subj) return false;
      if (status === 'available' && p.used) return false;
      if (status === 'used' && !p.used) return false;
      if (q) {
        const full = `${p.idea_id} ${p.video_idea} ${p.curiosity_hook} ${p.subject} ${p.topic_family}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });

    const page = payload.page || 1;
    const pageSize = payload.pageSize || 30;
    const paged = matched.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      total: matched.length,
      page,
      pageSize,
      totalPages: Math.ceil(matched.length / pageSize),
      items: paged,
      all_subjects: Array.from(new Set(pool.map(p => p.subject))).sort(),
      all_formats: Array.from(new Set(pool.map(p => p.signature_format))).sort()
    };
  }

  return { success: false, error: "Unknown action" };
}

export function parseRssXmlToArticles(xmlText: string, source: DiscoverySource): DiscoveryArticle[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item, entry'));
    if (!items || items.length === 0) return [];

    return items.map((item, idx) => {
      const title = item.querySelector('title')?.textContent || 'Recent Finding';
      let link = item.querySelector('link')?.textContent || '';
      if (!link) {
        link = item.querySelector('link')?.getAttribute('href') || source.officialUrl;
      }
      const pubDate = item.querySelector('pubDate, published, updated, dc\\:date')?.textContent || new Date().toISOString().slice(0, 10);
      const summary = item.querySelector('description, summary, content, content\\:encoded')?.textContent || '';

      return {
        id: `${source.id}-${idx}-${Date.now()}`,
        title: title.replace(/<[^>]+>/g, '').trim(),
        link: link.trim() || source.officialUrl,
        pubDate: pubDate.trim(),
        summary: summary.replace(/<[^>]+>/g, ' ').slice(0, 300).trim(),
        sourceId: source.id,
        sourceName: source.name,
        sourceCategory: source.category
      };
    });
  } catch (err) {
    console.error(`Error parsing XML for ${source.name}:`, err);
    return [];
  }
}

export async function fetchSourceArticles(source: DiscoverySource, query?: string, limit: number = 6): Promise<DiscoveryArticle[]> {
  let targetUrl = source.feedUrl;
  if (query && query.trim() && source.searchFeedPattern) {
    targetUrl = source.searchFeedPattern.replace('{query}', encodeURIComponent(query.trim()));
  }

  // Tier 1: Cloudflare Edge Worker Feed Proxy
  try {
    const edgeRes = await callApi('fetch_source_feed', { url: targetUrl });
    if (edgeRes && edgeRes.success && edgeRes.data) {
      const parsed = parseRssXmlToArticles(edgeRes.data, source);
      if (parsed.length > 0) return parsed.slice(0, limit);
    }
  } catch (e) {
    console.warn(`Worker proxy fetch failed for ${source.name}, falling back...`, e);
  }

  // Tier 2: Public AllOrigins CORS Proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const xml = await res.text();
      const parsed = parseRssXmlToArticles(xml, source);
      if (parsed.length > 0) return parsed.slice(0, limit);
    }
  } catch (e) {
    console.warn(`AllOrigins proxy fetch failed for ${source.name}:`, e);
  }

  // Tier 3: RSS2JSON Free Converter
  try {
    const r2jUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(r2jUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        return data.items.slice(0, limit).map((it: any, idx: number) => ({
          id: `${source.id}-${idx}-${Date.now()}`,
          title: it.title || 'Recent Finding',
          link: it.link || source.officialUrl,
          pubDate: it.pubDate || new Date().toISOString().slice(0, 10),
          summary: (it.description || '').replace(/<[^>]+>/g, ' ').slice(0, 300).trim(),
          sourceId: source.id,
          sourceName: source.name,
          sourceCategory: source.category
        }));
      }
    }
  } catch (e) {
    console.warn(`RSS2JSON fallback failed for ${source.name}:`, e);
  }

  // Tier 4: Curated Seed Fallbacks for this source if network is totally offline
  return [
    {
      id: `${source.id}-fallback-1`,
      title: query ? `Recent findings and new evidence regarding ${query} from ${source.name}` : `Recent breakthroughs and unexpected discoveries documented by ${source.name}`,
      link: source.officialUrl,
      pubDate: new Date().toISOString().slice(0, 10),
      summary: `Detailed investigation and scholarly reporting on ${source.category} from ${source.name}. Features field evidence, research analysis, and new discoveries.`,
      sourceId: source.id,
      sourceName: source.name,
      sourceCategory: source.category
    }
  ];
}

// Exported API Interface
export const api = {
  getInitialData: () => callApi('get_initial_data'),
  getTodayBatch: () => callApi('get_today_batch'),
  generateBatch: (mode: SelectionMode, size: number, subjectFilter?: string | string[]) => 
    callApi('generate_batch', { mode, size, subject_filter: subjectFilter, request_id: generateRequestId() }),
  replaceBatchItem: (batchId: string, batchItemId: string, position?: number, mode?: SelectionMode) => 
    callApi('replace_item', { batch_id: batchId, batch_item_id: batchItemId, position, mode, request_id: generateRequestId() }),
  markUsed: (ideaId: string) => 
    callApi('mark_used', { idea_id: ideaId, request_id: generateRequestId() }),
  undoUsed: (ideaId: string) => 
    callApi('undo_used', { idea_id: ideaId, request_id: generateRequestId() }),
  getProductionPool: (params: { query?: string; subject?: string; format?: string; research_status?: string; status?: string; min_score?: number; page?: number; pageSize?: number }) => 
    callApi('search', params),
  getBrief: (ideaId: string) => 
    callApi('get_brief', { idea_id: ideaId }),
  getStats: () => 
    callApi('get_stats'),
  getConfig: () => 
    callApi('get_config'),
  saveConfig: (config: AppConfig) =>
    callApi('save_config', { config, request_id: generateRequestId() }),
  syncInventory: () => 
    callApi('sync_inventory'),
  fetchSourceArticles,
  addProductionIdea: (idea: Partial<GeneratedTopicIdea>) =>
    callApi('add_production_idea', {
      video_idea: idea.video_idea,
      curiosity_hook: idea.curiosity_hook,
      signature_format: idea.signature_format,
      subject: idea.subject,
      topic_family: idea.topic_family,
      production_score: idea.production_score,
      priority_tier: idea.priority_tier,
      visualization_direction: idea.visualization_direction,
      source_family_guidance: idea.source_family_guidance,
      request_id: generateRequestId()
    })
};

