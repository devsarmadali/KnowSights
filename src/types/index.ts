export interface ProductionIdea {
  idea_id: string;
  subject: string;
  topic_family: string;
  signature_format: string;
  video_idea: string;
  curiosity_hook: string;
  freshness_class: string;
  research_status: string;
  used: boolean;
  used_date: string | null;
  times_shown: number;
  last_shown: string | null;
  production_score: number;
  priority_tier: string;
  notes?: string;
  active: boolean;
  hold_reason?: string;
  brief_available?: boolean;
  parent_sr?: number;
  subtopic_seed?: string;
  visualization_direction?: string;
  source_family_guidance?: string;
}

export interface BatchItem {
  batch_item_id: string;
  batch_id: string;
  idea_id: string;
  position: number;
  status: 'shown' | 'replaced' | 'used';
  selected_at: string;
  idea: ProductionIdea;
}

export interface DailyBatch {
  batch_id: string;
  date: string;
  selection_mode: string;
  requested_size: number;
  created_at: string;
  items: BatchItem[];
}

export interface IdeaBrief {
  idea_id: string;
  title: string;
  overview: string;
  key_points: string;
  sources: string;
  ready_status: string;
}

export interface SubjectCoverage {
  subject: string;
  total: number;
  used: number;
  available: number;
  used_percentage: number;
}

export interface SystemStats {
  total_ideas: number;
  available_ideas: number;
  used_ideas: number;
  used_percentage: number;
  used_today: number;
  subjects_coverage: SubjectCoverage[];
}

export interface AppConfig {
  daily_mix_size: number;
  cooldown_days: number;
  max_same_subject: number;
  max_same_topic: number;
  max_same_signature_format: number;
  minimum_production_score: number;
  prefer_never_shown: boolean;
  allow_previously_shown: boolean;
  exclude_used: boolean;
  timezone: string;
  default_mode: string;
  auto_generate_daily: boolean;
  google_web_app_url: string;
  gemini_api_key_1?: string;
  gemini_api_key_2?: string;
  gemini_api_key_3?: string;
}

export type SelectionMode = 'BALANCED' | 'DISCOVERY' | 'DEEP_DIVE' | 'REVISIT_UNUSED' | 'CURRENT_EMERGING' | 'RANDOM';

export interface DiscoverySource {
  id: string;
  name: string;
  type: string;
  category: string;
  group: 'archaeology' | 'science' | 'history' | 'academic' | 'curiosities' | 'space' | 'ai-tech' | 'data-stats' | 'facts-mysteries' | 'deep-science';
  bestFor: string;
  officialUrl: string;
  feedUrl: string;
  searchFeedPattern?: string;
  subjectMapping: string;
  topicFamily: string;
  defaultFormat: string;
  badgeColor?: string;
}

export interface DiscoveryArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
}

export interface GeneratedTopicIdea {
  id: string;
  video_idea: string;
  curiosity_hook: string;
  core_questions: [string, string, string]; // [Evidence/Discovery, Mechanism/Context, Implication/Impact]
  signature_format: string;
  subject: string;
  topic_family: string;
  source_name: string;
  source_url: string;
  source_article_title: string;
  source_published_date: string;
  source_category: string;
  production_score: number;
  priority_tier: 'Tier 1' | 'Tier 2';
  freshness_class: string;
  visualization_direction: string;
  source_family_guidance: string;
  added_to_pool?: boolean;
}

export interface InstitutionalRepository {
  id: string;
  name: string;
  type: string;
  category: string;
  purpose: string;
  tier: 'Tier 1 — Primary Evidence' | 'Tier 2 — Scholarly/Reference' | 'Tier 3 — Discovery/Archive';
  officialUrl: string;
  searchPattern?: string;
  group: 'history-research' | 'archaeology-ancient' | 'military-war' | 'south-asian-islamic' | 'science-verification' | 'economics-finance' | 'credit-ratings' | 'trade-energy' | 'geopolitics-strategy' | 'health-governance';
  groupLabel: string;
  subjectMapping: string;
  topicFamily: string;
  defaultFormat: string;
  badgeColor?: string;
}

