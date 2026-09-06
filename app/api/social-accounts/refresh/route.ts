import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { decryptToken, encryptToken } from '@/lib/security/crypto';
import { refreshAccessToken } from '@/lib/oauth/handlers';

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

    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!account.refresh_token_encrypted) {
      return NextResponse.json(
        { error: 'This platform does not support automatic token refresh. Please reconnect.' },
        { status: 400 }
      );
    }

    const plainRefreshToken = decryptToken(account.refresh_token_encrypted);
    const refreshed = await refreshAccessToken({
      platform: account.platform,
      refreshToken: plainRefreshToken,
    });

    const newAccessTokenEncrypted = encryptToken(refreshed.accessToken);
    const newRefreshTokenEncrypted = refreshed.refreshToken
      ? encryptToken(refreshed.refreshToken)
      : account.refresh_token_encrypted;

    let expiresAt: string | null = null;
    if (refreshed.expiresIn) {
      expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
    }

    await supabase
      .from('social_accounts')
      .update({
        access_token_encrypted: newAccessTokenEncrypted,
        refresh_token_encrypted: newRefreshTokenEncrypted,
        token_expires_at: expiresAt,
        status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully.',
      status: 'connected',
      expiresAt,
    });
  } catch (err: unknown) {
    console.error('Refresh Social Token Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
