import React, { useState } from 'react';
import { DailyBatch, BatchItem, SelectionMode } from '../types';
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
  Check
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
  isLoading
}) => {
  const [briefModalState, setBriefModalState] = useState<{ isOpen: boolean; ideaId: string | null; videoIdea: string }>({
    isOpen: false,
    ideaId: null,
    videoIdea: ''
  });

  const [batchCopied, setBatchCopied] = useState(false);

  const usedInCurrentBatch = batch?.items?.filter(i => i.status === 'used' || i.idea.used).length || 0;

  const handleCopyAllBatch = async () => {
    if (!batch || !batch.items.length) return;
    const listText = batch.items.map((it, idx) => {
      const idea = it.idea;
      return `${idx + 1}. [${idea.idea_id}] ${idea.video_idea}
   • Hook: "${idea.curiosity_hook || 'Engaging deep dive hook'}"
   • Category: ${idea.subject} (${idea.topic_family})
   • Format: ${idea.signature_format || 'Standard'}
   • Score: ${idea.production_score} (${idea.priority_tier || 'Tier 1'})`;
    }).join('\n\n');

    const textToCopy = `🎬 KNOWSIGHTS TOPIC MIX (${batch.selection_mode} - ${batch.date})
Total Ideas: ${batch.items.length}
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
      />

      {/* Active Daily Batch View */}
      {batch ? (
        <div className="space-y-4">
          
          {/* Batch Status Header & Bulk Copy Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs font-mono text-neutral-400 bg-neutral-900/40 p-3 rounded-2xl border border-neutral-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center space-x-1.5 text-neutral-200 font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Date: {batch.date}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                {batch.selection_mode}
              </span>
              <span>{batch.items.length} Ideas</span>
              <span className="text-neutral-600">•</span>
              <div className="flex items-center space-x-1 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Used: <strong className="text-white">{usedInCurrentBatch} / {batch.items.length}</strong></span>
              </div>
            </div>

            {/* Bulk Copy Entire Batch Button */}
            <button
              onClick={handleCopyAllBatch}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
                batchCopied
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 hover:border-emerald-500/50'
              }`}
              title="Copy all ideas in this batch as a complete Prompt Pack"
            >
              {batchCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied All {batch.items.length} Ideas!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Ideas (Prompt Pack)</span>
                </>
              )}
            </button>
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
                onOpenBrief={(id, videoIdea) => setBriefModalState({ isOpen: true, ideaId: id, videoIdea })}
              />
            ))}
          </div>

          {/* Central Rule Callout Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-start space-x-3 text-xs text-neutral-400">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200 block mb-0.5">Continuous Inventory Rule (SHOWN != USED)</strong>
              <span>
                Ideas appearing in this mix have their exposure counter updated, but are <strong className="text-emerald-300">never consumed</strong> until you explicitly click <strong>✓ Mark Used</strong>. You can safely replace or regenerate without losing ideas.
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-12 text-center border border-neutral-800/80 my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Mix Active For Today</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mb-6">
            Choose your preferred selection strategy above and click <strong>Generate Fresh Mix</strong> to pull curated ideas from the Production Pool.
          </p>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            Generate Today's Mix Now
          </button>
        </div>
      )}

      {/* Brief Modal */}
      <BriefModal
        isOpen={briefModalState.isOpen}
        onClose={() => setBriefModalState({ isOpen: false, ideaId: null, videoIdea: '' })}
        ideaId={briefModalState.ideaId}
        videoIdea={briefModalState.videoIdea}
      />

    </div>
  );
};
