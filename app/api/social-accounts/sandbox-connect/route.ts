import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { encryptToken } from '@/lib/security/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform || 'facebook';

    const mockAccounts: Record<string, any> = {
      facebook: {
        account_id: '109283746501928',
        account_name: 'Al Tanzeel Quran Academy',
        username: 'altanzeel.academy',
        profile_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
        metadata: {
          category: 'Religious Organization & Education',
          followers: 14500,
          likes: 12800,
          verified: true,
          is_sandbox: true,
        },
        scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
      },
      instagram: {
        account_id: '17841400928374650',
        account_name: 'Al Tanzeel Official',
        username: 'altanzeel_quran',
        profile_image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=150',
        metadata: {
          account_type: 'BUSINESS',
          followers: 28400,
          media_count: 142,
          is_sandbox: true,
        },
        scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
      },
      tiktok: {
        account_id: '719283746501928374',
        account_name: 'Al Tanzeel Academy',
        username: 'altanzeel_academy',
        profile_image_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=150',
        metadata: {
          followers: 45200,
          likes: 320000,
          is_sandbox: true,
        },
        scopes: ['user.info.basic', 'video.upload'],
      },
      youtube: {
        account_id: 'UC928374650192837465019',
        account_name: 'Al Tanzeel Quran Academy',
        username: '@AlTanzeelAcademy',
        profile_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
        metadata: {
          subscribers: 18900,
          video_count: 86,
          is_sandbox: true,
        },
        scopes: ['youtube.readonly', 'youtube.upload'],
      },
      twitter: {
        account_id: '1492837465019283746',
        account_name: 'Al Tanzeel Quran',
        username: 'AlTanzeelQuran',
        profile_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
        metadata: {
          followers: 8200,
          following: 120,
          is_sandbox: true,
        },
        scopes: ['tweet.read', 'tweet.write', 'users.read'],
      },
      whatsapp: {
        account_id: '923001234567',
        account_name: 'Al Tanzeel Quran Support & Channel',
        username: '+92 300 1234567',
        profile_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
        metadata: {
          waba_id: '109283746501928',
          phone_number_id: '209283746501928',
          is_sandbox: true,
        },
        scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
      },
    };

    const targetAccount = mockAccounts[platform] || mockAccounts.facebook;
    const fakeToken = `EAAGm0PXqBZB...sandbox_${platform}_${Date.now()}`;
    const encryptedToken = encryptToken(fakeToken);

    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const { error: upsertError } = await supabase.from('social_accounts').upsert(
      {
        user_id: user.id,
        platform,
        account_id: targetAccount.account_id,
        account_name: targetAccount.account_name,
        username: targetAccount.username,
        profile_image_url: targetAccount.profile_image_url,
        access_token_encrypted: encryptedToken,
        refresh_token_encrypted: null,
        token_expires_at: tokenExpiresAt,
        scopes: targetAccount.scopes,
        status: 'connected',
        metadata: targetAccount.metadata,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform,account_id' }
    );

    if (upsertError) {
      console.warn('Sandbox upsert notice:', upsertError.message);
    }

    return NextResponse.json({
      success: true,
      message: `${targetAccount.account_name} (${platform.toUpperCase()}) successfully connected in Sandbox mode!`,
      account: {
        platform,
        account_name: targetAccount.account_name,
        username: targetAccount.username,
      },
    });
  } catch (err: unknown) {
    console.error('Sandbox Connect Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sandbox connect failed' },
      { status: 500 }
    );
  }
}
