import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { generateContentIdeas } from '@/lib/ai/marketing-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataset = await fetchGroundedDataset(user.id);
    const ideas = await generateContentIdeas(dataset);

    return NextResponse.json({ success: true, ideas });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch content ideas';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  return GET(_req);
}
