import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { SocialPlatform } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const platform = searchParams.get('platform') as SocialPlatform | null;

    if (!postId || !platform) {
      return NextResponse.json(
        { error: 'postId and platform query parameters are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { user } = await getAuthUser();

    if (!user) {
      return NextResponse.json({ versions: [] });
    }

    const { data: versions, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('post_id', postId)
      .eq('platform', platform)
      .order('version', { ascending: false });

    if (error) {
      console.warn('Error fetching versions:', error);
      return NextResponse.json({ versions: [] });
    }

    return NextResponse.json({ versions: versions || [] });
  } catch (err: unknown) {
    console.error('API /api/ai/versions error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch version history' },
      { status: 500 }
    );
  }
}
