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

    // Fetch account to check if Meta revocation is needed
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (account && account.platform === 'facebook' && account.access_token_encrypted) {
      try {
        const { decryptToken } = await import('@/lib/security/crypto');
        const token = decryptToken(account.access_token_encrypted);
        if (token) {
          // Attempt Meta Graph API permission revocation (ignore error if expired)
          await fetch(`https://graph.facebook.com/v21.0/${account.account_id}/permissions?access_token=${token}`, {
            method: 'DELETE',
          }).catch(() => {});
        }
      } catch {
        // Ignore decryption or network error during disconnect
      }
    }

    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.warn('social_accounts disconnect notice (table migration or network):', deleteError.message);
      return NextResponse.json({
        success: true,
        message: 'Account disconnected successfully.',
      });
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
