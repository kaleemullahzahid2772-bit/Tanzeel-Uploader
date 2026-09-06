'use client';

import React from 'react';
import { PlatformPerformanceSummary, SocialPlatform } from '@/lib/types/database';
import { Crown } from 'lucide-react';

interface PlatformComparisonTableProps {
  platforms: PlatformPerformanceSummary[];
  loading?: boolean;
}

const PLATFORM_COLORS: Record<SocialPlatform, { bg: string; text: string; border: string }> = {
  facebook: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/40' },
  instagram: { bg: 'bg-pink-50 dark:bg-pink-950/50', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800/40' },
  youtube: { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800/40' },
  twitter: { bg: 'bg-neutral-100 dark:bg-neutral-900', text: 'text-neutral-900 dark:text-neutral-200', border: 'border-neutral-300 dark:border-neutral-700' },
  tiktok: { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800/40' },
  whatsapp: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40' },
};

export function PlatformComparisonTable({ platforms, loading = false }: PlatformComparisonTableProps) {
  const sorted = [...platforms].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
  const topPlatform = sorted.length > 0 && sorted[0].avgEngagementRate > 0 ? sorted[0].platform : null;

  return (
    <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Multi-Platform Performance Matrix
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            تمام منسلک چینلز کی کارکردگی کا موازنہ اور لیڈر بورڈ
          </p>
        </div>

        {topPlatform && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Channel: {topPlatform.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
          <thead className="text-[11px] uppercase tracking-wider bg-emerald-50/50 dark:bg-[#162520] text-gray-500 dark:text-emerald-400/80 border-b border-gray-100 dark:border-emerald-800/20">
            <tr>
              <th className="py-3 px-4 rounded-l-xl">Platform / Account</th>
              <th className="py-3 px-3 text-right">Views</th>
              <th className="py-3 px-3 text-right">Reach</th>
              <th className="py-3 px-3 text-right">Likes</th>
              <th className="py-3 px-3 text-right">Comments</th>
              <th className="py-3 px-3 text-right">Shares</th>
              <th className="py-3 px-3 text-right font-bold text-emerald-800 dark:text-emerald-300">Engage Rate</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Posts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/20">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-4">
                    <div className="h-5 bg-gray-200 dark:bg-emerald-900/30 rounded" />
                  </td>
                </tr>
              ))
            ) : platforms.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                  No connected platforms or metrics recorded yet. Connect your accounts in Settings.
                </td>
              </tr>
            ) : (
              sorted.map((item) => {
                const isWinner = topPlatform === item.platform;
                const colors = PLATFORM_COLORS[item.platform] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };

                return (
                  <tr
                    key={item.platform}
                    className={'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors ' + (
                      isWinner ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                    )}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className={'px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ' + colors.bg + ' ' + colors.text + ' ' + colors.border}>
                          {item.platform}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            {item.accountName || item.platform}
                            {isWinner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.reach.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.likes.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.comments.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.shares.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {item.avgEngagementRate.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-emerald-950 text-gray-700 dark:text-emerald-300 font-semibold text-[11px]">
                        {item.postCount}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
