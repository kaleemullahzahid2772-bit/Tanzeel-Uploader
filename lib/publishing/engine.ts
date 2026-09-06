import { createClient } from '@/lib/supabase/server';
import {
  SocialPlatform,
  SocialAccount,
  MediaItem,
  PublishTarget,
  PlatformPublishResult,
  PublishResponse,
  PublishingJob,
} from '@/lib/types/database';
import { decryptToken } from '@/lib/security/crypto';
import { getPlatformAdapter } from './adapters';

export interface ExecutePublishOptions {
  userId: string;
  postId?: string;
  mediaId?: string;
  targets: PublishTarget[];
}

/**
 * Main Coordinator for Social Media Publishing Engine
 */
export async function executeMultiPlatformPublish({
  userId,
  postId,
  mediaId,
  targets,
}: ExecutePublishOptions): Promise<PublishResponse> {
  const supabase = await createClient();

  // 1. Fetch Media Item if mediaId is provided
  let mediaItem: MediaItem | null = null;
  if (mediaId) {
    const { data: mediaData } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .eq('user_id', userId)
      .maybeSingle();

    if (mediaData) {
      mediaItem = mediaData as MediaItem;
    }
  }

  // 2. Fetch all required Social Accounts
  const accountIds = targets.map((t) => t.accountId);
  const { data: accountsData, error: accountsError } = await supabase
    .from('social_accounts')
    .select('*')
    .in('id', accountIds)
    .eq('user_id', userId);

  if (accountsError) {
    console.error('Failed to fetch social accounts for publishing:', accountsError);
  }

  const accountsMap = new Map<string, SocialAccount>();
  (accountsData || []).forEach((acc) => {
    accountsMap.set(acc.id, acc as SocialAccount);
  });

  // 3. Process each target independently via Promise.allSettled
  const jobPromises = targets.map(async (target): Promise<PlatformPublishResult> => {
    const { platform, accountId, content } = target;
    const account = accountsMap.get(accountId);

    if (!account) {
      return {
        jobId: `err_${Date.now()}_${platform}`,
        platform,
        accountId,
        accountName: target.accountName || 'Unknown Account',
        status: 'failed',
        errorCode: 'ACCOUNT_NOT_FOUND',
        errorMessage: `Connected social account (${accountId}) not found.`,
      };
    }

    const adapter = getPlatformAdapter(platform);
    if (!adapter) {
      return {
        jobId: `err_${Date.now()}_${platform}`,
        platform,
        accountId,
        accountName: account.account_name,
        status: 'unsupported',
        errorCode: 'ADAPTER_NOT_FOUND',
        errorMessage: `Publishing adapter for ${platform} is not available.`,
      };
    }

    // Pre-flight Validation
    const validation = adapter.validate({ content, media: mediaItem, account });
    if (!validation.valid) {
      const errorMsg = validation.errors.join(' | ');

      // Insert failed job into DB
      const { data: jobRecord } = await supabase
        .from('publishing_jobs')
        .insert({
          user_id: userId,
          post_id: postId || null,
          social_account_id: account.id,
          platform,
          account_name: account.account_name,
          status: 'failed',
          error_code: 'VALIDATION_FAILED',
          error_message: errorMsg,
          request_payload: { content, mediaId },
        })
        .select()
        .single();

      return {
        jobId: jobRecord?.id || `val_err_${Date.now()}`,
        platform,
        accountId,
        accountName: account.account_name,
        status: 'failed',
        errorCode: 'VALIDATION_FAILED',
        errorMessage: errorMsg,
      };
    }

    // Idempotency Check: Prevent duplicate publishing within 3 minutes
    if (postId) {
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      const { data: duplicateJob } = await supabase
        .from('publishing_jobs')
        .select('id, status, platform_post_id, platform_post_url, published_at')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('social_account_id', account.id)
        .eq('status', 'published')
        .gte('published_at', threeMinutesAgo)
        .maybeSingle();

      if (duplicateJob) {
        return {
          jobId: duplicateJob.id,
          platform,
          accountId,
          accountName: account.account_name,
          status: 'published',
          platformPostId: duplicateJob.platform_post_id,
          platformPostUrl: duplicateJob.platform_post_url,
          publishedAt: duplicateJob.published_at,
          errorMessage: 'Post was already published to this account recently.',
        };
      }
    }

    // Create Initial Job in DB with status: 'processing'
    const { data: jobRecord, error: jobCreateError } = await supabase
      .from('publishing_jobs')
      .insert({
        user_id: userId,
        post_id: postId || null,
        social_account_id: account.id,
        platform,
        account_name: account.account_name,
        status: 'processing',
        request_payload: { content, mediaId },
      })
      .select()
      .single();

    if (jobCreateError) {
      console.error('Failed to create publishing job in DB:', jobCreateError);
    }

    const currentJobId = jobRecord?.id || `job_${Date.now()}_${platform}`;

    // Decrypt Access Token Securely
    let decryptedAccessToken = '';
    try {
      decryptedAccessToken = decryptToken(account.access_token_encrypted);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to decrypt access token.';
      await updateJobInDb(supabase, currentJobId, {
        status: 'needs_reconnect',
        error_code: 'TOKEN_DECRYPTION_ERROR',
        error_message: errMsg,
      });

      return {
        jobId: currentJobId,
        platform,
        accountId,
        accountName: account.account_name,
        status: 'needs_reconnect',
        errorCode: 'TOKEN_DECRYPTION_ERROR',
        errorMessage: 'Security token could not be decrypted. Please reconnect the account.',
      };
    }

    // Execute Adapter Publish
    try {
      const publishResult = await adapter.publish({
        account,
        content,
        media: mediaItem,
        decryptedAccessToken,
      });

      const publishedAt = publishResult.success ? new Date().toISOString() : null;

      // Update Job Record in DB
      await updateJobInDb(supabase, currentJobId, {
        status: publishResult.status,
        platform_post_id: publishResult.platformPostId || null,
        platform_post_url: publishResult.platformPostUrl || null,
        error_code: publishResult.errorCode || null,
        error_message: publishResult.errorMessage || null,
        response_payload: publishResult.rawResponse || {},
        published_at: publishedAt,
      });

      return {
        jobId: currentJobId,
        platform,
        accountId,
        accountName: account.account_name,
        status: publishResult.status,
        platformPostId: publishResult.platformPostId,
        platformPostUrl: publishResult.platformPostUrl,
        errorCode: publishResult.errorCode,
        errorMessage: publishResult.errorMessage,
        publishedAt: publishedAt || undefined,
      };
    } catch (publishErr: unknown) {
      const errMessage = publishErr instanceof Error ? publishErr.message : 'Publishing execution failed.';
      await updateJobInDb(supabase, currentJobId, {
        status: 'failed',
        error_code: 'EXECUTION_EXCEPTION',
        error_message: errMessage,
      });

      return {
        jobId: currentJobId,
        platform,
        accountId,
        accountName: account.account_name,
        status: 'failed',
        errorCode: 'EXECUTION_EXCEPTION',
        errorMessage: errMessage,
      };
    }
  });

  const settledResults = await Promise.allSettled(jobPromises);

  const results: PlatformPublishResult[] = settledResults.map((res, index) => {
    if (res.status === 'fulfilled') {
      return res.value;
    } else {
      const target = targets[index];
      return {
        jobId: `err_${Date.now()}_${target.platform}`,
        platform: target.platform,
        accountId: target.accountId,
        accountName: target.accountName || 'Unknown',
        status: 'failed',
        errorCode: 'UNHANDLED_EXCEPTION',
        errorMessage: res.reason?.message || 'Unexpected execution error.',
      };
    }
  });

  const publishedCount = results.filter((r) => r.status === 'published').length;
  const failedCount = results.filter((r) => r.status !== 'published').length;

  // Update Post Status if published
  if (postId && publishedCount > 0) {
    try {
      await supabase
        .from('posts')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Failed to update post status to published:', e);
    }
  }

  return {
    success: publishedCount > 0,
    total: targets.length,
    publishedCount,
    failedCount,
    results,
  };
}

