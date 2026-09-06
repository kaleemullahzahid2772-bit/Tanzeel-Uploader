import { NextRequest } from 'next/server';
import { GET as getSocialAccounts } from '@/app/api/social-accounts/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getSocialAccounts(req);
}
