import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: postAnalytics, error } = await supabase
      .from('post_analytics')
      .select('*, posts(*), social_accounts(*), publishing_jobs(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !postAnalytics) {
      return NextResponse.json({ error: 'Post analytics not found.' }, { status: 404 });
    }

    return NextResponse.json({ analytics: postAnalytics });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch post analytics detail';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}