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
  onRefineSingle?: (item: BatchItem) => Promise<void>;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  item,
  onMarkUsed,
  onUndoUsed,
  onReplace,
  onOpenBrief,
  onSaveToNotes,
  onRefineSingle
}) => {
  const [isReplacing, setIsReplacing] = useState(false);
  const [isRefiningSingle, setIsRefiningSingle] = useState(false);
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

  const handleRefineSingleClick = async () => {
    if (!onRefineSingle || isUsed || isReplaced || isRefiningSingle) return;
    setIsRefiningSingle(true);
    try {
      await onRefineSingle(item);
    } finally {
      setIsRefiningSingle(false);
    }
  };

  return (
    <div 
      className={`glass-panel glass-panel-hover rounded-2xl p-5 relative flex flex-col justify-between transition-all duration-200 border overflow-hidden ${
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
          {idea.ai_refined && (
            <span 
              className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/25 flex items-center space-x-1"
              title="Refined into a high-retention YouTube concept by Gemini"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>AI Angle</span>
            </span>
          )}
        </div>

        {/* Action / Score Pill */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {onRefineSingle && !isUsed && !isReplaced && (
            <button
              onClick={handleRefineSingleClick}
              disabled={isRefiningSingle}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-all cursor-pointer disabled:opacity-50"
              title="Refine this individual topic into a YouTube angle with Gemini"
            >
              <Sparkles className={`w-3 h-3 text-amber-400 ${isRefiningSingle ? 'animate-spin' : ''}`} />
              <span>{isRefiningSingle ? 'Refining...' : (idea.ai_refined ? '✨ Gemini Re-roll' : '✨ Gemini Refine')}</span>
            </button>
          )}

          <span className="flex items-center space-x-1 text-amber-400 font-mono text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{idea.production_score}</span>
          </span>
        </div>
      </div>

      {/* 2. Main Title & YouTube Storytelling Angle */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {idea.signature_format ? idea.signature_format.split('—')[0].trim() : 'YouTube Angle'}
          </span>
          <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px]" title={idea.signature_format}>
            {idea.signature_format ? (idea.signature_format.includes('—') ? idea.signature_format.split('—')[1].trim() : idea.signature_format) : ''}
          </span>
        </div>

        {idea.content_angle && (
          <div className="text-[11px] font-mono text-amber-300/90 flex items-center space-x-1 pt-0.5">
            <span className="text-amber-500 font-bold">Angle:</span>
            <span className="truncate italic font-medium">{idea.content_angle}</span>
          </div>
        )}

        <h3 className="font-display font-bold text-base sm:text-lg leading-snug text-white tracking-tight line-clamp-3">
          {idea.video_idea}
        </h3>
      </div>

      {/* 3. Subtopic Seed (Curriculum Foundation) */}
      {idea.subtopic_seed && idea.subtopic_seed !== idea.video_idea && (
        <div className="mb-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-neutral-400 font-sans">
          <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 block font-semibold mb-0.5">
            Seed Concept:
          </span>
          <p className="line-clamp-2 italic text-neutral-300">
            "{idea.subtopic_seed}"
          </p>
        </div>
      )}

      {/* 4. Curiosity Hook */}
      <div className="mb-4">
        {idea.curiosity_hook ? (
          <div className="editorial-hook p-3 rounded-xl text-xs font-sans italic leading-relaxed">
            "{idea.curiosity_hook}"
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-neutral-400 italic">
            Standard format angle ready for script formulation.
          </div>
        )}
      </div>

      {/* 5. Subject & Topic Family Lineage Badges */}
      <div className="mb-4 flex flex-wrap gap-1.5 items-center">
        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px] font-medium">
          {idea.subject}
        </span>
        <span className="text-neutral-600 text-[10px] font-mono">/</span>
        <span className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-neutral-300 font-mono text-[10px] truncate max-w-[200px]" title={idea.topic_family}>
          {idea.topic_family}
        </span>
      </div>

      {/* 6. Footer: Metadata & Action Toolbar */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
        
        {/* Row 1: Exposure & Priority Tier */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400">
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

        {/* Row 2: Secondary Tool Actions (4 Symmetrical Columns) */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {/* Copy Prompt */}
          <button
            onClick={handleCopyPrompt}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white'
            }`}
            title="Copy pure AI Research Prompt to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
            <span className="text-[11px] truncate">{isCopied ? 'Copied!' : 'Prompt'}</span>
          </button>

          {/* Brief */}
          <button
            onClick={() => onOpenBrief(idea)}
            className="flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-all cursor-pointer"
            title="Open Research Brief"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px] truncate">Brief</span>
          </button>

          {/* Save to Notes Vault */}
          <button
            onClick={handleSaveToNotesClick}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-glow-emerald'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300 hover:text-white'
            }`}
            title="Save this topic concept & research prompt directly to Personal Notes Vault"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            <span className="text-[11px] truncate">{isSaved ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Swap */}
          <button
            onClick={handleReplaceClick}
            disabled={isUsed || isReplaced || isReplacing}
            className="flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
            title="Replace idea in this slot"
          >
            <RotateCw className={`w-3.5 h-3.5 shrink-0 ${isReplacing ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} />
            <span className="text-[11px] truncate">Swap</span>
          </button>
        </div>

        {/* Row 3: Primary Lifecycle Action (Full Width, Never Clips or Overflows) */}
        <button
          onClick={handleMarkToggle}
          disabled={isMarking}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isUsed
              ? 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-emerald-500/30 ring-1 ring-emerald-300'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-[0.99]'
          }`}
          title={isUsed ? "Undo Used (makes idea eligible again in future mixes)" : "Mark as Used (consumes idea and excludes from future batches)"}
        >
          {isUsed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>Consumed (Click to Undo)</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Mark as Used</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
