'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  RotateCw, 
  Download, 
  BookOpen, 
  Users, 
  Eye, 
  TrendingUp, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Send, 
  Layers, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DateRangePicker, DateFilterState } from '@/components/analytics/DateRangePicker';
import { MetricCard } from '@/components/analytics/MetricCard';
import { MetricDefinitionsModal } from '@/components/analytics/MetricDefinitionsModal';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { PlatformComparisonTable } from '@/components/analytics/PlatformComparisonTable';
import { TopPostsSection } from '@/components/analytics/TopPostsSection';
import { PostAnalyticsModal } from '@/components/analytics/PostAnalyticsModal';
import { ContentAndTopicInsights } from '@/components/analytics/ContentAndTopicInsights';
import { AISummaryCard } from '@/components/analytics/AISummaryCard';
import { 
  AnalyticsOverviewKPIs, 
  AnalyticsTimeSeriesPoint, 
  PlatformPerformanceSummary, 
  ContentTypePerformance, 
  TopicPerformance, 
  BestPostingInsights, 
  PostAnalytics, 
  AISummaryReport, 
  SocialPlatform 
} from '@/lib/types/database';

export default function AnalyticsDashboardPage() {
  const [filters, setFilters] = useState<DateFilterState>({
    preset: 'last_30d',
    platform: 'all',
  });

  const [overview, setOverview] = useState<AnalyticsOverviewKPIs | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeSeriesPoint[]>([]);
  const [platforms, setPlatforms] = useState<PlatformPerformanceSummary[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentTypePerformance[]>([]);
  const [topics, setTopics] = useState<TopicPerformance[]>([]);
  const [bestPosting, setBestPosting] = useState<BestPostingInsights>({
    bestTimeSlot: '07:00 PM - 09:00 PM',
    bestDayOfWeek: 'Friday (جمعۃ المبارک)',
    bestPlatform: null,
    dataSufficient: false,
    sampleSize: 0,
    note: 'Aggregated performance telemetry',
  });
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [aiReport, setAiReport] = useState<AISummaryReport | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; platform: SocialPlatform; account_name: string; account_username?: string }>>([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostAnalytics | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set('preset', filters.preset);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.platform && filters.platform !== 'all') params.set('platform', filters.platform);
    if (filters.accountId) params.set('accountId', filters.accountId);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/social-accounts');
        if (res.ok) {
          const data = await res.json();
          if (data.accounts) {
            setAccounts(data.accounts);
          }
        }
      } catch (err) {
        console.error('Failed to load accounts for analytics filter:', err);
      }
    }
    loadAccounts();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const qs = buildQueryParams();

    try {
      const [ovRes, tsRes, bkRes, postRes] = await Promise.all([
        fetch('/api/analytics/overview?' + qs),
        fetch('/api/analytics/timeseries?' + qs),
        fetch('/api/analytics/breakdown?' + qs),
        fetch('/api/analytics/posts?' + qs + '&limit=20'),
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData.kpis || ovData.overview || null);
      }

      if (tsRes.ok) {
        const tsData = await tsRes.json();
        setTimeseries(tsData.points || tsData.timeseries || []);
      }

      if (bkRes.ok) {
        const bkData = await bkRes.json();
        setPlatforms(bkData.platformComparison || bkData.platforms || []);
        setContentTypes(bkData.contentTypeBreakdown || bkData.content_types || []);
        setTopics(bkData.topicBreakdown || bkData.topics || []);
        if (bkData.bestPostingInsights || bkData.best_posting) {
          setBestPosting(bkData.bestPostingInsights || bkData.best_posting);
        }
      }

      if (postRes.ok) {
        const postData = await postRes.json();
        setPosts(postData.posts || []);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSyncTelemetry = async () => {
    setSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastSyncedAt(new Date().toLocaleTimeString());
        setSyncFeedback('Analytics synchronized successfully! (' + (data.social_accounts_synced || 0) + ' accounts, ' + (data.posts_synced || 0) + ' posts)');
        await fetchData();
      } else {
        setSyncFeedback('Sync finished: ' + (data.message || 'Complete'));
        await fetchData();
      }
    } catch (err: any) {
      setSyncFeedback('Sync failed: ' + (err.message || 'Unknown network error'));
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const qs = buildQueryParams();
      const res = await fetch('/api/analytics/export?' + qs);
      if (!res.ok) throw new Error('Failed to generate export file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NurSocial_Analytics_' + (filters.preset || 'export') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateAIReport = async () => {
    try {
      const res = await fetch('/api/analytics/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpis: overview,
          bestInsights: bestPosting,
          topTopics: topics.slice(0, 5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate AI performance report:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-emerald-900/10 dark:border-emerald-800/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Phase 7 — Authentic Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            Social Analytics & Performance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-urdu mt-0.5">
            حقیقی سوشل میڈیا میٹرکس، پلیٹ فارمز کا تقابل اور اے آئی اسٹریٹجک بصیرت
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Glossary / Definitions Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowGlossary(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#15241F] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30 border border-gray-200 dark:border-emerald-800/30 text-xs font-medium transition-colors"
            title="View metric definitions and calculation formulas"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            disabled={exporting || loading}
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#15241F] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30 border border-gray-200 dark:border-emerald-800/30 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Download className={'w-4 h-4 text-amber-600 ' + (exporting ? 'animate-bounce' : '')} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* Manual Telemetry Sync */}
          <button
            type="button"
            disabled={syncing}
            onClick={handleSyncTelemetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-medium transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50"
          >
            <RotateCw className={'w-3.5 h-3.5 ' + (syncing ? 'animate-spin' : '')} />
            <span>{syncing ? 'Syncing Platform APIs...' : 'Refresh Analytics'}</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          {lastSyncedAt && (
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              Synced at {lastSyncedAt}
            </span>
          )}
        </div>
      )}

      {/* Filters Component */}
      <DateRangePicker
        filters={filters}
        onChange={setFilters}
        accounts={accounts}
        disabled={loading}
      />

      {/* KPI Overview Grid (9 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Followers"
          urduTitle="مجموعی فالورز"
          value={overview?.followers?.value || 0}
          delta={overview?.followers}
          icon={Users}
          tooltip="Total audience across all connected platforms"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Video & Content Views"
          urduTitle="ویڈیو و مواد کے ویوز"
          value={overview?.views?.value || 0}
          delta={overview?.views}
          icon={Eye}
          tooltip="Total video and post views reported by platform APIs"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Total Reach"
          urduTitle="منفرد ناظرین (ریچ)"
          value={overview?.reach?.value || 0}
          delta={overview?.reach}
          icon={BarChart3}
          tooltip="Unique users who saw your content during the selected date range"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Total Impressions"
          urduTitle="مجموعی نمائش"
          value={overview?.impressions?.value || 0}
          delta={overview?.impressions}
          icon={Layers}
          tooltip="Total times your content was displayed on screen"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Likes & Reactions"
          urduTitle="پسندیدگی اور ری ایکشنز"
          value={overview?.likes?.value || 0}
          delta={overview?.likes}
          icon={ThumbsUp}
          tooltip="Total positive reactions across posts"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Comments & Feedback"
          urduTitle="تبصرے اور فیڈ بیک"
          value={overview?.comments?.value || 0}
          delta={overview?.comments}
          icon={MessageCircle}
          tooltip="Direct audience replies and comments"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Shares & Reposts"
          urduTitle="شیئرز اور ری ٹویٹس"
          value={overview?.shares?.value || 0}
          delta={overview?.shares}
          icon={Share2}
          tooltip="Content distribution by your viewers"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Avg Engagement Rate"
          urduTitle="اوسط انگیجمنٹ ریٹ"
          value={overview?.engagementRate?.value || 0}
          delta={overview?.engagementRate}
          icon={TrendingUp}
          format="percentage"
          tooltip="(Likes + Comments + Shares) / Reach * 100"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />

        <MetricCard
          title="Published Posts"
          urduTitle="شائع شدہ پوسٹس"
          value={overview?.publishedPosts?.value || 0}
          delta={overview?.publishedPosts}
          icon={Send}
          tooltip="Total published posts in this period"
          onInfoClick={() => setShowGlossary(true)}
          loading={loading}
        />
      </div>

      {/* Performance Trends Chart */}
      <AnalyticsCharts
        data={timeseries}
        loading={loading}
      />

      {/* AI Performance Intelligence Card */}
      <AISummaryCard
        report={aiReport}
        onRegenerate={handleGenerateAIReport}
        loading={loading}
      />

      {/* Multi-Platform Comparison Table */}
      <PlatformComparisonTable
        platforms={platforms}
        loading={loading}
      />

      {/* Content Formats, Islamic Topics & Timing Intelligence */}
      <ContentAndTopicInsights
        contentTypes={contentTypes}
        topics={topics}
        bestPosting={bestPosting}
        loading={loading}
      />

      {/* Top Performing Posts Section */}
      <TopPostsSection
        posts={posts}
        onSelectPost={setSelectedPost}
        loading={loading}
      />

      {/* Detailed Post Analytics Drawer/Modal */}
      <PostAnalyticsModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      {/* Metric Definitions & Transparency Modal */}
      <MetricDefinitionsModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </div>
  );
}
