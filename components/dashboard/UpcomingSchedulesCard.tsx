'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScheduledPost } from '@/lib/types/database';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { formatScheduledDateTime } from '@/lib/scheduling/timezone';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';

export function UpcomingSchedulesCard() {
  const [schedules, setSchedules] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch('/api/scheduling/posts?status=scheduled&limit=3');
        if (res.ok) {
          const data = await res.json();
          setSchedules(data.schedules || []);
        }
      } catch (err) {
        console.error('Failed to load upcoming schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="rounded-2xl bg-sand-ivory border border-sand-border p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold-subtle text-gold-deep border border-gold-border/60">
            <Calendar className="w-5 h-5 text-gold-deep" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-emerald-deep flex items-center gap-2">
              <span>Upcoming Scheduled Content</span>
              <span className="text-xs font-sans text-gold-deep font-semibold">
                ({schedules.length} active)
              </span>
            </h3>
            <p className="text-xs text-charcoal-muted">
              Auto-publishing via background worker without needing an open browser tab.
            </p>
          </div>
        </div>

        <Link href="/dashboard/calendar">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View Calendar (کیلنڈر)
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-charcoal-muted animate-pulse">
          Loading upcoming schedules...
        </div>
      ) : schedules.length === 0 ? (
        <div className="p-6 text-center bg-sand-cream/40 rounded-xl border border-sand-border/60 space-y-2">
          <Clock className="w-6 h-6 text-charcoal-light mx-auto" />
          <p className="text-xs text-charcoal-muted">
            No posts currently scheduled. Plan ahead in the Content Studio!
          </p>
          <Link href="/dashboard/create-post">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-gold-light" />}>
              Create &amp; Schedule
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {schedules.map((item) => {
            const platformInfo = PLATFORM_INFO[item.platform];
            const timeFormatted = formatScheduledDateTime(item.scheduled_for, item.timezone);

            return (
              <div
                key={item.id}
                className="p-3.5 bg-sand-cream/60 rounded-xl border border-sand-border/80 flex flex-col justify-between gap-3 hover:border-gold-primary/60 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform={item.platform} className="w-4 h-4 text-emerald-primary" />
                    <span className="text-xs font-semibold text-emerald-deep">
                      {platformInfo?.name || item.platform}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-subtle text-emerald-deep font-semibold border border-emerald-primary/20">
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-charcoal-main line-clamp-2 leading-relaxed">
                  {item.content_snapshot?.caption || 'Islamic Content Post'}
                </p>

                <div className="pt-2 border-t border-sand-border/50 flex items-center justify-between text-[11px] text-charcoal-muted font-mono">
                  <div className="flex items-center gap-1 text-gold-deep">
                    <Clock className="w-3 h-3 text-gold-primary" />
                    <span>{timeFormatted}</span>
                  </div>
                  <span className="text-[10px] text-charcoal-light truncate max-w-[80px]">
                    {item.timezone.split('/')[1] || item.timezone}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
