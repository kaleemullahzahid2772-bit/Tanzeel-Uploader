'use client';

import React from 'react';
import { ContentTypePerformance, TopicPerformance, BestPostingInsights } from '@/lib/types/database';
import { 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  BookOpen, 
  TrendingUp 
} from 'lucide-react';

interface ContentAndTopicInsightsProps {
  contentTypes: ContentTypePerformance[];
  topics: TopicPerformance[];
  bestPosting: BestPostingInsights;
  loading?: boolean;
}

export function ContentAndTopicInsights({
  contentTypes,
  topics,
  bestPosting,
  loading = false,
}: ContentAndTopicInsightsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Best Posting Timing Intelligence */}
      <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Optimal Posting Schedule
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            تاریخی ڈیٹا کے مطابق سب سے زیادہ انگیجمنٹ کے اوقات
          </p>
        </div>

        <div className="space-y-3">
          {/* Peak Day Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Peak Day (بہترین دن)</span>
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {bestPosting.bestDayOfWeek || 'Friday (جمعۃ المبارک)'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Highest audience engagement recorded on this day.
            </p>
          </div>

          {/* Peak Time Slot Card */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Peak Time (بہترین وقت)</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
              {bestPosting.bestTimeSlot || '07:00 PM - 09:00 PM'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              (Post-Maghrib / Post-Isha prime audience window)
            </p>
          </div>

          {/* Confidence Note */}
          <div className="text-[11px] text-gray-400 bg-gray-50 dark:bg-[#162520] p-3 rounded-xl border border-gray-100 dark:border-emerald-800/20">
            {bestPosting.note || 'Calculated from historical publishing engagement scores.'}
          </div>
        </div>
      </div>

      {/* 2. Content Format Resonance */}
      <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Content Format Breakdown
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            ویڈیو، ریلز اور تصاویر کی اوسط کارکردگی
          </p>
        </div>

        <div className="space-y-2.5">
          {contentTypes.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 italic">
              No format telemetry available yet.
            </div>
          ) : (
            contentTypes.map((ct) => (
              <div
                key={ct.type}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#162520] border border-gray-100 dark:border-emerald-800/20 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold capitalize text-gray-900 dark:text-white">
                    {ct.label || ct.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {ct.avgEngagementRate.toFixed(2)}% ER
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>{ct.postCount} posts</span>
                  <span>Views: {ct.views.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Islamic Topic Resonance */}
      <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Islamic Topic Resonance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            قرآنی و اسلامی موضوعات پر سامعین کی دلچسپی
          </p>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {topics.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 italic">
              No topic resonance data found for this interval.
            </div>
          ) : (
            topics.map((t) => (
              <div
                key={t.topic}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#162520] border border-gray-100 dark:border-emerald-800/20 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {t.topic}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {t.avgEngagementRate.toFixed(2)}% ER
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>{t.postCount} posts</span>
                  <span>Total Views: {t.views.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
