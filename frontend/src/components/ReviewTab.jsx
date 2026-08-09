import React from 'react';
import { AlertTriangle, AlertCircle, Info, Lightbulb, CheckCircle2, ShieldAlert } from 'lucide-react';

const SEVERITY_ORDER = {
  critical: 1,
  warning: 2,
  suggestion: 3,
  info: 4
};

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-950/40',
    border: 'border-red-800/60',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: ShieldAlert,
    iconColor: 'text-red-400'
  },
  warning: {
    label: 'Warning',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/50',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-400'
  },
  suggestion: {
    label: 'Suggestion',
    bg: 'bg-blue-950/30',
    border: 'border-blue-800/50',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: Lightbulb,
    iconColor: 'text-blue-400'
  },
  info: {
    label: 'Info',
    bg: 'bg-slate-900/60',
    border: 'border-slate-800',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icon: Info,
    iconColor: 'text-slate-400'
  }
};

export default function ReviewTab({ review = [], errorMessage }) {
  if (errorMessage) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300 text-sm flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-200">Review Generation Notice</h4>
          <p className="mt-1 text-xs text-red-300/90">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Sort issues by severity priority then by line number
  const sortedReview = [...review].sort((a, b) => {
    const pA = SEVERITY_ORDER[a.severity?.toLowerCase()] || 99;
    const pB = SEVERITY_ORDER[b.severity?.toLowerCase()] || 99;
    if (pA !== pB) return pA - pB;
    return (a.line || 0) - (b.line || 0);
  });

  const counts = {
    critical: sortedReview.filter(i => i.severity?.toLowerCase() === 'critical').length,
    warning: sortedReview.filter(i => i.severity?.toLowerCase() === 'warning').length,
    suggestion: sortedReview.filter(i => i.severity?.toLowerCase() === 'suggestion').length,
    info: sortedReview.filter(i => i.severity?.toLowerCase() === 'info').length
  };

  if (sortedReview.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-dark-900 border border-slate-800/80">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Issues Found! Clean Code.</h3>
        <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
          Groq AI analyzed your code structure, edge cases, and best practices. No critical bugs or performance bottlenecks were detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-dark-900 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 font-medium text-slate-300">
          <span>Found <strong>{sortedReview.length}</strong> feedback item{sortedReview.length === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center space-x-3">
          {counts.critical > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-semibold">
              {counts.critical} Critical
            </span>
          )}
          {counts.warning > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
              {counts.warning} Warning{counts.warning === 1 ? '' : 's'}
            </span>
          )}
          {counts.suggestion > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
              {counts.suggestion} Suggestion{counts.suggestion === 1 ? '' : 's'}
            </span>
          )}
          {counts.info > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-400 text-[11px] font-semibold">
              {counts.info} Info
            </span>
          )}
        </div>
      </div>

      {/* Review Item Cards */}
      <div className="grid gap-3">
        {sortedReview.map((item, index) => {
          const sevKey = item.severity?.toLowerCase() || 'info';
          const cfg = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.info;
          const IconComp = cfg.icon;

          return (
            <div
              key={index}
              className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border} transition-all hover:border-slate-600/80 shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-dark-950 border border-slate-800 ${cfg.iconColor}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-100">{item.issue}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                {item.line !== null && item.line !== undefined && (
                  <span className="px-2.5 py-1 rounded-md bg-dark-950 border border-slate-800 font-mono text-[11px] text-slate-300 shrink-0 font-medium">
                    Line {item.line}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
