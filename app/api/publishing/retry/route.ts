import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { retryPublishJob } from '@/lib/publishing/engine';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required to retry publishing.' },
        { status: 400 }
      );
    }

    const result = await retryPublishJob(jobId, user.id);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Retry Publish API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
