import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

const TWITTER_API_V2_URL = 'https://api.twitter.com/2/tweets';

export const twitterAdapter: PlatformPublishAdapter = {
  platform: 'twitter',

  validate({ content }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const postText = buildFormattedPostText(content);
    if (!postText.trim()) {
      errors.push('Tweet text cannot be empty.');
    }

    if (postText.length > 280) {
      errors.push(`Tweet exceeds maximum 280 character limit. Current: ${postText.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ account, content, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    const postText = buildFormattedPostText(content).slice(0, 280);

    if (!postText.trim()) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'EMPTY_TEXT',
        errorMessage: 'Tweet content is empty.',
      };
    }

    try {
      const payload: { text: string } = {
        text: postText,
      };

      const res = await fetch(TWITTER_API_V2_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptedAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.errors || data.error) {
        const errorsList = data.errors || [];
        const firstError = errorsList[0] || {};
        const code = String(firstError.code || res.status);
        const message = firstError.message || data.detail || data.title || `Twitter API error: ${res.statusText}`;

        const isAuthError =
          code === '401' ||
          code === '403' ||
          code === '89' ||
          message.toLowerCase().includes('token') ||
          message.toLowerCase().includes('auth') ||
          message.toLowerCase().includes('permission');

        return {
          success: false,
          status: isAuthError ? 'needs_reconnect' : 'failed',
          errorCode: code,
          errorMessage: message,
          rawResponse: data,
        };
      }

      const tweetId = data.data?.id;
      const username = account.username || account.account_name.replace(/\s+/g, '');
      const platformPostUrl = `https://x.com/${username}/status/${tweetId}`;

      return {
        success: true,
        status: 'published',
        platformPostId: tweetId,
        platformPostUrl,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error communicating with X/Twitter API';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
