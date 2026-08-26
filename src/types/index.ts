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
}

export type SelectionMode = 'BALANCED' | 'DISCOVERY' | 'DEEP_DIVE' | 'REVISIT_UNUSED' | 'CURRENT_EMERGING' | 'RANDOM';
