'use client';

import React from 'react';
import { Sparkles, RefreshCw, BookOpen, FileText, Target, ShieldCheck, Clock } from 'lucide-react';
import { MarketingGoal, ConfidenceLevel } from '@/lib/types/database';

interface MarketingHeaderProps {
  primaryGoal: MarketingGoal;
  confidence: ConfidenceLevel;
  lastUpdated: string | null;
  sampleSize: number;
  onRefresh: () => void;
  onOpenBrandKnowledge: () => void;
  onOpenReport: () => void;
  refreshing: boolean;
}

const GOAL_LABELS: Record<MarketingGoal, { label: string; urdu: string }> = {
  grow_followers: { label: 'Grow Followers', urdu: 'فالورز میں اضافہ' },
  increase_engagement: { label: 'Maximize Engagement', urdu: 'اینگیجمنٹ و مکالمہ' },
  increase_reach: { label: 'Expand Organic Reach', urdu: 'آرگینک ریچ کی وسعت' },
  generate_leads: { label: 'Generate Leads', urdu: 'حصولِ روابط و لیڈز' },
  promote_courses: { label: 'Promote Islamic Courses', urdu: 'دینی کورسز کا فروغ' },
  website_traffic: { label: 'Drive Website Traffic', urdu: 'ویب سائٹ ٹریفک' },
  brand_awareness: { label: 'Build Brand Awareness', urdu: 'برانڈ پہچان و آگاہی' },
  video_views: { label: 'Increase Video Views', urdu: 'ویڈیو ویوز میں اضافہ' },
};

export function MarketingHeader({
  primaryGoal,
  confidence,
  lastUpdated,
  sampleSize,
  onRefresh,
  onOpenBrandKnowledge,
  onOpenReport,
  refreshing,
}: MarketingHeaderProps) {
  const goalInfo = GOAL_LABELS[primaryGoal] || GOAL_LABELS.increase_engagement;

  return (
    <div className="bg-sand-ivory dark:bg-[#0F1715] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-elevated relative overflow-hidden">
      {/* Background Star Ornament */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 opacity-5 dark:opacity-10 pointer-events-none text-gold-deep">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
        </svg>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-light/20 text-emerald-deep dark:text-emerald-light border border-emerald-light/30">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 8 • AI Marketing Strategist
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gold-subtle text-gold-deep border border-gold-border">
              <Target className="w-3 h-3" />
              {goalInfo.label} ({goalInfo.urdu})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-emerald-deep dark:text-white">
            AI Marketing Manager
          </h1>
          <p className="text-sm text-charcoal-muted dark:text-gray-300 mt-1">
            Your AI-powered marketing strategist • آپ کا باوقار و ڈیٹا پر مبنی مارکیٹنگ اسٹریٹجسٹ
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-charcoal-light dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Data-grounded ({sampleSize} verified posts)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold-deep" />
              Last evaluated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Live session'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenBrandKnowledge}
            className="px-4 py-2.5 rounded-xl border border-sand-border dark:border-emerald-800/40 bg-sand-card dark:bg-[#15231F] text-charcoal-deep dark:text-white text-xs font-semibold hover:bg-sand-muted transition-colors flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-emerald-primary" />
            <span>Brand Knowledge</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="px-4 py-2.5 rounded-xl border border-sand-border dark:border-emerald-800/40 bg-sand-card dark:bg-[#15231F] text-charcoal-deep dark:text-white text-xs font-semibold hover:bg-sand-muted transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4 text-gold-deep" />
            <span>Executive Report</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Analyzing...' : 'Refresh AI Insights'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
