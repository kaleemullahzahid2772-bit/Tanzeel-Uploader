import { createClient } from '@/lib/supabase/server';
import {
  ScheduledPost,
  ScheduleTarget,
  ScheduleResult,
  ScheduleResponse,
  SocialAccount,
  MediaItem,
  InAppNotification,
  NotificationType,
} from '@/lib/types/database';
import { isFutureUTC } from './timezone';
import { getPlatformAdapter } from '@/lib/publishing/adapters';
import { decryptToken, encryptToken } from '@/lib/security/crypto';
import { refreshSocialAccountToken } from '@/lib/oauth/handlers';

export interface CreateScheduleOptions {
  userId: string;
  postId?: string;
  mediaId?: string;
  scheduledForUtc: string;
  timezone: string;
  targets: ScheduleTarget[];
}

/**
 * Creates scheduled posts for one or more platform targets with immutable content snapshots.
 */
export async function createScheduledPosts({
  userId,
  postId,
  mediaId,
  scheduledForUtc,
  timezone,
  targets,
}: CreateScheduleOptions): Promise<ScheduleResponse> {
  const supabase = await createClient();

  // 1. Validate Future Date
  if (!isFutureUTC(scheduledForUtc, 10)) {
    throw new Error('Scheduled date and time must be in the future.');
  }

  // 2. Fetch required Social Accounts
  const accountIds = targets.map((t) => t.accountId);
  const { data: accountsData } = await supabase
    .from('social_accounts')
    .select('*')
    .in('id', accountIds)
    .eq('user_id', userId);

  const accountsMap = new Map<string, SocialAccount>();
  (accountsData || []).forEach((acc) => {
    accountsMap.set(acc.id, acc as SocialAccount);
  });

  // 3. Process and create scheduled post per platform target
  const results: ScheduleResult[] = [];

  for (const target of targets) {
    const { platform, accountId, content } = target;
    const account = accountsMap.get(accountId);

    if (!account) {
      results.push({
        scheduleId: `err_${Date.now()}_${platform}`,
        platform,
        accountId,
        accountName: target.accountName || 'Unknown',
        scheduledFor: scheduledForUtc,
        timezone,
        status: 'failed',
        errorMessage: `Connected social account (${accountId}) not found.`,
      });
      continue;
    }

    // Duplicate scheduling protection: Check for duplicate scheduled post in same 5-minute window
    if (postId) {
      const windowStart = new Date(new Date(scheduledForUtc).getTime() - 2 * 60 * 1000).toISOString();
      const windowEnd = new Date(new Date(scheduledForUtc).getTime() + 2 * 60 * 1000).toISOString();

      const { data: existingSchedule } = await supabase
        .from('scheduled_posts')
        .select('id, status, scheduled_for')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('platform', platform)
        .eq('social_account_id', account.id)
        .eq('status', 'scheduled')
        .gte('scheduled_for', windowStart)
        .lte('scheduled_for', windowEnd)
        .maybeSingle();

      if (existingSchedule) {
        results.push({
          scheduleId: existingSchedule.id,
          platform,
          accountId: account.id,
          accountName: account.account_name,
          scheduledFor: existingSchedule.scheduled_for,
          timezone,
          status: 'scheduled',
          errorMessage: 'An identical scheduled post already exists for this timeframe.',
        });
        continue;
      }
    }

    // Insert scheduled_post record with immutable snapshot
    const { data: inserted, error: insertError } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        post_id: postId || null,
        social_account_id: account.id,
        platform,
        account_name: account.account_name,
        content_snapshot: content,
        media_id: mediaId || null,
        scheduled_for: scheduledForUtc,
        timezone,
        status: 'scheduled',
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      results.push({
        scheduleId: `err_insert_${Date.now()}`,
        platform,
        accountId: account.id,
        accountName: account.account_name,
        scheduledFor: scheduledForUtc,
        timezone,
        status: 'failed',
        errorMessage: insertError?.message || 'Failed to save scheduled post to database.',
      });
    } else {
      results.push({
        scheduleId: inserted.id,
        platform,
        accountId: account.id,
        accountName: account.account_name,
        scheduledFor: inserted.scheduled_for,
        timezone: inserted.timezone,
        status: 'scheduled',
      });
    }
  }

  const scheduledCount = results.filter((r) => r.status === 'scheduled').length;

  // Create In-App Notification
  if (scheduledCount > 0) {
    await createInAppNotification({
      userId,
      title: 'Post Scheduled (پوسٹ شیڈول ہو گئی)',
      message: `Successfully scheduled content across ${scheduledCount} channel(s) for future delivery.`,
      type: 'info',
      link: '/dashboard/calendar',
    });
  }

  return {
    success: scheduledCount > 0,
    total: targets.length,
    scheduledCount,
    results,
  };
}

