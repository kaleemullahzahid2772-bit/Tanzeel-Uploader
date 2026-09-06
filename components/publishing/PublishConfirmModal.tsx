'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import {
  SocialPlatform,
  SocialAccountPublic,
  PlatformContentData,
  MediaItem,
  PublishTarget,
} from '@/lib/types/database';
import {
  Send,
  AlertTriangle,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targets: PublishTarget[]) => void;
  platforms: SocialPlatform[];
  contents: Record<SocialPlatform, PlatformContentData>;
  media?: MediaItem | null;
  accounts: SocialAccountPublic[];
  isPublishing?: boolean;
}

export function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  platforms,
  contents,
  media,
  accounts,
  isPublishing = false,
}: PublishConfirmModalProps) {
  // Map platform to selected accountId
  const [selectedAccountMap, setSelectedAccountMap] = useState<Record<SocialPlatform, string>>(
    {} as Record<SocialPlatform, string>
  );

  // Auto-select first connected account for each active platform
  useEffect(() => {
    const newMap: Record<SocialPlatform, string> = { ...selectedAccountMap };
    platforms.forEach((p) => {
      if (!newMap[p]) {
        const available = accounts.filter((a) => a.platform === p && a.status === 'connected');
        if (available.length > 0) {
          newMap[p] = available[0].id;
        }
      }
    });
    setSelectedAccountMap(newMap);
  }, [platforms, accounts]);

  const handleAccountChange = (platform: SocialPlatform, accountId: string) => {
    setSelectedAccountMap((prev) => ({
      ...prev,
      [platform]: accountId,
    }));
  };

  // Build target list
  const validTargets: PublishTarget[] = [];
  const validationWarnings: { platform: SocialPlatform; message: string }[] = [];

  platforms.forEach((platform) => {
    const accountId = selectedAccountMap[platform];
    const content = contents[platform];
    const account = accounts.find((a) => a.id === accountId);

    if (!accountId || !account) {
      validationWarnings.push({
        platform,
        message: `No connected ${PLATFORM_INFO[platform]?.name} account selected.`,
      });
      return;
    }

    // Media checks
    if ((platform === 'instagram' || platform === 'tiktok' || platform === 'youtube') && !media) {
      validationWarnings.push({
        platform,
        message: `${PLATFORM_INFO[platform]?.name} requires an attached media file.`,
      });
    }

    if (platform === 'youtube' && media && media.file_type !== 'video') {
      validationWarnings.push({
        platform,
        message: 'YouTube requires a video file (images not supported).',
      });
    }

    if (content) {
      validTargets.push({
        platform,
        accountId: account.id,
        accountName: account.account_name,
        content,
      });
    }
  });

  const handlePublishClick = () => {
    if (validTargets.length === 0) return;
    onConfirm(validTargets);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="پبلش کی حتمی تصدیق — Final Publish Confirmation"
      description="براہ کرم سوشل اکاؤنٹس اور مواد کا حتمی جائزہ لیں۔"
      maxWidth="2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Islamic Header Banner */}
        <div className="p-4 bg-emerald-subtle/50 rounded-2xl border border-emerald-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-primary text-gold-light flex items-center justify-center font-serif text-lg font-bold shadow-subtle">
              ﷽
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-deep font-urdu">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — اشاعت کی تیاری
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Official API Direct Publishing • Zero Fake Data Policy
              </p>
            </div>
          </div>
          <Badge variant="gold" size="sm" className="hidden sm:flex">
            Phase 5 Verified
          </Badge>
        </div>

        {/* Attached Media Summary */}
        {media ? (
          <div className="p-3.5 bg-sand-cream rounded-xl border border-sand-border flex items-center gap-3">
            <div className="relative w-16 h-12 bg-charcoal-main rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {media.file_type === 'video' ? (
                <Film className="w-5 h-5 text-gold-primary" />
              ) : (
                <Image
                  src={media.public_url}
                  alt={media.file_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase text-emerald-deep font-semibold">
                Attached {media.file_type}
              </span>
              <p className="text-xs font-medium text-charcoal-main truncate">{media.file_name}</p>
            </div>
            <Badge variant="emerald" size="sm">
              Ready
            </Badge>
          </div>
        ) : (
          <div className="p-3 bg-sand-ivory rounded-xl border border-sand-border text-xs text-charcoal-muted flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-charcoal-light" />
            <span>Text-only publication (No media file attached).</span>
          </div>
        )}

        {/* Pre-flight Warnings if any */}
        {validationWarnings.length > 0 && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 space-y-1.5 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Publishing Warnings (تنبیہات):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
              {validationWarnings.map((w, idx) => (
                <li key={idx}>
                  <strong>{PLATFORM_INFO[w.platform]?.name}:</strong> {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Platform Breakdown & Account Selection */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-muted font-semibold">
            Target Channels & Copy Preview
          </h4>

          <div className="space-y-3">
            {platforms.map((platform) => {
              const info = PLATFORM_INFO[platform];
              const content = contents[platform];
              const availableAccounts = accounts.filter(
                (a) => a.platform === platform && a.status === 'connected'
              );
              const selectedAccountId = selectedAccountMap[platform];
              const isAccountSelected = !!selectedAccountId;

              const textPreview = content?.caption || content?.description || content?.hook || '';

              return (
                <div
                  key={platform}
                  className={`p-4 rounded-xl border transition-all ${
                    isAccountSelected
                      ? 'bg-sand-ivory border-sand-border shadow-xs'
                      : 'bg-sand-muted/20 border-sand-border opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
                    <div className="flex items-center gap-2.5">
                      <SocialIcon platform={platform} className={`w-5 h-5 ${info.color}`} />
                      <div>
                        <div className="text-xs font-semibold text-emerald-deep flex items-center gap-1.5">
                          <span>{info.name}</span>
                          <span className="text-[10px] text-charcoal-muted">({info.urduName})</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Selector */}
                    <div className="flex items-center gap-2">
                      {availableAccounts.length > 0 ? (
                        <select
                          value={selectedAccountId || ''}
                          onChange={(e) => handleAccountChange(platform, e.target.value)}
                          className="text-xs py-1.5 px-2.5 bg-sand-cream border border-sand-border rounded-lg text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
                        >
                          {availableAccounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.account_name} ({acc.username ? `@${acc.username}` : 'Page'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          No Account Connected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Copy Snippet */}
                  {content ? (
                    <div className="mt-3 space-y-2">
                      {content.title && (
                        <div className="text-xs font-semibold text-emerald-deep truncate">
                          📌 {content.title}
                        </div>
                      )}
                      <p className="text-xs text-charcoal-main line-clamp-3 leading-relaxed font-urdu whitespace-pre-line bg-sand-cream/50 p-2.5 rounded-lg border border-sand-border/40">
                        {textPreview || 'No copy generated.'}
                      </p>
                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {content.hashtags.slice(0, 5).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono text-emerald-primary bg-emerald-subtle/50 px-1.5 py-0.5 rounded"
                            >
                              {t.startsWith('#') ? t : `#${t}`}
                            </span>
                          ))}
                          {content.hashtags.length > 5 && (
                            <span className="text-[10px] text-charcoal-muted">
                              +{content.hashtags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-charcoal-muted italic">
                      No content data available for {info.name}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-sand-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-charcoal-muted">
            <span className="font-semibold text-emerald-deep">{validTargets.length}</span> of {platforms.length} platform(s) ready
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isPublishing}>
              Cancel (منسوخ)
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={isPublishing}
              disabled={validTargets.length === 0}
              onClick={handlePublishClick}
              leftIcon={<Send className="w-4 h-4 text-gold-light" />}
              className="shadow-elevated bg-emerald-primary text-gold-light"
            >
              🚀 Publish Now ({validTargets.length} Channels)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
