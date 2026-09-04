import React from 'react';
import { 
  Compass, 
  Sparkles, 
  Layers, 
  Shuffle, 
  RotateCcw, 
  Zap, 
  Globe2,
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { SelectionMode } from '../types';

interface BatchControlsProps {
  mode: SelectionMode;
  setMode: (mode: SelectionMode) => void;
  size: number;
  setSize: (size: number) => void;
  subjectFilter: string;
  setSubjectFilter: (subj: string) => void;
  subjectsList: string[];
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  aiRefineEnabled?: boolean;
  onToggleAiRefine?: (enabled: boolean) => void;
  geminiKeysCount?: number;
  preferredModel?: string;
}

const MODES: { id: SelectionMode; label: string; icon: any; desc: string }[] = [
  { 
    id: 'BALANCED', 
    label: 'Balanced', 
    icon: Compass, 
    desc: 'Equitable rotation across subjects & formats with recency cooldown' 
  },
  { 
    id: 'DISCOVERY', 
    label: 'Discovery', 
    icon: Sparkles, 
    desc: 'Strongly prioritize fresh ideas that have never been shown' 
  },
  { 
    id: 'DEEP_DIVE', 
    label: 'Deep Dive', 
    icon: Layers, 
    desc: 'Explore diverse topics exclusively within a selected subject' 
  },
  { 
    id: 'REVISIT_UNUSED', 
    label: 'Revisit Unused', 
    icon: RotateCcw, 
    desc: 'Surface previously shown but unconsumed ideas for a second look' 
  },
  { 
    id: 'CURRENT_EMERGING', 
    label: 'Current & Emerging', 
    icon: Globe2, 
    desc: 'Heavily weight emerging tech, geopolitical, and science subjects' 
  },
  { 
    id: 'RANDOM', 
    label: 'Random', 
    icon: Shuffle, 
    desc: 'High-entropy exploration while strictly excluding used ideas' 
  }
];

export const BatchControls: React.FC<BatchControlsProps> = ({
  mode,
  setMode,
  size,
  setSize,
  subjectFilter,
  setSubjectFilter,
  subjectsList,
  onGenerate,
  isLoading,
  aiRefineEnabled = true,
  onToggleAiRefine,
  geminiKeysCount = 0,
  preferredModel
}) => {
  const currentModeObj = MODES.find(m => m.id === mode) || MODES[0];
  const hasGeminiKeys = geminiKeysCount > 0;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-8 border border-neutral-800/90 space-y-6">
      
      {/* Selection Modes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Selection Strategy</span>
          </label>
          <span className="text-xs text-neutral-400 hidden sm:inline">{currentModeObj.desc}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-500/70 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="font-semibold">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Controls Bar: Count, Subject Filter, AI Refine Toggle, and Generate Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 border-t border-neutral-900">
        
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Idea Count Stepper */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Mix Size
            </label>
            <div className="flex items-center space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              {[6, 12, 18, 24].map((num) => (
                <button
                  key={num}
                  onClick={() => setSize(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    size === num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5 flex items-center justify-between">
              <span>Subject Scope {mode === 'DEEP_DIVE' && <span className="text-indigo-400 font-bold">(Required)</span>}</span>
              {subjectFilter && (
                <button 
                  onClick={() => setSubjectFilter('')}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-medium appearance-none focus:outline-none focus:border-emerald-500 pr-8"
              >
                <option value="">All Subjects {subjectsList.length > 0 ? `(${subjectsList.length} Disciplines)` : '(Broad Mix)'}</option>
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* AI YouTube Angle Refinement Toggle (Gemini Multi-Key) */}
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Gemini AI Refinement
            </label>
            <button
              type="button"
              onClick={() => onToggleAiRefine && onToggleAiRefine(!aiRefineEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                aiRefineEnabled && hasGeminiKeys
                  ? 'bg-gradient-to-r from-violet-950/70 to-indigo-950/70 border-violet-500/50 text-violet-200 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/20'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title={
                hasGeminiKeys
                  ? `Click to toggle Gemini AI refinement (${geminiKeysCount} key${geminiKeysCount > 1 ? 's' : ''} active, ${preferredModel || 'flash models'}). Refines academic topics into YouTube concepts.`
                  : "Configure Gemini API keys in Settings to enable YouTube angle refinement"
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiRefineEnabled && hasGeminiKeys ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-neutral-500'}`} />
              <span>YouTube Angles</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                aiRefineEnabled && hasGeminiKeys
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-800 text-neutral-500'
              }`}>
                {aiRefineEnabled && hasGeminiKeys ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

        </div>

        {/* PRIMARY GENERATE BUTTON */}
        <button
          onClick={onGenerate}
          disabled={isLoading || (mode === 'DEEP_DIVE' && !subjectFilter)}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-sm tracking-wide shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{aiRefineEnabled && hasGeminiKeys ? 'Generating & Refining...' : 'Mixing Candidates...'}</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Generate Fresh Mix ({size})</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
