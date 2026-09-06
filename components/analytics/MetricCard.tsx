'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { MetricDelta } from '@/lib/types/database';

interface MetricCardProps {
  title: string;
  urduTitle?: string;
  value: number | string;
  delta?: MetricDelta;
  icon: React.ComponentType<{ className?: string }>;
  tooltip?: string;
  format?: 'number' | 'percentage' | 'compact' | 'text';
  subtext?: string;
  badge?: string;
  onInfoClick?: () => void;
  loading?: boolean;
}

export function MetricCard({
  title,
  urduTitle,
  value,
  delta,
  icon: Icon,
  tooltip,
  format = 'number',
  subtext,
  badge,
  onInfoClick,
  loading = false,
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val !== 'number') return val;
    if (format === 'percentage') return val.toFixed(2) + '%';
    if (format === 'compact') {
      if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
      if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    return val.toLocaleString();
  };

  const isUp = delta && (delta.direction === 'up' || (delta.percentage !== null && delta.percentage > 0));
  const isDown = delta && (delta.direction === 'down' || (delta.percentage !== null && delta.percentage < 0));
  const isNeutral = delta && (delta.direction === 'neutral' || delta.percentage === 0);
  const isUnavailable = !delta || delta.direction === 'unavailable' || !delta.isAvailable;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#111C18] rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm hover:shadow-md transition-all group">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500/40 to-emerald-600 opacity-80" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-emerald-400/80">
              {title}
            </h4>
            {tooltip && (
              <button
                type="button"
                onClick={onInfoClick}
                title={tooltip}
                className="text-gray-400 hover:text-emerald-600 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {urduTitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 font-urdu">{urduTitle}</p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Main Value */}
      <div className="space-y-2">
        {loading ? (
          <div className="h-9 w-24 bg-gray-200 dark:bg-emerald-900/30 animate-pulse rounded-lg" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">
              {formatValue(value)}
            </span>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/40">
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Delta Comparison */}
        {delta && !loading && (
          <div className="flex items-center gap-1.5 text-xs">
            {isUp && (
              <span className="flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                +{delta.percentage}%
              </span>
            )}
            {isDown && (
              <span className="flex items-center gap-0.5 font-medium text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
                {delta.percentage}%
              </span>
            )}
            {isNeutral && !isUnavailable && (
              <span className="flex items-center gap-0.5 font-medium text-gray-500">
                <Minus className="w-3.5 h-3.5" />
                0%
              </span>
            )}
            {isUnavailable && (
              <span className="text-gray-400 text-[11px] italic">
                Baseline / First interval
              </span>
            )}

            {!isUnavailable && (
              <span className="text-gray-400 text-[11px]">vs previous period</span>
            )}
          </div>
        )}

        {subtext && !loading && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
