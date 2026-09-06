import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let query = supabase
      .from('scheduled_posts')
      .select('*, media:media_id(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('scheduled_for', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_for', endDate);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.warn('scheduled_posts query notice (table may need migration):', error.message);
      return NextResponse.json({
        posts: [],
        total: 0,
        notice: 'Database table scheduled_posts not initialized yet.',
      });
    }

    let filteredPosts = posts || [];

    // In-memory text search on title / caption if search query provided
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filteredPosts = filteredPosts.filter((p) => {
        const snap = p.content_snapshot || {};
        const title = (snap.title || '').toLowerCase();
        const caption = (snap.caption || snap.description || snap.hook || '').toLowerCase();
        const acc = (p.account_name || '').toLowerCase();
        return title.includes(q) || caption.includes(q) || acc.includes(q);
      });
    }

    return NextResponse.json({
      posts: filteredPosts,
      total: count || filteredPosts.length,
    });
  } catch (err: unknown) {
    console.error('Fetch Scheduled Posts API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
