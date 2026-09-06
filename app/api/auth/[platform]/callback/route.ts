import { NextRequest } from 'next/server';
import { GET as handleOAuthCallback } from '@/app/api/oauth/[platform]/callback/route';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  return handleOAuthCallback(req, context);
}
