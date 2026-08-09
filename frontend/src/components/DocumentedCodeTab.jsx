import React, { useState } from 'react';
import { Copy, Check, FileCode, AlertCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function DocumentedCodeTab({ code, language = 'javascript', errorMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizedLanguage = language === 'auto' ? 'javascript' : language;

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Code Bar Header */}
        <div className="px-4 py-2.5 bg-dark-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <FileCode className="w-4 h-4 text-brand-400" />
            <span>Annotated Code ({normalizedLanguage})</span>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Syntax Highlighted Area */}
        <div className="p-2 text-xs font-mono overflow-x-auto max-h-[600px] overflow-y-auto">
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={oneDark}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '12px',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace'
            }}
          >
            {code || '// No documented code generated.'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