/**
 * Helper to update a job in Supabase
 */
async function updateJobInDb(
  supabase: ReturnType<typeof createClient> extends Promise<infer U> ? U : never,
  jobId: string,
  updates: Partial<PublishingJob>
) {
  try {
    await supabase
      .from('publishing_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error(`Failed to update publishing job ${jobId}:`, err);
  }
}

/**
 * Retry a failed publishing job
 */
export async function retryPublishJob(jobId: string, userId: string): Promise<PlatformPublishResult> {
  const supabase = await createClient();

  // Fetch job
  const { data: job, error } = await supabase
    .from('publishing_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (error || !job) {
    throw new Error('Publishing job not found.');
  }

  if (job.status === 'published') {
    return {
      jobId: job.id,
      platform: job.platform,
      accountId: job.social_account_id,
      accountName: job.account_name,
      status: 'published',
      platformPostId: job.platform_post_id,
      platformPostUrl: job.platform_post_url,
      publishedAt: job.published_at,
    };
  }

  const target: PublishTarget = {
    platform: job.platform,
    accountId: job.social_account_id,
    accountName: job.account_name,
    content: (job.request_payload?.content as unknown) || {},
  };

  const publishRes = await executeMultiPlatformPublish({
    userId,
    postId: job.post_id || undefined,
    mediaId: (job.request_payload?.mediaId as string) || undefined,
    targets: [target],
  });

  // Increment retry count
  await supabase
    .from('publishing_jobs')
    .update({ retry_count: (job.retry_count || 0) + 1 })
    .eq('id', jobId);

  return publishRes.results[0] || {
    jobId,
    platform: job.platform,
    accountId: job.social_account_id,
    accountName: job.account_name,
    status: 'failed',
    errorMessage: 'Retry execution returned empty result.',
  };
}
