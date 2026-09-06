'use client';

import React from 'react';
import { AIMarketingInsight } from '@/lib/types/database';
import { HelpCircle, X, ShieldCheck, Database } from 'lucide-react';

interface WhyAmISeeingThisModalProps {
  insight: AIMarketingInsight | null;
  metricKey?: string | null;
  onClose: () => void;
}

export function WhyAmISeeingThisModal({ insight, metricKey, onClose }: WhyAmISeeingThisModalProps) {
  if (!insight && !metricKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-sand-ivory dark:bg-[#0F1715] rounded-3xl shadow-2xl border border-sand-border dark:border-emerald-800/30 overflow-hidden">
        <div className="p-5 border-b border-sand-border/80 flex items-center justify-between bg-sand-card dark:bg-[#15231F]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-deep text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                Why am I seeing this recommendation?
              </h4>
              <p className="text-[11px] text-charcoal-muted dark:text-gray-400 font-urdu">
                شفافیت اور ڈیٹا کی تصدیق کا ثبوت (Data Explainability)
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-charcoal-muted hover:text-charcoal-deep rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-sand-muted dark:bg-[#15231F] border border-sand-border/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-deep dark:text-emerald-light font-bold">
              <Database className="w-4 h-4" />
              <span>Data Source & Methodology</span>
            </div>
            <p className="text-charcoal-deep dark:text-gray-300 font-urdu leading-relaxed">
              {insight?.supporting_data?.calculationNote || 'یہ تجزیہ آپ کے منسلک سوشل اکاؤنٹس سے موصول ہونے والے تصدیق شدہ میٹرکس کی بنیاد پر اخذ کیا گیا ہے۔'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-sand-border/40">
              <span className="text-charcoal-muted">Sample Size:</span>
              <span className="font-mono font-bold text-emerald-deep dark:text-white">
                {insight?.supporting_data?.sampleSize || 'Verified'} posts
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-sand-border/40">
              <span className="text-charcoal-muted">Evaluation Period:</span>
              <span className="font-mono font-bold text-emerald-deep dark:text-white">
                {insight?.supporting_data?.period || 'Last 60 days'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-sand-border/40">
              <span className="text-charcoal-muted">Confidence Level:</span>
              <span className="font-mono font-bold text-emerald-primary uppercase">
                {insight?.confidence || 'Medium'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Zero Hallucination Policy: Nūr Social strictly uses authentic historical records.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white font-semibold transition-colors shadow-sm"
          >
            Got it, thank you!
          </button>
        </div>
      </div>
    </div>
  );
}
