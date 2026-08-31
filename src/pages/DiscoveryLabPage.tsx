import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  SlidersHorizontal, 
  Flame, 
  Filter, 
  Compass, 
  Atom, 
  Scroll, 
  Landmark, 
  Plus, 
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Bot,
  Key,
  ShieldCheck,
  Globe,
  Radio,
  Library,
  Zap,
  Building2,
  Award,
  Shield,
  FileText,
  Grid,
  LayoutGrid,
  Tag,
  FolderOpen
} from 'lucide-react';
import { 
  DISCOVERY_SOURCES, 
  SOURCE_GROUPS, 
  transformArticleToIdea 
} from '../data/discoverySources';
import { 
  INSTITUTIONAL_REPOSITORIES, 
  INSTITUTIONAL_GROUPS, 
  VERIFICATION_TIERS 
} from '../data/institutionalArchives';
import { 
  DiscoverySource, 
  DiscoveryArticle, 
  GeneratedTopicIdea,
  InstitutionalRepository,
  AppConfig 
} from '../types';
import { api, loadConfig, saveConfig } from '../services/api';
import { 
  getConfiguredGeminiKeys, 
  generateIdeaWithGeminiRotation,
  testGeminiApiKey 
} from '../services/gemini';

interface DiscoveryLabPageProps {
  onRefreshStats: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DiscoveryLabPage: React.FC<DiscoveryLabPageProps> = ({
  onRefreshStats,
  showToast
}) => {
  // Navigation View: 'generator' | 'publications' | 'archives'
  const [activeView, setActiveView] = useState<'generator' | 'publications' | 'archives'>('generator');

  // Idea Display Mode: 'categorized' (Categorized by Subject sections) vs 'flat' (Single grid)
  const [ideaViewMode, setIdeaViewMode] = useState<'categorized' | 'flat'>('categorized');

  // Search & Filter State (Generator)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(
    DISCOVERY_SOURCES.map(s => s.id)
  );
  const [articlesPerSource, setArticlesPerSource] = useState<number>(2);
  const [showSourcesPanel, setShowSourcesPanel] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Institutional Archives Filter State
  const [selectedArchiveGroup, setSelectedArchiveGroup] = useState<string>('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Gemini Configuration State
  const [config, setConfigState] = useState<AppConfig>(loadConfig());
  const [key1, setKey1] = useState(config.gemini_api_key_1 || '');
  const [key2, setKey2] = useState(config.gemini_api_key_2 || '');
  const [key3, setKey3] = useState(config.gemini_api_key_3 || '');
  const [keyTestLoading, setKeyTestLoading] = useState<number | null>(null);
  const [keyTestResult, setKeyTestResult] = useState<{ [key: number]: string }>({});

  // Generation & Results State
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: number; sourceName: string; aiActive?: boolean } | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedTopicIdea[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQuestionsId, setExpandedQuestionsId] = useState<string | null>(null);
  const [savingPoolId, setSavingPoolId] = useState<string | null>(null);

  // Active Gemini keys count
  const activeGeminiKeys = getConfiguredGeminiKeys(config);
  const isAiActive = activeGeminiKeys.length > 0;

