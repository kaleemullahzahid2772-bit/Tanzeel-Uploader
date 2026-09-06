'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { ScheduledPost, ScheduledPostStatus } from '@/lib/types/database';
import { formatScheduledDateTime } from '@/lib/scheduling/timezone';
import {
  Calendar as CalendarIcon,
  Clock,
  Film,
  Image as ImageIcon,
  RotateCcw,
  Pause,
  Play,
  XCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

interface CalendarEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  onOpenReschedule: (post: ScheduledPost) => void;
  onTogglePause: (post: ScheduledPost) => Promise<void>;
  onCancelSchedule: (post: ScheduledPost) => Promise<void>;
}

export function CalendarEventDetailModal({
  isOpen,
  onClose,
  post,
  onOpenReschedule,
  onTogglePause,
  onCancelSchedule,
}: CalendarEventDetailModalProps) {
  if (!post) return null;

  const info = PLATFORM_INFO[post.platform];
  const snapshot = post.content_snapshot || {};
  const caption = snapshot.caption || snapshot.description || snapshot.hook || '';
  const isActionable = post.status === 'scheduled' || post.status === 'paused' || post.status === 'failed';

  const getStatusBadge = (status: ScheduledPostStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="emerald" size="sm" className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-primary" />
            <span>Published (شائع شدہ)</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="gold" size="sm" className="inline-flex items-center gap-1">
            <Loader2 className="w-3 h-3 text-gold-deep animate-spin" />
            <span>Processing...</span>
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="draft" size="sm" className="inline-flex items-center gap-1">
            <Pause className="w-3 h-3 text-amber-600" />
            <span>Paused (روکا گیا)</span>
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" size="sm">
            Cancelled
          </Badge>
        );
      case 'needs_reconnect':
        return (
          <Badge variant="draft" size="sm" className="inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Reconnect Needed</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="failed" size="sm" className="inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </Badge>
        );
      case 'scheduled':
      default:
        return (
          <Badge variant="gold" size="sm" className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-gold-deep" />
            <span>Scheduled (شیڈول شدہ)</span>
          </Badge>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="شیڈول پوسٹ کی تفصیلات — Scheduled Post Details"
      description="تفصیلی مواد، میڈیا اسنیپ شاٹ اور اشاعت کی معلومات۔"
      maxWidth="xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Platform & Status Header */}
        <div className="p-4 bg-sand-cream rounded-2xl border border-sand-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border shadow-2xs">
              <SocialIcon platform={post.platform} className={`w-6 h-6 ${info?.color}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-deep">
                {info?.name} ({info?.urduName})
              </h4>
              <p className="text-xs text-charcoal-muted">
                Account: <strong>{post.account_name}</strong>
              </p>
            </div>
          </div>

          <div>{getStatusBadge(post.status)}</div>
        </div>

        {/* Timing Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-sand-ivory rounded-xl border border-sand-border text-xs">
          <div>
            <span className="text-charcoal-muted block text-[11px] font-mono uppercase">
              Scheduled For (Local)
            </span>
            <strong className="text-emerald-deep">
              {formatScheduledDateTime(post.scheduled_for, post.timezone)}
            </strong>
          </div>
          <div>
            <span className="text-charcoal-muted block text-[11px] font-mono uppercase">
              Timezone &amp; UTC
            </span>
            <span className="text-charcoal-main font-mono text-[11px]">
              {post.timezone} ({new Date(post.scheduled_for).toUTCString()})
            </span>
          </div>
        </div>

        {/* Error Message Alert (if failed or needs reconnect) */}
        {post.error_message && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl space-y-1">
            <span className="font-semibold block text-[11px]">Error Details:</span>
            <p className="text-[11px]">{post.error_message}</p>
          </div>
        )}

        {/* Media Preview (if attached) */}
        {post.media && (
          <div className="p-3 bg-sand-cream rounded-xl border border-sand-border flex items-center gap-3">
            <div className="relative w-16 h-12 bg-charcoal-main rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {post.media.file_type === 'video' ? (
                <Film className="w-5 h-5 text-gold-primary" />
              ) : (
                <Image
                  src={post.media.public_url}
                  alt={post.media.file_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase text-emerald-deep font-semibold">
                Attached {post.media.file_type}
              </span>
              <p className="text-xs font-medium text-charcoal-main truncate">{post.media.file_name}</p>
            </div>
          </div>
        )}

        {/* Content Snapshot Display */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-muted font-semibold">
            Approved Content Snapshot
          </h4>

          {snapshot.title && (
            <div className="text-xs font-bold text-emerald-deep">
              📌 {snapshot.title}
            </div>
          )}

          <div className="p-4 bg-sand-ivory rounded-xl border border-sand-border/80 text-xs text-charcoal-main leading-relaxed font-urdu whitespace-pre-line">
            {caption || 'No copy available in snapshot.'}
          </div>

          {snapshot.hashtags && snapshot.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {snapshot.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono text-emerald-primary bg-emerald-subtle/50 px-1.5 py-0.5 rounded"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {snapshot.cta && (
            <div className="text-xs font-medium text-emerald-deep pt-1">
              👉 {snapshot.cta}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-sand-border/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isActionable && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenReschedule(post);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reschedule
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTogglePause(post)}
                  leftIcon={post.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                >
                  {post.status === 'paused' ? 'Resume' : 'Pause'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancelSchedule(post)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Cancel Schedule
                </Button>
              </>
            )}
          </div>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
