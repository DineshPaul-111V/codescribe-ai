import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import ReviewTab from './components/ReviewTab';
import DocumentedCodeTab from './components/DocumentedCodeTab';
import ReadmeTab from './components/ReadmeTab';
import { analyzeCode } from './api/client';
import { ShieldCheck, FileCode2, FileText, AlertTriangle, Sparkles, Key, Check } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [inlineKeyInput, setInlineKeyInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [globalError, setGlobalError] = useState('');

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'code' | 'readme'

  useEffect(() => {
    const savedKey = localStorage.getItem('codescribe_groq_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setInlineKeyInput(savedKey);
    }
  }, []);

  const handleSaveInlineKey = (e) => {
    e.preventDefault();
    const trimmed = inlineKeyInput.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    localStorage.setItem('codescribe_groq_api_key', trimmed);
    setGlobalError('');
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setGlobalError('');
    setLoadingMessage('Initializing Groq LLM session...');

    const progressTimer1 = setTimeout(() => {
      setLoadingMessage(`Calling ${model} (Review, Docstrings, README)...`);
    }, 2000);

    const progressTimer2 = setTimeout(() => {
      setLoadingMessage('Parsing review comments & assembling markdown...');
    }, 8000);

    try {
      const data = await analyzeCode({ code, language, source: 'paste', apiKey, model });
      setResults(data);
      setActiveTab('review');

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Analysis failed:', err);
      setGlobalError(err.message || 'An unexpected error occurred during code analysis.');
    } finally {
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const reviewCount = results?.review?.length || 0;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Header apiKey={apiKey} setApiKey={setApiKey} model={model} setModel={setModel} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Code Intelligence in Seconds</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Code Reviews & Documentation, <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">Automated</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Paste a code snippet, upload a file, or enter a public GitHub URL. Get line-by-line review comments, annotated docstrings, and a clean README section in one pass.
          </p>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm shadow-xl flex items-start space-x-3.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-white text-sm">Groq API Key Required</h4>
                <p className="mt-1 text-xs text-red-300/90 leading-relaxed">{globalError}</p>
              </div>

              {(globalError.includes('GROQ_API_KEY') || !apiKey) && (
                <form onSubmit={handleSaveInlineKey} className="p-3 rounded-xl bg-dark-950 border border-red-900/60 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                    <Key className="w-3.5 h-3.5 text-brand-400" />
                    <span>Paste your free Groq API Key (`gsk_...`) below:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={inlineKeyInput}
                      onChange={(e) => setInlineKeyInput(e.target.value)}
                      placeholder="gsk_..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-dark-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!inlineKeyInput.trim()}
                      className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Key & Continue</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Need a key? Get one in 10 seconds at{' '}
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-400 underline hover:text-brand-300"
                    >
                      console.groq.com
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Input Section */}
        <CodeInput
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
        />

        {/* Results Section */}
        {results && (
          <div id="results-section" className="pt-4 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Analysis Results</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Model: llama-3.3-70b-versatile
              </span>
            </div>

            {/* Results 3-Tab Header */}
            <div className="flex items-center space-x-2 border-b border-slate-800/80">
              <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'review'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Code Review</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  reviewCount > 0 ? 'bg-brand-500/20 text-brand-300' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {reviewCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'code'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-4 h-4" />
                <span>Documented Code</span>
              </button>

              <button
                onClick={() => setActiveTab('readme')}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'readme'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>README.md Summary</span>
              </button>
            </div>

            {/* Active Tab Panels */}
            <div className="pt-2">
              {activeTab === 'review' && (
                <ReviewTab
                  review={results.review}
                  errorMessage={results.errors?.review}
                />
              )}

              {activeTab === 'code' && (
                <DocumentedCodeTab
                  code={results.documentedCode}
                  language={language}
                  errorMessage={results.errors?.documentedCode}
                />
              )}

              {activeTab === 'readme' && (
                <ReadmeTab
                  readme={results.readme}
                  errorMessage={results.errors?.readme}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-dark-950 py-6 text-center text-xs text-slate-500">
        <p>CodeScribe — Built with Groq API & React + Tailwind CSS</p>
      </footer>
    </div>
  );
}
