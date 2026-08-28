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
  Check
} from 'lucide-react';
import { AppConfig } from '../types';
import { DEFAULT_CONFIG, loadConfig, saveConfig, DEFAULT_WEB_APP_URL, api } from '../services/api';

interface SettingsPageProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  onRefreshAll: () => Promise<void>;
  spreadsheetId: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  config,
  setConfig,
  onRefreshAll,
  spreadsheetId
}) => {
  const [formData, setFormData] = useState<AppConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [saving, setSaving] = useState(false);

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

      {/* 2. Runtime Mixer Rules (App Config) */}
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
