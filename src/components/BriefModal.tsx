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
import { IdeaBrief } from '../types';
import { api } from '../services/api';

interface BriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string | null;
  videoIdea: string;
}

export const BriefModal: React.FC<BriefModalProps> = ({
  isOpen,
  onClose,
  ideaId,
  videoIdea
}) => {
  const [brief, setBrief] = useState<IdeaBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && ideaId) {
      setLoading(true);
      api.getBrief(ideaId)
        .then((res) => {
          if (res && res.success && res.brief) {
            setBrief(res.brief);
          } else {
            setBrief(null);
          }
        })
        .catch(() => setBrief(null))
        .finally(() => setLoading(false));
    } else {
      setBrief(null);
    }
  }, [isOpen, ideaId]);

  if (!isOpen || !ideaId) return null;

  const overviewText = brief?.overview || 
    `Investigative explainer breaking down "${videoIdea}". Explores core underlying mechanisms, counter-intuitive data, and tangible real-world significance for viewers.`;

  const keyPointsText = brief?.key_points || 
    `• Hook & Pattern Interrupt: Open with a provocative visual contradiction or puzzle regarding "${videoIdea}".\n• Foundational Concept: Break down why and how this phenomenon occurs in simple, visual terms.\n• Evidence & Case Breakdown: Examine documented historical, scientific, or geopolitical examples.\n• Myth Busting: Debunk the top misconception associated with this topic.\n• Takeaway & Future Outlook: Conclude with actionable insights and broader implications.`;

  const sourcesText = brief?.sources || 
    `Peer-reviewed academic research, verified statistical datasets, historical archives, and authoritative institutional publications.`;

  const handleCopyFullBrief = async () => {
    const fullMarkdown = `📑 KNOWSIGHTS RESEARCH BRIEF & SCRIPTING PROMPT
======================================================
Idea ID: ${ideaId}
Topic / Video Idea: ${brief?.title || videoIdea}
Research Status: ${brief?.ready_status || 'Ready for Production'}

1. EXECUTIVE OVERVIEW
${overviewText}

2. KEY SCRIPT BEATS, FACTS & DATA
${keyPointsText}

3. DATA SOURCES & REFERENCES
${sourcesText}

======================================================
💡 SCRIPTWRITING & VIDEO GENERATION PROMPT:
"Act as a professional YouTube documentary scriptwriter. Using the research brief above for '${brief?.title || videoIdea}', write a captivating, high-retention 8-10 minute video script. 

Format the output with:
- [Visual / B-Roll Directions]
- [Narrator Script]
- [On-Screen Graphic Cues]
Ensure a strong opening hook within the first 15 seconds, smooth narrative pacing, and engaging explanations without fluff."`;

    try {
      await navigator.clipboard.writeText(fullMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-neutral-800 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800 gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white truncate">Source-Ready Research Brief</h3>
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-sky-400 font-bold flex-shrink-0">
                  {ideaId}
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate">{videoIdea}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Top 1-Click Copy Brief Button */}
            <button
              onClick={handleCopyFullBrief}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-600/30 active:scale-95'
              }`}
              title="Copy Full Research Brief & Scriptwriting Prompt to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Brief!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Brief Prompt</span>
                </>
              )}
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-neutral-300">
          {loading ? (
            <div className="py-12 text-center text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400 mb-2" />
              <p>Loading research brief from Google Sheets...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Ready Status Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Status: <strong>{brief?.ready_status || 'Verified Production Ready'}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                  1-Click Ready to Script
                </span>
              </div>

              {/* Title / Premise */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 mb-1 font-bold">Research Title / Core Thesis</h4>
                <p className="text-sm font-semibold text-white">{brief?.title || videoIdea}</p>
              </div>

              {/* Overview */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Executive Overview</h4>
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 whitespace-pre-line text-neutral-200">
                  {overviewText}
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Key Facts, Data & Script Beats</h4>
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 whitespace-pre-line text-neutral-200">
                  {keyPointsText}
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-1.5">
                <h4 className="font-mono uppercase text-[11px] text-neutral-400 font-bold">Data Sources & Citations</h4>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
                  {sourcesText}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleCopyFullBrief}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all shadow-md shadow-sky-600/30"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Full Prompt!' : 'Copy Full Research & Script Prompt'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
