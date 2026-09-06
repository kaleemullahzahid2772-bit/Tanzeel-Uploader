'use client';

import React from 'react';
import { MarketingHealthScore } from '@/lib/types/database';
import { Activity, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MarketingHealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: MarketingHealthScore;
}

export function MarketingHealthScoreModal({
  isOpen,
  onClose,
  healthScore,
}: MarketingHealthScoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-sand-ivory dark:bg-[#0F1715] rounded-3xl shadow-2xl border border-sand-border dark:border-emerald-800/30 overflow-hidden">
        <div className="p-5 border-b border-sand-border/80 flex items-center justify-between bg-sand-card dark:bg-[#15231F]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-deep text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                Marketing Health Score Breakdown
              </h4>
              <p className="text-[11px] text-charcoal-muted dark:text-gray-400 font-urdu">
                100 پوائنٹس اسکور کا شفاف اور تفصیلی فارمولا
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-charcoal-muted hover:text-charcoal-deep rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Overall Health Score
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-urdu">
                {healthScore.notes}
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-deep dark:text-white">
              {healthScore.overallScore}/100
            </div>
          </div>

          <div className="space-y-3">
            {healthScore.components.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-deep dark:text-white">
                    {c.name} ({c.labelUrdu})
                  </span>
                  <span className="font-mono font-bold text-emerald-primary">
                    {c.score} / {c.maxScore} pts
                  </span>
                </div>
                <div className="w-full bg-sand-muted dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-primary h-full"
                    style={{ width: `${(c.score / c.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-charcoal-muted dark:text-gray-400">
                  {c.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
