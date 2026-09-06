import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { SocialPlatform } from '@/lib/types/database';
import { exchangeCodeForTokens } from '@/lib/oauth/handlers';
import { encryptToken } from '@/lib/security/crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await context.params;
  const platform = rawPlatform as SocialPlatform;
  const searchParams = req.nextUrl.searchParams;

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') || searchParams.get('error_description');

  if (error || !code || !state) {
    const deniedMsg = error && (error.includes('denied') || error.includes('access_denied'))
      ? 'user_denied'
      : 'authorization_failed';
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=' + deniedMsg + '&platform=' + platform, req.url)
    );
  }

  try {
    const supabase = await createClient();

    // 1. Verify User Session
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?redirectTo=/dashboard/accounts', req.url)
      );
    }

    // 2. Verify State Record in Database (Anti-CSRF)
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', state)
      .eq('user_id', user.id)
      .eq('platform', platform)
      .maybeSingle();

    if (stateError || !stateRecord) {
      console.warn('OAuth State Mismatch / Invalid State Token:', state);
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=invalid_state&platform=' + platform, req.url)
      );
    }

    if (new Date(stateRecord.expires_at) < new Date()) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=state_expired&platform=' + platform, req.url)
      );
    }

    // 3. Exchange Code for Tokens & Fetch Account Info
    const tokenResult = await exchangeCodeForTokens({
      platform,
      code,
      redirectUri: stateRecord.redirect_uri,
      codeVerifier: stateRecord.code_verifier,
    });

    // 4. Encrypt Tokens (AES-256-GCM)
    const accessTokenEncrypted = encryptToken(tokenResult.accessToken);
    const refreshTokenEncrypted = tokenResult.refreshToken
      ? encryptToken(tokenResult.refreshToken)
      : null;

    let expiresAtDate: string | null = null;
    if (tokenResult.expiresIn) {
      expiresAtDate = new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString();
    }

    // 5. Store / Upsert Connected Accounts in Database
    for (const acc of tokenResult.accounts) {
      await supabase.from('social_accounts').upsert(
        {
          user_id: user.id,
          platform,
          account_id: acc.accountId,
          account_name: acc.accountName,
          username: acc.username || null,
          profile_image_url: acc.profileImageUrl || null,
          access_token_encrypted: accessTokenEncrypted,
          refresh_token_encrypted: refreshTokenEncrypted,
          token_expires_at: expiresAtDate,
          scopes: tokenResult.scopes || [],
          status: 'connected',
          metadata: acc.metadata || {},
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform,account_id' }
      );
    }

    // 6. Clean Up Used State
    await supabase.from('oauth_states').delete().eq('id', stateRecord.id);

    // 7. Success Redirect to Social Accounts Dashboard
    const response = NextResponse.redirect(
      new URL(
        '/dashboard/accounts?connected=' + platform + '&count=' + tokenResult.accounts.length + '&success=true',
        req.url
      )
    );

    response.cookies.delete('oauth_state_' + platform);
    return response;
  } catch (err: unknown) {
    console.error('OAuth Callback Processing Error:', err);
    const errMessage = err instanceof Error ? err.message : 'callback_exchange_failed';
    return NextResponse.redirect(
      new URL(
        '/dashboard/accounts?error=callback_failed&platform=' + platform + '&msg=' + encodeURIComponent(errMessage),
        req.url
      )
    );
  }
}
