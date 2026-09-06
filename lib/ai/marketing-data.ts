import { createClient } from '@/lib/supabase/server';
import {
  GroundedMarketingDataset,
} from './marketing-intelligence';
import {
  BrandKnowledge,
  SocialAccount,
  SocialAccountPublic,
  PostAnalytics,
  AnalyticsSnapshot,
} from '@/lib/types/database';

/**
 * Fetches unified grounded marketing dataset for a given user from Supabase.
 */
export async function fetchGroundedDataset(userId: string): Promise<GroundedMarketingDataset> {
  const supabase = await createClient();

  // 1. Brand Knowledge
  const { data: brandKnowledge } = await supabase
    .from('brand_knowledge')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // 2. Connected Social Accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected');

  const sanitizedAccounts: SocialAccountPublic[] = (accounts || []).map((acc: SocialAccount) => ({
    id: acc.id,
    platform: acc.platform,
    account_id: acc.account_id,
    account_name: acc.account_name,
    username: acc.username,
    profile_image_url: acc.profile_image_url,
    token_expires_at: acc.token_expires_at,
    scopes: acc.scopes,
    status: acc.status,
    metadata: acc.metadata,
    connected_at: acc.connected_at,
    updated_at: acc.updated_at,
  }));

  // 3. Post Analytics (last 60 days)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
  const { data: postsData } = await supabase
    .from('post_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('published_at', sixtyDaysAgo)
    .order('published_at', { ascending: false })
    .limit(100);

  // 4. Analytics Snapshots
  const { data: snapshotsData } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('metric_date', sixtyDaysAgo.slice(0, 10))
    .order('metric_date', { ascending: false })
    .limit(60);

  // 5. Upcoming Scheduled Posts Count
  const { count: schedulesCount } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'scheduled');

  return {
    brandKnowledge: (brandKnowledge as BrandKnowledge) || null,
    connectedAccounts: sanitizedAccounts,
    posts: (postsData as PostAnalytics[]) || [],
    snapshots: (snapshotsData as AnalyticsSnapshot[]) || [],
    upcomingSchedulesCount: schedulesCount || 0,
  };
}
