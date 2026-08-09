import React, { useState } from 'react';
import { FileCode, Upload, Github, Play, Loader2, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { fetchGithubFile } from '../api/client';

const LANGUAGES = [
  { id: 'auto', name: 'Auto-detect' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' }
];

const PRESETS = [
  {
    name: 'Python Bug & Math',
    language: 'python',
    code: `def calculate_average_and_max(numbers):
    total = 0
    max_val = numbers[0]
    # Off by one error in range causing IndexError or missing last element
    for i in range(0, len(numbers)):
        total += numbers[i]
        if numbers[i] > max_val:
            max_val = numbers[i]
            
    avg = total / len(numbers) # Division by zero if numbers is empty!
    return avg, max_val

def process_user_data(user_list):
    results = []
    for user in user_list:
        scores = user.get('scores', [])
        avg, highest = calculate_average_and_max(scores)
        results.append({
            'name': user['name'],
            'avg': avg,
            'max': highest
        })
    return results
`
  },
  {
    name: 'JavaScript Fetcher',
    language: 'javascript',
    code: `async function fetchUserData(userId) {
  // Vulnerable to unhandled errors & missing validation
  const response = await fetch('https://api.example.com/users/' + userId);
  const data = await response.json();
  
  let formattedName = data.name.toUpperCase();
  let items = data.orders.map(order => {
    return order.price * order.quantity;
  });
  
  return {
    user: formattedName,
    totalSpent: items.reduce((a, b) => a + b, 0)
  };
}

function renderUserBadge(userData) {
  const container = document.getElementById('user-card');
  container.innerHTML = "<h2>" + userData.user + "</h2><p>Spent: $" + userData.totalSpent + "</p>";
}
`
  }
];

export default function CodeInput({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  isLoading,
  loadingMessage
}) {
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'upload' | 'github'
  const [githubUrl, setGithubUrl] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [fetchedFileName, setFetchedFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        setFetchedFileName(file.name);
        // Try guessing language from extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        const matchedLang = LANGUAGES.find(l => l.id === ext || (ext === 'js' && l.id === 'javascript') || (ext === 'py' && l.id === 'python') || (ext === 'ts' && l.id === 'typescript'));
        if (matchedLang) setLanguage(matchedLang.id);
      }
    };
    reader.readAsText(file);
  };

  const handleFetchGithub = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setIsFetchingGithub(true);
    setGithubError('');
    setFetchedFileName('');

    try {
      const res = await fetchGithubFile(githubUrl);
      setCode(res.content);
      setFetchedFileName(res.filename);
      if (res.language) setLanguage(res.language);
    } catch (err) {
      setGithubError(err.message || 'Failed to fetch GitHub file');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const loadPreset = (preset) => {
    setCode(preset.code);
    setLanguage(preset.language);
    setFetchedFileName(`Preset: ${preset.name}`);
    setGithubError('');
  };

  const handleClear = () => {
    setCode('');
    setFetchedFileName('');
    setGithubError('');
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        {/* Input Method Switcher */}
        <div className="flex items-center space-x-1 bg-dark-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveInputTab('paste')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeInputTab === 'paste'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Paste Code</span>
          </button>

          <button
            onClick={() => setActiveInputTab('upload')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeInputTab === 'upload'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveInputTab('github')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeInputTab === 'github'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub URL</span>
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" /> Samples:
          </span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="pt-4">

        {/* GitHub Input Mode */}
        {activeInputTab === 'github' && (
          <form onSubmit={handleFetchGithub} className="mb-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Enter GitHub Repository or Raw File URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="e.g. https://github.com/octocat/Hello-World or direct file link"
                className="flex-1 px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={isFetchingGithub || !githubUrl.trim()}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                {isFetchingGithub ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span>Fetch Code</span>
                  </>
                )}
              </button>
            </div>

            {githubError && (
              <div className="mt-2.5 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span>{githubError}</span>
              </div>
            )}
          </form>
        )}

        {/* Upload Mode File Selector */}
        {activeInputTab === 'upload' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Choose a code file from your computer (.py, .js, .ts, .java, .cpp, etc.):
            </label>
            <div className="relative border-2 border-dashed border-slate-700/80 hover:border-brand-500/80 rounded-xl p-4 text-center cursor-pointer transition-colors bg-dark-950/50">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-brand-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-300 font-medium">Click or drag a file to upload</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports any plain text code file up to 2MB</p>
            </div>
          </div>
        )}

        {/* Active Source Banner */}
        {fetchedFileName && (
          <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Loaded: <strong className="text-slate-100">{fetchedFileName}</strong>
            </span>
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
              title="Clear loaded file"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}

        {/* Code Textarea & Language Selector Header */}
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Code Editor ({code ? `${code.split('\n').length} lines` : '0 lines'})
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            {code && (
              <button
                onClick={handleClear}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                title="Clear code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Code Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your raw code here, or use the tabs above to upload a file / fetch from GitHub..."
          rows={12}
          className="w-full p-4 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y"
        />

        {/* Action Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {code ? '⚡ Ready for Groq AI review & documentation' : 'Paste or fetch code to start'}
          </span>
          <button
            onClick={onAnalyze}
            disabled={isLoading || !code.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand-500/25 glow-effect"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingMessage || 'Analyzing Code...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
