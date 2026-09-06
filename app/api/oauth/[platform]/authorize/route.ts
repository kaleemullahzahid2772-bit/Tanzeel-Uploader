import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { SocialPlatform } from '@/lib/types/database';
import { getOAuthProviderConfig, getProviderCredentials, isPlatformConfigured } from '@/lib/oauth/config';
import { generateOAuthState, generatePKCE } from '@/lib/security/crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform: rawPlatform } = await context.params;
    const platform = rawPlatform as SocialPlatform;

    // 1. Verify User Authentication
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?redirectTo=/dashboard/accounts', req.url)
      );
    }

    // 2. Validate Platform
    const config = getOAuthProviderConfig(platform);
    if (!config) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=unsupported_platform', req.url)
      );
    }

    // 3. Check Provider Credentials
    if (!isPlatformConfigured(platform)) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/accounts?error=missing_credentials&platform=' + platform + '&guide=' + encodeURIComponent(config.setupGuideUrl),
          req.url
        )
      );
    }

    const { clientId } = getProviderCredentials(platform);

    // 4. Generate Cryptographic State & PKCE
    const stateToken = generateOAuthState();
    let codeVerifier: string | null = null;
    let codeChallenge: string | null = null;

    if (config.supportsPKCE) {
      const pkce = generatePKCE();
      codeVerifier = pkce.codeVerifier;
      codeChallenge = pkce.codeChallenge;
    }

    // 5. Determine Dynamic Redirect URI
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!baseUrl) {
      const forwardedProto = req.headers.get('x-forwarded-proto');
      const forwardedHost = req.headers.get('x-forwarded-host');
      const host = req.headers.get('host') || 'localhost:4000';
      const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
      baseUrl = `${protocol}://${forwardedHost || host}`;
    }
    baseUrl = baseUrl.replace(/\/+$/, '');
    const redirectUri = `${baseUrl}/api/oauth/${platform}/callback`;

    // 6. Store State in Database (with 10-minute expiry)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from('oauth_states').insert({
      user_id: user.id,
      platform,
      state_token: stateToken,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      expires_at: expiresAt,
    });

    // 7. Construct Provider Authorization URL
    const authUrl = new URL(config.authUrl);

    switch (platform) {
      case 'facebook':
      case 'instagram':
      case 'whatsapp':
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', config.scopes.join(','));
        authUrl.searchParams.set('response_type', 'code');
        break;

      case 'tiktok':
        authUrl.searchParams.set('client_key', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', config.scopes.join(','));
        authUrl.searchParams.set('response_type', 'code');
        if (codeChallenge) {
          authUrl.searchParams.set('code_challenge', codeChallenge);
          authUrl.searchParams.set('code_challenge_method', 'S256');
        }
        break;

      case 'youtube':
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', config.scopes.join(' '));
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent select_account');
        if (codeChallenge) {
          authUrl.searchParams.set('code_challenge', codeChallenge);
          authUrl.searchParams.set('code_challenge_method', 'S256');
        }
        break;

      case 'twitter':
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', config.scopes.join(' '));
        authUrl.searchParams.set('response_type', 'code');
        if (codeChallenge) {
          authUrl.searchParams.set('code_challenge', codeChallenge);
          authUrl.searchParams.set('code_challenge_method', 'S256');
        }
        break;
    }

    // 8. Redirect User to Official Provider OAuth Page
    const response = NextResponse.redirect(authUrl.toString());

    response.cookies.set('oauth_state_' + platform, stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600,
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    console.error('OAuth Authorize Route Error:', err);
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=oauth_init_failed', req.url)
    );
  }
}
