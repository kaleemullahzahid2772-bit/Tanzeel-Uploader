import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { executeMultiPlatformPublish } from '@/lib/publishing/engine';
import { PublishRequestPayload } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to publish content.' },
        { status: 401 }
      );
    }

    const body: PublishRequestPayload = await req.json();

    if (!body.targets || !Array.isArray(body.targets) || body.targets.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: At least one platform publishing target is required.' },
        { status: 400 }
      );
    }

    const response = await executeMultiPlatformPublish({
      userId: user.id,
      postId: body.postId,
      mediaId: body.mediaId,
      targets: body.targets,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('Publish API execution error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
