import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  X, 
  BookOpen, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { IdeaBrief, ProductionIdea } from '../types';
import { api } from '../services/api';
import { formatBriefModalCopyText } from '../utils/researchPrompt';

interface BriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: ProductionIdea | null;
  ideaId?: string | null;
  videoIdea?: string;
}

export const BriefModal: React.FC<BriefModalProps> = ({
  isOpen,
  onClose,
  idea,
  ideaId,
  videoIdea
}) => {
  const [brief, setBrief] = useState<IdeaBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive active values prioritizing the current active idea displayed on the card
  const activeIdeaId = idea?.idea_id || ideaId || '';
  const activeTitle = idea?.video_idea || videoIdea || brief?.title || '';
  const activeHook = idea?.curiosity_hook || '';
  const activeFormat = idea?.signature_format || '';
  const activeSubject = idea?.subject || '';
  const activeTopicFamily = idea?.topic_family || '';
  const activeSeed = (idea?.original_video_idea && idea.original_video_idea !== idea.video_idea) 
    ? idea.original_video_idea 
    : undefined;

  useEffect(() => {
    if (!isOpen || !activeIdeaId) {
      setBrief(null);
      setError(null);
      return;
    }

    const fetchBrief = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getBrief(activeIdeaId);
        if (res && res.success && res.brief) {
          setBrief(res.brief);
        } else {
          setBrief(null);
        }
      } catch (err: any) {
        console.error("Failed to load brief", err);
        setError("Could not load brief details from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [isOpen, activeIdeaId]);

  if (!isOpen || !activeIdeaId) return null;

  // Check if a curated brief from human research exists or if it's the backend generic fallback
  const isGenericBackendBrief = !brief || !brief.overview || brief.overview.startsWith('Curated research outline for');

  const overviewText = (!isGenericBackendBrief && !idea?.ai_refined && brief?.title === activeTitle)
    ? brief.overview
    : (idea?.visualization_direction 
        ? idea.visualization_direction 
        : `Investigative exploration into ${activeSubject || 'historical & scientific breakthroughs'} focusing on "${activeTitle}".`);

  const keyPointsText = (!isGenericBackendBrief && !idea?.ai_refined && brief?.title === activeTitle)
    ? brief.key_points
    : `1. Primary Discoveries & Ground Truth: Documented field artifacts, primary archival texts, and counter-intuitive data points.
2. Analytical Deep Dive (${activeFormat || 'Explainer'}): Structural mechanisms, historical causality, and unexpected discoveries.
3. Paradigm Shift & Scientific Reality: Overturning traditional assumptions and establishing the verified evidence.`;

  const sourcesText = idea?.source_family_guidance || brief?.sources || 
    `Authoritative peer-reviewed journals, institutional archives, museum collections, and verified empirical databases.`;

  const handleCopyFullBrief = async () => {
    const fullMarkdown = formatBriefModalCopyText({
      ideaId: activeIdeaId,
      title: activeTitle,
      overview: overviewText,
      keyPoints: keyPointsText,
      sources: sourcesText,
      readyStatus: brief?.ready_status || (idea?.research_status ? idea.research_status : 'Ready'),
      hook: activeHook,
      subject: activeSubject,
      topicFamily: activeTopicFamily,
      format: activeFormat,
      originalSeed: activeSeed
    });

    try {
      await navigator.clipboard.writeText(fullMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 border border-white/[0.1] shadow-2xl relative max-h-[90vh] flex flex-col bg-[#0d1118]/95 backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 flex-shrink-0 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-display font-bold text-white tracking-tight truncate">Source-Ready Research Brief</h3>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.1] text-[11px] font-mono text-sky-300 font-bold flex-shrink-0">
                  {activeIdeaId}
                </span>
              </div>
              <p className="text-xs text-neutral-300 truncate font-medium mt-0.5">{activeTitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Top 1-Click Copy Research Prompt Button */}
            <button
              onClick={handleCopyFullBrief}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-600/30 active:scale-95'
              }`}
              title="Copy pure AI Research Prompt to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Prompt!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-neutral-200">
          {loading ? (
            <div className="py-14 text-center text-neutral-400">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-400 mb-2.5" />
              <p className="font-medium text-xs">Loading research brief from datastore...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Ready Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Status: <strong className="text-white">{brief?.ready_status || (idea?.research_status ? idea.research_status : 'Verified Production Ready')}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  1-Click Ready to Script
                </span>
              </div>

              {/* Title / Premise */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Research Title / Core Thesis</h4>
                  {idea?.ai_refined && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI Refined YouTube Angle</span>
                    </span>
                  )}
                </div>
                <p className="text-sm font-display font-bold text-white tracking-tight leading-snug">{activeTitle}</p>
                {activeSeed && (
                  <p className="text-[11px] text-neutral-400 font-mono pt-2 border-t border-white/[0.06] mt-1 flex items-center space-x-1 truncate">
                    <span className="text-neutral-500">Curriculum Seed:</span>
                    <span className="italic text-neutral-300 truncate">"{activeSeed}"</span>
                  </p>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Executive Overview</h4>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] whitespace-pre-line text-neutral-100 leading-relaxed font-normal">
                  {overviewText}
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Key Facts, Data & Script Beats</h4>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] whitespace-pre-line text-neutral-100 leading-relaxed font-normal">
                  {keyPointsText}
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Data Sources & Citations</h4>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-[11px] text-neutral-300 font-mono leading-relaxed">
                  {sourcesText}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleCopyFullBrief}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-xs font-bold text-white transition-all shadow-md shadow-sky-600/30 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Research Prompt!' : 'Copy Research Prompt'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
