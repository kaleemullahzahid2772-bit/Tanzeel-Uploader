import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { DateRangePreset, SocialPlatform, AnalyticsOverviewKPIs, AnalyticsSnapshot, PostAnalytics } from '@/lib/types/database';
import { calculateDateRange, computeDelta, calculateEngagementRate } from '@/lib/analytics/normalizer';

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

    const { startDate, endDate, prevStartDate, prevEndDate } = calculateDateRange(preset, customStart, customEnd);

    // 1. Fetch current period snapshots
    let currentSnapshotsQuery = supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate);

    if (platform && platform !== 'all') {
      currentSnapshotsQuery = currentSnapshotsQuery.eq('platform', platform);
    }
    if (accountId && accountId !== 'all') {
      currentSnapshotsQuery = currentSnapshotsQuery.eq('social_account_id', accountId);
    }

    const { data: currentSnapshots } = await currentSnapshotsQuery;

    // 2. Fetch previous period snapshots
    let prevSnapshotsQuery = supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', prevStartDate)
      .lte('metric_date', prevEndDate);

    if (platform && platform !== 'all') {
      prevSnapshotsQuery = prevSnapshotsQuery.eq('platform', platform);
    }
    if (accountId && accountId !== 'all') {
      prevSnapshotsQuery = prevSnapshotsQuery.eq('social_account_id', accountId);
    }

    const { data: prevSnapshots } = await prevSnapshotsQuery;

    // 3. Fetch current post analytics
    let currentPostsQuery = supabase
      .from('post_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('published_at', startDate + 'T00:00:00.000Z')
      .lte('published_at', endDate + 'T23:59:59.999Z');

    if (platform && platform !== 'all') {
      currentPostsQuery = currentPostsQuery.eq('platform', platform);
    }
    if (accountId && accountId !== 'all') {
      currentPostsQuery = currentPostsQuery.eq('social_account_id', accountId);
    }

    const { data: currentPosts } = await currentPostsQuery;

    // 4. Fetch previous post analytics
    let prevPostsQuery = supabase
      .from('post_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('published_at', prevStartDate + 'T00:00:00.000Z')
      .lte('published_at', prevEndDate + 'T23:59:59.999Z');

    if (platform && platform !== 'all') {
      prevPostsQuery = prevPostsQuery.eq('platform', platform);
    }
    if (accountId && accountId !== 'all') {
      prevPostsQuery = prevPostsQuery.eq('social_account_id', accountId);
    }

    const { data: prevPosts } = await prevPostsQuery;

    // Aggregations
    const curSnap = (currentSnapshots || []) as AnalyticsSnapshot[];
    const prvSnap = (prevSnapshots || []) as AnalyticsSnapshot[];
    const curPst = (currentPosts || []) as PostAnalytics[];
    const prvPst = (prevPosts || []) as PostAnalytics[];

    // Followers: latest snapshot value per account
    const latestFollowersMap: Record<string, number> = {};
    for (const s of curSnap) {
      latestFollowersMap[s.social_account_id] = Math.max(latestFollowersMap[s.social_account_id] || 0, s.followers);
    }
    const curFollowers = Object.values(latestFollowersMap).reduce((a, b) => a + b, 0);

    const prevFollowersMap: Record<string, number> = {};
    for (const s of prvSnap) {
      prevFollowersMap[s.social_account_id] = Math.max(prevFollowersMap[s.social_account_id] || 0, s.followers);
    }
    const prevFollowers = Object.values(prevFollowersMap).reduce((a, b) => a + b, 0);

    // Sum of post metrics or snapshots
    const curViews = curPst.reduce((sum, p) => sum + p.views, 0) || curSnap.reduce((sum, s) => sum + s.views, 0);
    const prevViews = prvPst.reduce((sum, p) => sum + p.views, 0) || prvSnap.reduce((sum, s) => sum + s.views, 0);

    const curLikes = curPst.reduce((sum, p) => sum + p.likes, 0) || curSnap.reduce((sum, s) => sum + s.likes, 0);
    const prevLikes = prvPst.reduce((sum, p) => sum + p.likes, 0) || prvSnap.reduce((sum, s) => sum + s.likes, 0);

    const curComments = curPst.reduce((sum, p) => sum + p.comments, 0) || curSnap.reduce((sum, s) => sum + s.comments, 0);
    const prevComments = prvPst.reduce((sum, p) => sum + p.comments, 0) || prvSnap.reduce((sum, s) => sum + s.comments, 0);

    const curShares = curPst.reduce((sum, p) => sum + p.shares, 0) || curSnap.reduce((sum, s) => sum + s.shares, 0);
    const prevShares = prvPst.reduce((sum, p) => sum + p.shares, 0) || prvSnap.reduce((sum, s) => sum + s.shares, 0);

    const curReach = curPst.reduce((sum, p) => sum + p.reach, 0) || curSnap.reduce((sum, s) => sum + s.reach, 0);
    const prevReach = prvPst.reduce((sum, p) => sum + p.reach, 0) || prvSnap.reduce((sum, s) => sum + s.reach, 0);

    const curImpressions = curPst.reduce((sum, p) => sum + p.impressions, 0) || curSnap.reduce((sum, s) => sum + s.impressions, 0);
    const prevImpressions = prvPst.reduce((sum, p) => sum + p.impressions, 0) || prvSnap.reduce((sum, s) => sum + s.impressions, 0);

    const curEngagementRate = calculateEngagementRate(curLikes, curComments, curShares, curReach || curViews);
    const prevEngagementRate = calculateEngagementRate(prevLikes, prevComments, prevShares, prevReach || prevViews);

    const kpis: AnalyticsOverviewKPIs = {
      followers: computeDelta(curFollowers, prevFollowers),
      views: computeDelta(curViews, prevViews),
      likes: computeDelta(curLikes, prevLikes),
      comments: computeDelta(curComments, prevComments),
      shares: computeDelta(curShares, prevShares),
      reach: computeDelta(curReach, prevReach),
      impressions: computeDelta(curImpressions, prevImpressions),
      engagementRate: computeDelta(curEngagementRate, prevEngagementRate),
      publishedPosts: computeDelta(curPst.length, prvPst.length),
      lastSyncedAt: curSnap[0]?.updated_at || curPst[0]?.fetched_at || null,
    };

    return NextResponse.json({
      kpis,
      dateRange: { startDate, endDate, prevStartDate, prevEndDate, preset },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch overview analytics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}