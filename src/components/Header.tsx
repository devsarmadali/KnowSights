import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Search, 
  Settings, 
  FileSpreadsheet, 
  ExternalLink,
  CheckCircle2, 
  Compass,
  Radio,
  Palette,
  Moon,
  Sun,
  BookOpen,
  Check
} from 'lucide-react';
import { SystemStats } from '../types';

export type ThemeOption = 'dark' | 'sepia' | 'solarized-dark' | 'solarized-light';

interface HeaderProps {
  activeTab: 'mix' | 'browse' | 'discovery' | 'settings';
  setActiveTab: (tab: 'mix' | 'browse' | 'discovery' | 'settings') => void;
  stats: SystemStats | null;
  spreadsheetId: string;
  currentTheme?: ThemeOption;
  onThemeChange?: (theme: ThemeOption) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  spreadsheetId,
  currentTheme = 'dark',
  onThemeChange
}) => {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: 'mix' | 'browse' | 'discovery' | 'settings'; label: string; icon: any; badge?: string }[] = [
    { id: 'mix', label: "Today's Ideas", icon: Compass },
    { id: 'browse', label: "Production Pool", icon: Search },
    { id: 'discovery', label: "Discovery Lab", icon: Radio, badge: "54 Sources" },
    { id: 'settings', label: "Settings", icon: Settings },
  ];

  const themes: { id: ThemeOption; label: string; icon: any; desc: string; previewClass: string }[] = [
    { 
      id: 'dark', 
      label: 'Obsidian Dark', 
      icon: Moon, 
      desc: 'High-contrast dark mode with neon emerald accents',
      previewClass: 'bg-neutral-950 border-neutral-800 text-neutral-100'
    },
    { 
      id: 'sepia', 
      label: 'Warm Sepia', 
      icon: BookOpen, 
      desc: 'Warm paper & ink palette engineered for zero eye strain',
      previewClass: 'bg-[#221d18] border-[#4a3e35] text-[#f7eee2]'
    },
    { 
      id: 'solarized-dark', 
      label: 'Solarized Dark', 
      icon: Palette, 
      desc: 'Classic Ethan Schoonover deep teal precision dark',
      previewClass: 'bg-[#002b36] border-[#0e4c5b] text-[#93a1a1]'
    },
    { 
      id: 'solarized-light', 
      label: 'Solarized Light', 
      icon: Sun, 
      desc: 'Clean parchment day mode with sharp contrast',
      previewClass: 'bg-[#fdf6e3] border-[#d3cbb4] text-[#586e75]'
    },
  ];

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-lg tracking-tight text-white">KnowSights</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Schema 2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Curated Content Idea Mixer • Zero AI</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold ml-0.5 hidden lg:inline">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Theme Switcher, Cloudflare D1 Active Badge & Sheet Backup */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Selector Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-all shadow-sm"
                title="Change theme (Dark, Sepia, Solarized Dark, Solarized Light)"
                aria-label="Theme selection"
              >
                {currentTheme === 'sepia' ? (
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                ) : currentTheme === 'solarized-dark' ? (
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                ) : currentTheme === 'solarized-light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden sm:inline capitalize font-medium text-[11px]">
                  {currentTheme.replace('-', ' ')}
                </span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-neutral-800/80 mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Theme & Readability</p>
                  </div>
                  <div className="space-y-1">
                    {themes.map((t) => {
                      const Icon = t.icon;
                      const isSelected = currentTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            if (onThemeChange) onThemeChange(t.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left flex items-start space-x-2.5 p-2 rounded-xl text-xs transition-all ${
                            isSelected 
                              ? 'bg-neutral-800 text-white ring-1 ring-neutral-700' 
                              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border flex-shrink-0 mt-0.5 ${t.previewClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-neutral-200">{t.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                            </div>
                            <p className="text-[10px] text-neutral-500 leading-snug mt-0.5 line-clamp-1">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <span 
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold"
              title="Primary Datastore: Cloudflare D1 Serverless Edge SQL (knowsights-db)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Cloudflare D1 ⚡</span>
              <span className="sm:hidden">D1 ⚡</span>
            </span>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-emerald-300 transition-all group"
              title="Open Google Sheet backup"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
              <span className="hidden sm:inline">Sheet</span>
              <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400" />
            </a>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-neutral-900 py-2 space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live KPI Metrics Bar */}
        {stats && (
          <div className="py-2.5 border-t border-neutral-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>Total Pool:</span>
              <span className="text-neutral-100 font-bold">{(stats.total_ideas ?? 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-emerald-400/90">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Available:</span>
              <span className="text-white font-bold">{(stats.available_ideas ?? 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Used:</span>
              <span className="text-amber-300 font-bold">{(stats.used_ideas ?? 0).toLocaleString()}</span>
              <span className="text-neutral-500">({stats.used_percentage ?? 0}%)</span>
            </div>

            <div className="hidden sm:flex items-center justify-end text-neutral-500 space-x-1">
              <span className="text-[11px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-emerald-400 font-bold">
                SHOWN != USED
              </span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
