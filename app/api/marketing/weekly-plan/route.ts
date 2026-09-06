import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { generateWeeklyPlan } from '@/lib/ai/marketing-intelligence';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataset = await fetchGroundedDataset(user.id);
    const plan = await generateWeeklyPlan(dataset);

    return NextResponse.json({ success: true, plan });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate weekly plan';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
