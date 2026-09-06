import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { identifyRepurposingCandidates } from '@/lib/ai/marketing-repurposer';
import { analyzeHistoricalData } from '@/lib/ai/marketing-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataset = await fetchGroundedDataset(user.id);
    const analysis = analyzeHistoricalData(dataset);
    const candidates = identifyRepurposingCandidates(dataset.posts, analysis.connectedPlatforms);

    return NextResponse.json({
      success: true,
      candidates,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch repurposing candidates';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
