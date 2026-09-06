import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { reschedulePost } from '@/lib/scheduling/scheduler';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id: scheduleId } = await params;
    const body = await req.json();
    const { scheduledFor, timezone } = body;

    if (!scheduledFor) {
      return NextResponse.json(
        { error: 'New scheduled date and time is required.' },
        { status: 400 }
      );
    }

    const updated = await reschedulePost({
      scheduleId,
      userId: user.id,
      newScheduledForUtc: scheduledFor,
      newTimezone: timezone || 'UTC',
    });

    return NextResponse.json({
      success: true,
      post: updated,
    });
  } catch (err: unknown) {
    console.error('Reschedule API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
