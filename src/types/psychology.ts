export interface PsychologyTopic {
  id: string; // e.g. "TOP-001"
  phenomenon: string; // e.g. "Confirmation bias"
  dimension?: string; // e.g. "Psychological Manipulation", "System Traps & Structural Dynamics"
  sector: string; // e.g. "Cognitive Biases & Decision-Making"
  category: string;
  type: string;
  subtype: string;
  definition: string;
  mechanism: string;
  contexts: string;
  related: string;
  audience: string;
  role_tag: string;
  angle: string;
  lens: string;
  prompt: string;
  question: string;
  story: string;
  awakening_truth: string;
  hidden_assumption: string;
  uncomfortable_q: string;
  who_benefits: string;
  who_pays: string;
  everyday_trigger: string;
  myth: string;
  reality_check: string;
  surprise_type: string;
  status: string;
  evidence: string;
  controversy: string;
  sensitivity: string;
  verification: string;
  sources: string[];
  verified_count: number;
  shock: number; // 1-5
  relatability: number; // 1-5
  visualizability: number; // 1-5
  comment_potential: number; // 1-5
  sensationalism_risk: number; // 1-5
  safe_claim_note: string;
  primary_prompt: string;
  candidate_angles: string[];
  candidate_questions: string[];
  candidate_hooks: string[];
  candidate_endings: string[];
  candidate_perspectives: string[];
  candidate_stakeholders: string[];
  candidate_scenes: string[];
  candidate_visuals: string[];
  candidate_ethics: string[];
  candidate_series: string[];
  candidate_recipes: string[];
  candidate_seeds: string[];
  candidate_engagement_triggers?: string[];
  candidate_engagement_goals?: string[];
  candidate_psychographics?: string[];
  audience_guardrails?: string[];
  audience_guidance?: string;
}

export interface PsychologyFilterState {
  query: string;
  sector: string; // 'all' or specific sector name
  dimension?: string; // 'all' or specific dimension name
  category: string;
  minShock: number;
  minRelatability: number;
  evidenceOnly: boolean; // verified_count > 0 or has source
  status: 'all' | 'unstudied' | 'studied' | 'bookmarked';
  page: number;
  pageSize: number;
}

export interface PsychologyStats {
  total: number;
  studiedCount: number;
  bookmarkedCount: number;
  sectors: {
    name: string;
    count: number;
    color: string;
  }[];
  dimensions?: {
    name: string;
    slug: string;
    count: number;
    color: string;
    badgeClass: string;
  }[];
}

export const PSYCHOLOGY_SECTORS: { name: string; color: string; badgeClass: string; borderClass: string }[] = [
  { 
    name: 'Cognitive Biases & Decision-Making', 
    color: 'emerald', 
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    borderClass: 'border-emerald-500/30' 
  },
  { 
    name: 'Social Influence & Conformity', 
    color: 'violet', 
    badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    borderClass: 'border-violet-500/30' 
  },
  { 
    name: 'Crowd & Mass Behavior', 
    color: 'sky', 
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    borderClass: 'border-sky-500/30' 
  },
  { 
    name: 'Consumer & Pricing Psychology', 
    color: 'amber', 
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    borderClass: 'border-amber-500/30' 
  },
  { 
    name: 'Corporate Deception & Dark Patterns', 
    color: 'rose', 
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    borderClass: 'border-rose-500/30' 
  },
  { 
    name: 'Media & Information Psychology', 
    color: 'cyan', 
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    borderClass: 'border-cyan-500/30' 
  },
  { 
    name: 'Social Media & Digital Behavior', 
    color: 'indigo', 
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    borderClass: 'border-indigo-500/30' 
  },
  { 
    name: 'Memory, Attention & Perception', 
    color: 'teal', 
    badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
    borderClass: 'border-teal-500/30' 
  },
  { 
    name: 'Learning & Habit', 
    color: 'lime', 
    badgeClass: 'bg-lime-500/10 text-lime-300 border-lime-500/25',
    borderClass: 'border-lime-500/30' 
  },
  { 
    name: 'Motivation & Self-Regulation', 
    color: 'orange', 
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
    borderClass: 'border-orange-500/30' 
  },
  { 
    name: 'Identity, Status & Self', 
    color: 'fuchsia', 
    badgeClass: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25',
    borderClass: 'border-fuchsia-500/30' 
  },
  { 
    name: 'Relationships & Interpersonal Behavior', 
    color: 'pink', 
    badgeClass: 'bg-pink-500/10 text-pink-300 border-pink-500/25',
    borderClass: 'border-pink-500/30' 
  },
  { 
    name: 'Workplace & Organizations', 
    color: 'blue', 
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    borderClass: 'border-blue-500/30' 
  },
  { 
    name: 'Ethics, Morality & Responsibility', 
    color: 'red', 
    badgeClass: 'bg-red-500/10 text-red-300 border-red-500/25',
    borderClass: 'border-red-500/30' 
  },
  { 
    name: 'Risk, Fear & Crisis Behavior', 
    color: 'yellow', 
    badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25',
    borderClass: 'border-yellow-500/30' 
  },
  { 
    name: 'Persuasion, Scams & Compliance', 
    color: 'purple', 
    badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    borderClass: 'border-purple-500/30' 
  },
  { 
    name: 'Child & Adolescent Behavior', 
    color: 'emerald', 
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    borderClass: 'border-emerald-500/30' 
  },
  { 
    name: 'Behavioral Economics', 
    color: 'green', 
    badgeClass: 'bg-green-500/10 text-green-300 border-green-500/25',
    borderClass: 'border-green-500/30' 
  },
  { 
    name: 'Public Behavior & Civic Life', 
    color: 'teal', 
    badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
    borderClass: 'border-teal-500/30' 
  },
  { 
    name: 'Communication & Language Effects', 
    color: 'sky', 
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    borderClass: 'border-sky-500/30' 
  }
];

