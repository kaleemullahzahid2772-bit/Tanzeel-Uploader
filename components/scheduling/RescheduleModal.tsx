'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ScheduledPost } from '@/lib/types/database';
import {
  COMMON_TIMEZONES,
  convertLocalToUTC,
  getLocalDateAndTime,
  formatScheduledDateTime,
  isFutureUTC,
} from '@/lib/scheduling/timezone';
import { Calendar as CalendarIcon, Clock, Globe, AlertCircle } from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  onReschedule: (scheduleId: string, newScheduledForUtc: string, newTimezone: string) => Promise<void>;
}

export function RescheduleModal({
  isOpen,
  onClose,
  post,
  onReschedule,
}: RescheduleModalProps) {
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      const tz = post.timezone || 'Asia/Karachi';
      setTimezone(tz);
      const parts = getLocalDateAndTime(post.scheduled_for, tz);
      setDateStr(parts.dateStr);
      setTimeStr(parts.timeStr);
    }
  }, [post]);

  let calculatedUtcIso = '';
  let isFuture = false;

  if (dateStr && timeStr) {
    try {
      calculatedUtcIso = convertLocalToUTC(dateStr, timeStr, timezone);
      isFuture = isFutureUTC(calculatedUtcIso, 10);
    } catch {
      isFuture = false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !isFuture) return;

    setLoading(true);
    setError(null);

    try {
      await onReschedule(post.id, calculatedUtcIso, timezone);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule post.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="پوسٹ کا وقت تبدیل کریں — Reschedule Post"
      description={`نئی تاریخ اور وقت منتخب کریں برائے ${post?.platform || 'سوشل میڈیا'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-emerald-primary" />
            <span>New Date (نئی تاریخ) *</span>
          </label>
          <input
            type="date"
            required
            min={todayStr}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-primary" />
            <span>New Time (نیا وقت) *</span>
          </label>
          <input
            type="time"
            required
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          />
        </div>

        {/* Timezone Selector */}
        <div>
          <label className="block text-xs font-semibold text-emerald-deep mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-primary" />
            <span>Timezone (ٹائم زون) *</span>
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full text-xs py-2 px-2.5 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>

        {/* Preview Banner */}
        {calculatedUtcIso && (
          <div className="p-3 bg-sand-cream rounded-xl border border-sand-border text-xs space-y-1">
            <span className="text-charcoal-muted">New Scheduled Time: </span>
            <div className="text-emerald-deep font-semibold">
              {formatScheduledDateTime(calculatedUtcIso, timezone)}
            </div>
          </div>
        )}

        {!isFuture && dateStr && timeStr && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>براہ کرم مستقبل کی تاریخ اور وقت منتخب کریں۔</span>
          </div>
        )}

        <div className="pt-3 border-t border-sand-border flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!isFuture}
            leftIcon={<CalendarIcon className="w-3.5 h-3.5 text-gold-light" />}
          >
            Save New Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
