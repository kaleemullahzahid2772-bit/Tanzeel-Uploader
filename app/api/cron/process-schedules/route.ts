import { NextRequest, NextResponse } from 'next/server';
import { processDueSchedules } from '@/lib/scheduling/scheduler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCronTick(req);
}

export async function POST(req: NextRequest) {
  return handleCronTick(req);
}

async function handleCronTick(req: NextRequest) {
  try {
    // Optional secret check if CRON_SECRET is configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In dev mode allow if localhost
      const host = req.headers.get('host') || '';
      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
      }
    }

    const result = await processDueSchedules();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    console.error('Background Cron Scheduler Execution Error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
