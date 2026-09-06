import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { cancelScheduledPost } from '@/lib/scheduling/scheduler';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id: scheduleId } = await params;

    await cancelScheduledPost({
      scheduleId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Scheduled post cancelled successfully.',
    });
  } catch (err: unknown) {
    console.error('Cancel Schedule API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
