import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { DateRangePreset, SocialPlatform, AnalyticsTimeSeriesPoint, PostAnalytics, AnalyticsSnapshot } from '@/lib/types/database';
import { calculateDateRange, formatDateYMD } from '@/lib/analytics/normalizer';

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
    const platform = searchParams.get('platform') as SocialPlatform | 'all' | null;
    const accountId = searchParams.get('accountId');

    const { startDate, endDate } = calculateDateRange(preset, customStart, customEnd);

    // 1. Fetch snapshots
    let snapshotsQuery = supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (platform && platform !== 'all') snapshotsQuery = snapshotsQuery.eq('platform', platform);
    if (accountId && accountId !== 'all') snapshotsQuery = snapshotsQuery.eq('social_account_id', accountId);

    const { data: snapshots } = await snapshotsQuery;

    // 2. Fetch posts
    let postsQuery = supabase
      .from('post_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('published_at', startDate + 'T00:00:00.000Z')
      .lte('published_at', endDate + 'T23:59:59.999Z');

    if (platform && platform !== 'all') postsQuery = postsQuery.eq('platform', platform);
    if (accountId && accountId !== 'all') postsQuery = postsQuery.eq('social_account_id', accountId);

    const { data: posts } = await postsQuery;

    // Generate date map
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const daysMap: Record<string, AnalyticsTimeSeriesPoint> = {};

    for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + 1)) {
      const dStr = formatDateYMD(d);
      daysMap[dStr] = {
        date: dStr,
        followers: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        impressions: 0,
        engagement: 0,
        postsPublished: 0,
      };
    }

    // Populate from snapshots
    for (const s of (snapshots || []) as AnalyticsSnapshot[]) {
      if (daysMap[s.metric_date]) {
        daysMap[s.metric_date].followers += s.followers;
        daysMap[s.metric_date].views += s.views;
        daysMap[s.metric_date].likes += s.likes;
        daysMap[s.metric_date].comments += s.comments;
        daysMap[s.metric_date].shares += s.shares;
        daysMap[s.metric_date].reach += s.reach;
        daysMap[s.metric_date].impressions += s.impressions;
        daysMap[s.metric_date].engagement += (s.likes + s.comments + s.shares);
      }
    }

    // Populate from posts
    for (const p of (posts || []) as PostAnalytics[]) {
      const pDate = p.published_at.slice(0, 10);
      if (daysMap[pDate]) {
        daysMap[pDate].postsPublished += 1;
        daysMap[pDate].views += p.views;
        daysMap[pDate].likes += p.likes;
        daysMap[pDate].comments += p.comments;
        daysMap[pDate].shares += p.shares;
        daysMap[pDate].reach += p.reach;
        daysMap[pDate].impressions += p.impressions;
        daysMap[pDate].engagement += (p.likes + p.comments + p.shares);
      }
    }

    const points = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ points });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch timeseries analytics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}