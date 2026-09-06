import React, { useState } from 'react';
import { 
  Check, 
  RotateCw, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  BookOpen, 
  Star,
  Copy,
  FileText
} from 'lucide-react';
import { BatchItem, ProductionIdea } from '../types';
import { formatTopicCardCopyText } from '../utils/researchPrompt';

interface TopicCardProps {
  item: BatchItem;
  onMarkUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onUndoUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onReplace: (batchId: string, batchItemId: string, position: number) => Promise<void>;
  onOpenBrief: (idea: ProductionIdea) => void;
  onSaveToNotes?: (idea: ProductionIdea) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  item,
  onMarkUsed,
  onUndoUsed,
  onReplace,
  onOpenBrief,
  onSaveToNotes
}) => {
  const [isReplacing, setIsReplacing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const idea = item.idea;
  const isUsed = item.status === 'used' || idea.used;
  const isReplaced = item.status === 'replaced';

  const handleSaveToNotesClick = () => {
    if (onSaveToNotes) {
      onSaveToNotes(idea);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleCopyPrompt = async () => {
    const textToCopy = formatTopicCardCopyText(idea);

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleMarkToggle = async () => {
    setIsMarking(true);
    try {
      if (isUsed) {
        await onUndoUsed(idea.idea_id, item.batch_item_id);
      } else {
        await onMarkUsed(idea.idea_id, item.batch_item_id);
      }
    } finally {
      setIsMarking(false);
    }
  };

  const handleReplaceClick = async () => {
    if (isUsed || isReplaced || isReplacing) return;
    setIsReplacing(true);
    try {
      await onReplace(item.batch_id, item.batch_item_id, item.position);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div 
      className={`glass-panel glass-panel-hover rounded-2xl p-5 relative flex flex-col justify-between transition-all duration-200 border ${
        isUsed 
          ? 'border-emerald-500/40 bg-emerald-950/20 shadow-glow-emerald' 
          : isReplaced 
            ? 'opacity-40 grayscale border-white/[0.05]' 
            : 'border-white/[0.08] hover:border-emerald-500/30 bg-[#0d1118]/70 hover:bg-[#111722]/80 shadow-tactile'
      }`}
    >
      {/* 1. Header: Position Pill, Idea ID & Signature Format */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.1] flex items-center justify-center font-mono text-xs font-bold text-neutral-200">
            #{item.position}
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
            {idea.idea_id}
          </span>
          {idea.parent_sr && (
            <span 
              className="text-[10px] font-mono text-neutral-300 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.08]"
              title={`Taxonomy Lineage: Master Taxonomy Sr. #${idea.parent_sr}`}
            >
              Seed #{idea.parent_sr}
            </span>
          )}
          {idea.production_score > 0 && (
            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/25">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{idea.production_score}</span>
            </span>
          )}
          {idea.ai_refined && (
            <span 
              className="inline-flex items-center space-x-1 text-[10px] font-mono text-violet-300 font-bold bg-violet-500/15 px-2 py-0.5 rounded-md border border-violet-500/30"
              title="Refined by Gemini AI for high-retention YouTube video framing"
            >
              <Sparkles className="w-2.5 h-2.5 text-violet-400 fill-violet-400" />
              <span>YouTube Angle</span>
            </span>
          )}
        </div>

        {idea.signature_format && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[11px] font-medium shrink-0 max-w-[170px] truncate">
            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">{idea.signature_format}</span>
          </span>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-start">
        {/* Prominent Video Idea Headline */}
        <div>
          <h3 className="text-base font-display font-bold text-white leading-snug tracking-tight">
            {idea.video_idea}
          </h3>
          {idea.original_video_idea && idea.original_video_idea !== idea.video_idea && (
            <p className="text-[11px] text-neutral-400 mt-1 font-mono flex items-center space-x-1 truncate" title={`Original Curriculum Subtopic: ${idea.original_video_idea}`}>
              <span className="text-neutral-500">Seed:</span>
              <span className="truncate italic text-neutral-300">"{idea.original_video_idea}"</span>
            </p>
          )}
        </div>

        {/* Curiosity Hook with High-Contrast Editorial Styling */}
        <div className="p-3.5 rounded-xl editorial-hook border-t border-r border-b border-white/[0.06] text-xs text-neutral-200 italic leading-relaxed">
          "{idea.curiosity_hook || `Core underlying mechanisms, surprising facts, and real-world dynamics of ${idea.video_idea}.`}"
        </div>

        {/* Subject & Topic Family Taxonomy Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
            {idea.subject}
          </span>
          <span className="text-neutral-600 text-xs">/</span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-neutral-300 font-medium text-[11px]">
            {idea.topic_family}
          </span>
          {idea.freshness_class && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.03] text-neutral-400 text-[10px] font-mono border border-white/[0.06]">
              {idea.freshness_class}
            </span>
          )}
        </div>
      </div>

      {/* 3. Metadata & Actions Footer (2-Row Balanced Layout) */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.08] space-y-2.5">
        
        {/* Row 1: Exposure Stats & Tier */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="whitespace-nowrap">Exposure: <strong className="text-white">{idea.times_shown}x</strong></span>
            {idea.last_shown && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-300">{new Date(idea.last_shown).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            {idea.priority_tier || 'Tier 1'}
          </span>
        </div>

        {/* Row 2: Action Buttons Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          
          {/* Secondary Actions Group (Copy Prompt, Brief, Swap) */}
          <div className="flex items-center space-x-1.5">
            
            {/* Copy Research Prompt Button */}
            <button
              onClick={handleCopyPrompt}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white'
              }`}
              title="Copy pure AI Research Prompt to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-[11px]">Copy Prompt</span>
                </>
              )}
            </button>

            {/* Brief Button */}
            <button
              onClick={() => onOpenBrief(idea)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-all cursor-pointer"
              title="Open Research Brief"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px]">Brief</span>
            </button>

            {/* Save to Notes Vault Button */}
            {onSaveToNotes && (
              <button
                onClick={handleSaveToNotesClick}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-glow-emerald'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300 hover:text-white'
                }`}
                title="Save this topic concept & research prompt directly to Personal Notes Vault"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold">Saved!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">Save</span>
                  </>
                )}
              </button>
            )}

            {/* Swap / Replace Button */}
            {!isUsed && !isReplaced && (
              <button
                onClick={handleReplaceClick}
                disabled={isReplacing}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                title="Replace idea in this slot"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} />
                <span className="text-[11px]">Swap</span>
              </button>
            )}
          </div>

          {/* Primary Action Button: Mark Used / Undo */}
          <button
            onClick={handleMarkToggle}
            disabled={isMarking}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 shadow-md transition-all cursor-pointer ${
              isUsed
                ? 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-95'
            }`}
            title={isUsed ? "Undo Used (makes idea eligible again)" : "Mark as Used (excludes from future batches)"}
          >
            {isUsed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Used</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Mark Used</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
