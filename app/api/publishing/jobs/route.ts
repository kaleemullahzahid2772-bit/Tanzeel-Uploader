import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('publishing_jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (postId) {
      query = query.eq('post_id', postId);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.warn('publishing_jobs query notice (table may need migration):', error.message);
      return NextResponse.json({
        jobs: [],
        total: 0,
        limit,
        offset,
        notice: 'Database table publishing_jobs not initialized yet.',
      });
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err: unknown) {
    console.error('Fetch Publishing Jobs API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
