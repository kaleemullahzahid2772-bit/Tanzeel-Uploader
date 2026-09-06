import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('in_app_notifications query notice:', error.message);
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    });
  } catch (err: unknown) {
    console.error('Fetch Notifications API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } else if (notificationId) {
      await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Update Notifications API error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
