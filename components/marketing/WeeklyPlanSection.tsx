'use client';

import React from 'react';
import { WeeklyMarketingPlan, WeeklyMarketingDayPlan } from '@/lib/types/database';
import { Calendar, Clock, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface WeeklyPlanSectionProps {
  plan: WeeklyMarketingPlan | null;
  onGeneratePlan: () => void;
  generating: boolean;
}

export function WeeklyPlanSection({ plan, onGeneratePlan, generating }: WeeklyPlanSectionProps) {
  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-border/60 pb-5">
        <div>
          <h3 className="text-lg font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-primary" />
            AI 7-Day Marketing Strategy & Schedule
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
            آنے والے 7 دنوں کے لیے باوقار، مرحلہ وار اور خودکار شیڈولنگ گائیڈ
          </p>
        </div>

        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-gold-deep hover:bg-gold-primary text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating 7-Day Plan...' : 'Regenerate Weekly Plan'}</span>
        </button>
      </div>

      {plan && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
          <p className="text-xs text-emerald-900 dark:text-emerald-200 font-urdu leading-relaxed">
            ✨ {plan.strategySummaryUrdu}
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 italic">
            "{plan.strategySummaryEnglish}"
          </p>
        </div>
      )}

      {/* 7-Day Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {(plan?.days || []).map((day, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 flex flex-col justify-between gap-3 hover:border-emerald-primary/40 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-emerald-deep dark:text-white uppercase">
                  {day.day}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-semibold bg-sand-muted dark:bg-emerald-950 text-charcoal-deep dark:text-emerald-300">
                  {day.platform}
                </span>
              </div>

              <h5 className="text-xs font-bold text-emerald-deep dark:text-gray-100 line-clamp-2 mb-1">
                {day.contentTopic}
              </h5>

              <p className="text-[11px] text-charcoal-muted dark:text-gray-400 font-urdu line-clamp-2">
                {day.objective}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-sand-border/40">
              <div className="flex items-center gap-1 text-[10px] font-mono text-charcoal-light dark:text-gray-400">
                <Clock className="w-3 h-3 text-gold-deep" />
                <span>{day.suggestedTime}</span>
              </div>

              <Link
                href={`/dashboard/create-post?topic=${encodeURIComponent(day.contentTopic)}&platform=${encodeURIComponent(day.platform)}&format=${encodeURIComponent(day.contentType)}&notes=${encodeURIComponent(`Objective: ${day.objective}. Suggested CTA: ${day.suggestedCta}`)}`}
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-deep hover:bg-emerald-primary text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <PlusSquare className="w-3 h-3" />
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
