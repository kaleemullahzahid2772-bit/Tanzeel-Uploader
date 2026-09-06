'use client';

import React from 'react';
import {
  AIMarketingOverview,
  MarketingHealthScore,
} from '@/lib/types/database';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Share2,
} from 'lucide-react';

interface MarketingOverviewCardProps {
  overview: AIMarketingOverview;
  onOpenHealthModal: () => void;
  onOpenWhyModal: (metricKey: string) => void;
}

export function MarketingOverviewCard({
  overview,
  onOpenHealthModal,
  onOpenWhyModal,
}: MarketingOverviewCardProps) {
  const { healthScore, overallTrend, bestPlatform, bestContentType, bestTopic, postingConsistency } = overview;

  const getTrendIcon = () => {
    switch (overallTrend) {
      case 'growing':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-rose-600" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-amber-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-charcoal-muted" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-deep border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 60) return 'text-gold-deep border-gold-primary bg-amber-50 dark:bg-amber-950/30';
    if (score >= 40) return 'text-amber-600 border-amber-500 bg-amber-50 dark:bg-amber-950/30';
    return 'text-rose-600 border-rose-500 bg-rose-50 dark:bg-rose-950/30';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Marketing Health Score Card */}
      <div
        onClick={onOpenHealthModal}
        className="bg-sand-ivory dark:bg-[#111C18] rounded-2xl p-6 border border-sand-border dark:border-emerald-800/30 shadow-card hover:border-gold-border cursor-pointer transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-muted dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-primary" />
            Marketing Health Score
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sand-muted dark:bg-emerald-900/40 text-charcoal-deep dark:text-emerald-light font-medium">
            View breakdown →
          </span>
        </div>

        <div className="my-4 flex items-baseline gap-3">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-bold font-mono text-2xl ${getScoreColor(healthScore.overallScore)}`}>
            {healthScore.overallScore}
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-deep dark:text-white capitalize">
              {healthScore.status.replace('_', ' ')}
            </div>
            <div className="text-xs text-charcoal-light dark:text-gray-400 font-urdu">
              {healthScore.isLimitedData ? 'محدود ڈیٹا کی بنیاد پر' : 'جامع ڈیٹا پر مبنی اسکور'}
            </div>
          </div>
        </div>

        <div className="w-full bg-sand-muted dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-primary h-full transition-all duration-500"
            style={{ width: `${healthScore.overallScore}%` }}
          />
        </div>
      </div>

      {/* 2. Best Platform Card */}
      <div className="bg-sand-ivory dark:bg-[#111C18] rounded-2xl p-6 border border-sand-border dark:border-emerald-800/30 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-muted dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-emerald-primary" />
            Best Platform
          </span>
          <button
            type="button"
            onClick={() => onOpenWhyModal('best_platform')}
            className="text-[11px] text-emerald-primary hover:underline"
          >
            Why?
          </button>
        </div>

        <div className="my-3">
          <div className="text-xl font-bold font-heading text-emerald-deep dark:text-white uppercase">
            {bestPlatform || 'Limited Data'}
          </div>
          <p className="text-xs text-charcoal-muted dark:text-gray-300 mt-1 font-urdu">
            {bestPlatform ? 'اس پلیٹ فارم نے سب سے زیادہ مستند ویوز دیے' : 'کم از کم 3 پوسٹس شائع کرنے پر ظاہر ہوگا'}
          </p>
        </div>

        <div className="text-[11px] text-charcoal-light dark:text-gray-400">
          Status: {bestPlatform ? 'Primary Focus Channel' : 'Analyzing engagement...'}
        </div>
      </div>

      {/* 3. Top Resonant Topic */}
      <div className="bg-sand-ivory dark:bg-[#111C18] rounded-2xl p-6 border border-sand-border dark:border-emerald-800/30 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-muted dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-deep" />
            Top Content Topic
          </span>
          <button
            type="button"
            onClick={() => onOpenWhyModal('best_topic')}
            className="text-[11px] text-emerald-primary hover:underline"
          >
            Why?
          </button>
        </div>

        <div className="my-3">
          <div className="text-base font-bold font-heading text-emerald-deep dark:text-white truncate">
            {bestTopic || 'Islamic Wisdom & Education'}
          </div>
          <p className="text-xs text-charcoal-muted dark:text-gray-300 mt-1 font-urdu truncate">
            {bestTopic ? 'اس موضوع پر سامعین کا انٹرایکشن سب سے زیادہ رہا' : 'مختلف موضوعات پر شیڈولنگ درکار ہے'}
          </p>
        </div>

        <div className="text-[11px] text-charcoal-light dark:text-gray-400">
          Format: {bestContentType ? bestContentType.replace('_', ' ').toUpperCase() : 'Video / Short'}
        </div>
      </div>

      {/* 4. Posting Regularity & Trend */}
      <div className="bg-sand-ivory dark:bg-[#111C18] rounded-2xl p-6 border border-sand-border dark:border-emerald-800/30 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-muted dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-primary" />
            Cadence & Growth
          </span>
          {getTrendIcon()}
        </div>

        <div className="my-3">
          <div className="text-xl font-bold font-heading text-emerald-deep dark:text-white capitalize">
            {postingConsistency}
          </div>
          <p className="text-xs text-charcoal-muted dark:text-gray-300 mt-1 font-urdu">
            {postingConsistency === 'consistent' ? 'پوسٹنگ کا تسلسل الگورتھم کے لیے بہترین ہے' : 'ہفتہ وار شیڈولنگ سے تسلسل قائم کریں'}
          </p>
        </div>

        <div className="text-[11px] text-charcoal-light dark:text-gray-400 capitalize">
          Trend: {overallTrend.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
}
