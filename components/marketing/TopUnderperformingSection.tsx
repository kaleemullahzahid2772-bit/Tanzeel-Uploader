'use client';

import React from 'react';
import { Trophy, TrendingDown, Eye, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';
import { PostAnalytics } from '@/lib/types/database';

interface TopUnderperformingSectionProps {
  posts: PostAnalytics[];
}

export function TopUnderperformingSection({ posts }: TopUnderperformingSectionProps) {
  if (!posts || posts.length === 0) return null;

  const sorted = [...posts].sort((a, b) => b.views - a.views);
  const topPerformers = sorted.slice(0, 3);
  const underperformers = sorted.length >= 4 ? sorted.slice(-3).reverse() : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers Card */}
      <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-4">
        <div className="border-b border-sand-border/60 pb-3">
          <h3 className="text-base font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performing Content Intelligence
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
            سب سے زیادہ مقبول پوسٹس کا تجزیہ اور ان کی کامیابی کی وجوہات
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs text-emerald-900 dark:text-emerald-200 font-urdu">
          <strong className="block mb-0.5 text-emerald-deep dark:text-emerald-light">کامیابی کا پیٹرن:</strong>
          مستند قرآنی نکات اور عملی دعاؤں پر مشتمل پوسٹس نے تاریخی طور پر اوسط سے 35% زیادہ اینگیجمنٹ حاصل کی۔
        </div>

        <div className="space-y-3">
          {topPerformers.map((p, idx) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-amber-600">#{idx + 1}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sand-muted text-charcoal-deep font-semibold">
                    {p.platform}
                  </span>
                </div>
                <h5 className="font-bold text-emerald-deep dark:text-white truncate">
                  {p.post_title || 'Islamic Reflection Post'}
                </h5>
                <p className="text-[11px] text-charcoal-muted dark:text-gray-400 truncate font-urdu">
                  {p.post_topic || 'Islamic Wisdom'}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="font-bold text-emerald-primary">{p.views.toLocaleString()} views</div>
                <div className="text-[11px] text-charcoal-light dark:text-gray-400">{p.engagement_rate}% engagement</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underperforming Content Remediation */}
      <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-4">
        <div className="border-b border-sand-border/60 pb-3">
          <h3 className="text-base font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Content That Needs Improvement
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
            کم ردعمل حاصل کرنے والی پوسٹس اور ان کو بہتر بنانے کی تجاویز
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-xs text-amber-900 dark:text-amber-200 font-urdu">
          <strong className="block mb-0.5 text-amber-950 dark:text-amber-300">بہتری کی تجویز:</strong>
          بہت طویل تحریری پوسٹس کے مقابلے میں گرافکس، پوائنٹس اور مختصر ویڈیوز کا ردعمل بہتر رہتا ہے۔
        </div>

        {underperformers.length > 0 ? (
          <div className="space-y-3">
            {underperformers.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sand-muted text-charcoal-deep font-semibold">
                      {p.platform}
                    </span>
                  </div>
                  <h5 className="font-bold text-emerald-deep dark:text-white truncate">
                    {p.post_title || 'Islamic Topic'}
                  </h5>
                  <p className="text-[11px] text-charcoal-muted dark:text-gray-400 truncate font-urdu">
                    تجویز: پہلی سطر میں مضبوط تجسس اور ہوک شامل کریں۔
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="font-bold text-charcoal-deep dark:text-gray-300">{p.views.toLocaleString()} views</div>
                  <div className="text-[11px] text-charcoal-light dark:text-gray-400">{p.engagement_rate}% engagement</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-charcoal-muted font-urdu">
            تمام شائع کردہ پوسٹس نے متوازن معیار اور اینگیجمنٹ ظاہر کی ہے۔
          </div>
        )}
      </div>
    </div>
  );
}
