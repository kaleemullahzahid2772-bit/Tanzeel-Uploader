'use client';

import React from 'react';
import { RepurposeCandidate } from '@/lib/types/database';
import { Repeat, ArrowRight, Eye, ThumbsUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface RepurposingEngineCardProps {
  candidates: RepurposeCandidate[];
}

export function RepurposingEngineCard({ candidates }: RepurposingEngineCardProps) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-6">
      <div className="border-b border-sand-border/60 pb-5">
        <h3 className="text-lg font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
          <Repeat className="w-5 h-5 text-emerald-primary" />
          Content Repurposing Engine (مواد کا کثیر الجہتی استعمال)
        </h3>
        <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
          اعلیٰ کارکردگی کی حامل پوسٹس کو دیگر منسلک پلیٹ فارمز کے لیے خودکار تبدیل کریں
        </p>
      </div>

      <div className="space-y-4">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="p-5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 shadow-sm"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-sand-border/40">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mr-2">
                  Source: {cand.sourcePlatform}
                </span>
                <span className="text-xs font-bold text-emerald-deep dark:text-white">
                  "{cand.title}"
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-charcoal-light dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  {cand.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-gold-deep" />
                  {cand.likes.toLocaleString()} likes
                </span>
              </div>
            </div>

            {/* Repurposing Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {cand.repurposeIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-sand-ivory dark:bg-[#111C18] border border-sand-border/60 dark:border-emerald-800/30 flex flex-col justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-gold-deep block mb-1">
                      → To {idea.targetPlatform} ({idea.targetFormat})
                    </span>
                    <p className="text-[11px] text-charcoal-deep dark:text-gray-300 font-urdu line-clamp-2">
                      {idea.suggestedHook}
                    </p>
                  </div>

                  <Link
                    href={idea.createPostUrl}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-deep hover:bg-emerald-primary text-white text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{idea.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
