import { SocialPlatform } from '@/lib/types/database';
import { getOAuthProviderConfig, getProviderCredentials } from './config';

export interface TokenExchangeResult {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  tokenType?: string;
  scopes?: string[];
  accounts: Array<{
    accountId: string;
    accountName: string;
    username?: string | null;
    profileImageUrl?: string | null;
    metadata?: Record<string, unknown>;
  }>;
}

export async function exchangeCodeForTokens(params: {
  platform: SocialPlatform;
  code: string;
  redirectUri: string;
  codeVerifier?: string | null;
}): Promise<TokenExchangeResult> {
  const { platform, code, redirectUri, codeVerifier } = params;
  const config = getOAuthProviderConfig(platform);
  const { clientId, clientSecret } = getProviderCredentials(platform);

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${config.clientIdEnv} or ${config.clientSecretEnv} in environment variables.`);
  }

  switch (platform) {
    case 'facebook':
      return exchangeFacebookCode(code, redirectUri, clientId, clientSecret);
    case 'instagram':
      return exchangeInstagramCode(code, redirectUri, clientId, clientSecret);
    case 'tiktok':
      return exchangeTikTokCode(code, redirectUri, clientId, clientSecret, codeVerifier);
    case 'youtube':
      return exchangeGoogleYouTubeCode(code, redirectUri, clientId, clientSecret);
    case 'twitter':
      return exchangeTwitterCode(code, redirectUri, clientId, clientSecret, codeVerifier);
    case 'whatsapp':
      return exchangeWhatsAppCode(code, redirectUri, clientId, clientSecret);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function exchangeFacebookCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<TokenExchangeResult> {
  const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', clientId);
  tokenUrl.searchParams.set('client_secret', clientSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    throw new Error(tokenData.error?.message || 'Failed to exchange Facebook token');
  }

  const userAccessToken = tokenData.access_token;

  // Exchange for 60-day long-lived token
  const longLivedUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
  longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longLivedUrl.searchParams.set('client_id', clientId);
  longLivedUrl.searchParams.set('client_secret', clientSecret);
  longLivedUrl.searchParams.set('fb_exchange_token', userAccessToken);

  const longLivedRes = await fetch(longLivedUrl.toString());
  const longLivedData = await longLivedRes.json();
  const effectiveUserToken = longLivedData.access_token || userAccessToken;
  const expiresIn = longLivedData.expires_in || tokenData.expires_in || 5184000;

  // Fetch User's Pages
  const pagesUrl = new URL('https://graph.facebook.com/v21.0/me/accounts');
  pagesUrl.searchParams.set('access_token', effectiveUserToken);
  pagesUrl.searchParams.set('fields', 'id,name,category,access_token,picture{url}');

  const pagesRes = await fetch(pagesUrl.toString());
  const pagesData = await pagesRes.json();

  const accounts: TokenExchangeResult['accounts'] = [];

  if (pagesData.data && Array.isArray(pagesData.data) && pagesData.data.length > 0) {
    for (const page of pagesData.data) {
      accounts.push({
        accountId: page.id,
        accountName: page.name,
        username: page.id,
        profileImageUrl: page.picture?.data?.url || null,
        metadata: {
          category: page.category,
          page_access_token: page.access_token,
        },
      });
    }
  } else {
    const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,picture&access_token=${effectiveUserToken}`);
    const meData = await meRes.json();
    accounts.push({
      accountId: meData.id || 'fb_user',
      accountName: meData.name || 'Facebook User',
      profileImageUrl: meData.picture?.data?.url || null,
      metadata: { is_user_profile: true },
    });
  }

  return {
    accessToken: effectiveUserToken,
    expiresIn,
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    accounts,
  };
}

