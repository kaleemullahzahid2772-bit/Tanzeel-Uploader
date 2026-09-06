import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import {
  DateRangePreset,
  SocialPlatform,
  PlatformPerformanceSummary,
  ContentTypePerformance,
  TopicPerformance,
  BestPostingInsights,
  PostAnalytics,
  PostAnalyticsContentType,
} from '@/lib/types/database';
import { calculateDateRange } from '@/lib/analytics/normalizer';

const ALL_PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp'];

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const preset = (searchParams.get('preset') as DateRangePreset) || 'last_30d';
    const customStart = searchParams.get('startDate') || undefined;
    const customEnd = searchParams.get('endDate') || undefined;
    const platformFilter = searchParams.get('platform') as SocialPlatform | 'all' | null;
    const accountId = searchParams.get('accountId');

    const { startDate, endDate } = calculateDateRange(preset, customStart, customEnd);

    // 1. Fetch connected accounts
    const { data: connectedAccounts } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, status')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    const connectedPlatforms = new Set((connectedAccounts || []).map(a => a.platform));

    // 2. Fetch post analytics in range
    let query = supabase
      .from('post_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('published_at', startDate + 'T00:00:00.000Z')
      .lte('published_at', endDate + 'T23:59:59.999Z');

    if (platformFilter && platformFilter !== 'all') query = query.eq('platform', platformFilter);
    if (accountId && accountId !== 'all') query = query.eq('social_account_id', accountId);

    const { data: postsData } = await query;
    const posts = (postsData || []) as PostAnalytics[];

    // 3. Platform Comparison
    const platformMap: Record<SocialPlatform, PlatformPerformanceSummary> = {} as Record<SocialPlatform, PlatformPerformanceSummary>;
    for (const p of ALL_PLATFORMS) {
      platformMap[p] = {
        platform: p,
        postCount: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        impressions: 0,
        avgEngagementRate: 0,
        isAvailable: connectedPlatforms.has(p),
        unavailableMetrics: p === 'whatsapp' ? ['views', 'likes', 'comments', 'shares'] : [],
      };
    }

    for (const p of posts) {
      const summary = platformMap[p.platform];
      if (summary) {
        summary.postCount += 1;
        summary.views += p.views;
        summary.likes += p.likes;
        summary.comments += p.comments;
        summary.shares += p.shares;
        summary.reach += p.reach;
        summary.impressions += p.impressions;
        summary.avgEngagementRate += p.engagement_rate;
      }
    }

    const platformComparison = Object.values(platformMap).map(s => ({
      ...s,
      avgEngagementRate: s.postCount > 0 ? Number((s.avgEngagementRate / s.postCount).toFixed(2)) : 0,
    })).filter(s => s.isAvailable || s.postCount > 0);

    // 4. Content Type Breakdown
    const typeMap: Record<PostAnalyticsContentType, ContentTypePerformance> = {
      video: { type: 'video', label: 'Long Video (یوٹیوب / فیس بک)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      reel_short: { type: 'reel_short', label: 'Reels / Shorts (مختصر ویڈیوز)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      image: { type: 'image', label: 'Image / Infographic (تصاویر)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      carousel: { type: 'carousel', label: 'Carousel (ملٹی سلائیڈز)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      text: { type: 'text', label: 'Text / Quote (تحریری پیغامات)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      story: { type: 'story', label: 'Story (اسٹوری)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
      other: { type: 'other', label: 'Other Format (دیگر فارمیٹس)', postCount: 0, views: 0, likes: 0, comments: 0, shares: 0, avgEngagementRate: 0 },
    };

    for (const p of posts) {
      const entry = typeMap[p.content_type] || typeMap.other;
      entry.postCount += 1;
      entry.views += p.views;
      entry.likes += p.likes;
      entry.comments += p.comments;
      entry.shares += p.shares;
      entry.avgEngagementRate += p.engagement_rate;
    }

    const contentTypeBreakdown = Object.values(typeMap)
      .map(t => ({
        ...t,
        avgEngagementRate: t.postCount > 0 ? Number((t.avgEngagementRate / t.postCount).toFixed(2)) : 0,
      }))
      .filter(t => t.postCount > 0);

    // 5. Islamic Topic Breakdown
    const topicMap: Record<string, TopicPerformance> = {};
    for (const p of posts) {
      const t = p.post_topic || 'General Islamic Reflection';
      if (!topicMap[t]) {
        topicMap[t] = {
          topic: t,
          postCount: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          avgEngagementRate: 0,
        };
      }
      topicMap[t].postCount += 1;
      topicMap[t].views += p.views;
      topicMap[t].likes += p.likes;
      topicMap[t].comments += p.comments;
      topicMap[t].shares += p.shares;
      topicMap[t].avgEngagementRate += p.engagement_rate;
    }

    const topicBreakdown = Object.values(topicMap)
      .map(tp => ({
        ...tp,
        avgEngagementRate: tp.postCount > 0 ? Number((tp.avgEngagementRate / tp.postCount).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // 6. Best Posting Time & Day Insights
    const dayOfWeekCounts: Record<string, { posts: number; totalEngagement: number }> = {};
    const hourSlotCounts: Record<string, { posts: number; totalEngagement: number }> = {};
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const p of posts) {
      const date = new Date(p.published_at);
      const day = DAYS[date.getUTCDay()];
      const hour = date.getUTCHours();
      const slot = hour + ':00 - ' + ((hour + 2) % 24) + ':00 UTC';

      if (!dayOfWeekCounts[day]) dayOfWeekCounts[day] = { posts: 0, totalEngagement: 0 };
      dayOfWeekCounts[day].posts += 1;
      dayOfWeekCounts[day].totalEngagement += p.views + p.likes + p.comments;

      if (!hourSlotCounts[slot]) hourSlotCounts[slot] = { posts: 0, totalEngagement: 0 };
      hourSlotCounts[slot].posts += 1;
      hourSlotCounts[slot].totalEngagement += p.views + p.likes + p.comments;
    }

    let bestDayOfWeek: string | null = null;
    let maxDayEngagement = -1;
    for (const [day, data] of Object.entries(dayOfWeekCounts)) {
      const avg = data.totalEngagement / data.posts;
      if (avg > maxDayEngagement) {
        maxDayEngagement = avg;
        bestDayOfWeek = day;
      }
    }

    let bestTimeSlot: string | null = null;
    let maxSlotEngagement = -1;
    for (const [slot, data] of Object.entries(hourSlotCounts)) {
      const avg = data.totalEngagement / data.posts;
      if (avg > maxSlotEngagement) {
        maxSlotEngagement = avg;
        bestTimeSlot = slot;
      }
    }

    let bestPlatform: SocialPlatform | null = null;
    let maxPlatEngagement = -1;
    for (const s of platformComparison) {
      if (s.views > maxPlatEngagement) {
        maxPlatEngagement = s.views;
        bestPlatform = s.platform;
      }
    }

    const dataSufficient = posts.length >= 3;
    const bestPostingInsights: BestPostingInsights = {
      bestTimeSlot: dataSufficient ? bestTimeSlot : null,
      bestDayOfWeek: dataSufficient ? bestDayOfWeek : null,
      bestPlatform: dataSufficient ? bestPlatform : null,
      dataSufficient,
      sampleSize: posts.length,
      note: dataSufficient
        ? 'Calculated from ' + posts.length + ' published post metrics in the selected period.'
        : 'Not enough data available. At least 3 published posts with API metrics are required to calculate peak resonance times.',
    };

    return NextResponse.json({
      platformComparison,
      contentTypeBreakdown,
      topicBreakdown,
      bestPostingInsights,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch breakdown analytics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}