/**
 * Background Scheduler: Atomically claims and processes all due scheduled posts.
 */
export async function processDueSchedules(): Promise<{
  processedCount: number;
  publishedCount: number;
  failedCount: number;
  reconnectCount: number;
}> {
  const supabase = await createClient();
  const nowUtc = new Date().toISOString();
  const workerId = `worker_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // 1. Find Due Posts (scheduled_for <= NOW and status = 'scheduled')
  const { data: duePosts, error: findError } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', nowUtc)
    .order('scheduled_for', { ascending: true })
    .limit(20);

  if (findError || !duePosts || duePosts.length === 0) {
    return { processedCount: 0, publishedCount: 0, failedCount: 0, reconnectCount: 0 };
  }

  let publishedCount = 0;
  let failedCount = 0;
  let reconnectCount = 0;

  for (const post of duePosts as ScheduledPost[]) {
    // 2. Atomic Lock: Claim the post
    const { data: claimed, error: claimError } = await supabase
      .from('scheduled_posts')
      .update({
        status: 'processing',
        locked_at: nowUtc,
        locked_by: workerId,
        updated_at: nowUtc,
      })
      .eq('id', post.id)
      .eq('status', 'scheduled') // Enforce concurrency lock
      .select()
      .maybeSingle();

    if (claimError || !claimed) {
      // Another worker already claimed this post
      continue;
    }

    // 3. Load Social Account & Media
    const { data: accountData } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', post.social_account_id)
      .maybeSingle();

    if (!accountData) {
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'needs_reconnect',
          error_message: 'Social account is no longer connected.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      await createInAppNotification({
        userId: post.user_id,
        title: `Account Disconnected (${post.platform})`,
        message: `Scheduled post could not publish because the ${post.platform} account is disconnected. Please reconnect.`,
        type: 'warning',
        link: '/dashboard/accounts',
      });
      reconnectCount++;
      continue;
    }

    const account = accountData as SocialAccount;

    let mediaItem: MediaItem | null = null;
    if (post.media_id) {
      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .eq('id', post.media_id)
        .maybeSingle();
      if (mediaData) {
        mediaItem = mediaData as MediaItem;
      }
    }

    // 4. Token Expiration Check & Auto-Refresh
    if (account.token_expires_at) {
      const expiry = new Date(account.token_expires_at).getTime();
      const isExpired = expiry <= Date.now();
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
        } catch (refreshErr) {
          console.warn(`Token refresh failed for ${account.platform}:`, refreshErr);
        }
      }
    }

    // 5. Decrypt Access Token
    let decryptedAccessToken = '';
    try {
      decryptedAccessToken = decryptToken(account.access_token_encrypted);
    } catch {
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'needs_reconnect',
          error_message: 'Could not decrypt access token.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      reconnectCount++;
      continue;
    }

    // 6. Invoke Platform Adapter
    const adapter = getPlatformAdapter(post.platform);
    if (!adapter) {
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'failed',
          error_message: `No adapter found for platform: ${post.platform}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      failedCount++;
      continue;
    }

    try {
      const publishRes = await adapter.publish({
        account,
        content: post.content_snapshot,
        media: mediaItem,
        decryptedAccessToken,
      });

      if (publishRes.success) {
        // Create publishing job record for audit
        const { data: pubJob } = await supabase
          .from('publishing_jobs')
          .insert({
            user_id: post.user_id,
            post_id: post.post_id,
            social_account_id: account.id,
            platform: post.platform,
            account_name: account.account_name,
            status: 'published',
            platform_post_id: publishRes.platformPostId || null,
            platform_post_url: publishRes.platformPostUrl || null,
            request_payload: { content: post.content_snapshot, mediaId: post.media_id },
            response_payload: publishRes.rawResponse || {},
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        await supabase
          .from('scheduled_posts')
          .update({
            status: 'published',
            publishing_job_id: pubJob?.id || null,
            published_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        await createInAppNotification({
          userId: post.user_id,
          title: `Post Published to ${account.account_name} (${post.platform})`,
          message: `Your scheduled Islamic reflection was published successfully at ${post.scheduled_for}.`,
          type: 'success',
          link: publishRes.platformPostUrl || '/dashboard/publishing',
        });

        publishedCount++;
      } else {
        const isPermanent =
          publishRes.status === 'needs_reconnect' ||
          publishRes.status === 'unsupported' ||
          (post.retry_count || 0) >= (post.max_retries || 3);

        const newStatus = isPermanent
          ? publishRes.status === 'needs_reconnect'
            ? 'needs_reconnect'
            : 'failed'
          : 'scheduled'; // Will retry next tick

        await supabase
          .from('scheduled_posts')
          .update({
            status: newStatus,
            retry_count: (post.retry_count || 0) + 1,
            error_message: publishRes.errorMessage || 'Publishing failed.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        if (newStatus === 'needs_reconnect' || newStatus === 'failed') {
          await createInAppNotification({
            userId: post.user_id,
            title: `Scheduled Post Failed (${post.platform})`,
            message: publishRes.errorMessage || 'Scheduled post delivery encountered an issue.',
            type: 'error',
            link: '/dashboard/calendar',
          });
          failedCount++;
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown execution error.';
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'failed',
          error_message: errMsg,
          retry_count: (post.retry_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      failedCount++;
    }
  }

  return {
    processedCount: duePosts.length,
    publishedCount,
    failedCount,
    reconnectCount,
  };
}

/**
 * Reschedules a pending scheduled post to a new date/time.
 */
export async function reschedulePost({
  scheduleId,
  userId,
  newScheduledForUtc,
  newTimezone,
}: {
  scheduleId: string;
  userId: string;
  newScheduledForUtc: string;
  newTimezone: string;
}): Promise<ScheduledPost> {
  const supabase = await createClient();

  if (!isFutureUTC(newScheduledForUtc, 10)) {
    throw new Error('New scheduled date and time must be in the future.');
  }

  const { data: updated, error } = await supabase
    .from('scheduled_posts')
    .update({
      scheduled_for: newScheduledForUtc,
      timezone: newTimezone,
      status: 'scheduled',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .in('status', ['scheduled', 'failed', 'paused'])
    .select()
    .single();

  if (error || !updated) {
    throw new Error(error?.message || 'Failed to reschedule post.');
  }

  return updated as ScheduledPost;
}

/**
 * Cancels a scheduled post.
 */
export async function cancelScheduledPost({
  scheduleId,
  userId,
}: {
  scheduleId: string;
  userId: string;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scheduled_posts')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .in('status', ['scheduled', 'paused']);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Toggles pause/resume on a scheduled post.
 */
export async function togglePauseScheduledPost({
  scheduleId,
  userId,
}: {
  scheduleId: string;
  userId: string;
}): Promise<ScheduledPost> {
  const supabase = await createClient();

  const { data: post, error: fetchErr } = await supabase
    .from('scheduled_posts')
    .select('status')
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !post) {
    throw new Error('Scheduled post not found.');
  }

  const newStatus = post.status === 'paused' ? 'scheduled' : 'paused';

  const { data: updated, error: updateErr } = await supabase
    .from('scheduled_posts')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateErr || !updated) {
    throw new Error(updateErr?.message || 'Failed to update schedule status.');
  }

  return updated as ScheduledPost;
}

/**
 * Helper to create an In-App notification.
 */
export async function createInAppNotification({
  userId,
  title,
  message,
  type = 'info',
  link = null,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
}): Promise<InAppNotification | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('in_app_notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false,
      })
      .select()
      .maybeSingle();

    return data as InAppNotification | null;
  } catch (e) {
    console.warn('Failed to insert in-app notification:', e);
    return null;
  }
}
