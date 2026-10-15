import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [threshold, setThreshold] = useState('0.70');
  const [language, setLanguage] = useState('mr');
  const [vectorTopK, setVectorTopK] = useState('3');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>System Settings & Parameters (प्रशासकीय सेटिंग्ज)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure model confidence evaluation thresholds, RAG search top-K parameters, and language fallbacks.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-2xl">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Disease Model Low Confidence Threshold (कमी अचूकता मर्यादा)
            </label>
            <input
              type="text"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Scans with confidence below this threshold will display an explicit KVK verification alert.
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Default System Language Preference
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
            >
              <option value="mr">मराठी (Marathi - Primary)</option>
              <option value="en">English (secondary)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              ChromaDB RAG Document Retrieval Top-K Results
            </label>
            <input
              type="number"
              value={vectorTopK}
              onChange={(e) => setVectorTopK(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
            />
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Admin settings saved successfully.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
};
