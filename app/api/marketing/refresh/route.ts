import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { generateMarketingOverview, generateWeeklyPlan, generateContentIdeas } from '@/lib/ai/marketing-intelligence';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Invalidate old active insights
    await supabase
      .from('ai_marketing_insights')
      .update({ is_active: false })
      .eq('user_id', user.id);

    const dataset = await fetchGroundedDataset(user.id);

    // Regenerate fresh intelligence in parallel
    const [overview, weeklyPlan, contentIdeas] = await Promise.all([
      generateMarketingOverview(dataset),
      generateWeeklyPlan(dataset),
      generateContentIdeas(dataset),
    ]);

    return NextResponse.json({
      success: true,
      message: 'AI Marketing Intelligence refreshed successfully.',
      overview,
      weeklyPlan,
      contentIdeas,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to refresh AI intelligence';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
