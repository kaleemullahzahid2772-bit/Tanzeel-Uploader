import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { DateRangePreset, SocialPlatform, PostSortOption } from '@/lib/types/database';
import { calculateDateRange } from '@/lib/analytics/normalizer';

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
    const sortBy = (searchParams.get('sortBy') as PostSortOption) || 'views';
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = Math.max(0, Number(searchParams.get('offset')) || 0);
    const search = searchParams.get('search')?.trim() || '';

    const { startDate, endDate } = calculateDateRange(preset, customStart, customEnd);

    let query = supabase
      .from('post_analytics')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('published_at', startDate + 'T00:00:00.000Z')
      .lte('published_at', endDate + 'T23:59:59.999Z');

    if (platform && platform !== 'all') query = query.eq('platform', platform);
    if (accountId && accountId !== 'all') query = query.eq('social_account_id', accountId);
    if (search) {
      query = query.or('post_title.ilike.%' + search + '%,post_topic.ilike.%' + search + '%');
    }

    // Sort order
    switch (sortBy) {
      case 'likes':
        query = query.order('likes', { ascending: false });
        break;
      case 'comments':
        query = query.order('comments', { ascending: false });
        break;
      case 'shares':
        query = query.order('shares', { ascending: false });
        break;
      case 'engagement':
        query = query.order('engagement_rate', { ascending: false });
        break;
      case 'date':
        query = query.order('published_at', { ascending: false });
        break;
      case 'views':
      default:
        query = query.order('views', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: posts, count, error } = await query;
    if (error) {
      console.warn('post_analytics query notice:', error.message);
      return NextResponse.json({
        posts: [],
        total: 0,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch posts analytics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}