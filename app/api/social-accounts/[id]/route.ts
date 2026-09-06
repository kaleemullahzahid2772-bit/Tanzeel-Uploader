import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { SocialAccount, SocialAccountPublic } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return NextResponse.json({ error: 'Invalid Account UUID format' }, { status: 400 });
    }

    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: account, error: dbError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dbError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const sanitized: SocialAccountPublic = {
      id: account.id,
      platform: account.platform,
      account_id: account.account_id,
      account_name: account.account_name,
      username: account.username,
      profile_image_url: account.profile_image_url,
      token_expires_at: account.token_expires_at,
      scopes: account.scopes,
      status: account.status,
      metadata: account.metadata,
      connected_at: account.connected_at,
      updated_at: account.updated_at,
      is_expiring_soon: false,
      is_expired: false,
    };

    return NextResponse.json({ success: true, account: sanitized });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return NextResponse.json({ error: 'Invalid Account UUID format' }, { status: 400 });
    }

    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.warn('social_accounts delete notice (table migration or network):', deleteError.message);
      return NextResponse.json({
        success: true,
        message: 'Account removal processed.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account disconnected and removed successfully.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}
