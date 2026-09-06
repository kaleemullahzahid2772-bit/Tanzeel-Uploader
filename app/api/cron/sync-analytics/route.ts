import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncAllUserAnalytics } from '@/lib/analytics/sync';

export async function GET(req: NextRequest) {
  return handleSyncCron(req);
}

export async function POST(req: NextRequest) {
  return handleSyncCron(req);
}

async function handleSyncCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'nur_scheduler_secret_2026';

    if (authHeader && authHeader !== 'Bearer ' + cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: users } = await supabase.from('profiles').select('id');

    let totalSynced = 0;
    if (users && users.length > 0) {
      for (const u of users) {
        try {
          await syncAllUserAnalytics(u.id);
          totalSynced++;
        } catch (syncErr) {
          console.error('Sync failed for user ' + u.id + ':', syncErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics sync completed for ' + totalSynced + ' user(s).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Analytics cron worker error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}