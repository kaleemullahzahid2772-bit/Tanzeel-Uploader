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
  ScheduleTarget,
} from '@/lib/types/database';
import {
  COMMON_TIMEZONES,
  convertLocalToUTC,
  formatScheduledDateTime,
  isFutureUTC,
} from '@/lib/scheduling/timezone';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Film,
  Image as ImageIcon,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import Image from 'next/image';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { scheduledForUtc: string; timezone: string; targets: ScheduleTarget[] }) => void;
  platforms: SocialPlatform[];
  contents: Record<SocialPlatform, PlatformContentData>;
  media?: MediaItem | null;
  accounts: SocialAccountPublic[];
  defaultTimezone?: string;
  isScheduling?: boolean;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  platforms,
  contents,
  media,
  accounts,
  defaultTimezone = 'Asia/Karachi',
  isScheduling = false,
}: ScheduleModalProps) {
  // Selected Accounts Map
  const [selectedAccountMap, setSelectedAccountMap] = useState<Record<SocialPlatform, string>>(
    {} as Record<SocialPlatform, string>
  );

  // Date and Time State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(defaultTimezone);
  const [minDate, setMinDate] = useState<string>('');

  // Pre-fill tomorrow's date & default time
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setMinDate(todayStr);

    // Default to tomorrow 8:00 PM
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

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

  // Build target list & check validations
  const validTargets: ScheduleTarget[] = [];
  const validationWarnings: string[] = [];

  platforms.forEach((platform) => {
    const accountId = selectedAccountMap[platform];
    const content = contents[platform];
    const account = accounts.find((a) => a.id === accountId);

    if (!accountId || !account) {
      validationWarnings.push(`No connected ${PLATFORM_INFO[platform]?.name} account selected.`);
      return;
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

  // Calculate UTC timestamp and validity
  let calculatedUtcIso = '';
  let isFuture = false;

  if (selectedDate && selectedTime) {
    try {
      calculatedUtcIso = convertLocalToUTC(selectedDate, selectedTime, selectedTimezone);
      isFuture = isFutureUTC(calculatedUtcIso, 10);
    } catch {
      isFuture = false;
    }
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFuture || validTargets.length === 0) return;

    onConfirm({
      scheduledForUtc: calculatedUtcIso,
      timezone: selectedTimezone,
      targets: validTargets,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="پوسٹ شیڈول کریں — Schedule Multi-Platform Post"
      description="مستقبل کی تاریخ، وقت اور ٹائم زون منتخب کریں تاکہ سسٹم خودکار طور پر اشاعت کر سکے۔"
      maxWidth="2xl"
    >
      <form onSubmit={handleScheduleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Islamic Header Banner */}
        <div className="p-4 bg-emerald-subtle/50 rounded-2xl border border-emerald-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-primary text-gold-light flex items-center justify-center font-serif text-lg font-bold shadow-subtle">
              ﷽
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-deep font-urdu">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — اسمارٹ شیڈولنگ
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Browser-Independent Background Worker • Atomic Job Locking
              </p>
            </div>
          </div>
          <Badge variant="gold" size="sm" className="hidden sm:flex">
            Phase 6 Active
          </Badge>
        </div>

        {/* Date, Time & Timezone Pickers */}
        <div className="p-4 bg-sand-cream rounded-2xl border border-sand-border space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-muted font-semibold flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gold-deep" />
            <span>1. Timing &amp; Timezone Configuration</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-emerald-primary" />
                <span>Date (تاریخ) *</span>
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-sand-ivory border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
              />
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-primary" />
                <span>Time (وقت) *</span>
              </label>
              <input
                type="time"
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-sand-ivory border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
              />
            </div>

            {/* Timezone Selector */}
            <div>
              <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-primary" />
                <span>Timezone (ٹائم زون) *</span>
              </label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-sand-ivory border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden truncate"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing Preview Banner */}
          {calculatedUtcIso && (
            <div className="p-3 bg-sand-ivory rounded-xl border border-sand-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-charcoal-muted">Local Publishing Time: </span>
                <strong className="text-emerald-deep font-semibold">
                  {formatScheduledDateTime(calculatedUtcIso, selectedTimezone)}
                </strong>
              </div>
              <div className="text-[11px] font-mono text-charcoal-muted">
                UTC: {new Date(calculatedUtcIso).toUTCString()}
              </div>
            </div>
          )}

          {!isFuture && selectedDate && selectedTime && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>براہ کرم مستقبل کی تاریخ اور وقت منتخب کریں۔ (Scheduled time must be in the future).</span>
            </div>
          )}
        </div>

        {/* Attached Media Summary */}
        {media && (
          <div className="p-3.5 bg-sand-cream rounded-xl border border-sand-border flex items-center gap-3">
            <div className="relative w-14 h-10 bg-charcoal-main rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {media.file_type === 'video' ? (
                <Film className="w-4 h-4 text-gold-primary" />
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
                Attached {media.file_type} Snapshot
              </span>
              <p className="text-xs font-medium text-charcoal-main truncate">{media.file_name}</p>
            </div>
            <Badge variant="emerald" size="sm">
              Ready
            </Badge>
          </div>
        )}

        {/* Target Platforms & Account Selectors */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-muted font-semibold">
            2. Selected Channels ({validTargets.length} Ready)
          </h4>

          <div className="space-y-2.5">
            {platforms.map((platform) => {
              const info = PLATFORM_INFO[platform];
              const content = contents[platform];
              const availableAccounts = accounts.filter(
                (a) => a.platform === platform && a.status === 'connected'
              );
              const selectedAccountId = selectedAccountMap[platform];
              const isSelected = !!selectedAccountId;

              return (
                <div
                  key={platform}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sand-ivory border-sand-border shadow-2xs'
                      : 'bg-sand-muted/20 border-sand-border opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SocialIcon platform={platform} className={`w-5 h-5 ${info.color}`} />
                    <div>
                      <div className="text-xs font-semibold text-emerald-deep">
                        {info.name} <span className="text-[10px] text-charcoal-muted">({info.urduName})</span>
                      </div>
                      <div className="text-[11px] text-charcoal-muted truncate max-w-xs font-urdu">
                        {content?.caption || content?.description || content?.title || 'No copy'}
                      </div>
                    </div>
                  </div>

                  <div>
                    {availableAccounts.length > 0 ? (
                      <select
                        value={selectedAccountId || ''}
                        onChange={(e) => handleAccountChange(platform, e.target.value)}
                        className="text-xs py-1 px-2.5 bg-sand-cream border border-sand-border rounded-lg text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
                      >
                        {availableAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.account_name} ({acc.username ? `@${acc.username}` : 'Page'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        No Account Connected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-sand-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-charcoal-muted">
            <span className="font-semibold text-emerald-deep">{validTargets.length}</span> of {platforms.length} channel(s) ready
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isScheduling}>
              Cancel (منسوخ)
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isScheduling}
              disabled={!isFuture || validTargets.length === 0}
              leftIcon={<CalendarIcon className="w-4 h-4 text-gold-light" />}
              className="shadow-elevated bg-emerald-primary text-gold-light"
            >
              📅 Schedule Post ({validTargets.length} Channels)
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
