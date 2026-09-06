import React, { useState } from 'react';
import { DailyBatch, BatchItem, SelectionMode, ProductionIdea } from '../types';
import { BatchControls } from '../components/BatchControls';
import { TopicCard } from '../components/TopicCard';
import { BriefModal } from '../components/BriefModal';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  HelpCircle,
  RotateCw,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

interface DailyMixPageProps {
  batch: DailyBatch | null;
  mode: SelectionMode;
  setMode: (mode: SelectionMode) => void;
  size: number;
  setSize: (size: number) => void;
  subjectFilter: string;
  setSubjectFilter: (subj: string) => void;
  subjectsList: string[];
  onGenerate: () => Promise<void>;
  onMarkUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onUndoUsed: (ideaId: string, batchItemId: string) => Promise<void>;
  onReplace: (batchId: string, batchItemId: string, position: number) => Promise<void>;
  isLoading: boolean;
  onRefineBatch?: () => Promise<void>;
  isRefiningBatch?: boolean;
  aiRefineEnabled?: boolean;
  onToggleAiRefine?: (enabled: boolean) => void;
  geminiKeysCount?: number;
  preferredModel?: string;
}

export const DailyMixPage: React.FC<DailyMixPageProps> = ({
  batch,
  mode,
  setMode,
  size,
  setSize,
  subjectFilter,
  setSubjectFilter,
  subjectsList,
  onGenerate,
  onMarkUsed,
  onUndoUsed,
  onReplace,
  isLoading,
  onRefineBatch,
  isRefiningBatch = false,
  aiRefineEnabled = true,
  onToggleAiRefine,
  geminiKeysCount = 0,
  preferredModel
}) => {
  const [briefModalState, setBriefModalState] = useState<{ isOpen: boolean; idea: ProductionIdea | null }>({
    isOpen: false,
    idea: null
  });

  const [batchCopied, setBatchCopied] = useState(false);

  const usedInCurrentBatch = batch?.items?.filter(i => i.status === 'used' || i.idea.used).length || 0;
  const aiRefinedCount = batch?.items?.filter(i => i.ai_refined || i.idea.ai_refined).length || 0;

  const handleCopyAllBatch = async () => {
    if (!batch || !batch.items.length) return;
    const listText = batch.items.map((it, idx) => {
      const idea = it.idea;
      const aiTag = idea.ai_refined ? ' [✨ AI YouTube Angle]' : '';
      return `${idx + 1}. [${idea.idea_id}]${aiTag} ${idea.video_idea}
   • Hook: "${idea.curiosity_hook || 'Engaging deep dive hook'}"
   • Category: ${idea.subject} (${idea.topic_family})
   • Format: ${idea.signature_format || 'Standard'}
   • Score: ${idea.production_score} (${idea.priority_tier || 'Tier 1'})${idea.visualization_direction ? `\n   • Visual Direction: ${idea.visualization_direction}` : ''}`;
    }).join('\n\n');

    const textToCopy = `🎬 KNOWSIGHTS TOPIC MIX (${batch.selection_mode} - ${batch.date})
Total Ideas: ${batch.items.length}${aiRefinedCount > 0 ? ` (${aiRefinedCount} AI Refined YouTube Angles)` : ''}
======================================================
${listText}

======================================================
💡 PROMPT FOR AI SCRIPTING & VIDEO GENERATION:
"Here are today's ${batch.items.length} curated KnowSights YouTube video concepts. For each idea:
1. Generate 3 click-worthy, curiosity-driven YouTube Title variations.
2. Outline a visual thumbnail concept (main subject, background, 3-word text overlay).
3. Draft a 30-second opening script hook that creates an instant pattern interrupt."`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setBatchCopied(true);
      setTimeout(() => setBatchCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Generator Controls */}
      <BatchControls
        mode={mode}
        setMode={setMode}
        size={size}
        setSize={setSize}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        subjectsList={subjectsList}
        onGenerate={onGenerate}
        isLoading={isLoading}
        aiRefineEnabled={aiRefineEnabled}
        onToggleAiRefine={onToggleAiRefine}
        geminiKeysCount={geminiKeysCount}
        preferredModel={preferredModel}
      />

      {/* Active Daily Batch View */}
      {batch ? (
        <div className="space-y-5">
          
          {/* Batch Status Header & Bulk Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs font-mono text-neutral-300 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] shadow-tactile">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center space-x-1.5 text-white font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Date: {batch.date}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                {batch.selection_mode}
              </span>
              <span className="text-neutral-300">{batch.items.length} Ideas</span>
              <span className="text-neutral-600">•</span>
              <div className="flex items-center space-x-1.5 text-neutral-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Used: <strong className="text-white">{usedInCurrentBatch} / {batch.items.length}</strong></span>
              </div>
              {aiRefinedCount > 0 && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold">
                    <Sparkles className="w-3 h-3 text-violet-400 fill-violet-400" />
                    <span>YouTube Angles: {aiRefinedCount}/{batch.items.length}</span>
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons: Bulk Copy & Refine with Gemini */}
            <div className="flex flex-wrap items-center gap-2">
              {onRefineBatch && (
                <button
                  onClick={onRefineBatch}
                  disabled={isRefiningBatch || (geminiKeysCount || 0) === 0}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer ${
                    (geminiKeysCount || 0) > 0
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-950/50'
                      : 'bg-white/[0.04] text-neutral-500 cursor-not-allowed border border-white/[0.06]'
                  }`}
                  title={
                    (geminiKeysCount || 0) > 0
                      ? "Refine all topics in this batch into high-retention YouTube video concepts with unique curiosity angles using Gemini"
                      : "Configure a Gemini API Key in Settings to enable YouTube angle refinement"
                  }
                >
                  {isRefiningBatch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Refining with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Refine Batch (Gemini)</span>
                    </>
                  )}
                </button>
              )}

              {/* Bulk Copy Entire Batch Button */}
              <button
                onClick={handleCopyAllBatch}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer ${
                  batchCopied
                    ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50'
                }`}
                title="Copy all ideas in this batch as a complete Prompt Pack"
              >
                {batchCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Copied All {batch.items.length} Ideas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All (Prompt Pack)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid of Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batch.items.map((item) => (
              <TopicCard
                key={item.batch_item_id}
                item={item}
                onMarkUsed={onMarkUsed}
                onUndoUsed={onUndoUsed}
                onReplace={onReplace}
                onOpenBrief={(idea) => setBriefModalState({ isOpen: true, idea })}
              />
            ))}
          </div>

          {/* Central Rule Callout Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] flex items-start space-x-3 text-xs text-neutral-300">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5 font-semibold">Continuous Inventory Rule (SHOWN != USED)</strong>
              <span>
                Ideas appearing in this mix have their exposure counter updated, but are <strong className="text-emerald-300">never consumed</strong> until you explicitly click <strong>✓ Mark Used</strong>. You can safely replace or regenerate without losing ideas.
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-14 text-center border border-white/[0.08] my-8 shadow-tactile">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/40">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">No Mix Active For Today</h3>
          <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed font-normal">
            Choose your preferred selection strategy above and click <strong>Generate Fresh Mix</strong> to pull curated ideas from the Production Pool.
          </p>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            Generate Today's Mix Now
          </button>
        </div>
      )}

      {/* Brief Modal */}
      <BriefModal
        isOpen={briefModalState.isOpen}
        onClose={() => setBriefModalState({ isOpen: false, idea: null })}
        idea={briefModalState.idea}
      />

    </div>
  );
};
