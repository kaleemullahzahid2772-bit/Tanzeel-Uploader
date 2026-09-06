import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully.',
    });
  } catch (err: unknown) {
    console.error('Disconnect Social Account Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
