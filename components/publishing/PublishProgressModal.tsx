'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { PlatformPublishResult, PublishingJobStatus } from '@/lib/types/database';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface PublishProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: PlatformPublishResult[];
  isLoading: boolean;
  onRetrySingle?: (jobId: string) => void;
}

export function PublishProgressModal({
  isOpen,
  onClose,
  results,
  isLoading,
  onRetrySingle,
}: PublishProgressModalProps) {
  const publishedCount = results.filter((r) => r.status === 'published').length;
  const failedCount = results.filter((r) => r.status === 'failed' || r.status === 'needs_reconnect').length;
  const totalCount = results.length;

  const getStatusBadge = (status: PublishingJobStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="emerald" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-primary" />
            <span>Published (شائع ہو گیا)</span>
          </Badge>
        );
      case 'processing':
      case 'pending':
        return (
          <Badge variant="gold" size="sm" className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 text-gold-deep animate-spin" />
            <span>Publishing (جاری ہے...)</span>
          </Badge>
        );
      case 'needs_reconnect':
        return (
          <Badge variant="draft" size="sm" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Reconnect Needed</span>
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
          <Badge variant="failed" size="sm" className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed (ناکام)</span>
          </Badge>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="اشاعت کی صورتحال — Live Publishing Status"
      description="ہر سوشل چینل پر اشاعت کا براہِ راست اسٹیٹس ملاحظہ کریں۔"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Progress Header Summary */}
        <div className="p-4 bg-sand-cream rounded-2xl border border-sand-border flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-muted">
              Execution Summary
            </h4>
            <div className="text-sm font-semibold text-emerald-deep flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gold-primary animate-spin" />
                  <span>Communicating with Official Platform APIs...</span>
                </>
              ) : publishedCount === totalCount && totalCount > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-primary" />
                  <span>All {publishedCount} Channels Published Successfully! الحمد لله</span>
                </>
              ) : (
                <span>
                  {publishedCount} Published, {failedCount} Failed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="md">
              {publishedCount} / {totalCount} Success
            </Badge>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {results.map((res, idx) => {
            const info = PLATFORM_INFO[res.platform];

            return (
              <div
                key={res.jobId || idx}
                className="p-4 bg-sand-ivory rounded-xl border border-sand-border shadow-xs space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={res.platform} className={`w-5 h-5 ${info?.color || 'text-charcoal-main'}`} />
                    <div>
                      <div className="text-xs font-semibold text-emerald-deep flex items-center gap-1.5">
                        <span>{info?.name || res.platform}</span>
                        <span className="text-[11px] text-charcoal-muted font-normal">
                          • {res.accountName}
                        </span>
                      </div>
                      {res.platformPostId && (
                        <div className="text-[10px] font-mono text-charcoal-muted mt-0.5">
                          ID: {res.platformPostId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>{getStatusBadge(res.status)}</div>
                </div>

                {/* Error Message if Failed */}
                {res.errorMessage && res.status !== 'published' && (
                  <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px]">
                        {res.errorCode ? `[${res.errorCode}] ` : ''}Error Details:
                      </span>
                      {onRetrySingle && res.jobId && !res.jobId.startsWith('err_') && (
                        <button
                          type="button"
                          onClick={() => onRetrySingle(res.jobId)}
                          className="text-[10px] font-medium text-rose-900 underline hover:text-rose-950 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Retry Now
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed">{res.errorMessage}</p>
                  </div>
                )}

                {/* Direct "View Post" Link if Published */}
                {res.status === 'published' && res.platformPostUrl && (
                  <div className="flex items-center justify-end pt-1">
                    <a
                      href={res.platformPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-primary hover:text-emerald-deep hover:underline transition-colors bg-emerald-subtle/40 px-2.5 py-1 rounded-md border border-emerald-primary/20"
                    >
                      <span>View Live Post (پوسٹ دیکھیں)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-sand-border/80 flex items-center justify-between">
          <Link href="/dashboard/publishing">
            <Button variant="outline" size="sm">
              View History Table (پبلشنگ ہسٹری)
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={onClose} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Done (مکمل)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
