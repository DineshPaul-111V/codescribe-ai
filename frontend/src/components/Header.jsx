import React, { useState } from 'react';
import { Code2, Zap, Github, Sparkles, Key, CheckCircle, X, Cpu } from 'lucide-react';

export default function Header({ apiKey, setApiKey, model = 'llama-3.3-70b-versatile', setModel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('codescribe_groq_api_key', trimmed);
    } else {
      localStorage.removeItem('codescribe_groq_api_key');
    }
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    localStorage.removeItem('codescribe_groq_api_key');
    setIsModalOpen(false);
  };

  const isKeyPresent = Boolean(apiKey && apiKey.trim());

  return (
    <header className="border-b border-slate-800/80 bg-dark-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Left Branding */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Code<span className="text-brand-500">Scribe</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Groq AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instant code reviews & auto-generated docs powered by Groq
            </p>
          </div>
        </div>

        {/* Right Badges & Model / API Key Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 self-end sm:self-center">
          
          {/* Model Selector */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-dark-950 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-mono"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b (High Quality)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b (High Rate Limit)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setTempKey(apiKey || '');
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isKeyPresent
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-900/50'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isKeyPresent ? 'API Key Set' : 'Configure API Key'}</span>
            {isKeyPresent && <CheckCircle className="w-3 h-3 text-emerald-400" />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Source</span>
          </a>
        </div>

      </div>

      {/* API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Groq API Key Setup</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enter your Groq API key to enable AI reviews and doc generation. You can get a free API key at{' '}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 underline hover:text-brand-300"
              >
                console.groq.com
              </a>. Keys are stored locally in your browser.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Groq API Key (`gsk_...`):
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
