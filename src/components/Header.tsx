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
  Check, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { SystemStats } from '../types';
import { DISCOVERY_SOURCES } from '../data/discoverySources';

export type ThemeOption = 'dark' | 'sepia' | 'solarized-dark' | 'solarized-light';

interface HeaderProps {
  activeTab: 'mix' | 'browse' | 'discovery' | 'notes' | 'settings';
  setActiveTab: (tab: 'mix' | 'browse' | 'discovery' | 'notes' | 'settings') => void;
  stats: SystemStats | null;
  spreadsheetId: string;
  currentTheme?: ThemeOption;
  onThemeChange?: (theme: ThemeOption) => void;
  notesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  spreadsheetId,
  currentTheme = 'dark',
  onThemeChange,
  notesCount = 0
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

  const tabs: { 
    id: 'mix' | 'browse' | 'discovery' | 'notes' | 'settings'; 
    label: string; 
    shortLabel: string;
    icon: any; 
    badge?: string | number;
    highlight?: boolean;
  }[] = [
    { 
      id: 'mix', 
      label: "Today's Mix", 
      shortLabel: "Mix",
      icon: Compass 
    },
    { 
      id: 'browse', 
      label: "Production Pool", 
      shortLabel: "Pool",
      icon: Search, 
      badge: stats ? stats.total_ideas : undefined 
    },
    { 
      id: 'discovery', 
      label: "Discovery Lab", 
      shortLabel: "Lab",
      icon: Radio, 
      badge: `${DISCOVERY_SOURCES.length}` 
    },
    { 
      id: 'notes', 
      label: "Notes & Prompts", 
      shortLabel: "Notes",
      icon: FileText, 
      badge: notesCount,
      highlight: true
    },
    { 
      id: 'settings', 
      label: "Settings", 
      shortLabel: "Config",
      icon: Settings 
    },
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
    <header className="app-header border-b sticky top-0 z-50 transition-colors shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Tier 1: Brand & Top Utilities Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('mix')}
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 cursor-pointer group select-none"
            title="KnowSights Content Engine"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <div className="w-full h-full app-header-logo-bg rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-base sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  KnowSights
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  Schema 2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium hidden md:block">
                Curated Content Idea Mixer • Zero AI Costs
              </p>
            </div>
          </div>

          {/* Right Action Bar: Quick Jump to Notes, D1 Status, Theme, Sheet */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Quick Direct Link to Notes & Prompts Vault */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/40 shadow-glow-emerald'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-neutral-200 hover:text-white'
              }`}
              title="Open Personal Notes & AI Prompts Vault"
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'notes' ? 'text-emerald-400' : 'text-emerald-400'}`} />
              <span className="font-bold hidden sm:inline">Notes Vault</span>
              <span className="sm:hidden font-bold">Notes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                {notesCount}
              </span>
            </button>

            {/* Cloudflare D1 Connection Badge */}
            <span 
              className="inline-flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[11px] font-semibold"
              title="Primary Datastore: Cloudflare D1 Serverless Edge SQL (knowsights-db, 4,140 ideas)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
              <span className="hidden md:inline">Cloudflare D1 ⚡</span>
              <span className="md:hidden">D1 ⚡</span>
            </span>

            {/* Theme Selector Dropdown */}
            <div className="relative z-50" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono transition-all shadow-sm cursor-pointer ${
                  showThemeMenu 
                    ? 'bg-white/[0.1] border-emerald-500/50 text-white ring-1 ring-emerald-500/40' 
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-neutral-300 hover:text-white'
                }`}
                title="Change theme (Obsidian Dark, Warm Sepia, Solarized Dark, Solarized Light)"
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
                <span className="hidden lg:inline capitalize font-medium text-[11px]">
                  {currentTheme.replace('-', ' ')}
                </span>
              </button>

              {showThemeMenu && (
                <div className="app-theme-menu absolute right-0 top-full mt-2 w-72 rounded-2xl p-2.5 z-[100] backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-white/[0.08] mb-1.5 flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Theme & Readability</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">4 Modes</span>
                  </div>
                  <div className="space-y-1.5">
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
                          className={`theme-menu-item w-full text-left flex items-start space-x-2.5 p-2 rounded-xl text-xs cursor-pointer ${
                            isSelected 
                              ? 'theme-menu-item-active ring-1' 
                              : ''
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
                            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5 line-clamp-1">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Google Sheet Link */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-emerald-300 transition-all group"
              title="Open Google Sheet visual database backup"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
              <span className="hidden xl:inline">Sheet</span>
              <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
            </a>
          </div>

        </div>

        {/* Tier 2: Dedicated Primary Navigation Bar - Fully Visible on ALL screen sizes */}
        <div className="pb-2.5 pt-1 border-t border-white/[0.06]">
          <nav className="grid grid-cols-5 gap-1 sm:flex sm:items-center sm:justify-center sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-2 py-2 px-1.5 sm:px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-sm ring-1 ring-emerald-500/40 border border-emerald-500/40'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                  <span className="text-[11px] sm:text-xs font-semibold truncate text-center">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold hidden sm:inline ${
                      tab.highlight
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.08] text-neutral-300 border border-white/[0.1]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tier 3: Live KPI Metrics & Invariant Ribbon */}
        {stats && (
          <div className="py-2 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Total Pool:</span>
              <span className="text-white font-bold tracking-tight">{(stats.total_ideas ?? 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Available:</span>
              <span className="text-white font-bold tracking-tight">{(stats.available_ideas ?? 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Used:</span>
              <span className="text-amber-300 font-bold tracking-tight">{(stats.used_ideas ?? 0).toLocaleString()}</span>
              <span className="text-neutral-400">({stats.used_percentage ?? 0}%)</span>
            </div>

            <div 
              onClick={() => setActiveTab('notes')}
              className="flex items-center space-x-2 text-neutral-400 hover:text-emerald-300 cursor-pointer transition-colors"
              title="Click to open Personal Notes Vault"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved Notes:</span>
              <span className="text-emerald-400 font-bold tracking-tight">{notesCount}</span>
            </div>

            <div className="hidden sm:flex items-center justify-end text-neutral-400 space-x-1">
              <span 
                className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.08] text-emerald-400 font-bold tracking-wider"
                title="Strict Invariant: Viewing a card in daily mix increments Times Shown and records Last Shown, but does NOT consume the idea until explicitly clicked Used"
              >
                SHOWN != USED
              </span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
