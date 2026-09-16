import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Shuffle, 
  RotateCw, 
  Bookmark, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Target, 
  Loader2,
  Filter,
  Check
} from 'lucide-react';
import { 
  PsychologyTopic, 
  PsychologyFilterState, 
  PSYCHOLOGY_SECTORS, 
  getSectorConfig 
} from '../types/psychology';
import { 
  fetchPsychologyDatabase, 
  filterPsychologyTopics, 
  getStudiedTopicIds, 
  toggleStudiedTopicId, 
  getBookmarkedTopicIds, 
  toggleBookmarkedTopicId, 
  getPsychologyStats, 
  drawPsychologyMix 
} from '../services/psychologyApi';
import { PsychologyTopicCard } from '../components/PsychologyTopicCard';
import { PsychologyDetailModal } from '../components/PsychologyDetailModal';

interface PsychologyPageProps {
  onSaveToNotes?: (topic: PsychologyTopic) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PsychologyPage: React.FC<PsychologyPageProps> = ({
  onSaveToNotes,
  showToast
}) => {
  const [allTopics, setAllTopics] = useState<PsychologyTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Persistence sets
  const [studiedIds, setStudiedIds] = useState<Set<string>>(() => getStudiedTopicIds());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => getBookmarkedTopicIds());

  // Filter State
  const [filter, setFilter] = useState<PsychologyFilterState>({
    query: '',
    sector: 'all',
    category: '',
    minShock: 0,
    minRelatability: 0,
    evidenceOnly: false,
    status: 'all',
    page: 1,
    pageSize: 18
  });

  // Modal State
  const [selectedTopic, setSelectedTopic] = useState<PsychologyTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Daily Mix / Curated Draw Mode
  const [drawnBatch, setDrawnBatch] = useState<PsychologyTopic[] | null>(null);

