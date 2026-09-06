'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ScheduledPost,
  ScheduledPostStatus,
  SocialPlatform,
  CalendarViewMode,
} from '@/lib/types/database';
import { PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarEventDetailModal } from '@/components/scheduling/CalendarEventDetailModal';
import { RescheduleModal } from '@/components/scheduling/RescheduleModal';
import {
  formatScheduledDateTime,
  getLocalDateAndTime,
} from '@/lib/scheduling/timezone';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusSquare,
  Filter,
  Search,
  RotateCcw,
  Clock,
  ListFilter,
  LayoutGrid,
  CalendarDays,
  CalendarRange,
  Pause,
  Play,
  XCircle,
  Sparkles,
} from 'lucide-react';

const ALL_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'whatsapp',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContentCalendarPage() {
  const { user } = useAuth();

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Data & Filters
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [postToReschedule, setPostToReschedule] = useState<ScheduledPost | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const fetchScheduledPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/scheduling/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.warn('Error fetching scheduled posts:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, platformFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchScheduledPosts();
  }, [fetchScheduledPosts]);

  // Actions
  const handleTogglePause = async (post: ScheduledPost) => {
    try {
      const res = await fetch(`/api/scheduling/${post.id}/pause`, { method: 'POST' });
      if (res.ok) {
        await fetchScheduledPosts();
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost((prev) => (prev ? { ...prev, status: prev.status === 'paused' ? 'scheduled' : 'paused' } : null));
        }
      }
    } catch (e) {
      console.error('Toggle pause error:', e);
    }
  };

  const handleCancelSchedule = async (post: ScheduledPost) => {
    if (!confirm('Are you sure you want to cancel this scheduled post? (کیا آپ واقعی شیڈول منسوخ کرنا چاہتے ہیں؟)')) return;
    try {
      const res = await fetch(`/api/scheduling/${post.id}/cancel`, { method: 'POST' });
      if (res.ok) {
        await fetchScheduledPosts();
        setIsDetailOpen(false);
      }
    } catch (e) {
      console.error('Cancel schedule error:', e);
    }
  };

  const handleRescheduleSubmit = async (scheduleId: string, newScheduledForUtc: string, newTimezone: string) => {
    const res = await fetch(`/api/scheduling/${scheduleId}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor: newScheduledForUtc, timezone: newTimezone }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reschedule');
    }

    await fetchScheduledPosts();
  };

  // Calendar Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else if (viewMode === 'day') next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else if (viewMode === 'day') next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayIndex = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: d.toISOString().split('T')[0] });
    }

    // Next month padding to fill complete weeks (multiple of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
      }
    }

    return days;
  }, [currentDate]);

  // Map posts by Date string (YYYY-MM-DD) in user timezone
  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    posts.forEach((post) => {
      const { dateStr } = getLocalDateAndTime(post.scheduled_for, post.timezone || 'Asia/Karachi');
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(post);
    });
    return map;
  }, [posts]);

  const monthYearLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold-deep mb-1 font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-gold-primary" />
            <span>Phase 6 — Smart Scheduling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-deep font-urdu">
            سوشل میڈیا کنٹینٹ کیلنڈر — Content Calendar
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Visual planning, automated background worker delivery, and multi-channel scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/create-post">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusSquare className="w-4 h-4 text-gold-light" />}
              className="shadow-elevated bg-emerald-primary text-gold-light"
            >
              Create &amp; Schedule Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Controls & Navigation Bar */}
      <div className="p-4 bg-sand-ivory rounded-2xl border border-sand-border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation & Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-sand-cream p-1 rounded-xl border border-sand-border">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-sand-ivory text-emerald-deep transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-sand-ivory text-emerald-deep transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-sand-ivory text-emerald-deep transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-serif text-lg font-bold text-emerald-deep min-w-[170px]">
            {monthYearLabel}
          </h3>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex rounded-xl bg-sand-cream p-1 border border-sand-border">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'month'
                ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                : 'text-charcoal-muted hover:text-emerald-deep'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Month (مہینہ)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'week'
                ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                : 'text-charcoal-muted hover:text-emerald-deep'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Week (ہفتہ)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'day'
                ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                : 'text-charcoal-muted hover:text-emerald-deep'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Day (یوم)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                : 'text-charcoal-muted hover:text-emerald-deep'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List (فہرست)</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search post topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs py-1.5 pl-8 pr-3 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep placeholder:text-charcoal-light focus:ring-1 focus:ring-gold-primary focus:outline-hidden w-36 sm:w-44"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          >
            <option value="all">All Channels</option>
            {ALL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_INFO[p]?.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-sand-cream border border-sand-border rounded-xl text-emerald-deep font-medium focus:ring-1 focus:ring-gold-primary focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="processing">Processing</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchScheduledPosts}
            loading={loading}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* VIEW 1: MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-2xl border border-sand-border overflow-hidden bg-sand-ivory shadow-xs">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-sand-cream border-b border-sand-border text-center text-xs font-semibold text-emerald-deep py-2.5">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="tracking-wider font-mono uppercase text-[11px]">
                {day}
              </div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-sand-border/60">
            {monthData.map((item, idx) => {
              const dayPosts = postsByDate[item.dateStr] || [];
              const isToday = new Date().toISOString().split('T')[0] === item.dateStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    item.isCurrentMonth ? 'bg-sand-ivory hover:bg-sand-cream/30' : 'bg-sand-muted/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-primary text-gold-light shadow-xs'
                          : 'text-charcoal-main'
                      }`}
                    >
                      {item.date.getDate()}
                    </span>

                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-mono text-gold-deep font-semibold">
                        {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                    {dayPosts.map((post) => {
                      const info = PLATFORM_INFO[post.platform];
                      const { formattedTime } = getLocalDateAndTime(post.scheduled_for, post.timezone);
                      const title = post.content_snapshot?.title || post.content_snapshot?.caption || 'Post';

                      return (
                        <div
                          key={post.id}
                          onClick={() => {
                            setSelectedPost(post);
                            setIsDetailOpen(true);
                          }}
                          className={`cursor-pointer p-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-subtle ${
                            post.status === 'published'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : post.status === 'failed'
                              ? 'bg-rose-50 text-rose-900 border-rose-200'
                              : post.status === 'paused'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-sand-cream/90 text-emerald-deep border-sand-border hover:border-gold-primary'
                          }`}
                        >
                          <SocialIcon platform={post.platform} className={`w-3.5 h-3.5 ${info?.color}`} />
                          <span className="font-mono text-[9px] font-semibold text-charcoal-muted truncate shrink-0">
                            {formattedTime}
                          </span>
                          <span className="truncate font-medium font-urdu flex-1">{title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="rounded-2xl border border-sand-border overflow-hidden bg-sand-ivory shadow-xs p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((dayName, idx) => {
              // Calculate date for this day in selected week
              const curr = new Date(currentDate);
              const first = curr.getDate() - curr.getDay() + idx;
              const dayDate = new Date(curr.setDate(first));
              const dateStr = dayDate.toISOString().split('T')[0];
              const dayPosts = postsByDate[dateStr] || [];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col gap-2 min-h-[200px] ${
                    isToday ? 'bg-gold-subtle/30 border-gold-primary/50' : 'bg-sand-cream/60 border-sand-border'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-sand-border/60 pb-2">
                    <span className="text-xs font-semibold text-emerald-deep">{dayName}</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        isToday ? 'bg-emerald-primary text-gold-light' : 'text-charcoal-muted'
                      }`}
                    >
                      {dayDate.getDate()} {dayDate.toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayPosts.length === 0 ? (
                      <div className="text-[11px] text-charcoal-light italic text-center pt-6">
                        No posts scheduled
                      </div>
                    ) : (
                      dayPosts.map((post) => {
                        const info = PLATFORM_INFO[post.platform];
                        const { formattedTime } = getLocalDateAndTime(post.scheduled_for, post.timezone);
                        return (
                          <div
                            key={post.id}
                            onClick={() => {
                              setSelectedPost(post);
                              setIsDetailOpen(true);
                            }}
                            className="cursor-pointer p-2 rounded-lg bg-sand-ivory border border-sand-border hover:border-gold-primary shadow-2xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1">
                                <SocialIcon platform={post.platform} className={`w-3.5 h-3.5 ${info?.color}`} />
                                <span className="font-semibold text-emerald-deep">{info?.name}</span>
                              </div>
                              <span className="font-mono text-charcoal-muted">{formattedTime}</span>
                            </div>
                            <p className="text-[11px] text-charcoal-main font-urdu truncate">
                              {post.content_snapshot?.title || post.content_snapshot?.caption || 'Post'}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="p-6 bg-sand-ivory rounded-2xl border border-sand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-border">
            <h3 className="font-serif text-lg font-bold text-emerald-deep">
              Agenda for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <span className="text-xs font-mono text-gold-deep font-semibold">
              {(postsByDate[currentDate.toISOString().split('T')[0]] || []).length} scheduled posts
            </span>
          </div>

          <div className="space-y-3">
            {(postsByDate[currentDate.toISOString().split('T')[0]] || []).length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-muted space-y-2">
                <Clock className="w-8 h-8 text-gold-deep mx-auto opacity-70" />
                <p>No social media posts scheduled for this day.</p>
                <Link href="/dashboard/create-post">
                  <Button variant="outline" size="sm">
                    Schedule a Post Now
                  </Button>
                </Link>
              </div>
            ) : (
              (postsByDate[currentDate.toISOString().split('T')[0]] || []).map((post) => {
                const info = PLATFORM_INFO[post.platform];
                const { formattedTime } = getLocalDateAndTime(post.scheduled_for, post.timezone);

                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsDetailOpen(true);
                    }}
                    className="cursor-pointer p-4 bg-sand-cream/80 hover:bg-sand-cream rounded-xl border border-sand-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-sand-ivory rounded-xl border border-sand-border">
                        <SocialIcon platform={post.platform} className={`w-5 h-5 ${info?.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-deep">{info?.name}</span>
                          <span className="text-[11px] font-mono text-charcoal-muted">
                            • {post.account_name}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-primary bg-emerald-subtle/50 px-2 py-0.5 rounded">
                            {formattedTime}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-main font-urdu mt-1 line-clamp-2 leading-relaxed">
                          {post.content_snapshot?.title || post.content_snapshot?.caption || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostToReschedule(post);
                          setIsRescheduleOpen(true);
                        }}
                      >
                        Reschedule
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-sand-border overflow-hidden bg-sand-ivory shadow-xs">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-xs text-charcoal-muted space-y-2">
              <CalendarIcon className="w-8 h-8 text-gold-deep mx-auto opacity-70" />
              <p>No scheduled posts matching your active filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal-main">
                <thead className="bg-sand-cream/80 text-[11px] font-mono uppercase tracking-wider text-charcoal-muted border-b border-sand-border">
                  <tr>
                    <th className="py-3.5 px-4">Scheduled Date &amp; Time</th>
                    <th className="py-3.5 px-4">Channel &amp; Account</th>
                    <th className="py-3.5 px-4">Content Excerpt</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/60">
                  {posts.map((post) => {
                    const info = PLATFORM_INFO[post.platform];
                    const snapshot = post.content_snapshot || {};
                    const isActionable = post.status === 'scheduled' || post.status === 'paused' || post.status === 'failed';

                    return (
                      <tr key={post.id} className="hover:bg-sand-cream/40 transition-colors">
                        {/* Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-emerald-deep">
                            {formatScheduledDateTime(post.scheduled_for, post.timezone)}
                          </div>
                          <div className="text-[10px] font-mono text-charcoal-muted">
                            {post.timezone}
                          </div>
                        </td>

                        {/* Channel */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <SocialIcon platform={post.platform} className={`w-4 h-4 ${info?.color}`} />
                            <div>
                              <div className="font-semibold text-emerald-deep">{info?.name || post.platform}</div>
                              <div className="text-[10px] text-charcoal-muted">{post.account_name}</div>
                            </div>
                          </div>
                        </td>

                        {/* Excerpt */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {snapshot.title && (
                            <div className="font-medium text-emerald-deep truncate">{snapshot.title}</div>
                          )}
                          <p className="text-[11px] text-charcoal-muted truncate font-urdu">
                            {snapshot.caption || snapshot.description || '—'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              post.status === 'published'
                                ? 'emerald'
                                : post.status === 'failed'
                                ? 'failed'
                                : post.status === 'paused'
                                ? 'draft'
                                : 'gold'
                            }
                            size="sm"
                          >
                            {post.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setIsDetailOpen(true);
                              }}
                            >
                              Details
                            </Button>

                            {isActionable && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPostToReschedule(post);
                                    setIsRescheduleOpen(true);
                                  }}
                                  leftIcon={<RotateCcw className="w-3 h-3" />}
                                >
                                  Reschedule
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePause(post)}
                                  className="text-xs"
                                >
                                  {post.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Event Detail Modal */}
      {isDetailOpen && (
        <CalendarEventDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          post={selectedPost}
          onOpenReschedule={(post) => {
            setPostToReschedule(post);
            setIsRescheduleOpen(true);
          }}
          onTogglePause={handleTogglePause}
          onCancelSchedule={handleCancelSchedule}
        />
      )}

      {/* MODAL 2: Reschedule Modal */}
      {isRescheduleOpen && (
        <RescheduleModal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          post={postToReschedule}
          onReschedule={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
