import React, { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Server,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Key,
  Bot,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Palette,
  Moon,
  Sun,
  BookOpen
} from 'lucide-react';
import { AppConfig } from '../types';
import { DEFAULT_CONFIG, loadConfig, saveConfig, DEFAULT_WEB_APP_URL, api } from '../services/api';
import { testGeminiApiKey } from '../services/gemini';

interface SettingsPageProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  onRefreshAll: () => Promise<void>;
  spreadsheetId: string;
  onThemeChange?: (theme: 'dark' | 'sepia' | 'solarized-dark' | 'solarized-light') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  config,
  setConfig,
  onRefreshAll,
  spreadsheetId,
  onThemeChange
}) => {
  const [formData, setFormData] = useState<AppConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Gemini Key Testing & Visibility State
  const [showKey1, setShowKey1] = useState(false);
  const [showKey2, setShowKey2] = useState(false);
  const [showKey3, setShowKey3] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ [key: number]: { loading: boolean; valid?: boolean; message?: string } }>({});

  const handleTestGeminiKey = async (keyNum: 1 | 2 | 3) => {
    const keyVal = keyNum === 1 ? formData.gemini_api_key_1 : keyNum === 2 ? formData.gemini_api_key_2 : formData.gemini_api_key_3;
    if (!keyVal || !keyVal.trim()) {
      setKeyTestStatus(prev => ({ ...prev, [keyNum]: { loading: false, valid: false, message: "Please enter an API key first." } }));
      return;
    }

    setKeyTestStatus(prev => ({ ...prev, [keyNum]: { loading: true } }));
    const result = await testGeminiApiKey(keyVal);
    setKeyTestStatus(prev => ({
      ...prev,
      [keyNum]: {
        loading: false,
        valid: result.valid,
        message: result.valid ? `✓ Key verified (${result.model || 'gemini-2.5-flash'} active)` : `✗ ${result.error}`
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      saveConfig(formData);
      setConfig(formData);

      const remoteRes = await api.saveConfig(formData);
      if (remoteRes && remoteRes.success) {
        setTestResult({ 
          success: true, 
          message: "✓ Settings successfully synced & saved directly to Cloudflare D1 edge datastore." 
        });
      } else {
        setTestResult({ 
          success: true, 
          message: "Settings saved to local storage cache." 
        });
      }
      await onRefreshAll();
    } catch (err: any) {
      setTestResult({ 
        success: false, 
        message: `Saved locally. Cloudflare D1 sync warning: ${err.message || err}` 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = (formData.google_web_app_url || DEFAULT_WEB_APP_URL).trim();
      const res = await fetch(`${url}?action=get_initial_data`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTestResult({
            success: true,
            message: `Connected successfully! Found ${json.stats?.total_ideas || 0} ideas in Production Pool.`
          });
        } else {
          setTestResult({
            success: false,
            message: json.error || "Endpoint returned an error."
          });
        }
      } else {
        setTestResult({
          success: false,
          message: `HTTP ${res.status}: ${res.statusText}`
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`// Refer to scripts/knowsights_backend.gs in this workspace`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-display font-bold text-white">System Settings & Connections</h2>
          <p className="text-xs text-neutral-400">Schema 2.0 Google Sheets backend configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          <span>{saving ? 'Syncing to D1...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* 1. Universal Database Connection (Cloudflare D1 & Google Sheets) */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Database & Backend Endpoint</h3>
              <p className="text-xs text-neutral-400">High-performance Cloudflare D1 Edge SQL with Google Sheets fallback</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFormData({ ...formData, google_web_app_url: 'https://knowsights-api.excisetools.workers.dev' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border transition-all ${
                (formData.google_web_app_url || '').includes('workers.dev')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              ⚡ Cloudflare D1 (Fastest)
            </button>
            <button
              onClick={() => setFormData({ ...formData, google_web_app_url: 'https://script.google.com/macros/s/AKfycbzrJo3mT73UlHp5EbXwzteWdebFzMQunRIV0YY_44j_OvVhDhXRcvFqMieE2FrsL4kK_g/exec' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border transition-all ${
                (formData.google_web_app_url || '').includes('script.google.com')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              📊 Google Sheets
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="url"
            value={formData.google_web_app_url}
            onChange={(e) => setFormData({ ...formData, google_web_app_url: e.target.value })}
            placeholder="https://knowsights-api.excisetools.workers.dev"
            className="w-full bg-neutral-900 text-white font-mono text-xs border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-mono text-[11px]">
              D1 Database: <code className="text-emerald-400">knowsights-db (4,140 rows)</code> • Sheet ID: <code className="text-neutral-300">{spreadsheetId}</code>
            </span>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 hover:text-emerald-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            testResult.success 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* 2. Gemini Multi-Key Auto-Rotation Engine */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-5 bg-neutral-950/60">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Gemini AI Multi-Key Engine</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  3-Key Auto-Rotation
                </span>
              </div>
              <p className="text-xs text-neutral-400">Configure up to 3 Gemini API keys for seamless auto-failover during topic generation</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              Model: gemini-2.5-flash
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Key 1: Primary */}
          <div className="space-y-1.5 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Primary Gemini API Key (Key 1)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestGeminiKey(1)}
                disabled={keyTestStatus[1]?.loading}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{keyTestStatus[1]?.loading ? 'Testing...' : 'Test Key 1'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey1 ? 'text' : 'password'}
                value={formData.gemini_api_key_1 || ''}
                onChange={(e) => setFormData({ ...formData, gemini_api_key_1: e.target.value })}
                placeholder="AIzaSy... (Paste primary Gemini API key)"
                className="w-full bg-neutral-950 text-white font-mono text-xs border border-neutral-800 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowKey1(!showKey1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showKey1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {keyTestStatus[1]?.message && (
              <p className={`text-[11px] font-mono mt-1 ${keyTestStatus[1].valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {keyTestStatus[1].message}
              </p>
            )}
          </div>

          {/* Key 2: Secondary / Backup */}
          <div className="space-y-1.5 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Secondary Gemini API Key (Key 2 — Failover 1)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestGeminiKey(2)}
                disabled={keyTestStatus[2]?.loading}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{keyTestStatus[2]?.loading ? 'Testing...' : 'Test Key 2'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey2 ? 'text' : 'password'}
                value={formData.gemini_api_key_2 || ''}
                onChange={(e) => setFormData({ ...formData, gemini_api_key_2: e.target.value })}
                placeholder="AIzaSy... (Paste backup Gemini API key)"
                className="w-full bg-neutral-950 text-white font-mono text-xs border border-neutral-800 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowKey2(!showKey2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showKey2 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {keyTestStatus[2]?.message && (
              <p className={`text-[11px] font-mono mt-1 ${keyTestStatus[2].valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {keyTestStatus[2].message}
              </p>
            )}
          </div>

          {/* Key 3: Tertiary / Backup */}
          <div className="space-y-1.5 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Tertiary Gemini API Key (Key 3 — Failover 2)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestGeminiKey(3)}
                disabled={keyTestStatus[3]?.loading}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{keyTestStatus[3]?.loading ? 'Testing...' : 'Test Key 3'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey3 ? 'text' : 'password'}
                value={formData.gemini_api_key_3 || ''}
                onChange={(e) => setFormData({ ...formData, gemini_api_key_3: e.target.value })}
                placeholder="AIzaSy... (Paste 2nd backup Gemini API key)"
                className="w-full bg-neutral-950 text-white font-mono text-xs border border-neutral-800 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowKey3(!showKey3)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showKey3 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {keyTestStatus[3]?.message && (
              <p className={`text-[11px] font-mono mt-1 ${keyTestStatus[3].valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {keyTestStatus[3].message}
              </p>
            )}
          </div>
        </div>

        {/* Rotation Architecture Note */}
        <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 text-xs text-neutral-300 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px]">
            <p className="font-bold text-white">How 3-Key Auto-Rotation Works:</p>
            <p className="text-neutral-400 leading-relaxed">
              When searching & generating topics in the Discovery Lab, the system requests Gemini using <strong>Key 1</strong> (defaulting to <code>gemini-2.5-flash</code>). If Key 1 reaches free tier rate limits (HTTP 429) or errors, the engine automatically falls over to <strong>Key 2</strong>, and subsequently <strong>Key 3</strong>. If no keys are provided, it smoothly uses the built-in deterministic synthesis rules.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Theme & Readability Appearance */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Theme & Readability Appearance</h3>
              <p className="text-xs text-neutral-400">Choose between high-contrast dark, bookish warm sepia, or precision solarized</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl capitalize">
            Active: {(formData.theme || 'dark').replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'dark' as const,
              name: 'Obsidian Dark',
              icon: Moon,
              desc: 'High-contrast obsidian with emerald accents',
              bgClass: 'bg-neutral-950 border-neutral-800 text-white',
              accent: 'text-emerald-400'
            },
            {
              id: 'sepia' as const,
              name: 'Warm Sepia',
              icon: BookOpen,
              desc: 'Paper & warm ink for zero eye strain',
              bgClass: 'bg-[#221d18] border-[#4a3e35] text-[#f7eee2]',
              accent: 'text-amber-400'
            },
            {
              id: 'solarized-dark' as const,
              name: 'Solarized Dark',
              icon: Palette,
              desc: 'Ethan Schoonover deep teal precision',
              bgClass: 'bg-[#002b36] border-[#0e4c5b] text-[#fdf6e3]',
              accent: 'text-cyan-400'
            },
            {
              id: 'solarized-light' as const,
              name: 'Solarized Light',
              icon: Sun,
              desc: 'Crisp parchment daylight readability',
              bgClass: 'bg-[#fdf6e3] border-[#d3cbb4] text-[#073642]',
              accent: 'text-blue-500'
            }
          ].map((themeItem) => {
            const Icon = themeItem.icon;
            const isSelected = (formData.theme || 'dark') === themeItem.id;
            return (
              <button
                key={themeItem.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, theme: themeItem.id });
                  if (onThemeChange) onThemeChange(themeItem.id);
                }}
                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${themeItem.bgClass} ${
                  isSelected ? 'ring-2 ring-emerald-400 shadow-lg' : 'hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/10">
                    <Icon className={`w-4 h-4 ${themeItem.accent}`} />
                  </div>
                  {isSelected && (
                    <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <p className="font-bold text-xs">{themeItem.name}</p>
                <p className="text-[10px] opacity-75 mt-1 leading-snug">{themeItem.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Runtime Mixer Rules (App Config) */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Topic Mixer Configuration</h3>
            <p className="text-xs text-neutral-400">Editable parameters matching App Config rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Default Mix Size */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <label className="font-semibold text-white block">Default Daily Mix Size</label>
            <p className="text-neutral-400 text-[11px]">Number of ideas selected per daily batch</p>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.daily_mix_size}
              onChange={(e) => setFormData({ ...formData, daily_mix_size: Number(e.target.value) })}
              className="w-full bg-neutral-950 text-white font-mono rounded-lg px-3 py-1.5 border border-neutral-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cooldown Days */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <label className="font-semibold text-white block">Exposure Cooldown (Days)</label>
            <p className="text-neutral-400 text-[11px]">Penalty period before shown idea repeats</p>
            <input
              type="number"
              min="1"
              max="90"
              value={formData.cooldown_days}
              onChange={(e) => setFormData({ ...formData, cooldown_days: Number(e.target.value) })}
              className="w-full bg-neutral-950 text-white font-mono rounded-lg px-3 py-1.5 border border-neutral-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Max Same Subject */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <label className="font-semibold text-white block">Max Same Subject per Batch</label>
            <p className="text-neutral-400 text-[11px]">Soft cap on ideas from a single subject</p>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.max_same_subject}
              onChange={(e) => setFormData({ ...formData, max_same_subject: Number(e.target.value) })}
              className="w-full bg-neutral-950 text-white font-mono rounded-lg px-3 py-1.5 border border-neutral-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Max Same Signature Format */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <label className="font-semibold text-white block">Max Same Signature Format</label>
            <p className="text-neutral-400 text-[11px]">Soft cap on repeating presentation formats</p>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.max_same_signature_format}
              onChange={(e) => setFormData({ ...formData, max_same_signature_format: Number(e.target.value) })}
              className="w-full bg-neutral-950 text-white font-mono rounded-lg px-3 py-1.5 border border-neutral-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>
      </div>

      {/* 3. 1-Click Inventory Synchronization & Promotion */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Full Inventory Synchronization (3,960 Ideas)</h3>
              <p className="text-xs text-neutral-400">Promote Master Taxonomy into Production Pool with Idea IDs & Formats</p>
            </div>
          </div>
          <button
            onClick={async () => {
              setTesting(true);
              setTestResult(null);
              try {
                const res = await (api as any).syncInventory();
                if (res && res.success) {
                  setTestResult({
                    success: true,
                    message: res.message || `Successfully synchronized ${res.total_ideas || 3960} ideas into Production Pool!`
                  });
                  await onRefreshAll();
                } else {
                  setTestResult({
                    success: false,
                    message: res?.error || "Sync returned an error. Ensure scripts/knowsights_backend.gs is deployed in Apps Script."
                  });
                }
              } catch (e: any) {
                setTestResult({ success: false, message: `Sync error: ${e.message}` });
              } finally {
                setTesting(false);
              }
            }}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Synchronizing...' : 'Sync Master Taxonomy to Production Pool'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-emerald-400">💡 Why was Production Pool / Content Candidates partially filled?</p>
          <p className="text-neutral-400">
            The raw 3,960 rows reside in the <code>Master Taxonomy</code> tab. Under Schema 2.0, the <code>Production Pool</code> requires curated fields (<strong>Idea ID</strong>, <strong>Curiosity Hook</strong>, <strong>Signature Format</strong>, and <strong>Production Score</strong>). Clicking the button above automatically structures and formats all 3,960 items into the Production Pool so every single idea is 100% ready to copy for video research and generation.
          </p>
        </div>
      </div>

      {/* 4. Deployment & Setup Guide */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Sheet Apps Script Setup</h3>
            <p className="text-xs text-neutral-400">How to deploy or update the backend code</p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300 leading-relaxed">
          <li>
            Open your Google Sheet: <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-mono">1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w</a>
          </li>
          <li>Click <strong>Extensions → Apps Script</strong> in the menu.</li>
          <li>Copy the code from <code>scripts/knowsights_backend.gs</code> and paste it into <code>Code.gs</code>.</li>
          <li>Click <strong>Deploy → Manage Deployments → Edit (pencil) → New Version → Deploy</strong>.</li>
          <li>Copy the Web App URL and paste it in the field above, then click <strong>Save Changes</strong>.</li>
        </ol>
      </div>

    </div>
  );
};