async function exchangeInstagramCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<TokenExchangeResult> {
  const fbResult = await exchangeFacebookCode(code, redirectUri, clientId, clientSecret);
  const accounts: TokenExchangeResult['accounts'] = [];

  for (const page of fbResult.accounts) {
    try {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.accountId}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${fbResult.accessToken}`
      );
      const igData = await igRes.json();
      const ig = igData.instagram_business_account;

      if (ig) {
        accounts.push({
          accountId: ig.id,
          accountName: ig.name || ig.username || page.accountName,
          username: ig.username || null,
          profileImageUrl: ig.profile_picture_url || page.profileImageUrl,
          metadata: { linked_facebook_page_id: page.accountId },
        });
      }
    } catch (err) {
      console.warn('Error fetching linked Instagram account:', err);
    }
  }

  if (accounts.length === 0) {
    accounts.push({
      accountId: `ig_${fbResult.accounts[0]?.accountId || 'pending'}`,
      accountName: `${fbResult.accounts[0]?.accountName || 'Instagram'} (Professional)`,
      profileImageUrl: fbResult.accounts[0]?.profileImageUrl || null,
      metadata: { note: 'Please link your Instagram Professional account to your Facebook Page in Meta Business Suite.' },
    });
  }

  return {
    ...fbResult,
    scopes: ['instagram_basic', 'instagram_content_publish'],
    accounts,
  };
}

async function exchangeTikTokCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
  codeVerifier?: string | null
): Promise<TokenExchangeResult> {
  const bodyParams = new URLSearchParams();
  bodyParams.set('client_key', clientId);
  bodyParams.set('client_secret', clientSecret);
  bodyParams.set('code', code);
  bodyParams.set('grant_type', 'authorization_code');
  bodyParams.set('redirect_uri', redirectUri);
  if (codeVerifier) {
    bodyParams.set('code_verifier', codeVerifier);
  }

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange TikTok token');
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const openId = data.open_id;
  const expiresIn = data.expires_in;

  let displayName = 'TikTok Creator';
  let avatarUrl: string | null = null;
  let username: string | null = null;

  try {
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const userData = await userRes.json();
    if (userData.data?.user) {
      displayName = userData.data.user.display_name || displayName;
      avatarUrl = userData.data.user.avatar_url || null;
      username = userData.data.user.username || null;
    }
  } catch (err) {
    console.warn('Error fetching TikTok user info:', err);
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    scopes: ['user.info.basic', 'video.upload'],
    accounts: [
      {
        accountId: openId,
        accountName: displayName,
        username,
        profileImageUrl: avatarUrl,
      },
    ],
  };
}

async function exchangeGoogleYouTubeCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<TokenExchangeResult> {
  const bodyParams = new URLSearchParams();
  bodyParams.set('code', code);
  bodyParams.set('client_id', clientId);
  bodyParams.set('client_secret', clientSecret);
  bodyParams.set('redirect_uri', redirectUri);
  bodyParams.set('grant_type', 'authorization_code');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Google OAuth token');
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token || null;
  const expiresIn = data.expires_in;

  const accounts: TokenExchangeResult['accounts'] = [];

  try {
    const ytRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        accounts.push({
          accountId: item.id,
          accountName: item.snippet?.title || 'YouTube Channel',
          username: item.snippet?.customUrl || null,
          profileImageUrl: item.snippet?.thumbnails?.default?.url || null,
          metadata: {
            subscriberCount: item.statistics?.subscriberCount || '0',
            videoCount: item.statistics?.videoCount || '0',
          },
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching YouTube channel:', err);
  }

  if (accounts.length === 0) {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileRes.json();

    accounts.push({
      accountId: profileData.id || 'google_channel',
      accountName: profileData.name || 'YouTube Channel',
      profileImageUrl: profileData.picture || null,
    });
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    scopes: ['youtube.readonly', 'youtube.upload'],
    accounts,
  };
}

async function exchangeTwitterCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
  codeVerifier?: string | null
): Promise<TokenExchangeResult> {
  const bodyParams = new URLSearchParams();
  bodyParams.set('code', code);
  bodyParams.set('grant_type', 'authorization_code');
  bodyParams.set('client_id', clientId);
  bodyParams.set('redirect_uri', redirectUri);
  if (codeVerifier) {
    bodyParams.set('code_verifier', codeVerifier);
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: bodyParams.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Twitter token');
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token || null;
  const expiresIn = data.expires_in;

  let accountId = 'twitter_user';
  let accountName = 'X User';
  let username: string | null = null;
  let profileImageUrl: string | null = null;

  try {
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();
    if (userData.data) {
      accountId = userData.data.id;
      accountName = userData.data.name;
      username = userData.data.username ? `@${userData.data.username}` : null;
      profileImageUrl = userData.data.profile_image_url || null;
    }
  } catch (err) {
    console.warn('Error fetching Twitter user info:', err);
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    accounts: [
      {
        accountId,
        accountName,
        username,
        profileImageUrl,
      },
    ],
  };
}

async function exchangeWhatsAppCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<TokenExchangeResult> {
  const fbResult = await exchangeFacebookCode(code, redirectUri, clientId, clientSecret);
  const accounts: TokenExchangeResult['accounts'] = [];

  try {
    const wabaRes = await fetch(
      `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}&access_token=${fbResult.accessToken}`
    );
    const wabaData = await wabaRes.json();

    if (wabaData.data && Array.isArray(wabaData.data)) {
      for (const biz of wabaData.data) {
        const wabas = biz.owned_whatsapp_business_accounts?.data || [];
        for (const waba of wabas) {
          const phone = waba.phone_numbers?.data?.[0];
          accounts.push({
            accountId: waba.id,
            accountName: waba.name || phone?.verified_name || 'WhatsApp Business',
            username: phone?.display_phone_number || null,
            metadata: {
              business_id: biz.id,
              phone_number_id: phone?.id,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching WhatsApp accounts:', err);
  }

  if (accounts.length === 0) {
    accounts.push({
      accountId: `waba_${fbResult.accounts[0]?.accountId || 'pending'}`,
      accountName: `${fbResult.accounts[0]?.accountName || 'WhatsApp'} (Channel/Broadcast)`,
      metadata: { note: 'Meta WhatsApp Business Account connected.' },
    });
  }

  return {
    ...fbResult,
    scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
    accounts,
  };
}

export async function refreshAccessToken(params: {
  platform: SocialPlatform;
  refreshToken: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const { platform, refreshToken } = params;
  const { clientId, clientSecret } = getProviderCredentials(platform);

  if (platform === 'youtube') {
    const body = new URLSearchParams();
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    body.set('refresh_token', refreshToken);
    body.set('grant_type', 'refresh_token');

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh YouTube token');
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  if (platform === 'twitter') {
    const body = new URLSearchParams();
    body.set('client_id', clientId);
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh Twitter token');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  if (platform === 'tiktok') {
    const body = new URLSearchParams();
    body.set('client_key', clientId);
    body.set('client_secret', clientSecret);
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh TikTok token');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  throw new Error(`Token refresh is not applicable or supported for ${platform}`);
}

export const refreshSocialAccountToken = refreshAccessToken;

