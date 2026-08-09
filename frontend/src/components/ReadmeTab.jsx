import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Eye, Code, Copy, Check, FileText, AlertCircle } from 'lucide-react';

export default function ReadmeTab({ readme = '', errorMessage }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!readme) return;
    const blob = new Blob([readme], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!readme) return;
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Header Toolbar */}
        <div className="px-4 py-2.5 bg-dark-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Toggle View Mode */}
          <div className="flex items-center space-x-1 bg-dark-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'preview'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'raw'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Markdown</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download README.md</span>
            </button>
          </div>

        </div>

        {/* Content Body */}
        <div className="p-6 text-sm text-slate-200 min-h-[300px] max-h-[600px] overflow-y-auto">
          {viewMode === 'preview' ? (
            <div className="prose prose-invert max-w-none prose-headings:font-sans prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:text-xs prose-p:leading-relaxed prose-li:text-xs prose-li:text-slate-300 prose-code:font-mono prose-code:text-brand-300 prose-code:bg-slate-800/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{readme || '*No README generated yet.*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              readOnly
              value={readme}
              rows={16}
              className="w-full h-full p-4 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none resize-none"
            />
          )}
        </div>

      </div>
    </div>
  );
}
