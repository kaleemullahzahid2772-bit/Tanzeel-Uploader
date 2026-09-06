'use client';

import React, { useState } from 'react';
import { AISummaryReport } from '@/lib/types/database';
import { 
  Sparkles, 
  RotateCw, 
  Award, 
  CheckCircle2, 
  HeartHandshake 
} from 'lucide-react';

interface AISummaryCardProps {
  report: AISummaryReport | null;
  onRegenerate: () => Promise<void>;
  loading?: boolean;
}

export function AISummaryCard({ report, onRegenerate, loading = false }: AISummaryCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-[#0D382B] to-[#0A261D] rounded-3xl p-6 sm:p-8 text-white border border-emerald-700/40 shadow-xl space-y-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Gemini AI Intelligence Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            Data-Grounded Performance & Strategic Review
          </h3>
          <p className="text-xs text-emerald-200/80 font-urdu">
            آپ کے سوشل چینلز کے حقیقی ڈیٹا پر مبنی اسٹریٹجک اے آئی جائزہ
          </p>
        </div>

        <button
          type="button"
          disabled={loading || isGenerating}
          onClick={handleRefresh}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium transition-all disabled:opacity-50"
        >
          <RotateCw className={'w-3.5 h-3.5 ' + (isGenerating ? 'animate-spin' : '')} />
          <span>{isGenerating ? 'Analyzing Telemetry...' : 'Regenerate AI Report'}</span>
        </button>
      </div>

      {/* Body Content */}
      {loading || isGenerating ? (
        <div className="space-y-3 py-6 animate-pulse">
          <div className="h-4 bg-emerald-800/40 rounded w-3/4" />
          <div className="h-4 bg-emerald-800/40 rounded w-full" />
          <div className="h-4 bg-emerald-800/40 rounded w-2/3" />
        </div>
      ) : !report ? (
        <div className="py-6 text-center text-xs text-emerald-200/60 italic space-y-1">
          <p>Click 'Regenerate AI Report' to generate a data-grounded performance review.</p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10 text-xs sm:text-sm">
          {/* Urdu Summary Banner */}
          {report.summaryUrdu && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/30 text-emerald-100 font-urdu leading-relaxed">
              {report.summaryUrdu}
            </div>
          )}

          {/* English Summary */}
          {report.summaryEnglish && (
            <p className="text-emerald-100/90 leading-relaxed font-sans">
              {report.summaryEnglish}
            </p>
          )}

          {/* Highlights & Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Strengths */}
            {report.keyStrengths && report.keyStrengths.length > 0 && (
              <div className="p-4 rounded-2xl bg-black/20 border border-emerald-600/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Key Performance Highlights</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-100/90">
                  {report.keyStrengths.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strategic Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Actionable Recommendations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-100/90">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-amber-400 font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Islamic Closing Note */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-300/70 pt-2 font-urdu">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>بارک اللہ فی جهودکم — اللہ تعالی آپ کی دعوتی اور دینی خدمات میں برکت عطا فرمائے۔</span>
          </div>
        </div>
      )}
    </div>
  );
}
