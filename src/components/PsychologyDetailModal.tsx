import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Target, 
  Eye, 
  MessageSquare, 
  ShieldAlert, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Layers,
  Compass,
  Film,
  Video
} from 'lucide-react';
import { PsychologyTopic, getSectorConfig, getDimensionConfig } from '../types/psychology';
import { formatPsychologyScriptPrompt, formatPsychologyNarrativeStoryPrompt } from '../services/psychologyApi';

interface PsychologyDetailModalProps {
  topic: PsychologyTopic | null;
  isOpen: boolean;
  onClose: () => void;
  isStudied: boolean;
  isBookmarked: boolean;
  onToggleStudied: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onSaveToNotes?: (topic: PsychologyTopic) => void;
}

export const PsychologyDetailModal: React.FC<PsychologyDetailModalProps> = ({
  topic,
  isOpen,
  onClose,
  isStudied,
  isBookmarked,
  onToggleStudied,
  onToggleBookmark,
  onSaveToNotes
}) => {
  const [activeTab, setActiveTab] = useState<'hooks' | 'tensions' | 'evidence' | 'prompt' | 'story'>('hooks');
  const [isCopied, setIsCopied] = useState(false);
  const [isStoryCopied, setIsStoryCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !topic) return null;

  const sectorConfig = getSectorConfig(topic.sector);
  const dimensionConfig = topic.dimension ? getDimensionConfig(topic.dimension) : null;

  const handleCopyPrompt = async () => {
    const text = formatPsychologyScriptPrompt(topic);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyStoryPrompt = async () => {
    const text = formatPsychologyNarrativeStoryPrompt(topic);
    try {
      await navigator.clipboard.writeText(text);
      setIsStoryCopied(true);
      setTimeout(() => setIsStoryCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy story prompt', err);
    }
  };

  const handleSaveNote = () => {
    if (onSaveToNotes) {
      onSaveToNotes(topic);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0e131d] border border-white/[0.12] shadow-2xl shadow-emerald-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#121824]/90 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-xs font-bold text-neutral-300 bg-white/[0.06] border border-white/[0.12] px-2.5 py-0.5 rounded-lg">
                {topic.id}
              </span>
              {dimensionConfig && (
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${dimensionConfig.badgeClass}`}>
                  {dimensionConfig.name}
                </span>
              )}
              <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${sectorConfig.badgeClass}`}>
                {topic.sector}
              </span>
              {topic.type && (
                <span className="text-xs font-mono text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-lg">
                  {topic.type} {topic.subtype ? `• ${topic.subtype}` : ''}
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {topic.phenomenon}
            </h2>
            <p className="text-sm text-neutral-300 max-w-2xl font-sans leading-relaxed">
              {topic.definition}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(topic.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this topic'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Mark studied */}
            <button
              onClick={() => onToggleStudied(topic.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isStudied 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
              title={isStudied ? 'Mark as Unstudied' : 'Mark as Studied / Used'}
            >
              {isStudied ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Metric Pills */}
        <div className="px-6 py-3 bg-[#0a0d14] border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1 text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Shock: <strong>{topic.shock.toFixed(1)}/5</strong></span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              <span>Relatability: <strong>{topic.relatability.toFixed(1)}/5</strong></span>
            </span>
            <span className="flex items-center space-x-1 text-cyan-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Visual: <strong>{topic.visualizability.toFixed(1)}/5</strong></span>
            </span>
            <span className="flex items-center space-x-1 text-purple-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments: <strong>{topic.comment_potential.toFixed(1)}/5</strong></span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveNote}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300 hover:text-white'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <FileText className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{isSaved ? 'Saved to Notes' : 'Save Note'}</span>
            </button>

            <button
              onClick={handleCopyPrompt}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300 hover:text-emerald-100'
              }`}
              title="Copy 'Wise Wolf vs. Naive Sheep' Socratic Dialogue Intelligence Dossier"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isCopied ? 'Copied Dossier!' : 'Copy Wolf vs Sheep'}</span>
            </button>

            <button
              onClick={handleCopyStoryPrompt}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isStoryCopied
                  ? 'bg-purple-500/25 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300 hover:text-purple-100'
              }`}
              title="Copy 15–20 Min YouTube Story Narration & Deep Research Script Prompt for ChatGPT"
            >
              {isStoryCopied ? <Check className="w-3.5 h-3.5 text-purple-300" /> : <Video className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isStoryCopied ? 'Copied Story!' : 'Copy 15-20m Story'}</span>
            </button>
          </div>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-white/[0.08] bg-[#0c1017] px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('hooks')}
            className={`py-3 px-4 text-xs font-semibold font-mono border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'hooks'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Candidate Hooks & Stories ({topic.candidate_hooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tensions')}
            className={`py-3 px-4 text-xs font-semibold font-mono border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'tensions'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>The Hidden Layer & Tensions</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 text-xs font-semibold font-mono border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research & DOIs ({topic.sources.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-4 text-xs font-semibold font-mono border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Wise Wolf Intelligence Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`py-3 px-4 text-xs font-semibold font-mono border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'story'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>15–20m YouTube Story Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          
          {/* TAB 1: HOOKS & STORY STRUCTURES */}
          {activeTab === 'hooks' && (
            <div className="space-y-6">
              {/* Primary Awakening Truth */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                  Primary Awakening Seed
                </span>
                <p className="text-emerald-100 text-sm italic font-medium leading-relaxed">
                  "{topic.awakening_truth || topic.prompt}"
                </p>
              </div>

              {/* Candidate Opening Hooks */}
              {topic.candidate_hooks && topic.candidate_hooks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Alternative Opening Hook Patterns ({topic.candidate_hooks.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {topic.candidate_hooks.map((hk, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-300 flex items-start space-x-2">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">#{i + 1}</span>
                        <span className="italic leading-relaxed">"{hk}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Angle Recipes & Story Seeds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.story && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="font-mono text-xs text-amber-400 font-semibold block">
                      Seed Story Setup
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {topic.story}
                    </p>
                  </div>
                )}

                {topic.question && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="font-mono text-xs text-cyan-400 font-semibold block">
                      Provocative Core Question
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {topic.question}
                    </p>
                  </div>
                )}
              </div>

              {/* Candidate Ending Templates & Actionable CTAs */}
              {topic.candidate_endings && topic.candidate_endings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Candidate Ending & Reframe Templates
                  </h4>
                  <div className="space-y-2">
                    {topic.candidate_endings.map((end, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-300 flex items-start space-x-2">
                        <span className="font-mono text-cyan-400 font-bold shrink-0">End #{i + 1}</span>
                        <span className="leading-relaxed">"{end}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THE HIDDEN LAYER & TENSIONS */}
          {activeTab === 'tensions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
                  <span className="font-mono text-xs font-semibold text-emerald-400 block">
                    💰 Who Benefits / Gains
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {topic.who_benefits || 'Not explicitly designated; distributed systemic beneficiary.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-1.5">
                  <span className="font-mono text-xs font-semibold text-rose-400 block">
                    ⚖️ Who Pays / Bears Cost
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {topic.who_pays || 'The individual decision-maker or vulnerable participant.'}
                  </p>
                </div>
              </div>

              {topic.hidden_assumption && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="font-mono text-xs font-semibold text-amber-400 block">
                    👁️ The Hidden Assumption
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    "{topic.hidden_assumption}"
                  </p>
                </div>
              )}

              {topic.uncomfortable_q && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="font-mono text-xs font-semibold text-purple-400 block">
                    ⚡ The Uncomfortable Question
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "{topic.uncomfortable_q}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.myth && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="font-mono text-xs text-red-400 font-semibold block">
                      Common Pop-Psychology Myth
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {topic.myth}
                    </p>
                  </div>
                )}
                {topic.reality_check && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="font-mono text-xs text-emerald-400 font-semibold block">
                      Empirical Reality-Check
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {topic.reality_check}
                    </p>
                  </div>
                )}
              </div>

              {topic.candidate_ethics && topic.candidate_ethics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Ethical Tensions & Trade-offs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topic.candidate_ethics.map((eth, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300">
                        {eth}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHOLARLY SOURCES & DOIS */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    Verification Status
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    {topic.status || 'Verified scholarly source'}
                  </span>
                </div>
                {topic.evidence && (
                  <p className="text-xs text-neutral-300">
                    Strength: <span className="font-semibold text-white">{topic.evidence}</span>
                  </p>
                )}
                {topic.verification && (
                  <p className="text-xs text-neutral-400 italic">
                    "{topic.verification}"
                  </p>
                )}
              </div>

              {/* Direct DOI Links */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Linked Academic Sources & DOIs
                </h4>
                {topic.sources && topic.sources.length > 0 ? (
                  <div className="space-y-2">
                    {topic.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/30 text-xs text-emerald-300 hover:text-emerald-200 transition-colors group cursor-pointer"
                      >
                        <span className="truncate font-mono mr-2">{src}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-emerald-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-neutral-400 italic">
                    Standard scholarly verification pending for this specific seed.
                  </div>
                )}
              </div>

              {/* Safe Claim Guardrails */}
              {topic.safe_claim_note && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25 space-y-1">
                  <span className="font-mono text-xs text-amber-400 font-semibold block flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Evidence-Aware Guardrails</span>
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {topic.safe_claim_note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISE WOLF vs NAIVE SHEEP MASTER DOSSIER */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-xs text-neutral-400 max-w-xl">
                  Feed directly into ChatGPT, Gemini, or Claude to generate a full comprehensive research & story dossier (plain-English for the general public, flexible 60s reel to 5+ min deep-dive, Socratic dialogues, and narrative blueprints):
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 cursor-pointer transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied Full Dossier!' : 'Copy Master Intelligence Dossier'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-xs font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px]">
                {formatPsychologyScriptPrompt(topic)}
              </pre>
            </div>
          )}

          {/* TAB 5: 15–20 MINUTE YOUTUBE STORY SCRIPT */}
          {activeTab === 'story' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-xs text-neutral-400 max-w-xl">
                  Feed directly into ChatGPT, Claude, or Gemini to conduct deep investigation, uncover hidden truths & manipulation playbooks (like the supermarket checkout candy effect), and generate a complete 15–20 min YouTube narration script:
                </span>
                <button
                  onClick={handleCopyStoryPrompt}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 cursor-pointer transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                >
                  {isStoryCopied ? <Check className="w-3.5 h-3.5 text-purple-300" /> : <Video className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{isStoryCopied ? 'Copied Story Prompt!' : 'Copy 15-20m Story Prompt'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-xs font-mono text-purple-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px]">
                {formatPsychologyNarrativeStoryPrompt(topic)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0d1118] flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Contexts: <strong className="text-neutral-200">{topic.contexts || 'Everyday life'}</strong></span>
          <span>Target Audience: <strong className="text-neutral-200">{topic.audience}</strong></span>
        </div>
      </div>
    </div>
  );
};