  // Fetch all 1,000 topics on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchPsychologyDatabase();
        if (isMounted) {
          if (data && data.length > 0) {
            setAllTopics(data);
          } else {
            setLoadError('No psychology topics found.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err?.message || 'Failed to load psychology database');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered calculation
  const { items: displayTopics, total, totalPages } = useMemo(() => {
    if (drawnBatch) {
      return { items: drawnBatch, total: drawnBatch.length, totalPages: 1 };
    }
    return filterPsychologyTopics(allTopics, filter, studiedIds, bookmarkedIds);
  }, [allTopics, filter, studiedIds, bookmarkedIds, drawnBatch]);

  // Overall stats
  const stats = useMemo(() => {
    return getPsychologyStats(allTopics, studiedIds, bookmarkedIds);
  }, [allTopics, studiedIds, bookmarkedIds]);

  // Handlers
  const handleToggleStudied = (id: string) => {
    const isNowStudied = toggleStudiedTopicId(id);
    setStudiedIds(new Set(getStudiedTopicIds()));
    if (showToast) {
      showToast(isNowStudied ? 'Marked as Studied / Used' : 'Unmarked Studied state', 'info');
    }
  };

  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmarkedTopicId(id);
    setBookmarkedIds(new Set(getBookmarkedTopicIds()));
    if (showToast) {
      showToast(isNowBookmarked ? 'Bookmarked topic' : 'Removed bookmark', 'info');
    }
  };

  const handleOpenDetail = (topic: PsychologyTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const handleDrawMix = (count: number = 6) => {
    const batch = drawPsychologyMix(allTopics, count, studiedIds);
    setDrawnBatch(batch);
    if (showToast) {
      showToast(`Curated a fresh ${count}-card Psychology Mix across sectors`, 'success');
    }
  };

  const handleClearDraw = () => {
    setDrawnBatch(null);
  };

  const handleResetFilters = () => {
    setFilter({
      query: '',
      sector: 'all',
      category: '',
      minShock: 0,
      minRelatability: 0,
      evidenceOnly: false,
      status: 'all',
      page: 1,
      pageSize: 18
    });
    setDrawnBatch(null);
  };

  const isFiltered = 
    filter.query !== '' || 
    filter.sector !== 'all' || 
    filter.minShock > 0 || 
    filter.minRelatability > 0 || 
    filter.evidenceOnly || 
    filter.status !== 'all';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* 1. Page Header & Live Stats Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-neutral-950" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Psychology Topic Engine V6
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
              Human Behavior & Cognitive Architecture
            </h1>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              1,000 verified psychological phenomena, dark patterns, social dilemmas, and cognitive biases across 20 distinct sectors. Complete with curiosity hooks, driver mechanisms, and scholarly DOIs.
            </p>
          </div>

          {/* Quick Stats & Action Cards */}
          <div className="flex items-center flex-wrap gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[85px]">
              <span className="font-mono text-[10px] uppercase text-neutral-500 block">Total Pool</span>
              <span className="font-mono text-xl font-bold text-white">{stats.total}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center min-w-[85px]">
              <span className="font-mono text-[10px] uppercase text-emerald-400 block">Studied</span>
              <span className="font-mono text-xl font-bold text-emerald-300">{stats.studiedCount}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center min-w-[85px]">
              <span className="font-mono text-[10px] uppercase text-amber-400 block">Bookmarks</span>
              <span className="font-mono text-xl font-bold text-amber-300">{stats.bookmarkedCount}</span>
            </div>
            <button
              onClick={() => handleDrawMix(6)}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-xs font-mono shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              title="Draw a curated set of 6 psychology cards across random sectors"
            >
              <Shuffle className="w-4 h-4" />
              <span>Draw Mix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Drawn Mix Banner (if in Drawn mode) */}
      {drawnBatch && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-white font-display">
                Curated Psychology Mix Active ({drawnBatch.length} Cards)
              </h4>
              <p className="text-xs text-emerald-300/80 font-mono">
                Diverse sample chosen across distinct psychological sectors.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDrawMix(drawnBatch.length)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-neutral-200 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-roll</span>
            </button>
            <button
              onClick={handleClearDraw}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
            >
              Back to Full 1,000
            </button>
          </div>
        </div>
      )}

      {/* 3. Horizontal Sector Selector (20 Sectors) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Explore Sectors (20 Core Disciplines)</span>
          {filter.sector !== 'all' && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, sector: 'all', page: 1 }))}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Reset to All Sectors
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          <button
            onClick={() => {
              setFilter(prev => ({ ...prev, sector: 'all', page: 1 }));
              if (drawnBatch) setDrawnBatch(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
              filter.sector === 'all' && !drawnBatch
                ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border-white/[0.08]'
            }`}
          >
            All Sectors (1,000)
          </button>

          {PSYCHOLOGY_SECTORS.map((sec) => {
            const isSelected = filter.sector.toLowerCase() === sec.name.toLowerCase() && !drawnBatch;
            return (
              <button
                key={sec.name}
                onClick={() => {
                  setFilter(prev => ({ ...prev, sector: sec.name, page: 1 }));
                  if (drawnBatch) setDrawnBatch(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer border flex items-center space-x-1.5 ${
                  isSelected
                    ? `${sec.badgeClass} border-current font-bold ring-1 ring-white/20`
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border-white/[0.08]'
                }`}
              >
                <span>{sec.name}</span>
                <span className="text-[10px] opacity-60 font-mono">(50)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Controls & Search Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.query}
            onChange={(e) => {
              setFilter(prev => ({ ...prev, query: e.target.value, page: 1 }));
              if (drawnBatch) setDrawnBatch(null);
            }}
            placeholder="Search phenomenon, mechanism, contexts..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
          />
          {filter.query && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, query: '', page: 1 }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#0e131d]">Status: All Topics</option>
            <option value="unstudied" className="bg-[#0e131d]">Status: Unstudied Only</option>
            <option value="studied" className="bg-[#0e131d]">Status: Studied / Used</option>
            <option value="bookmarked" className="bg-[#0e131d]">Status: Bookmarked Only</option>
          </select>

          {/* Shock score filter */}
          <select
            value={filter.minShock}
            onChange={(e) => setFilter(prev => ({ ...prev, minShock: Number(e.target.value), page: 1 }))}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="0" className="bg-[#0e131d]">Shock: Any</option>
            <option value="3" className="bg-[#0e131d]">Shock: ≥ 3.0</option>
            <option value="4" className="bg-[#0e131d]">Shock: ≥ 4.0</option>
            <option value="5" className="bg-[#0e131d]">Shock: 5.0 High</option>
          </select>

          {/* Verified Evidence toggle */}
          <button
            onClick={() => setFilter(prev => ({ ...prev, evidenceOnly: !prev.evidenceOnly, page: 1 }))}
            className={`px-3 py-2 rounded-xl text-xs font-mono border transition-colors cursor-pointer flex items-center space-x-1.5 ${
              filter.evidenceOnly
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
            title="Filter to phenomena with verified sources / linked DOIs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Verified Sources</span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-mono text-rose-300 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Count & Results Status */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
        <span>
          Showing <strong className="text-white">{displayTopics.length}</strong> of{' '}
          <strong className="text-white">{total}</strong> topics
          {filter.sector !== 'all' && (
            <span className="text-emerald-400 font-semibold ml-1.5">
              in {filter.sector}
            </span>
          )}
        </span>
        {!drawnBatch && totalPages > 1 && (
          <span>
            Page <strong className="text-white">{filter.page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* 6. Loading or Empty State */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="font-mono text-xs text-neutral-400">
            Initializing Psychology Topic Engine database (1,000 records)...
          </p>
        </div>
      ) : loadError ? (
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-2">
          <p className="text-sm font-bold text-rose-300 font-mono">Error loading database</p>
          <p className="text-xs text-neutral-400">{loadError}</p>
        </div>
      ) : displayTopics.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/[0.08] space-y-4">
          <Brain className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-display font-bold text-white">
            No psychology topics match your filter criteria
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Try adjusting your search query, lowering the shock threshold, or switching to "All Sectors".
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* 7. Topics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayTopics.map((topic) => (
            <PsychologyTopicCard
              key={topic.id}
              topic={topic}
              isStudied={studiedIds.has(topic.id)}
              isBookmarked={bookmarkedIds.has(topic.id)}
              onToggleStudied={handleToggleStudied}
              onToggleBookmark={handleToggleBookmark}
              onOpenDetail={handleOpenDetail}
              onSaveToNotes={onSaveToNotes}
            />
          ))}
        </div>
      )}

      {/* 8. Pagination Controls */}
      {!drawnBatch && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            disabled={filter.page <= 1}
            onClick={() => {
              setFilter(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 border border-white/[0.08] text-neutral-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 font-mono text-xs text-neutral-400">
            {Array.from({ length: Math.min(7, totalPages) }, (_, idx) => {
              let pageNum = idx + 1;
              if (totalPages > 7) {
                if (filter.page <= 4) {
                  pageNum = idx + 1;
                } else if (filter.page >= totalPages - 3) {
                  pageNum = totalPages - 6 + idx;
                } else {
                  pageNum = filter.page - 3 + idx;
                }
              }
              const isActive = pageNum === filter.page;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, page: pageNum }));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`w-8 h-8 rounded-lg border transition-all cursor-pointer font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border-white/[0.08]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={filter.page >= totalPages}
            onClick={() => {
              setFilter(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }));
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 border border-white/[0.08] text-neutral-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 9. Deep Dive Detail Modal */}
      <PsychologyDetailModal
        topic={selectedTopic}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isStudied={selectedTopic ? studiedIds.has(selectedTopic.id) : false}
        isBookmarked={selectedTopic ? bookmarkedIds.has(selectedTopic.id) : false}
        onToggleStudied={handleToggleStudied}
        onToggleBookmark={handleToggleBookmark}
        onSaveToNotes={onSaveToNotes}
      />
    </div>
  );
};
