import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Brain, 
  Loader2, 
  Check, 
  Copy, 
  PlusCircle, 
  AlertCircle, 
  ArrowRight, 
  FileText,
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  PsychologyTopic, 
  PSYCHOLOGY_DIMENSIONS, 
  getDimensionConfig,
  getSectorConfig 
} from '../types/psychology';
import { generatePsychologyTopicsWithGeminiRotation } from '../services/gemini';
import { formatPsychologyScriptPrompt } from '../services/psychologyApi';

interface GeminiPsychologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopics: (newTopics: PsychologyTopic[]) => void;
  existingCount: number;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialDimension?: string;
}

export const GeminiPsychologyModal: React.FC<GeminiPsychologyModalProps> = ({
  isOpen,
  onClose,
  onAddTopics,
  existingCount,
  showToast,
  initialDimension
}) => {
  const [dimension, setDimension] = useState<string>(
    initialDimension && initialDimension !== 'all' ? initialDimension : PSYCHOLOGY_DIMENSIONS[0].name
  );
  const [count, setCount] = useState<number>(3);
  const [focusPrompt, setFocusPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTopics, setGeneratedTopics] = useState<PsychologyTopic[]>([]);
  const [modelUsed, setModelUsed] = useState<string | undefined>();
  const [keyIndexUsed, setKeyIndexUsed] = useState<number | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [committed, setCommitted] = useState<boolean>(false);

  useEffect(() => {
    if (initialDimension && initialDimension !== 'all') {
      const match = PSYCHOLOGY_DIMENSIONS.find(
        d => d.name.toLowerCase() === initialDimension.toLowerCase() || d.slug.toLowerCase() === initialDimension.toLowerCase()
      );
      if (match) setDimension(match.name);
    }
  }, [initialDimension]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedTopics([]);
    setCommitted(false);

    try {
      const startId = existingCount + 1;
      const res = await generatePsychologyTopicsWithGeminiRotation(
        dimension,
        count,
        focusPrompt.trim() ? focusPrompt.trim() : undefined,
        startId
      );

      if (res.success && res.topics.length > 0) {
        setGeneratedTopics(res.topics);
        setModelUsed(res.modelUsed);
        setKeyIndexUsed(res.keyUsedIndex);
        if (showToast) {
          showToast(`Synthesized ${res.topics.length} topics using ${res.modelUsed || 'Gemini'}`, 'success');
        }
      } else {
        setErrorMessage(res.error || 'Failed to synthesize topics with Gemini.');
        if (showToast) {
          showToast(res.error || 'Gemini synthesis failed', 'error');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during synthesis.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommitToPool = () => {
    if (generatedTopics.length === 0) return;
    onAddTopics(generatedTopics);
    setCommitted(true);
    if (showToast) {
      showToast(`Committed ${generatedTopics.length} new topics into your active pool!`, 'success');
    }
  };

  const handleCopyPrompt = async (topic: PsychologyTopic) => {
    const promptText = formatPsychologyScriptPrompt(topic);
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedId(topic.id);
      setTimeout(() => setCopiedId(null), 2000);
      if (showToast) {
        showToast(`Copied Dossier script prompt for ${topic.id}`, 'info');
      }
    } catch (err) {
      console.error('Failed to copy prompt', err);
    }
  };

  const handleExportJson = () => {
    if (generatedTopics.length === 0) return;
    const blob = new Blob([JSON.stringify(generatedTopics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_${dimension.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeDimConfig = getDimensionConfig(dimension);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0d121c] border border-white/[0.12] shadow-2xl shadow-emerald-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#111724]/90 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-4 h-4 text-neutral-950" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Gemini AI Topic Synthesizer Studio
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
              On-Demand Psychological Dimension Generator
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl font-sans">
              Autonomous multi-key Gemini synthesis for the "Wise Wolf vs. Naive Sheep" series. Expands your pool with verified mechanisms, systemic tensions, and 126-field intelligence dossiers.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Controls Box */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4 bg-white/[0.02]">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
                1. Select Critical Target Dimension
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PSYCHOLOGY_DIMENSIONS.map((dim) => {
                  const isSelected = dimension === dim.name;
                  return (
                    <button
                      key={dim.slug}
                      type="button"
                      onClick={() => setDimension(dim.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `${dim.badgeClass} ring-1 ring-white/30 font-bold scale-[1.01]`
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] text-neutral-300'
                      }`}
                    >
                      <span className="text-xs leading-tight mb-1 font-sans font-semibold">{dim.name}</span>
                      <span className="text-[10px] opacity-70 font-mono line-clamp-1">{dim.slug}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono italic mt-1">
                {activeDimConfig.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
                  2. Focus Directive / Subtopic Clue (Optional)
                </label>
                <input
                  type="text"
                  value={focusPrompt}
                  onChange={(e) => setFocusPrompt(e.target.value)}
                  placeholder="e.g. Focus on corporate SaaS auto-renewals, dark nudges, or medical anxiety"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-sans text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
                  3. Batch Size
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 3, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        count === n
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border-white/[0.08]'
                      }`}
                    >
                      {n} {n === 1 ? 'Topic' : 'Topics'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-rotates configured Gemini API keys (Flash models ranked)</span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 disabled:opacity-50 text-neutral-950 font-bold text-xs font-mono shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing ({dimension})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize {count} Topics</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start space-x-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong className="block font-bold">Generation Error:</strong>
                <p>{errorMessage}</p>
                <p className="mt-1 text-neutral-400">
                  Ensure at least one valid Gemini API Key is configured in App Config or Settings.
                </p>
              </div>
            </div>
          )}

          {/* Generated Results Stream */}
          {generatedTopics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ✓ Generated {generatedTopics.length} Topics
                  </span>
                  {modelUsed && (
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]">
                      Model: {modelUsed} (Key #{keyIndexUsed || 1})
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportJson}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={handleCommitToPool}
                    disabled={committed}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      committed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {committed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Active Pool</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Commit to Active Pool</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Topic Preview Cards */}
              <div className="space-y-4">
                {generatedTopics.map((topic) => {
                  const dimCfg = getDimensionConfig(topic.dimension);
                  const isThisCopied = copiedId === topic.id;

                  return (
                    <div 
                      key={topic.id}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-neutral-200 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.1]">
                            {topic.id}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${dimCfg.badgeClass}`}>
                            {topic.dimension}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/[0.06]">
                            {topic.sector}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyPrompt(topic)}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-mono transition-colors cursor-pointer"
                        >
                          {isThisCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied Dossier</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className="font-display font-bold text-lg text-white">
                        {topic.phenomenon}
                      </h3>

                      <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        {topic.definition}
                      </p>

                      {/* Mechanism & Awakening Truth */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold mb-0.5">
                            Underlying Mechanism
                          </span>
                          <p className="text-neutral-200 leading-snug">{topic.mechanism}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-emerald-400 block font-bold mb-0.5">
                            Awakening Realization
                          </span>
                          <p className="text-neutral-200 leading-snug">{topic.awakening_truth}</p>
                        </div>
                      </div>

                      {/* Beneficiaries & Cost */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 flex-wrap gap-2">
                        <span><strong>Who Profits:</strong> {topic.who_benefits}</span>
                        <span><strong>Who Pays:</strong> {topic.who_pays}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#111724]/90 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono text-neutral-400">
            {committed ? (
              <span className="text-emerald-400 font-bold">✓ Ready in session pool</span>
            ) : generatedTopics.length > 0 ? (
              <span>Click "Commit to Active Pool" to browse these alongside the database.</span>
            ) : (
              <span>Ready to synthesize topics.</span>
            )}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
