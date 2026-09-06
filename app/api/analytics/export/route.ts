import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { DateRangePreset, SocialPlatform, PostAnalytics } from '@/lib/types/database';
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

    const { startDate, endDate } = calculateDateRange(preset, customStart, customEnd);

    let query = supabase
      .from('post_analytics')
      .select('*, social_accounts(account_name)')
      .eq('user_id', user.id)
      .gte('published_at', startDate + 'T00:00:00.000Z')
      .lte('published_at', endDate + 'T23:59:59.999Z')
      .order('published_at', { ascending: false });

    if (platform && platform !== 'all') query = query.eq('platform', platform);

    const { data: postsData } = await query;
    const posts = (postsData || []) as (PostAnalytics & { social_accounts?: { account_name?: string } })[];

    const headers = [
      'Published Date',
      'Platform',
      'Account',
      'Title',
      'Topic',
      'Content Type',
      'Views',
      'Likes',
      'Comments',
      'Shares',
      'Reach',
      'Impressions',
      'Engagement Rate (%)'
    ];

    const rows = posts.map(p => [
      '"' + p.published_at.slice(0, 10) + '"',
      '"' + p.platform + '"',
      '"' + (p.social_accounts?.account_name || p.platform) + '"',
      '"' + (p.post_title || 'Untitled Post').replace(/"/g, '""') + '"',
      '"' + (p.post_topic || 'Islamic Reflection').replace(/"/g, '""') + '"',
      '"' + p.content_type + '"',
      p.views,
      p.likes,
      p.comments,
      p.shares,
      p.reach,
      p.impressions,
      p.engagement_rate + '%'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nur-social-analytics-' + startDate + '-to-' + endDate + '.csv"',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to export analytics CSV';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}