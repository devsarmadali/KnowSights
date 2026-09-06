import React, { useState, useEffect } from 'react';
import { 
  DailyBatch, 
  SystemStats, 
  SelectionMode, 
  AppConfig,
  ProductionIdea,
  UserNote
} from './types';
import { 
  api, 
  loadConfig, 
  saveConfig, 
  normalizeStats, 
  normalizeBatch,
  getLocalNotes,
  saveLocalNotes
} from './services/api';
import { formatTopicCardCopyText } from './utils/researchPrompt';
import { 
  refineBatchWithGeminiRotation, 
  refineSingleTopicWithGeminiRotation, 
  getConfiguredGeminiKeys 
} from './services/gemini';
import { Header, ThemeOption } from './components/Header';
import { DailyMixPage } from './pages/DailyMixPage';
import { BrowsePage } from './pages/BrowsePage';
import { DiscoveryLabPage } from './pages/DiscoveryLabPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';

export const SPREADSHEET_ID = '1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mix' | 'browse' | 'discovery' | 'notes' | 'settings'>('mix');
  const [config, setConfig] = useState<AppConfig>(loadConfig());
  const [currentBatch, setCurrentBatch] = useState<DailyBatch | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [notesCount, setNotesCount] = useState<number>(() => {
    return getLocalNotes().length;
  });
  
  // Theme State (dark | sepia | solarized-dark | solarized-light)
  const [theme, setTheme] = useState<ThemeOption>(() => {
    const local = localStorage.getItem('knowsights_theme') as ThemeOption;
    if (local && ['dark', 'sepia', 'solarized-dark', 'solarized-light'].includes(local)) {
      return local;
    }
    return (loadConfig().theme as ThemeOption) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('knowsights_theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    const updated = { ...config, theme: newTheme };
    setConfig(updated);
    saveConfig(updated);
  };
  
  // Mixer Controls State
  const [mode, setMode] = useState<SelectionMode>((config.default_mode as SelectionMode) || 'BALANCED');
  const [size, setSize] = useState<number>(config.daily_mix_size || 12);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshStats = async () => {
    try {
      const res = await api.getStats();
      if (res && res.success) {
        const normalized = normalizeStats(res);
        setStats(normalized);
        if (normalized.subjects_coverage && normalized.subjects_coverage.length) {
          setSubjectsList(normalized.subjects_coverage.map((s: any) => s.subject));
        }
      }
    } catch (err) {
      console.error("Error refreshing stats", err);
    }
  };

  // Initial Load: Schema 2.0 getInitialData (loads config, stats, and today's existing batch)
  const initApp = async () => {
    setIsLoading(true);
    try {
      const initData = await api.getInitialData();
      if (initData && initData.success) {
        if (initData.config) {
          const currentLocal = loadConfig();
          const merged = { ...currentLocal, ...initData.config, google_web_app_url: currentLocal.google_web_app_url };
          setConfig(merged);
          saveConfig(merged);
          if (merged.daily_mix_size) setSize(merged.daily_mix_size);
          if (merged.default_mode) setMode(merged.default_mode as SelectionMode);
        }

        const normalizedStats = normalizeStats(initData);
        setStats(normalizedStats);
        if (normalizedStats.subjects_coverage && normalizedStats.subjects_coverage.length) {
          setSubjectsList(normalizedStats.subjects_coverage.map((s: any) => s.subject));
        }
        
        const normalizedBatch = normalizeBatch(initData);
        if (normalizedBatch) {
          setCurrentBatch(normalizedBatch);
        }
      }
    } catch (err) {
      console.error("Error initializing app", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const [isRefiningBatch, setIsRefiningBatch] = useState<boolean>(false);

  // 1. Generate Fresh Batch
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateBatch(mode, size, subjectFilter);
      if (res && res.success) {
        let normalized = normalizeBatch(res);
        if (normalized) {
          const keys = getConfiguredGeminiKeys(config);
          const shouldAiRefine = config.ai_refine_batch !== false && keys.length > 0;

          if (shouldAiRefine) {
            showToast(`Refining ${normalized.items.length} topics into YouTube concepts with Gemini AI...`, 'info');
            try {
              const aiRes = await refineBatchWithGeminiRotation(normalized.items, config);
              if (aiRes.success && aiRes.refinedItems.length > 0) {
                normalized = {
                  ...normalized,
                  items: aiRes.refinedItems
                };
                showToast(
                  `✨ Generated & refined ${normalized.items.length} YouTube-ready concepts with ${aiRes.modelUsed || 'Gemini'} (Key #${aiRes.keyUsedIndex})!`,
                  'success'
                );
              } else {
                showToast(`Generated ${mode} mix (${aiRes.error || 'AI refinement skipped'})`, 'info');
              }
            } catch (aiErr: any) {
              console.warn("AI refinement error during batch generation:", aiErr);
              showToast(`Generated fresh ${mode} mix with ${normalized.items.length} curated ideas!`, 'success');
            }
          } else {
            showToast(`Generated fresh ${mode} mix with ${normalized.items.length} curated ideas!`, 'success');
          }

          setCurrentBatch(normalized);
          await refreshStats();
        } else {
          showToast("No items in generated mix", 'error');
        }
      } else {
        showToast(res?.error || "Failed to generate mix", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Failed to generate mix", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Mark Used
  const handleMarkUsed = async (ideaId: string, batchItemId: string) => {
    try {
      const res = await api.markUsed(ideaId);
      if (res && res.success) {
        if (currentBatch) {
          const updatedItems = currentBatch.items.map(item => {
            if (item.batch_item_id === batchItemId || item.idea_id === ideaId) {
              return {
                ...item,
                status: 'used' as const,
                idea: { ...item.idea, used: true, used_date: res.used_date }
              };
            }
            return item;
          });
          setCurrentBatch({ ...currentBatch, items: updatedItems });
        }
        showToast(`Marked ${ideaId} as Used. Excluded from future mixes.`, 'success');
        await refreshStats();
      } else {
        showToast(res.error || "Error marking idea as used", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Error marking idea as used", 'error');
    }
  };

  // 3. Undo Used
  const handleUndoUsed = async (ideaId: string, batchItemId: string) => {
    try {
      const res = await api.undoUsed(ideaId);
      if (res && res.success) {
        if (currentBatch) {
          const updatedItems = currentBatch.items.map(item => {
            if (item.batch_item_id === batchItemId || item.idea_id === ideaId) {
              return {
                ...item,
                status: 'shown' as const,
                idea: { ...item.idea, used: false, used_date: null }
              };
            }
            return item;
          });
          setCurrentBatch({ ...currentBatch, items: updatedItems });
        }
        showToast(`Reverted ${ideaId} to available status.`, 'info');
        await refreshStats();
      } else {
        showToast(res.error || "Error reverting idea", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Error reverting idea", 'error');
    }
  };

  // 4. Replace Batch Item
  const handleReplace = async (batchId: string, batchItemId: string, position: number) => {
    try {
      const res = await api.replaceBatchItem(batchId, batchItemId, position, mode);
      if (res && res.success && res.new_item) {
        let newItem = { ...res.new_item, position };

        // If AI refinement is enabled and keys exist, refine the replacement card
        const keys = getConfiguredGeminiKeys(config);
        if (config.ai_refine_batch !== false && keys.length > 0) {
          try {
            const aiSingle = await refineSingleTopicWithGeminiRotation(newItem, config);
            if (aiSingle.refinedItem) {
              newItem = aiSingle.refinedItem;
            }
          } catch (e) {
            console.warn("Single card AI refinement error:", e);
          }
        }

        if (currentBatch) {
          const updatedItems = currentBatch.items.map(item => {
            if (item.batch_item_id === batchItemId) {
              return newItem;
            }
            return item;
          });
          setCurrentBatch({ ...currentBatch, items: updatedItems });
        }
        showToast(`Replaced item #${position} with ${newItem.idea.idea_id}${newItem.ai_refined ? ' (✨ AI Angle)' : ''}!`, 'info');
      } else {
        showToast(res.error || "No replacement candidate available", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Error replacing item", 'error');
    }
  };

  // 5. On-Demand Batch Refinement with Gemini
  const handleRefineBatch = async () => {
    if (!currentBatch || !currentBatch.items.length) return;
    const keys = getConfiguredGeminiKeys(config);
    if (keys.length === 0) {
      showToast("No Gemini API keys configured. Please add one in Settings.", 'error');
      return;
    }

    setIsRefiningBatch(true);
    try {
      const aiRes = await refineBatchWithGeminiRotation(currentBatch.items, config);
      if (aiRes.success && aiRes.refinedItems.length > 0) {
        setCurrentBatch({
          ...currentBatch,
          items: aiRes.refinedItems
        });
        showToast(
          `✨ Refined all ${aiRes.refinedItems.length} topics into YouTube concepts with ${aiRes.modelUsed || 'Gemini'} (Key #${aiRes.keyUsedIndex})!`,
          'success'
        );
      } else {
        showToast(`Refinement failed: ${aiRes.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Refinement error: ${err.message}`, 'error');
    } finally {
      setIsRefiningBatch(false);
    }
  };

  // Save single idea from card directly into Personal Notes Vault
  const handleSaveIdeaToNotes = (idea: ProductionIdea) => {
    try {
      const existing = getLocalNotes();
      if (existing.some(n => n.id === `note-${idea.idea_id}`)) {
        showToast(`"${idea.video_idea.slice(0, 32)}..." is already in your Notes Vault.`, 'info');
        return;
      }

      const promptText = formatTopicCardCopyText(idea);
      const newNote: UserNote = {
        id: `note-${idea.idea_id}`,
        title: idea.video_idea,
        content: `## Idea Hook\n"${idea.curiosity_hook || ''}"\n\n## Category & Lineage\n- **Subject**: ${idea.subject}\n- **Topic Family**: ${idea.topic_family}\n- **Format**: ${idea.signature_format || 'Standard'}\n- **Production Score**: ${idea.production_score}\n\n## Standard AI Research Prompt\n\`\`\`text\n${promptText}\n\`\`\`\n\n## Personal Research Notes\n`,
        category: 'prompts',
        tags: [idea.subject, idea.signature_format || 'Idea', 'DailyMix'].filter(Boolean),
        badge: 'Prompt',
        is_pinned: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [newNote, ...existing];
      saveLocalNotes(updated);
      setNotesCount(updated.length);
      api.saveNote(newNote).catch(err => console.warn("Background D1 note sync:", err));
      showToast(`Saved to Notes & Prompts Vault! (View in Notes)`, 'success');
    } catch (e) {
      console.error("Failed to save idea to notes", e);
      showToast("Could not save to notes.", 'error');
    }
  };

  // Bulk save entire current batch into Notes Vault
  const handleSaveAllBatchToNotes = (ideas: ProductionIdea[]) => {
    if (!ideas || !ideas.length) return;
    try {
      const existing = getLocalNotes();
      let addedCount = 0;
      const toAdd: UserNote[] = [];

      for (const idea of ideas) {
        if (!existing.some(n => n.id === `note-${idea.idea_id}`) && !toAdd.some(n => n.id === `note-${idea.idea_id}`)) {
          const promptText = formatTopicCardCopyText(idea);
          toAdd.push({
            id: `note-${idea.idea_id}`,
            title: idea.video_idea,
            content: `## Idea Hook\n"${idea.curiosity_hook || ''}"\n\n## Category & Lineage\n- **Subject**: ${idea.subject}\n- **Topic Family**: ${idea.topic_family}\n- **Format**: ${idea.signature_format || 'Standard'}\n- **Production Score**: ${idea.production_score}\n\n## Standard AI Research Prompt\n\`\`\`text\n${promptText}\n\`\`\`\n\n## Personal Research Notes\n`,
            category: 'prompts',
            tags: [idea.subject, idea.signature_format || 'Idea', 'DailyMix'].filter(Boolean),
            badge: 'Prompt',
            is_pinned: false,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          addedCount++;
        }
      }

      if (addedCount === 0) {
        showToast("All ideas in this batch are already saved in your Notes Vault.", 'info');
        return;
      }

      const updated = [...toAdd, ...existing];
      saveLocalNotes(updated);
      setNotesCount(updated.length);
      showToast(`Saved all ${addedCount} batch ideas to Notes & Prompts Vault!`, 'success');
    } catch (e) {
      console.error("Failed to save batch ideas to notes", e);
      showToast("Could not save batch to notes.", 'error');
    }
  };

  return (
    <div className="app-root min-h-screen flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-200 relative overflow-x-hidden transition-colors duration-200">
      
      {/* Subtle Ambient Radial Lighting for Visual Depth */}
      <div className="ambient-glow fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/5 via-teal-500/[0.02] to-transparent blur-3xl rounded-full" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-sky-500/[0.02] blur-3xl rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/[0.02] blur-3xl rounded-full" />
      </div>
      
      {/* Top Navigation & KPI Header */}
      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          spreadsheetId={SPREADSHEET_ID}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          notesCount={notesCount}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        
        {isLoading && !currentBatch && activeTab === 'mix' ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
            <p className="text-xs font-mono tracking-wider uppercase text-neutral-400 font-semibold">
              Connecting to Cloudflare D1 Edge Database...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'mix' && (
              <DailyMixPage
                batch={currentBatch}
                mode={mode}
                setMode={setMode}
                size={size}
                setSize={setSize}
                subjectFilter={subjectFilter}
                setSubjectFilter={setSubjectFilter}
                subjectsList={subjectsList}
                onGenerate={handleGenerate}
                onMarkUsed={handleMarkUsed}
                onUndoUsed={handleUndoUsed}
                onReplace={handleReplace}
                isLoading={isLoading}
                onRefineBatch={handleRefineBatch}
                isRefiningBatch={isRefiningBatch}
                aiRefineEnabled={config.ai_refine_batch !== false}
                onToggleAiRefine={(enabled) => {
                  const updated = { ...config, ai_refine_batch: enabled };
                  setConfig(updated);
                  saveConfig(updated);
                }}
                geminiKeysCount={getConfiguredGeminiKeys(config).length}
                preferredModel={config.preferred_gemini_model}
                onSaveToNotes={handleSaveIdeaToNotes}
                onSaveAllToNotes={handleSaveAllBatchToNotes}
              />
            )}

            {activeTab === 'browse' && (
              <BrowsePage onRefreshStats={refreshStats} />
            )}

            {activeTab === 'discovery' && (
              <DiscoveryLabPage 
                onRefreshStats={refreshStats} 
                showToast={showToast} 
              />
            )}

            {activeTab === 'notes' && (
              <NotesPage 
                showToast={showToast} 
                onNotesCountChange={setNotesCount}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                config={config}
                setConfig={setConfig}
                onRefreshAll={initApp}
                spreadsheetId={SPREADSHEET_ID}
                onThemeChange={handleThemeChange}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer border-t border-white/[0.06] backdrop-blur-md py-6 text-center text-xs font-mono relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center space-x-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-neutral-300">KnowSights Content Engine</span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400 font-semibold">Schema 2.0</span>
          </span>
          <span className="text-neutral-400 text-[11px]">
            Primary: <strong className="text-neutral-200">Cloudflare D1 (4,140 rows)</strong> • Backup: <strong className="text-neutral-300">Sheet (1HB4...0qd601w)</strong>
          </span>
        </div>
      </footer>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`glass-panel flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium ${
            toast.type === 'success' 
              ? 'border-emerald-500/40 bg-neutral-950/90 text-emerald-200 shadow-emerald-950/50' 
              : toast.type === 'error' 
                ? 'border-rose-500/40 bg-neutral-950/90 text-rose-200 shadow-rose-950/50' 
                : 'border-sky-500/40 bg-neutral-950/90 text-sky-200 shadow-sky-950/50'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
            <span className="font-semibold">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-neutral-400 hover:text-white ml-2 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