export function getSectorConfig(sectorName: string) {
  const found = PSYCHOLOGY_SECTORS.find(s => s.name.toLowerCase() === (sectorName || '').toLowerCase());
  return found || {
    name: sectorName || 'General Psychology',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    borderClass: 'border-emerald-500/30'
  };
}

export interface PsychologyDimension {
  name: string;
  slug: string;
  color: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}

export const PSYCHOLOGY_DIMENSIONS: PsychologyDimension[] = [
  {
    name: 'Psychological Manipulation',
    slug: 'manipulation',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    borderClass: 'border-rose-500/35',
    description: 'DARVO, gaslighting, weaponized empathy, intermittent reinforcement, and interpersonal traps.'
  },
  {
    name: 'Behavioral & Systemic Control',
    slug: 'control',
    color: 'indigo',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10',
    borderClass: 'border-indigo-500/35',
    description: 'Digital panopticons, velvet cages, dark nudging, institutional learned helplessness, and algorithmic conditioning.'
  },
  {
    name: 'System Traps & Structural Dynamics',
    slug: 'system-traps',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
    borderClass: 'border-amber-500/35',
    description: 'Tragedy of the commons, policy resistance, addiction/intervener traps, Goodhart’s law, and threshold collapses.'
  },
  {
    name: 'Status Quo & System Justification',
    slug: 'status-quo',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10',
    borderClass: 'border-cyan-500/35',
    description: 'System justification theory, the meritocracy myth, creeping normality, and manufactured inevitability.'
  },
  {
    name: 'Consumerism Manipulation',
    slug: 'consumerism',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    borderClass: 'border-emerald-500/35',
    description: 'Engineered dissatisfaction, hedonic treadmills, dark scarcity, aspirational debt, and Gruen transfer disorientation.'
  },
  {
    name: 'Social Traps & Multipolar Dilemmas',
    slug: 'social-traps',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/10',
    borderClass: 'border-purple-500/35',
    description: 'Moloch dynamics, crab mentality, pluralistic ignorance, positional arms races, and bystander apathy.'
  },
  {
    name: 'Social Controls & Compliance',
    slug: 'social-controls',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-sm shadow-blue-500/10',
    borderClass: 'border-blue-500/35',
    description: 'Manufactured consent, Overton window shifts, tone policing, shame economies, and the spiral of silence.'
  },
  {
    name: 'Sale of Fear & Threat Monetization',
    slug: 'fear',
    color: 'red',
    badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30 shadow-sm shadow-red-500/10',
    borderClass: 'border-red-500/35',
    description: 'Threat inflation, mean world syndrome, security theater, shock doctrines, and medicalization of normal struggles.'
  }
];

export function getDimensionConfig(dimensionName?: string): PsychologyDimension {
  const found = PSYCHOLOGY_DIMENSIONS.find(d => 
    d.name.toLowerCase() === (dimensionName || '').toLowerCase() ||
    d.slug.toLowerCase() === (dimensionName || '').toLowerCase()
  );
  return found || {
    name: dimensionName || 'Critical Lens',
    slug: 'general',
    color: 'neutral',
    badgeClass: 'bg-white/[0.05] text-neutral-300 border-white/[0.1]',
    borderClass: 'border-white/[0.1]',
    description: 'Core behavioral and systemic mechanism analysis.'
  };
}

