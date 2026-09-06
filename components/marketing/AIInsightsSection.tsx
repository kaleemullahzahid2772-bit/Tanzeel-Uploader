'use client';

import React, { useState } from 'react';
import { AIMarketingInsight, ConfidenceLevel } from '@/lib/types/database';
import { Lightbulb, Share2, Users, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface AIInsightsSectionProps {
  insights: AIMarketingInsight[];
  onOpenWhyModal: (insight: AIMarketingInsight) => void;
}

export function AIInsightsSection({ insights, onOpenWhyModal }: AIInsightsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'content' | 'platform' | 'audience' | 'action'>('all');

  const filtered = activeTab === 'all' ? insights : insights.filter(i => i.insight_type === activeTab);

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">Confidence: High</span>;
      case 'medium':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">Confidence: Medium</span>;
      case 'low':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold">Confidence: Low (Limited data)</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">Insufficient Data</span>;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'content': return <Lightbulb className="w-5 h-5 text-gold-deep" />;
      case 'platform': return <Share2 className="w-5 h-5 text-emerald-primary" />;
      case 'audience': return <Users className="w-5 h-5 text-blue-600" />;
      case 'action':
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-border/60 pb-5">
        <div>
          <h3 className="text-lg font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold-deep" />
            AI Marketing Insights & Recommended Actions
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
            حقیقی ڈیٹا اور آفیشل پلیٹ فارم اینالیٹکس کی بنیاد پر تزویراتی تجاویز
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-sand-muted dark:bg-[#15231F] rounded-xl border border-sand-border/80">
          {(['all', 'content', 'platform', 'audience', 'action'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-deep text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal-deep dark:text-gray-300'
              }`}
            >
              {tab === 'all' ? 'All Insights' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 hover:border-gold-border/60 transition-all flex flex-col justify-between gap-3 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sand-muted dark:bg-emerald-950/40">
                    {getIcon(item.insight_type)}
                  </div>
                  <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                    {item.title}
                  </h4>
                </div>
                {getConfidenceBadge(item.confidence)}
              </div>

              <p className="text-xs text-charcoal-deep dark:text-gray-300 leading-relaxed font-urdu">
                {item.description}
              </p>

              {item.recommendation && (
                <div className="mt-3 p-3 rounded-xl bg-gold-subtle/30 dark:bg-amber-950/20 border border-gold-border/40 text-xs text-charcoal-deep dark:text-gray-200">
                  <strong className="text-gold-deep block mb-1">Recommended Action:</strong>
                  {item.recommendation}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sand-border/40 text-xs">
              <span className="text-[11px] text-charcoal-light dark:text-gray-400 capitalize">
                Type: {item.insight_type}
              </span>
              <button
                type="button"
                onClick={() => onOpenWhyModal(item)}
                className="text-[11px] text-emerald-primary hover:underline font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why am I seeing this?</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
