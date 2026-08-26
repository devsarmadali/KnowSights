import React, { useState } from 'react';
import { 
  Check, 
  RotateCw, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  BookOpen, 
  Star,
  Copy
} from 'lucide-react';
import { BatchItem } from '../types';

interface TopicCardProps {
  item: BatchItem;
  onMarkUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onUndoUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onReplace: (batchId: string, batchItemId: string, position: number) => Promise<void>;
  onOpenBrief: (ideaId: string, videoIdea: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  item,
  onMarkUsed,
  onUndoUsed,
  onReplace,
  onOpenBrief
}) => {
  const [isReplacing, setIsReplacing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const idea = item.idea;
  const isUsed = item.status === 'used' || idea.used;
  const isReplaced = item.status === 'replaced';

  const handleCopyPrompt = async () => {
    const visLine = idea.visualization_direction ? `\n🎨 Visual Direction: ${idea.visualization_direction}` : '';
    const srcLine = idea.source_family_guidance ? `\n📚 Source Guidance: ${idea.source_family_guidance}` : '';
    const seedLine = idea.parent_sr ? `\n🌱 Taxonomy Seed: Master Taxonomy Sr. #${idea.parent_sr}` : '';
    const textToCopy = `🎬 VIDEO CONCEPT: ${idea.video_idea}
📌 Curiosity Hook: "${idea.curiosity_hook || `Core mechanisms and real-world dynamics of ${idea.video_idea}.`}"
🏷️ Category: ${idea.subject} / ${idea.topic_family}
✨ Format Style: ${idea.signature_format || 'Standard Explainer'}
⭐ Production Score: ${idea.production_score} (${idea.priority_tier || 'Tier 2'})
🆔 Idea ID: ${idea.idea_id}${seedLine}${visLine}${srcLine}

---
💡 Prompt for Scriptwriting & Video Generation:
"Create a comprehensive, high-retention YouTube video script on the topic: '${idea.video_idea}'.
Use this curiosity hook: '${idea.curiosity_hook || idea.video_idea}'.
Structure the script using the '${idea.signature_format || 'Explainer'}' format.${idea.visualization_direction ? ` Incorporate visual directions: ${idea.visualization_direction}.` : ''} Include an opening pattern interrupt, engaging evidence-backed body points, clear visual cues for animation/b-roll, and a satisfying conclusion."`;

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
          ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' 
          : isReplaced 
            ? 'opacity-50 grayscale border-neutral-800' 
            : 'border-neutral-800/90 hover:border-neutral-700 bg-neutral-900/50'
      }`}
    >
      {/* 1. Header: Position Pill, Idea ID & Signature Format */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-700 flex items-center justify-center font-mono text-xs font-bold text-neutral-300">
            #{item.position}
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400/90 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {idea.idea_id}
          </span>
          {idea.parent_sr && (
            <span 
              className="text-[10px] font-mono text-neutral-400 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-neutral-800"
              title={`Taxonomy Lineage: Master Taxonomy Sr. #${idea.parent_sr}`}
            >
              Seed #{idea.parent_sr}
            </span>
          )}
          {idea.production_score > 0 && (
            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{idea.production_score}</span>
            </span>
          )}
        </div>

        {idea.signature_format && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-medium shrink-0 max-w-[170px] truncate">
            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">{idea.signature_format}</span>
          </span>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="space-y-3 flex-1 flex flex-col justify-start">
        {/* Prominent Video Idea Headline */}
        <h3 className="text-base font-display font-bold text-white leading-snug tracking-tight">
          {idea.video_idea}
        </h3>

        {/* Curiosity Hook */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 italic leading-relaxed">
          "{idea.curiosity_hook || `Core underlying mechanisms, surprising facts, and real-world dynamics of ${idea.video_idea}.`}"
        </div>

        {/* Subject & Topic Family Taxonomy Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-medium text-[11px]">
            {idea.subject}
          </span>
          <span className="text-neutral-600 text-xs">/</span>
          <span className="px-2 py-0.5 rounded-md bg-neutral-800/90 text-neutral-300 font-normal text-[11px]">
            {idea.topic_family}
          </span>
          {idea.freshness_class && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[10px] font-mono border border-neutral-800/60">
              {idea.freshness_class}
            </span>
          )}
        </div>
      </div>

      {/* 3. Metadata & Actions Footer (2-Row Balanced Layout) */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2.5">
        
        {/* Row 1: Exposure Stats & Tier */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="whitespace-nowrap">Exposure: <strong className="text-neutral-200">{idea.times_shown}x</strong></span>
            {idea.last_shown && (
              <>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-400">{new Date(idea.last_shown).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            {idea.priority_tier || 'Tier 1'}
          </span>
        </div>

        {/* Row 2: Action Buttons Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          
          {/* Secondary Actions Group (Copy, Brief, Swap) */}
          <div className="flex items-center space-x-1.5">
            
            {/* Copy Button */}
            <button
              onClick={handleCopyPrompt}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Copy Video Concept & Prompt"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {/* Brief Button */}
            <button
              onClick={() => onOpenBrief(idea.idea_id, idea.video_idea)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sky-400 hover:text-sky-300 transition-all cursor-pointer"
              title="Open Research Brief"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px]">Brief</span>
            </button>

            {/* Swap / Replace Button */}
            {!isUsed && !isReplaced && (
              <button
                onClick={handleReplaceClick}
                disabled={isReplacing}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                title="Replace idea in this slot"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin text-emerald-400' : ''}`} />
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
                ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 active:scale-95'
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
