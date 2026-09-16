import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Target, 
  MessageSquare, 
  ShieldAlert, 
  FileText, 
  Layers,
  Search,
  BookOpen
} from 'lucide-react';
import { PsychologyTopic, getSectorConfig } from '../types/psychology';
import { formatPsychologyScriptPrompt } from '../services/psychologyApi';

interface PsychologyTopicCardProps {
  topic: PsychologyTopic;
  isStudied: boolean;
  isBookmarked: boolean;
  onToggleStudied: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onOpenDetail: (topic: PsychologyTopic) => void;
  onSaveToNotes?: (topic: PsychologyTopic) => void;
}

export const PsychologyTopicCard: React.FC<PsychologyTopicCardProps> = ({
  topic,
  isStudied,
  isBookmarked,
  onToggleStudied,
  onToggleBookmark,
  onOpenDetail,
  onSaveToNotes
}) => {
  const [showHiddenDynamic, setShowHiddenDynamic] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const sectorConfig = getSectorConfig(topic.sector);

  const handleCopyPrompt = async () => {
    const text = formatPsychologyScriptPrompt(topic);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy psychology prompt', err);
    }
  };

  const handleSaveToNotesClick = () => {
    if (onSaveToNotes) {
      onSaveToNotes(topic);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div 
      className={`glass-panel glass-panel-hover rounded-2xl p-5 relative flex flex-col justify-between transition-all duration-200 border overflow-hidden ${
        isStudied 
          ? 'border-emerald-500/40 bg-emerald-950/20 shadow-glow-emerald' 
          : isBookmarked
            ? 'border-amber-500/40 bg-amber-950/15'
            : 'border-white/[0.08] hover:border-white/[0.2] bg-[#0d1118]/75 hover:bg-[#111722]/85 shadow-tactile'
      }`}
    >
      {/* 1. Card Top Bar: Topic ID, Badges, & Quick State Toggles */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="font-mono text-xs font-bold text-neutral-300 bg-white/[0.05] border border-white/[0.1] px-2 py-0.5 rounded-md">
              {topic.id}
            </span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${sectorConfig.badgeClass}`}>
              {topic.sector}
            </span>
            {topic.type && (
              <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                {topic.type}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(topic.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this topic'}
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>

            {/* Studied / Used toggle button */}
            <button
              onClick={() => onToggleStudied(topic.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isStudied 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
              title={isStudied ? 'Mark as Unstudied' : 'Mark as Studied / Used'}
            >
              {isStudied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. Phenomenon Headline & Context */}
        <div className="mb-3 space-y-1">
          <h3 className="font-display font-bold text-lg leading-snug text-white tracking-tight flex items-baseline justify-between gap-2">
            <span>{topic.phenomenon}</span>
          </h3>

          {topic.subtype && (
            <p className="text-[11px] font-mono text-neutral-400">
              Subtype: <span className="text-neutral-200">{topic.subtype}</span>
            </p>
          )}
        </div>

        {/* 3. Core Definition & Mechanism */}
        <div className="space-y-2 mb-3.5">
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {topic.definition}
          </p>

          {topic.mechanism && (
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-300 font-sans">
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-semibold block mb-0.5">
                Driver Mechanism:
              </span>
              <p className="italic text-neutral-300">
                "{topic.mechanism}"
              </p>
            </div>
          )}
        </div>

        {/* 4. Curiosity Hook / Awakening Seed */}
        <div className="mb-3">
          <div className="editorial-hook p-3 rounded-xl text-xs font-sans italic leading-relaxed">
            "{topic.awakening_truth || topic.prompt || (topic.candidate_hooks && topic.candidate_hooks[0]) || 'What hidden rule is shaping this decision?'}"
          </div>
        </div>

        {/* 5. The Hidden Dynamic (Who Benefits vs Who Pays) Drawer */}
        {(topic.who_benefits || topic.who_pays || topic.hidden_assumption) && (
          <div className="mb-3">
            <button
              onClick={() => setShowHiddenDynamic(!showHiddenDynamic)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>The Hidden Dynamic ({showHiddenDynamic ? 'Hide' : 'Inspect'})</span>
              </span>
              {showHiddenDynamic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHiddenDynamic && (
              <div className="mt-1.5 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-[11px] space-y-2 animate-fadeIn">
                {topic.who_benefits && (
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold block">
                      Who Benefits / Gains:
                    </span>
                    <p className="text-neutral-300 mt-0.5">{topic.who_benefits}</p>
                  </div>
                )}
                {topic.who_pays && (
                  <div>
                    <span className="font-mono text-[10px] text-rose-400 font-semibold block">
                      Who Pays / Bears Cost:
                    </span>
                    <p className="text-neutral-300 mt-0.5">{topic.who_pays}</p>
                  </div>
                )}
                {topic.hidden_assumption && (
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold block">
                      Hidden Assumption:
                    </span>
                    <p className="text-neutral-300 mt-0.5">{topic.hidden_assumption}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. Psychology Metric Radar Pills */}
        <div className="grid grid-cols-4 gap-1.5 mb-3.5 text-[10px] font-mono">
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center" title={`Shock Potential: ${topic.shock}/5`}>
            <span className="text-neutral-500 block text-[9px]">Shock</span>
            <div className="flex items-center justify-center space-x-0.5 mt-0.5 text-amber-400 font-bold">
              <Zap className="w-2.5 h-2.5 fill-amber-400" />
              <span>{topic.shock.toFixed(1)}</span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center" title={`Relatability: ${topic.relatability}/5`}>
            <span className="text-neutral-500 block text-[9px]">Relate</span>
            <div className="flex items-center justify-center space-x-0.5 mt-0.5 text-emerald-400 font-bold">
              <Target className="w-2.5 h-2.5" />
              <span>{topic.relatability.toFixed(1)}</span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center" title={`Visualizability: ${topic.visualizability}/5`}>
            <span className="text-neutral-500 block text-[9px]">Visual</span>
            <div className="flex items-center justify-center space-x-0.5 mt-0.5 text-cyan-400 font-bold">
              <Eye className="w-2.5 h-2.5" />
              <span>{topic.visualizability.toFixed(1)}</span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center" title={`Comment Potential: ${topic.comment_potential}/5`}>
            <span className="text-neutral-500 block text-[9px]">Comments</span>
            <div className="flex items-center justify-center space-x-0.5 mt-0.5 text-purple-400 font-bold">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>{topic.comment_potential.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Footer: Evidence Status & Actions */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2">
        {/* Source verification tag */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span className="flex items-center space-x-1 truncate max-w-[200px]" title={topic.status}>
            <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{topic.verified_count > 0 ? `${topic.verified_count} Verified Sources` : 'Academic DOI Linked'}</span>
          </span>
          {topic.contexts && (
            <span className="text-[10px] text-neutral-500 truncate max-w-[120px]" title={topic.contexts}>
              {topic.contexts.split(';')[0]}
            </span>
          )}
        </div>

        {/* Symmetrical 3-Column Action Toolbar */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* Copy Prompt */}
          <button
            onClick={handleCopyPrompt}
            className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white'
            }`}
            title="Copy 'Wise Wolf vs. Naive Sheep' Master Story & Research Prompt for ChatGPT / Gemini"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
            <span className="text-[11px] truncate font-mono">{isCopied ? 'Copied!' : 'Wolf vs Sheep'}</span>
          </button>

          {/* Save to Notes */}
          <button
            onClick={handleSaveToNotesClick}
            className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white'
            }`}
            title="Save this topic card directly to Notes & Prompts"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
            <span className="text-[11px] truncate">{isSaved ? 'Saved!' : 'Note'}</span>
          </button>

          {/* Deep Dive Modal */}
          <button
            onClick={() => onOpenDetail(topic)}
            className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 transition-all cursor-pointer"
            title="Deep dive into candidate hooks, story recipes, and research DOIs"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] truncate">Deep Dive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
