import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { SocialAccount, SocialAccountPublic } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: accounts, error: dbError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (dbError) {
      console.warn('social_accounts query notice (table may need migration):', dbError.message);
      return NextResponse.json({
        success: true,
        accounts: [],
        notice: 'Database table social_accounts not initialized yet.',
      });
    }

    const now = Date.now();

    const sanitizedAccounts: SocialAccountPublic[] = (accounts || []).map((acc: SocialAccount) => {
      let isExpired = false;
      let isExpiringSoon = false;

      if (acc.token_expires_at) {
        const expiryTime = new Date(acc.token_expires_at).getTime();
        const diffDays = (expiryTime - now) / (1000 * 60 * 60 * 24);

        if (diffDays <= 0) {
          isExpired = true;
        } else if (diffDays <= 7) {
          isExpiringSoon = true;
        }
      }

      let status = acc.status;
      if (status === 'connected') {
        if (isExpired) status = 'expired';
        else if (isExpiringSoon) status = 'expiring_soon';
      }

      return {
        id: acc.id,
        platform: acc.platform,
        account_id: acc.account_id,
        account_name: acc.account_name,
        username: acc.username,
        profile_image_url: acc.profile_image_url,
        token_expires_at: acc.token_expires_at,
        scopes: acc.scopes,
        status,
        metadata: acc.metadata,
        connected_at: acc.connected_at,
        updated_at: acc.updated_at,
        is_expiring_soon: isExpiringSoon,
        is_expired: isExpired,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: sanitizedAccounts,
    });
  } catch (err: unknown) {
    console.error('List Social Accounts Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
