import { createClient } from '@/lib/supabase/server';
import {
  SocialAccount,
  PublishingJob,
  Post,
  MediaItem,
  PostAnalyticsContentType,
} from '@/lib/types/database';
import { decryptToken, encryptToken } from '@/lib/security/crypto';
import { refreshSocialAccountToken } from '@/lib/oauth/handlers';
import { fetchPlatformAccountMetrics, fetchPlatformPostMetrics } from './fetchers';
import { calculateEngagementRate, formatDateYMD } from './normalizer';

export interface SyncReport {
  success: boolean;
  syncedAccounts: number;
  syncedPosts: number;
  errors: string[];
  lastSyncedAt: string;
}

/**
 * Synchronizes account-level snapshot metrics for a single connected account.
 */
export async function syncSocialAccountAnalytics(
  socialAccountId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Fetch account
  const { data: accountData, error: accountError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', socialAccountId)
    .eq('user_id', userId)
    .single();

  if (accountError || !accountData) {
    return { success: false, error: accountError?.message || 'Social account not found.' };
  }

  const account = accountData as SocialAccount;

  if (account.status !== 'connected') {
    return { success: false, error: `Account status is ${account.status}. Reconnect required.` };
  }

  // 2. Token Refresh Check
  if (account.token_expires_at) {
    const isExpired = new Date(account.token_expires_at).getTime() <= Date.now();
    if (isExpired && account.refresh_token_encrypted) {
      try {
        const rawRefreshToken = decryptToken(account.refresh_token_encrypted);
        const refreshed = await refreshSocialAccountToken({
          platform: account.platform,
          refreshToken: rawRefreshToken,
        });

        if (refreshed.accessToken) {
          account.access_token_encrypted = encryptToken(refreshed.accessToken);
          if (refreshed.expiresIn) {
            account.token_expires_at = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
          }
          if (refreshed.refreshToken) {
            account.refresh_token_encrypted = encryptToken(refreshed.refreshToken);
          }

          await supabase
            .from('social_accounts')
            .update({
              access_token_encrypted: account.access_token_encrypted,
              refresh_token_encrypted: account.refresh_token_encrypted,
              token_expires_at: account.token_expires_at,
              status: 'connected',
              updated_at: new Date().toISOString(),
            })
            .eq('id', account.id);
        }
      } catch (err: unknown) {
        console.warn(`Token refresh failed during analytics sync for ${account.platform}:`, err);
      }
    }
  }

  // 3. Decrypt token & fetch metrics
  try {
    const accessToken = decryptToken(account.access_token_encrypted);
    const metrics = await fetchPlatformAccountMetrics(
      account.platform,
      account.account_id,
      accessToken,
      account.metadata
    );

    const todayDate = formatDateYMD(new Date());
    const engagementRate = calculateEngagementRate(
      metrics.likes,
      metrics.comments,
      metrics.shares,
      metrics.reach || metrics.views,
      account.platform
    );

    // 4. Upsert snapshot
    const { error: upsertError } = await supabase.from('analytics_snapshots').upsert(
      {
        user_id: userId,
        social_account_id: account.id,
        platform: account.platform,
        account_name: account.account_name,
        metric_date: todayDate,
        followers: metrics.followers,
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        reach: metrics.reach,
        impressions: metrics.impressions,
        engagement_rate: engagementRate,
        metrics_available: metrics.availableMetrics,
        metrics_unavailable: metrics.unavailableMetrics,
        raw_metadata: metrics.raw,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'social_account_id,metric_date' }
    );

    if (upsertError) throw upsertError;

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch account metrics';
    return { success: false, error: msg };
  }
}

/**
 * Synchronizes post-level analytics for recently published jobs.
 */
export async function syncUserPostAnalytics(userId: string, limit = 40): Promise<{ count: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  // 1. Fetch published jobs
  const { data: jobsData, error: jobsError } = await supabase
    .from('publishing_jobs')
    .select('*, social_accounts(*), posts(*), media(*)')
    .eq('user_id', userId)
    .eq('status', 'published')
    .not('platform_post_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (jobsError || !jobsData) {
    return { count: 0, errors: [jobsError?.message || 'Failed to fetch publishing jobs'] };
  }

  for (const job of jobsData) {
    const account = job.social_accounts as SocialAccount | null;
    if (!account || !job.platform_post_id) continue;

    try {
      const accessToken = decryptToken(account.access_token_encrypted);
      const metrics = await fetchPlatformPostMetrics(
        job.platform,
        job.platform_post_id,
        accessToken,
        account.account_id
      );

      const post = job.posts as Post | null;
      const media = job.media as MediaItem | null;

      let contentType: PostAnalyticsContentType = 'other';
      if (media?.file_type === 'video') contentType = 'video';
      else if (media?.file_type === 'image') contentType = 'image';
      else if (!media) contentType = 'text';

      const engagementRate = calculateEngagementRate(
        metrics.likes,
        metrics.comments,
        metrics.shares,
        metrics.reach || metrics.views,
        job.platform
      );

      const publishedAt = job.published_at || job.created_at;

      const { error: postUpsertError } = await supabase.from('post_analytics').upsert(
        {
          user_id: userId,
          post_id: job.post_id || null,
          publishing_job_id: job.id,
          social_account_id: account.id,
          platform: job.platform,
          platform_post_id: job.platform_post_id,
          post_title: post?.title || job.content_payload?.title || null,
          post_topic: post?.topic || null,
          content_type: contentType,
          published_at: publishedAt,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          reach: metrics.reach,
          impressions: metrics.impressions,
          engagement_rate: engagementRate,
          metrics_available: metrics.availableMetrics,
          metrics_unavailable: metrics.unavailableMetrics,
          raw_metadata: metrics.raw,
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'social_account_id,platform_post_id' }
      );

      if (postUpsertError) {
        errors.push(`Post ${job.platform_post_id}: ${postUpsertError.message}`);
      } else {
        count++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching post analytics';
      errors.push(`${job.platform} post (${job.platform_post_id}): ${msg}`);
    }
  }

  return { count, errors };
}

/**
 * High-level orchestration to synchronize all accounts and published posts for a user.
 */
export async function syncAllUserAnalytics(userId: string): Promise<SyncReport> {
  const supabase = await createClient();
  const errors: string[] = [];
  let syncedAccounts = 0;

  // 1. Fetch connected accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('id, platform, account_name, status')
    .eq('user_id', userId)
    .eq('status', 'connected');

  if (accountsError) {
    errors.push(accountsError.message);
  }

  if (accounts && accounts.length > 0) {
    for (const acc of accounts) {
      const res = await syncSocialAccountAnalytics(acc.id, userId);
      if (res.success) {
        syncedAccounts++;
      } else if (res.error) {
        errors.push(`${acc.platform} (${acc.account_name}): ${res.error}`);
      }
    }
  }

  // 2. Fetch and sync post-level analytics
  const postSyncResult = await syncUserPostAnalytics(userId, 30);
  errors.push(...postSyncResult.errors);

  return {
    success: errors.length === 0,
    syncedAccounts,
    syncedPosts: postSyncResult.count,
    errors,
    lastSyncedAt: new Date().toISOString(),
  };
}
