import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

const TIKTOK_POST_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/video/init/';

export const tiktokAdapter: PlatformPublishAdapter = {
  platform: 'tiktok',

  validate({ content, media }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!media || media.file_type !== 'video' || !media.public_url) {
      errors.push('TikTok requires an attached MP4 or MOV video file.');
    }

    const postText = buildFormattedPostText(content);
    if (postText.length > 2200) {
      errors.push(`TikTok title/caption exceeds maximum 2,200 character limit. Current: ${postText.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ account, content, media, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    if (!media || media.file_type !== 'video' || !media.public_url) {
      return {
        success: false,
        status: 'unsupported',
        errorCode: 'VIDEO_REQUIRED',
        errorMessage: 'TikTok Content Posting API strictly requires a public video URL.',
      };
    }

    const postText = buildFormattedPostText(content);

    try {
      const payload = {
        post_info: {
          title: postText.slice(0, 2200),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: media.public_url,
        },
      };

      const res = await fetch(TIKTOK_POST_INIT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptedAccessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || (data.error && data.error.code !== 'ok')) {
        const error = data.error || {};
        const code = String(error.code || res.status);
        const message = error.message || `TikTok API error: ${res.statusText}`;

        const isAuthError =
          code === 'access_token_invalid' ||
          code === 'scope_not_authorized' ||
          message.toLowerCase().includes('token') ||
          message.toLowerCase().includes('auth');

        return {
          success: false,
          status: isAuthError ? 'needs_reconnect' : 'failed',
          errorCode: code,
          errorMessage: message,
          rawResponse: data,
        };
      }

      const publishId = data.data?.publish_id || `tt_pub_${Date.now()}`;
      const username = account.username || account.account_name.replace(/\s+/g, '').toLowerCase();
      const platformPostUrl = `https://www.tiktok.com/@${username}`;

      return {
        success: true,
        status: 'published',
        platformPostId: publishId,
        platformPostUrl,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error communicating with TikTok';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
