'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import {
  PublishingJob,
  SocialPlatform,
} from '@/lib/types/database';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { PublishingHistoryTable } from '@/components/publishing/PublishingHistoryTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  PlusSquare,
  Share2,
  Filter,
  Clock,
} from 'lucide-react';

const ALL_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'whatsapp',
];

export default function PublishingDashboardPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<PublishingJob[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/publishing/jobs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch publishing jobs: ${res.statusText}`);
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalCount(data.total || 0);
    } catch (err: unknown) {
      console.error('Error loading publishing jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load publishing history');
    } finally {
      setLoading(false);
    }
  }, [user?.id, platformFilter, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/publishing/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Retry failed');
      }

      await fetchJobs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Retry failed');
    }
  };

  // KPI Calculations
  const publishedCount = jobs.filter((j) => j.status === 'published').length;
  const failedCount = jobs.filter((j) => j.status === 'failed' || j.status === 'needs_reconnect').length;
  const processingCount = jobs.filter((j) => j.status === 'processing' || j.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold-deep mb-1 font-semibold">
            <Send className="w-3.5 h-3.5 text-gold-primary" />
            <span>Phase 5 — Publishing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-deep font-urdu">
            سوشل میڈیا اشاعت کی تاریخ — Publishing Hub
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Real-time status tracking, audit logging, and retry management for all social channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            loading={loading}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link href="/dashboard/create-post">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusSquare className="w-4 h-4 text-gold-light" />}
              className="shadow-elevated"
            >
              Create & Publish Post
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Published */}
        <Card variant="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gold-light/80">
              Total Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-primary/40 flex items-center justify-center text-gold-light">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sand-ivory mt-2 font-mono">
            {publishedCount}
          </div>
          <p className="text-[11px] text-sand-muted/70 mt-1">
            Successfully delivered to APIs
          </p>
        </Card>

        {/* Card 2: Failed / Needs Attention */}
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-600 font-semibold">
              Failed / Attention
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal-main mt-2 font-mono">
            {failedCount}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">
            Validation or Token errors
          </p>
        </Card>

        {/* Card 3: Processing */}
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gold-deep font-semibold">
              Processing Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-subtle flex items-center justify-center text-gold-deep">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal-main mt-2 font-mono">
            {processingCount}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">
            Actively executing in queue
          </p>
        </Card>

        {/* Card 4: Connected Channels Quick Link */}
        <Card variant="subtle" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gold-deep font-semibold">
              OAuth Accounts
            </span>
            <Share2 className="w-4 h-4 text-gold-deep" />
          </div>
          <div className="mt-2">
            <Link
              href="/dashboard/accounts"
              className="text-xs font-semibold text-emerald-deep hover:underline flex items-center gap-1"
            >
              <span>Manage Connected Accounts →</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-sand-ivory rounded-2xl border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-primary" />
          <span className="text-xs font-semibold text-emerald-deep font-mono uppercase tracking-wider">
            Filters:
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          >
            <option value="all">All Platforms (تمام پلیٹ فارمز)</option>
            {ALL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_INFO[p]?.name} ({PLATFORM_INFO[p]?.urduName})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          >
            <option value="all">All Statuses (تمام صورتحال)</option>
            <option value="published">Published (شائع شدہ)</option>
            <option value="processing">Processing (جاری)</option>
            <option value="failed">Failed (ناکام)</option>
            <option value="needs_reconnect">Needs Reconnect</option>
            <option value="unsupported">Unsupported</option>
          </select>
        </div>
      </div>

      {/* Main Publishing History Table */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl">
          {error}
        </div>
      )}

      <PublishingHistoryTable
        jobs={jobs}
        onRetry={handleRetryJob}
        isLoading={loading}
      />
    </div>
  );
}
