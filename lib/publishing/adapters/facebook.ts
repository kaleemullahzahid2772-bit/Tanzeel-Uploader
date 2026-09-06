import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

const META_GRAPH_VERSION = 'v20.0';
const FB_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const facebookAdapter: PlatformPublishAdapter = {
  platform: 'facebook',

  validate({ content, media, account }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!account.account_id) {
      errors.push('Facebook Page ID is missing.');
    }

    const postText = buildFormattedPostText(content);
    if (!postText && !media) {
      errors.push('Post content is empty. Please provide text or media.');
    }

    if (postText.length > 63206) {
      errors.push(`Facebook text exceeds maximum limit (63,206 chars). Current: ${postText.length}`);
    }

    if (media) {
      if (!media.public_url) {
        errors.push('Attached media does not have a public URL accessible by Facebook.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ account, content, media, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    const pageId = account.account_id;
    const postText = buildFormattedPostText(content);

    try {
      let endpoint = `${FB_GRAPH_BASE}/${pageId}/feed`;
      const bodyParams: Record<string, string> = {
        access_token: decryptedAccessToken,
      };

      if (media && media.public_url) {
        if (media.file_type === 'video') {
          // Video upload endpoint
          endpoint = `${FB_GRAPH_BASE}/${pageId}/videos`;
          bodyParams.file_url = media.public_url;
          if (content.title) bodyParams.title = content.title;
          if (postText) bodyParams.description = postText;
        } else {
          // Photo upload endpoint
          endpoint = `${FB_GRAPH_BASE}/${pageId}/photos`;
          bodyParams.url = media.public_url;
          if (postText) bodyParams.caption = postText;
        }
      } else {
        // Text feed post
        bodyParams.message = postText;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyParams),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const error = data.error || {};
        const code = String(error.code || res.status);
        const message = error.message || `Facebook API error: ${res.statusText}`;

        // Check for token expired / invalid permission
        const isAuthError =
          code === '190' ||
          code === '102' ||
          message.toLowerCase().includes('token') ||
          message.toLowerCase().includes('session') ||
          message.toLowerCase().includes('permission');

        return {
          success: false,
          status: isAuthError ? 'needs_reconnect' : 'failed',
          errorCode: code,
          errorMessage: message,
          rawResponse: data,
        };
      }

      const postId = data.id || data.post_id;
      // Build clean public Facebook URL
      const cleanPostId = postId.includes('_') ? postId.split('_')[1] : postId;
      const platformPostUrl = `https://www.facebook.com/${pageId}/posts/${cleanPostId}`;

      return {
        success: true,
        status: 'published',
        platformPostId: postId,
        platformPostUrl,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error communicating with Facebook';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
