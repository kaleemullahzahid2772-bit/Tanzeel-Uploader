import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { createScheduledPosts } from '@/lib/scheduling/scheduler';
import { ScheduleRequestPayload } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body: ScheduleRequestPayload = await req.json();

    if (!body.targets || !Array.isArray(body.targets) || body.targets.length === 0) {
      return NextResponse.json(
        { error: 'At least one target platform is required for scheduling.' },
        { status: 400 }
      );
    }

    if (!body.scheduledFor) {
      return NextResponse.json(
        { error: 'Scheduled date and time is required.' },
        { status: 400 }
      );
    }

    const response = await createScheduledPosts({
      userId: user.id,
      postId: body.postId,
      mediaId: body.mediaId,
      scheduledForUtc: body.scheduledFor,
      timezone: body.timezone || 'UTC',
      targets: body.targets,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('Schedule Post API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
