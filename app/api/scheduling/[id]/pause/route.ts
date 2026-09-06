import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { togglePauseScheduledPost } from '@/lib/scheduling/scheduler';

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

    const updated = await togglePauseScheduledPost({
      scheduleId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      post: updated,
    });
  } catch (err: unknown) {
    console.error('Toggle Pause Schedule API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
