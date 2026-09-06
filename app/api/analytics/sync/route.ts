import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { syncAllUserAnalytics } from '@/lib/analytics/sync';

export async function POST(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await syncAllUserAnalytics(user.id);
    return NextResponse.json({
      message: 'Analytics synchronized successfully.',
      report,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to synchronize analytics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}