  // Group filter handler (Generator)
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    if (groupId === 'all') {
      setSelectedSourceIds(DISCOVERY_SOURCES.map(s => s.id));
    } else {
      const filtered = DISCOVERY_SOURCES.filter(s => s.group === groupId).map(s => s.id);
      setSelectedSourceIds(filtered);
    }
  };

  // Toggle individual source
  const toggleSource = (sourceId: string) => {
    if (selectedSourceIds.includes(sourceId)) {
      if (selectedSourceIds.length === 1) {
        showToast("At least one source must remain selected", 'info');
        return;
      }
      setSelectedSourceIds(prev => prev.filter(id => id !== sourceId));
    } else {
      setSelectedSourceIds(prev => [...prev, sourceId]);
    }
  };

  const selectAllSources = () => {
    setSelectedSourceIds(DISCOVERY_SOURCES.map(s => s.id));
    setSelectedGroup('all');
  };

  const clearAllSources = () => {
    setSelectedSourceIds([]);
  };

  // Quick single source generator trigger from Publications Directory
  const handleScanSingleSource = (source: DiscoverySource) => {
    setSelectedSourceIds([source.id]);
    setSelectedGroup(source.group);
    setActiveView('generator');
    setTimeout(() => {
      handleFetchAndGenerateCustom([source]);
    }, 100);
  };

  // Quick institutional archive scan
  const handleScanInstitutionalArchive = (repo: InstitutionalRepository) => {
    const tempSource: DiscoverySource = {
      id: repo.id,
      name: repo.name,
      type: repo.type,
      category: repo.category,
      group: 'history',
      bestFor: repo.purpose,
      officialUrl: repo.officialUrl,
      feedUrl: repo.searchPattern || `https://news.google.com/rss/search?q=site:${new URL(repo.officialUrl).hostname}&hl=en-US&gl=US&ceid=US:en`,
      searchFeedPattern: repo.searchPattern,
      subjectMapping: repo.subjectMapping,
      topicFamily: repo.topicFamily,
      defaultFormat: repo.defaultFormat
    };

    setSelectedSourceIds([tempSource.id]);
    setActiveView('generator');
    setTimeout(() => {
      handleFetchAndGenerateCustom([tempSource]);
    }, 100);
  };

  // Save Gemini Keys
  const handleSaveKeys = () => {
    const updated: AppConfig = {
      ...config,
      gemini_api_key_1: key1.trim(),
      gemini_api_key_2: key2.trim(),
      gemini_api_key_3: key3.trim()
    };
    saveConfig(updated);
    setConfigState(updated);
    setShowKeyModal(false);
    const count = getConfiguredGeminiKeys(updated).length;
    if (count > 0) {
      showToast(`Saved ${count} Gemini API Key(s) with 3-key auto-rotation enabled!`, 'success');
    } else {
      showToast("Gemini keys cleared. Built-in deterministic engine active.", 'info');
    }
  };

  const handleTestKey = async (num: 1 | 2 | 3) => {
    const val = num === 1 ? key1 : num === 2 ? key2 : key3;
    if (!val || !val.trim()) {
      setKeyTestResult(prev => ({ ...prev, [num]: "Enter a key to test" }));
      return;
    }
    setKeyTestLoading(num);
    const res = await testGeminiApiKey(val.trim());
    setKeyTestLoading(null);
    setKeyTestResult(prev => ({
      ...prev,
      [num]: res.valid ? "✓ Valid key (gemini-1.5-flash active)" : `✗ ${res.error}`
    }));
  };

  // Main Fetch & Idea Generation Engine with Multi-Key Gemini Rotation
  const handleFetchAndGenerateCustom = async (sourcesToUse?: DiscoverySource[]) => {
    const activeSources = sourcesToUse || DISCOVERY_SOURCES.filter(s => selectedSourceIds.includes(s.id));
    if (activeSources.length === 0) {
      showToast("Please select at least one publication source", 'error');
      return;
    }

    setIsFetching(true);
    const currentConfig = loadConfig();
    const configuredKeys = getConfiguredGeminiKeys(currentConfig);
    const useAi = configuredKeys.length > 0;

    setFetchProgress({ 
      current: 0, 
      total: activeSources.length, 
      sourceName: 'Initializing Feeds...', 
      aiActive: useAi 
    });
    const allGenerated: GeneratedTopicIdea[] = [];

    try {
      for (let i = 0; i < activeSources.length; i++) {
        const source = activeSources[i];
        setFetchProgress({
          current: i + 1,
          total: activeSources.length,
          sourceName: source.name,
          aiActive: useAi
        });

        try {
          const articles: DiscoveryArticle[] = await api.fetchSourceArticles(
            source,
            searchQuery.trim() || undefined,
            articlesPerSource
          );

          for (const article of articles) {
            let idea: GeneratedTopicIdea | null = null;

            // Tier 1: Try Gemini with 3-Key Auto-Rotation if keys exist
            if (useAi) {
              const aiRes = await generateIdeaWithGeminiRotation(article, source, currentConfig);
              if (aiRes.idea) {
                idea = aiRes.idea;
              }
            }

            // Tier 2: Deterministic Heuristic Synthesis Fallback
            if (!idea) {
              idea = transformArticleToIdea(article, source);
            }

            allGenerated.push(idea);
          }
        } catch (err) {
          console.warn(`Error fetching ${source.name}:`, err);
        }
      }

      setGeneratedIdeas(allGenerated);
      if (allGenerated.length > 0) {
        showToast(`Generated ${allGenerated.length} fresh topic ideas across categorized sections!`, 'success');
      } else {
        showToast("No new articles found matching criteria", 'info');
      }
    } catch (err: any) {
      showToast(`Generation error: ${err.message}`, 'error');
    } finally {
      setIsFetching(false);
      setFetchProgress(null);
    }
  };

  const handleFetchAndGenerate = () => handleFetchAndGenerateCustom();

  // Copy Full Video Scriptwriting Prompt to Clipboard
  const handleCopyPrompt = async (idea: GeneratedTopicIdea) => {
    const promptText = `🎬 VIDEO CONCEPT: ${idea.video_idea}
📌 Curiosity Hook: "${idea.curiosity_hook}"
🏷️ Category: ${idea.subject} / ${idea.topic_family}
✨ Signature Format: ${idea.signature_format}
⭐ Production Score: ${idea.production_score} (${idea.priority_tier})
📰 Source Publication: ${idea.source_name} (${idea.source_url})
📅 Publication Date: ${idea.source_published_date}

---
❓ 3 IN-DEPTH SCRIPT EXPLORATION QUESTIONS:
1. 🔍 Evidence & Discovery:
   ${idea.core_questions[0]}

2. ⚙️ Underlying Mechanism & Context:
   ${idea.core_questions[1]}

3. 🌐 Broader Implications & Paradigm Shift:
   ${idea.core_questions[2]}

---
💡 PROMPT FOR SCRIPTWRITING & VIDEO GENERATION:
"You are a master educational documentary writer. Create a captivating, high-retention YouTube video script on the topic: '${idea.video_idea}'.

1. HOOK & OPENING (0:00 - 1:00):
- Open immediately with this high-tension curiosity hook: '${idea.curiosity_hook}'.
- Interrupt viewer assumptions with the discovery reported by ${idea.source_name}.

2. DEEP-DIVE BODY (Core Narrative):
- Systematically answer these three core inquiry questions:
  • Q1: ${idea.core_questions[0]}
  • Q2: ${idea.core_questions[1]}
  • Q3: ${idea.core_questions[2]}
- Maintain the '${idea.signature_format}' pedagogical structure.

3. VISUAL CUES & DIRECTION:
- ${idea.visualization_direction}

4. CONCLUSION:
- Synthesize why this discovery matters for modern science/history and leave the viewer with a profound takeaway."`;

    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedId(idea.id);
      showToast("Copied complete scriptwriting prompt to clipboard!", 'success');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      showToast("Failed to copy prompt to clipboard", 'error');
    }
  };

  // Add 1-Click to Cloudflare D1 Production Pool (KS-P-*)
  const handleAddToPool = async (idea: GeneratedTopicIdea) => {
    setSavingPoolId(idea.id);
    try {
      const res = await api.addProductionIdea(idea);
      if (res && res.success) {
        setGeneratedIdeas(prev => 
          prev.map(it => it.id === idea.id ? { ...it, added_to_pool: true } : it)
        );
        showToast(`Added '${idea.video_idea}' to Production Pool as ${res.idea_id}!`, 'success');
        await onRefreshStats();
      } else {
        showToast(res?.error || "Failed to add idea to pool", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add idea to pool", 'error');
    } finally {
      setSavingPoolId(null);
    }
  };

  // Categorize Generated Ideas by Subject / Discipline
  const categorizedIdeas = useMemo(() => {
    const map = new Map<string, GeneratedTopicIdea[]>();
    for (const idea of generatedIdeas) {
      const subj = idea.subject || 'General Discovery & Thought';
      if (!map.has(subj)) {
        map.set(subj, []);
      }
      map.get(subj)!.push(idea);
    }
    return Array.from(map.entries()).map(([subject, ideas]) => ({
      subject,
      ideas
    }));
  }, [generatedIdeas]);

  // Filter Institutional Repositories
  const filteredRepositories = INSTITUTIONAL_REPOSITORIES.filter(repo => {
    if (selectedArchiveGroup !== 'all' && repo.group !== selectedArchiveGroup) return false;
    if (selectedTierFilter !== 'all') {
      if (selectedTierFilter === 'tier1' && !repo.tier.startsWith('Tier 1')) return false;
      if (selectedTierFilter === 'tier2' && !repo.tier.startsWith('Tier 2')) return false;
      if (selectedTierFilter === 'tier3' && !repo.tier.startsWith('Tier 3')) return false;
    }
    if (archiveSearchQuery.trim()) {
      const q = archiveSearchQuery.toLowerCase();
      const combined = `${repo.name} ${repo.category} ${repo.purpose} ${repo.groupLabel}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  // Group Institutional Repositories by Section
  const groupedRepositories = useMemo(() => {
    const map = new Map<string, InstitutionalRepository[]>();
    for (const repo of filteredRepositories) {
      const grp = repo.groupLabel || 'General Institutional Archives';
      if (!map.has(grp)) {
        map.set(grp, []);
      }
      map.get(grp)!.push(repo);
    }
    return Array.from(map.entries()).map(([groupLabel, repos]) => ({
      groupLabel,
      repos
    }));
  }, [filteredRepositories]);


  // Render a Single Topic Idea Card
  const renderTopicCard = (idea: GeneratedTopicIdea) => {
    const isQuestionsExpanded = expandedQuestionsId === idea.id;
    const isCopied = copiedId === idea.id;
    const isSaving = savingPoolId === idea.id;

    return (
      <div
        key={idea.id}
        className={`glass-panel glass-panel-hover p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
          idea.added_to_pool
            ? 'border-emerald-500/40 bg-emerald-950/15 ring-1 ring-emerald-500/20'
            : 'border-neutral-800/90 hover:border-neutral-700 bg-neutral-900/50'
        }`}
      >
        {/* Card Header: Source Pill & Format Badge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <a
              href={idea.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono group"
              title="Read original publication article"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold">{idea.source_name}</span>
              <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </a>

            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-md bg-neutral-800/80 border border-neutral-700 text-emerald-400 font-semibold">
                {idea.signature_format}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-amber-300 font-bold">
                ⭐ {idea.production_score}
              </span>
            </div>
          </div>

          {/* Video Concept Title */}
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {idea.video_idea}
          </h3>

          {/* Curiosity Hook Quote Box */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed font-sans relative">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 block mb-1">
              📌 Curiosity Hook:
            </span>
            "{idea.curiosity_hook}"
          </div>

          {/* Discipline / Topic Family Lineage */}
          <div className="flex items-center space-x-2 text-xs text-neutral-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
              {idea.subject}
            </span>
            <span>›</span>
            <span className="text-neutral-500 truncate max-w-[200px]">
              {idea.topic_family}
            </span>
          </div>

          {/* Expandable 3 Deep-Dive Script Questions */}
          <div className="border-t border-neutral-800/80 pt-3">
            <button
              onClick={() => setExpandedQuestionsId(isQuestionsExpanded ? null : idea.id)}
              className="flex items-center justify-between w-full text-xs font-mono text-neutral-400 hover:text-emerald-300 transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">3 Core Inquiry Questions</span>
              </span>
              {isQuestionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isQuestionsExpanded && (
              <div className="mt-3 space-y-2.5 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-300 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    1. Empirical & Physical Evidence:
                  </span>
                  <p className="text-neutral-300 leading-relaxed">{idea.core_questions[0]}</p>
                </div>
                <div className="space-y-1 border-t border-neutral-900 pt-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    2. Underlying Mechanism & Context:
                  </span>
                  <p className="text-neutral-300 leading-relaxed">{idea.core_questions[1]}</p>
                </div>
                <div className="space-y-1 border-t border-neutral-900 pt-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    3. Broader Implication & Paradigm Shift:
                  </span>
                  <p className="text-neutral-300 leading-relaxed">{idea.core_questions[2]}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="border-t border-neutral-800/80 pt-4 flex items-center justify-between gap-2">
          
          {/* Copy Scriptwriting Prompt Button */}
          <button
            onClick={() => handleCopyPrompt(idea)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title="Copy full scriptwriting outline and prompt for LLM generation"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy Script Prompt</span>
              </>
            )}
          </button>

          {/* Add to Production Pool Button */}
          {idea.added_to_pool ? (
            <span className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Production Pool</span>
            </span>
          ) : (
            <button
              onClick={() => handleAddToPool(idea)}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
              title="Permanently add to Cloudflare D1 Production Pool as a KS-P idea"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to D1...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Pool (KS-P)</span>
                </>
              )}
            </button>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. HERO HEADER & 3-VIEW SWITCHER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-neutral-800/90 relative overflow-hidden bg-gradient-to-b from-neutral-900/90 via-neutral-900/40 to-neutral-950/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-4">
          
          {/* Top Status Bar: Engine Mode & 3-Way Navigation Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Research Hub • {DISCOVERY_SOURCES.length} Publications & {INSTITUTIONAL_REPOSITORIES.length} Institutional Authorities</span>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* Gemini AI Status Badge & Config Modal Trigger */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isAiActive
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 shadow-sm shadow-cyan-950/40'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Configure 3 Gemini API keys with auto-failover rotation"
              >
                <Bot className={`w-3.5 h-3.5 ${isAiActive ? 'text-cyan-400 animate-pulse' : 'text-neutral-500'}`} />
                <span>
                  {isAiActive ? `Gemini AI (${activeGeminiKeys.length} Keys Active)` : 'Set Gemini Keys'}
                </span>
                <Key className="w-3 h-3 text-neutral-500 ml-1" />
              </button>

              {/* 3-View Switcher */}
              <div className="bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 flex items-center space-x-1">
                <button
                  onClick={() => setActiveView('generator')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'generator'
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Topic Generator</span>
                </button>
                <button
                  onClick={() => setActiveView('publications')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'publications'
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Library className="w-3.5 h-3.5 text-teal-400" />
                  <span>{DISCOVERY_SOURCES.length} Publications</span>
                </button>
                <button
                  onClick={() => setActiveView('archives')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'archives'
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{INSTITUTIONAL_REPOSITORIES.length} Institutional Repositories</span>
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              {activeView === 'generator' && 'Categorized Publication Discovery & Topic Generator'}
              {activeView === 'publications' && `Classified Publications Directory (${DISCOVERY_SOURCES.length} Resources)`}
              {activeView === 'archives' && `Classified Institutional Repositories (${INSTITUTIONAL_REPOSITORIES.length} Authorities)`}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
              {activeView === 'generator' && `Search breaking articles, museum reports, and excavations across ${DISCOVERY_SOURCES.length} elite publications. Automatically classified by subject section with 3-tier deep dive questions and optional 3-Key Gemini rotation.`}
              {activeView === 'publications' && `Browse all ${DISCOVERY_SOURCES.length} publications visually classified across 5 thematic sections: World History, Archaeology, Academic Essays, Hidden Curiosities, and Science Discoveries.`}
              {activeView === 'archives' && `Explore 36 authoritative repositories classified into sections 14 through 18, with Evidence Verification Tiers for primary ground truth verification.`}
            </p>
          </div>

          {/* Generator Controls (Shown in Generator View) */}
          {activeView === 'generator' && (
            <>
              {/* Search & Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchAndGenerate()}
                    placeholder={`Search topics across all ${DISCOVERY_SOURCES.length} sources (e.g. 'Bronze Age', 'Ancient Battles', 'Lost Cities', 'Hoaxes')...`}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleFetchAndGenerate}
                  disabled={isFetching}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Fetch & Generate</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowSourcesPanel(!showSourcesPanel)}
                  className={`inline-flex items-center space-x-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    showSourcesPanel 
                      ? 'bg-neutral-800 border-neutral-700 text-white' 
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>Sources ({selectedSourceIds.length}/{DISCOVERY_SOURCES.length})</span>
                  {showSourcesPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Group Filter Tags */}
              <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1 text-xs">
                <span className="text-neutral-500 font-mono flex items-center space-x-1 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Clusters:</span>
                </span>
                {SOURCE_GROUPS.map(group => {
                  const isActive = selectedGroup === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleGroupSelect(group.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80'
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>

      {/* 2. GEMINI 3-KEY CONFIGURATION MODAL / DRAWER */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-950 w-full max-w-xl space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini Multi-Key Auto-Rotation</h3>
                <p className="text-xs text-neutral-400">Configure up to 3 keys. The engine auto-fails over if a key hits quota limits.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Key 1 */}
              <div className="space-y-1 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Primary Gemini API Key (Key 1)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestKey(1)}
                    disabled={keyTestLoading === 1}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {keyTestLoading === 1 ? 'Testing...' : 'Test Key 1'}
                  </button>
                </div>
                <input
                  type="password"
                  value={key1}
                  onChange={(e) => setKey1(e.target.value)}
                  placeholder="AIzaSy... (Paste Primary Gemini API Key)"
                  className="w-full bg-neutral-950 font-mono text-xs border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
                {keyTestResult[1] && (
                  <p className={`text-[10px] font-mono mt-1 ${keyTestResult[1].startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {keyTestResult[1]}
                  </p>
                )}
              </div>

              {/* Key 2 */}
              <div className="space-y-1 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Secondary Gemini API Key (Key 2 — Failover 1)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestKey(2)}
                    disabled={keyTestLoading === 2}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {keyTestLoading === 2 ? 'Testing...' : 'Test Key 2'}
                  </button>
                </div>
                <input
                  type="password"
                  value={key2}
                  onChange={(e) => setKey2(e.target.value)}
                  placeholder="AIzaSy... (Paste Backup Gemini API Key)"
                  className="w-full bg-neutral-950 font-mono text-xs border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
                {keyTestResult[2] && (
                  <p className={`text-[10px] font-mono mt-1 ${keyTestResult[2].startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {keyTestResult[2]}
                  </p>
                )}
              </div>

              {/* Key 3 */}
              <div className="space-y-1 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Tertiary Gemini API Key (Key 3 — Failover 2)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestKey(3)}
                    disabled={keyTestLoading === 3}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {keyTestLoading === 3 ? 'Testing...' : 'Test Key 3'}
                  </button>
                </div>
                <input
                  type="password"
                  value={key3}
                  onChange={(e) => setKey3(e.target.value)}
                  placeholder="AIzaSy... (Paste 2nd Backup Gemini API Key)"
                  className="w-full bg-neutral-950 font-mono text-xs border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
                {keyTestResult[3] && (
                  <p className={`text-[10px] font-mono mt-1 ${keyTestResult[3].startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {keyTestResult[3]}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Keys are stored locally in your browser storage. If left empty, the engine uses built-in deterministic heuristic synthesis.</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKeys}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/50"
              >
                Save & Enable Rotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW B: 27 CLASSIFIED EDITORIAL PUBLICATIONS DIRECTORY */}
      {activeView === 'publications' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Classified Publications Directory ({DISCOVERY_SOURCES.length} Resources)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Organized by curriculum clusters. Click to browse the publication or trigger instant AI topic generation.
              </p>
            </div>
            
            <button
              onClick={() => setActiveView('generator')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Topic Generator</span>
            </button>
          </div>

          {/* Grouped Publications Sections */}
          <div className="space-y-10">
            {SOURCE_GROUPS.filter(g => g.id !== 'all').map((group, idx) => {
              const sourcesInGroup = DISCOVERY_SOURCES.filter(s => s.group === group.id);
              return (
                <div key={group.id} className="space-y-4">
                  {/* Category Section Header Banner */}
                  <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{group.label}</h3>
                        <p className="text-[11px] text-neutral-400">Curated publications & magazines</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 text-emerald-400 border border-neutral-800 font-bold">
                      {sourcesInGroup.length} Publications
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sourcesInGroup.map(source => (
                      <div
                        key={source.id}
                        className="glass-panel glass-panel-hover p-5 rounded-3xl border border-neutral-800/90 hover:border-neutral-700 bg-neutral-900/60 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-emerald-300 border border-neutral-700">
                              {source.type}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {source.category}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-white tracking-tight">
                              {source.name}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                              {source.bestFor}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between gap-2">
                          <a
                            href={source.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-emerald-300 transition-all group"
                          >
                            <span>Visit Publication</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                          </a>

                          <button
                            onClick={() => handleScanSingleSource(source)}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                            title="Fetch latest articles from this source only"
                          >
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>Scan Source</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 4. VIEW C: 36 CLASSIFIED INSTITUTIONAL REPOSITORIES */}
      {activeView === 'archives' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Classified Institutional Repositories ({INSTITUTIONAL_REPOSITORIES.length})</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Classified by section taxonomy (14–18) with Evidence Verification Tiers.
              </p>
            </div>

            <button
              onClick={() => setActiveView('generator')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Topic Generator</span>
            </button>
          </div>

          {/* Verification Hierarchy Guide */}
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Evidence Verification Hierarchy (Click to filter)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {VERIFICATION_TIERS.map(tier => (
                <div 
                  key={tier.tier}
                  onClick={() => setSelectedTierFilter(selectedTierFilter === (tier.tier.startsWith('Tier 1') ? 'tier1' : tier.tier.startsWith('Tier 2') ? 'tier2' : 'tier3') ? 'all' : (tier.tier.startsWith('Tier 1') ? 'tier1' : tier.tier.startsWith('Tier 2') ? 'tier2' : 'tier3'))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    tier.tier.startsWith('Tier 1')
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : tier.tier.startsWith('Tier 2')
                        ? 'bg-blue-950/20 border-blue-500/30'
                        : 'bg-amber-950/20 border-amber-500/30'
                  } ${
                    (selectedTierFilter === 'tier1' && tier.tier.startsWith('Tier 1')) ||
                    (selectedTierFilter === 'tier2' && tier.tier.startsWith('Tier 2')) ||
                    (selectedTierFilter === 'tier3' && tier.tier.startsWith('Tier 3'))
                      ? 'ring-2 ring-white/20'
                      : ''
                  }`}
                >
                  <span className={`text-[11px] font-mono font-bold block mb-1 ${
                    tier.tier.startsWith('Tier 1') ? 'text-emerald-400' : tier.tier.startsWith('Tier 2') ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {tier.tier}
                  </span>
                  <p className="text-[11px] text-neutral-300 font-medium leading-relaxed">{tier.guideline}</p>
                  <p className="text-[10px] text-neutral-500 mt-1 font-mono">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Category Filter Sub-Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                placeholder="Filter archives by keyword (e.g. 'navy', 'manuscripts', 'treaties', 'mughal', 'space', 'nasa')..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500/50 font-sans"
              />
              {archiveSearchQuery && (
                <button 
                  onClick={() => setArchiveSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
              {INSTITUTIONAL_GROUPS.map(grp => (
                <button
                  key={grp.id}
                  onClick={() => setSelectedArchiveGroup(grp.id)}
                  className={`px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                    selectedArchiveGroup === grp.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Sections for Institutional Archives */}
          <div className="space-y-10">
            {groupedRepositories.map(({ groupLabel, repos }) => (
              <div key={groupLabel} className="space-y-4">
                {/* Section Header */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{groupLabel}</h3>
                      <p className="text-[11px] text-neutral-400">Primary archives, museums & academic bodies</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 text-blue-400 border border-neutral-800 font-bold">
                    {repos.length} Authorities
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repos.map(repo => (
                    <div
                      key={repo.id}
                      className="glass-panel glass-panel-hover p-5 rounded-3xl border border-neutral-800/90 hover:border-neutral-700 bg-neutral-900/60 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            repo.tier.startsWith('Tier 1')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : repo.tier.startsWith('Tier 2')
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {repo.tier}
                          </span>

                          <span className="text-[10px] font-mono text-neutral-500">
                            {repo.groupLabel.split('.')[1] || repo.groupLabel}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {repo.name}
                          </h3>
                          <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                            {repo.type} • {repo.category}
                          </span>
                          <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                            {repo.purpose}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between gap-2">
                        <a
                          href={repo.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-blue-300 transition-all group"
                        >
                          <span>Visit Official Archive</span>
                          <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-blue-400" />
                        </a>

                        <button
                          onClick={() => handleScanInstitutionalArchive(repo)}
                          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all cursor-pointer"
                          title="Generate ideas from this institutional repository"
                        >
                          <Zap className="w-3 h-3 text-blue-400" />
                          <span>Scan Archive</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredRepositories.length === 0 && (
            <div className="glass-panel p-8 rounded-3xl border border-neutral-800 text-center text-neutral-400 text-xs">
              No repositories match the current search or tier filter.
            </div>
          )}

        </div>
      )}

      {/* 5. VIEW A: TOPIC GENERATOR RESULTS (CLASSIFIED BY SUBJECT SECTION) */}
      {activeView === 'generator' && (
        <div className="space-y-6">

          {/* Sources Config Drawer (Collapsible) */}
          {showSourcesPanel && (
            <div className="glass-panel p-6 rounded-3xl border border-neutral-800 bg-neutral-950/90 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Configure Active Publication Sources</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-emerald-400 font-mono">
                      {selectedSourceIds.length} of {DISCOVERY_SOURCES.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Toggle individual resources to include or exclude from live scanning.</p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={selectAllSources}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSources}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Sources Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DISCOVERY_SOURCES.map(source => {
                  const isSelected = selectedSourceIds.includes(source.id);
                  return (
                    <div
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isSelected
                          ? 'bg-neutral-900/90 border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-neutral-950/40 border-neutral-800/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                            <h4 className="text-xs font-bold text-white">{source.name}</h4>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                            {source.category} • {source.type}
                          </span>
                        </div>

                        <a
                          href={source.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-neutral-500 hover:text-emerald-400 p-1"
                          title="Open publication website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {source.bestFor}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Settings Sub-Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-xs text-neutral-400 font-mono">
                <div className="flex items-center space-x-3">
                  <span>Articles per source:</span>
                  <div className="flex items-center space-x-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                    {[1, 2, 3, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setArticlesPerSource(num)}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          articlesPerSource === num
                            ? 'bg-emerald-500 text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500">
                  {isAiActive ? `AI Mode Active (${activeGeminiKeys.length} Keys)` : 'Deterministic Heuristic Mode Active'}
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Progress Bar */}
          {fetchProgress && (
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-white font-mono flex items-center space-x-2">
                    <span>Scanning [{fetchProgress.current}/{fetchProgress.total}]: {fetchProgress.sourceName}</span>
                    {fetchProgress.aiActive && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                        Gemini AI Active
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-300/80">
                    Extracting recent publications and synthesizing curiosity hooks...
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {Math.round((fetchProgress.current / fetchProgress.total) * 100)}%
              </span>
            </div>
          )}

          {/* Generated Cards Header with Display Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Generated Research Topics ({generatedIdeas.length})
              </h2>
            </div>

            {generatedIdeas.length > 0 && (
              <div className="flex items-center space-x-2">
                {/* View Switcher: Categorized Sections vs Flat Grid */}
                <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex items-center space-x-1 text-xs">
                  <button
                    onClick={() => setIdeaViewMode('categorized')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      ideaViewMode === 'categorized'
                        ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Classified Sections ({categorizedIdeas.length})</span>
                  </button>
                  <button
                    onClick={() => setIdeaViewMode('flat')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      ideaViewMode === 'flat'
                        ? 'bg-neutral-800 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Flat Grid</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {generatedIdeas.length === 0 && !isFetching && (
            <div className="glass-panel p-12 rounded-3xl border border-neutral-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-emerald-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Topic Ideas Generated Yet</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Click "Fetch & Generate" above to scan the {DISCOVERY_SOURCES.length} publications for breaking findings, or enter a specific search query.
                </p>
              </div>
              <button
                onClick={handleFetchAndGenerate}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fetch Latest Discoveries Now</span>
              </button>
            </div>
          )}

          {/* 1. CATEGORIZED SECTIONS VIEW (DEFAULT) */}
          {ideaViewMode === 'categorized' && generatedIdeas.length > 0 && (
            <div className="space-y-10">
              {categorizedIdeas.map(({ subject, ideas }, sIdx) => (
                <div key={subject} className="space-y-4">
                  {/* Category Section Banner */}
                  <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                        {sIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{subject}</h3>
                        <p className="text-[11px] text-neutral-400">Curated topic ideas & curiosity hooks</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 text-emerald-400 border border-neutral-800 font-bold">
                      {ideas.length} {ideas.length === 1 ? 'Topic' : 'Topics'}
                    </span>
                  </div>

                  {/* Category Topic Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {ideas.map(renderTopicCard)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. FLAT GRID VIEW */}
          {ideaViewMode === 'flat' && generatedIdeas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {generatedIdeas.map(renderTopicCard)}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
