import React, { useState, useEffect } from 'react';
import { 
  DailyBatch, 
  SystemStats, 
  SelectionMode, 
  AppConfig 
} from './types';
import { api, loadConfig, saveConfig, normalizeStats, normalizeBatch } from './services/api';
import { Header, ThemeOption } from './components/Header';
import { DailyMixPage } from './pages/DailyMixPage';
import { BrowsePage } from './pages/BrowsePage';
import { DiscoveryLabPage } from './pages/DiscoveryLabPage';
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
  const [activeTab, setActiveTab] = useState<'mix' | 'browse' | 'discovery' | 'settings'>('mix');
  const [config, setConfig] = useState<AppConfig>(loadConfig());
  const [currentBatch, setCurrentBatch] = useState<DailyBatch | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  
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

  // 1. Generate Fresh Batch
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateBatch(mode, size, subjectFilter);
      if (res && res.success) {
        const normalized = normalizeBatch(res);
        if (normalized) {
          setCurrentBatch(normalized);
          showToast(`Generated fresh ${mode} mix with ${normalized.items.length} curated ideas!`, 'success');
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
        if (currentBatch) {
          const updatedItems = currentBatch.items.map(item => {
            if (item.batch_item_id === batchItemId) {
              return { ...res.new_item, position };
            }
            return item;
          });
          setCurrentBatch({ ...currentBatch, items: updatedItems });
        }
        showToast(`Replaced item #${position} with ${res.new_item.idea.idea_id}`, 'info');
      } else {
        showToast(res.error || "No replacement candidate available", 'error');
      }
    } catch (err: any) {
      showToast(err.message || "Error replacing item", 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      
      {/* Top Navigation & KPI Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        spreadsheetId={SPREADSHEET_ID}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {isLoading && !currentBatch && activeTab === 'mix' ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm font-mono text-neutral-400">Connecting to Cloudflare D1 Edge Database...</p>
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
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KnowSights Content Engine • Schema 2.0</span>
          <span>Primary: Cloudflare D1 (4,140 rows) • Backup: Sheet (1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w)</span>
        </div>
      </footer>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`glass-panel flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium ${
            toast.type === 'success' 
              ? 'border-emerald-500/50 bg-neutral-900 text-emerald-300 shadow-emerald-950/50' 
              : toast.type === 'error' 
                ? 'border-rose-500/50 bg-neutral-900 text-rose-300 shadow-rose-950/50' 
                : 'border-sky-500/50 bg-neutral-900 text-sky-300 shadow-sky-950/50'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-neutral-500 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
