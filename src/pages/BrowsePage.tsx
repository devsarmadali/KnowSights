import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Star,
  Sparkles,
  X,
  SlidersHorizontal,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { ProductionIdea } from '../types';
import { api, normalizeToProductionIdea } from '../services/api';
import { BriefModal } from '../components/BriefModal';

interface BrowsePageProps {
  onRefreshStats: () => Promise<void>;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({ onRefreshStats }) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [format, setFormat] = useState('');
  const [researchStatus, setResearchStatus] = useState('');
  const [status, setStatus] = useState<'all' | 'available' | 'used'>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProductionIdea[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [formatsList, setFormatsList] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Brief Modal State
  const [briefModal, setBriefModal] = useState<{ isOpen: boolean; ideaId: string | null; videoIdea: string }>({
    isOpen: false,
    ideaId: null,
    videoIdea: ''
  });

  const handleCopyRow = async (it: ProductionIdea) => {
    const visLine = it.visualization_direction ? `\n🎨 Visual Direction: ${it.visualization_direction}` : '';
    const srcLine = it.source_family_guidance ? `\n📚 Source Guidance: ${it.source_family_guidance}` : '';
    const seedLine = it.parent_sr ? `\n🌱 Taxonomy Seed: Master Taxonomy Sr. #${it.parent_sr}` : '';
    const text = `🎬 VIDEO CONCEPT: ${it.video_idea}
📌 Curiosity Hook: "${it.curiosity_hook || 'Engaging deep dive hook'}"
🏷️ Category: ${it.subject} / ${it.topic_family}
✨ Format Style: ${it.signature_format || 'Standard Explainer'}
⭐ Production Score: ${it.production_score} (${it.priority_tier || 'Tier 2'})
🆔 Idea ID: ${it.idea_id}${seedLine}${visLine}${srcLine}

---
💡 Prompt for Scriptwriting & Video Generation:
"Create a comprehensive YouTube video script on the topic: '${it.video_idea}'.
Use this curiosity hook: '${it.curiosity_hook || it.video_idea}'.
Structure the script using the '${it.signature_format || 'Explainer'}' format.${it.visualization_direction ? ` Incorporate visual directions: ${it.visualization_direction}.` : ''} Include an opening pattern interrupt, engaging evidence-backed body points, clear visual cues for animation/b-roll, and a satisfying conclusion."`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(it.idea_id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.getProductionPool({
        query,
        subject,
        format,
        research_status: researchStatus,
        status,
        min_score: minScore,
        page,
        pageSize
      });
      if (res && res.success) {
        const rawItems = res.items || [];
        setItems(rawItems.map((it: any, idx: number) => normalizeToProductionIdea(it, idx)));
        setTotal(res.total || 0);
        const subjs = res.all_subjects || res.subjects || [];
        if (subjs.length) setSubjectsList(subjs);
        const fmts = res.all_formats || res.formats || [];
        if (fmts.length) setFormatsList(fmts);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [subject, format, researchStatus, status, minScore, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchResults();
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleMarkToggle = async (idea: ProductionIdea) => {
    if (idea.used) {
      await api.undoUsed(idea.idea_id);
    } else {
      await api.markUsed(idea.idea_id);
    }
    await fetchResults();
    await onRefreshStats();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-neutral-800 space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Production Pool by Idea ID (e.g. KS-P-0054), Video Idea, Hook, or Topic Family..."
            className="w-full bg-neutral-900/90 text-white border border-neutral-800 rounded-xl px-4 py-3 pl-10 text-sm font-sans focus:outline-none focus:border-emerald-500 placeholder:text-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Subject Filter */}
          <div>
            <label className="block font-mono uppercase text-neutral-400 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Signature Format Filter */}
          <div>
            <label className="block font-mono uppercase text-neutral-400 mb-1">Signature Format</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Formats</option>
              {formatsList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Research Status Filter */}
          <div>
            <label className="block font-mono uppercase text-neutral-400 mb-1">Research Status</label>
            <select
              value={researchStatus}
              onChange={(e) => {
                setResearchStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Ready">Ready</option>
              <option value="In Review">In Review</option>
              <option value="Hold">Hold</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-mono uppercase text-neutral-400 mb-1">Usage Status</label>
            <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              {(['all', 'available', 'used'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatus(st);
                    setPage(1);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    status === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {st === 'available' ? 'Available' : st === 'used' ? 'Used' : 'All'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Count & Active Filter Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-xs font-mono text-neutral-400">
          <div>
            Found <strong className="text-white">{total.toLocaleString()}</strong> curated ideas in Production Pool
          </div>
          {(subject || format || researchStatus || query || status !== 'all' || minScore > 0) && (
            <button
              onClick={() => {
                setSubject('');
                setFormat('');
                setResearchStatus('');
                setQuery('');
                setStatus('all');
                setMinScore(0);
                setPage(1);
              }}
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Results Table */}
      <div className="glass-panel rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/90 text-neutral-400 font-mono uppercase border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4 w-24">Idea ID</th>
                <th className="py-3 px-4 min-w-[280px]">Video Idea & Hook</th>
                <th className="py-3 px-4 min-w-[140px]">Subject / Topic</th>
                <th className="py-3 px-4 min-w-[140px]">Signature Format</th>
                <th className="py-3 px-4 w-24 text-center">Score</th>
                <th className="py-3 px-4 w-24 text-center">Shown</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <p>Loading Production Pool from Google Sheets...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    No ideas matching your filter criteria in Production Pool.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr 
                    key={it.idea_id} 
                    className={`hover:bg-neutral-900/50 transition-colors ${
                      it.used ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Idea ID & Taxonomy Seed Lineage */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-emerald-400 block">{it.idea_id}</span>
                      {it.parent_sr && (
                        <span className="text-[10px] text-neutral-500 block font-normal" title={`Taxonomy Seed: Master Taxonomy Sr. #${it.parent_sr}`}>
                          Seed #{it.parent_sr}
                        </span>
                      )}
                    </td>

                    {/* Video Idea & Hook */}
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="space-y-1">
                        <span className="font-semibold text-sm leading-snug">{it.video_idea}</span>
                        {it.curiosity_hook && (
                          <p className="text-[11px] text-neutral-400 italic">
                            "{it.curiosity_hook}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Subject / Topic Family */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium block w-fit">
                          {it.subject}
                        </span>
                        <span className="text-neutral-400 text-[11px] block truncate max-w-[130px]">
                          {it.topic_family}
                        </span>
                      </div>
                    </td>

                    {/* Signature Format */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] font-medium">
                        {it.signature_format || 'Standard'}
                      </span>
                    </td>

                    {/* Production Score & Priority Tier */}
                    <td className="py-3 px-4 text-center font-mono">
                      <div className="inline-flex items-center space-x-1 font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{it.production_score}</span>
                      </div>
                      <span className="block text-[10px] text-neutral-500">{it.priority_tier}</span>
                    </td>

                    {/* Times Shown */}
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-neutral-400">
                      <strong className="text-neutral-200">{it.times_shown}x</strong>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4">
                      {it.used ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Used</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-normal text-[11px]">
                          Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Copy Prompt Button */}
                      <button
                        onClick={() => handleCopyRow(it)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          copiedId === it.idea_id
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                        title="Copy Idea & Script Prompt"
                      >
                        {copiedId === it.idea_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {it.brief_available && (
                        <button
                          onClick={() => setBriefModal({ isOpen: true, ideaId: it.idea_id, videoIdea: it.video_idea })}
                          className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-sky-400 hover:text-white transition-all"
                          title="Open Research Brief"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkToggle(it)}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          it.used
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                        title={it.used ? "Undo Used" : "Mark Used"}
                      >
                        {it.used ? "Undo" : "✓ Use"}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Research Brief Modal */}
      <BriefModal
        isOpen={briefModal.isOpen}
        onClose={() => setBriefModal({ isOpen: false, ideaId: null, videoIdea: '' })}
        ideaId={briefModal.ideaId}
        videoIdea={briefModal.videoIdea}
      />

    </div>
  );
};
