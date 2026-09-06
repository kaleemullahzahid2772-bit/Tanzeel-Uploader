'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Cpu, LayoutList, Check } from 'lucide-react';

interface GenerationProgressProps {
  currentStage?: number;
}

const STAGES = [
  {
    title: 'Analyzing Topic & Context',
    urduTitle: 'موضوع اور سیاق و سباق کا تجزیہ',
    desc: 'Extracting key themes, keywords, and tone nuances...',
    icon: Sparkles,
  },
  {
    title: 'Applying Islamic Safety & Brand Guardrails',
    urduTitle: 'اسلامی اخلاقی معیارات اور برانڈ قواعد کا نفاذ',
    desc: 'Verifying dignity, authentic etiquette, and no hallucinated fatwas...',
    icon: ShieldCheck,
  },
  {
    title: 'Generating Platform-Specific Copy',
    urduTitle: 'ہر سوشل میڈیا پلیٹ فارم کے لیے مخصوص تحریر',
    desc: 'Crafting Facebook posts, IG carousels, TikTok hooks, YouTube SEO, X tweets & WhatsApp broadcasts...',
    icon: Cpu,
  },
  {
    title: 'Validating Quality, Character Limits & Hashtags',
    urduTitle: 'کوالٹی اور کیریکٹر حدود کی جانچ',
    desc: 'Running automated safety heuristics and 280-char constraints...',
    icon: LayoutList,
  },
];

export function GenerationProgress({ currentStage }: GenerationProgressProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (typeof currentStage === 'number') {
      setActiveStep(currentStage);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [currentStage]);

  return (
    <div className="p-6 sm:p-8 bg-sand-ivory rounded-2xl border border-sand-border shadow-elevated space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-gold-subtle rounded-full border border-gold-border/60 text-gold-deep animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-emerald-deep">
          نور اے آئی کانٹینٹ برین برائے تخلیق
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto">
          AI is formulating dignified, high-impact social media content across all your selected platforms...
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3.5 max-w-md mx-auto">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-gold-subtle/50 border-gold-primary shadow-subtle'
                  : isDone
                  ? 'bg-sand-muted/60 border-sand-border text-charcoal-muted'
                  : 'opacity-40 border-sand-border/50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-emerald-primary text-sand-ivory'
                    : isCurrent
                    ? 'bg-gold-primary text-sand-ivory animate-spin'
                    : 'bg-sand-muted text-charcoal-light'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-emerald-deep">
                    {stage.title}
                  </h4>
                  <span className="text-[10px] text-charcoal-muted font-sans hidden sm:inline">
                    {stage.urduTitle}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
