'use client';

import React, { useState } from 'react';
import {
  PublishingJob,
  PublishingJobStatus,
} from '@/lib/types/database';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RotateCcw,
  Clock,
} from 'lucide-react';

interface PublishingHistoryTableProps {
  jobs: PublishingJob[];
  onRetry: (jobId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PublishingHistoryTable({
  jobs,
  onRetry,
  isLoading = false,
}: PublishingHistoryTableProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetryClick = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await onRetry(jobId);
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: PublishingJobStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="emerald" size="sm" className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-primary" />
            <span>Published</span>
          </Badge>
        );
      case 'processing':
      case 'pending':
        return (
          <Badge variant="gold" size="sm" className="inline-flex items-center gap-1">
            <Loader2 className="w-3 h-3 text-gold-deep animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case 'needs_reconnect':
        return (
          <Badge variant="draft" size="sm" className="inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Reconnect</span>
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="outline" size="sm">
            Unsupported
          </Badge>
        );
      case 'failed':
      default:
        return (
          <Badge variant="failed" size="sm" className="inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </Badge>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="p-12 text-center bg-sand-ivory rounded-2xl border border-sand-border space-y-3">
        <div className="w-12 h-12 rounded-full bg-sand-cream mx-auto flex items-center justify-center text-charcoal-muted">
          <Clock className="w-6 h-6 text-gold-deep" />
        </div>
        <h4 className="text-sm font-semibold text-emerald-deep">No Publishing History Found</h4>
        <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
          You have not published any posts to connected social channels yet. Approved posts from the Creator Studio will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-border bg-sand-ivory shadow-xs">
      <table className="w-full text-left text-xs text-charcoal-main">
        <thead className="bg-sand-cream/80 text-[11px] font-mono uppercase tracking-wider text-charcoal-muted border-b border-sand-border">
          <tr>
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4">Platform & Account</th>
            <th className="py-3.5 px-4">Post Excerpt</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Result / Link</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-border/60">
          {jobs.map((job) => {
            const info = PLATFORM_INFO[job.platform];
            const content = (job.request_payload?.content as Record<string, unknown>) || {};
            const title = (content.title as string) || '';
            const caption = (content.caption as string) || (content.description as string) || (content.hook as string) || '';
            const isRetrying = retryingId === job.id;

            return (
              <tr key={job.id} className="hover:bg-sand-cream/40 transition-colors">
                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-muted font-mono text-[11px]">
                  {formatDate(job.published_at || job.created_at)}
                </td>

                {/* Platform & Account */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <SocialIcon platform={job.platform} className={`w-4 h-4 ${info?.color || 'text-charcoal-main'}`} />
                    <div>
                      <div className="font-semibold text-emerald-deep">{info?.name || job.platform}</div>
                      <div className="text-[10px] text-charcoal-muted">{job.account_name}</div>
                    </div>
                  </div>
                </td>

                {/* Post Excerpt */}
                <td className="py-3.5 px-4 max-w-xs">
                  {title && (
                    <div className="font-medium text-emerald-deep truncate">{title}</div>
                  )}
                  <p className="text-[11px] text-charcoal-muted truncate font-urdu">
                    {caption || '—'}
                  </p>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(job.status)}
                </td>

                {/* Result Link or Error message */}
                <td className="py-3.5 px-4 max-w-xs">
                  {job.status === 'published' && job.platform_post_url ? (
                    <a
                      href={job.platform_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-primary hover:text-emerald-deep font-semibold underline text-xs"
                    >
                      <span>View Live Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : job.error_message ? (
                    <span className="text-[11px] text-rose-700 truncate block" title={job.error_message}>
                      {job.error_message}
                    </span>
                  ) : (
                    <span className="text-charcoal-light">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {job.status !== 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={isRetrying}
                      onClick={() => handleRetryClick(job.id)}
                      leftIcon={<RotateCcw className="w-3 h-3" />}
                    >
                      Retry
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
