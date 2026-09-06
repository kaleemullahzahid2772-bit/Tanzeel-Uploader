import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

const META_GRAPH_VERSION = 'v20.0';
const IG_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const instagramAdapter: PlatformPublishAdapter = {
  platform: 'instagram',

  validate({ content, media, account }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!account.account_id) {
      errors.push('Instagram Professional Account ID is missing.');
    }

    if (!media || !media.public_url) {
      errors.push('Instagram Content Publishing API requires an attached image or video. Pure text posts are not supported.');
    }

    const postText = buildFormattedPostText(content);
    if (postText.length > 2200) {
      errors.push(`Instagram caption exceeds maximum 2,200 character limit. Current: ${postText.length}`);
    }

    if (content.hashtags && content.hashtags.length > 30) {
      warnings.push(`Instagram allows a maximum of 30 hashtags. You have ${content.hashtags.length}.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ account, content, media, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    const igUserId = account.account_id;
    const caption = buildFormattedPostText(content);

    if (!media || !media.public_url) {
      return {
        success: false,
        status: 'unsupported',
        errorCode: 'MEDIA_REQUIRED',
        errorMessage: 'Instagram publishing requires an image or video file.',
      };
    }

    try {
      // Step 1: Create media container
      const containerParams = new URLSearchParams({
        access_token: decryptedAccessToken,
        caption: caption,
      });

      if (media.file_type === 'video') {
        containerParams.append('video_url', media.public_url);
        containerParams.append('media_type', 'REELS');
      } else {
        containerParams.append('image_url', media.public_url);
      }

      const containerRes = await fetch(`${IG_GRAPH_BASE}/${igUserId}/media?${containerParams.toString()}`, {
        method: 'POST',
      });

      const containerData = await containerRes.json();

      if (!containerRes.ok || containerData.error) {
        const error = containerData.error || {};
        const code = String(error.code || containerRes.status);
        const message = error.message || `Failed to create Instagram container: ${containerRes.statusText}`;

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
          rawResponse: containerData,
        };
      }

      const creationId = containerData.id;

      // If video, poll status briefly (up to 3 tries, 3 seconds apart)
      if (media.file_type === 'video') {
        let attempts = 0;
        let ready = false;

        while (attempts < 3 && !ready) {
          await new Promise((r) => setTimeout(r, 2500));
          const statusRes = await fetch(
            `${IG_GRAPH_BASE}/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(decryptedAccessToken)}`
          );
          const statusData = await statusRes.json();
          if (statusData.status_code === 'FINISHED') {
            ready = true;
          } else if (statusData.status_code === 'ERROR') {
            return {
              success: false,
              status: 'failed',
              errorCode: 'CONTAINER_PROCESSING_ERROR',
              errorMessage: statusData.status || 'Instagram video container processing failed.',
              rawResponse: statusData,
            };
          }
          attempts++;
        }
      }

      // Step 2: Publish the media container
      const publishParams = new URLSearchParams({
        creation_id: creationId,
        access_token: decryptedAccessToken,
      });

      const publishRes = await fetch(`${IG_GRAPH_BASE}/${igUserId}/media_publish?${publishParams.toString()}`, {
        method: 'POST',
      });

      const publishData = await publishRes.json();

      if (!publishRes.ok || publishData.error) {
        const error = publishData.error || {};
        return {
          success: false,
          status: 'failed',
          errorCode: String(error.code || publishRes.status),
          errorMessage: error.message || 'Failed to publish Instagram container.',
          rawResponse: publishData,
        };
      }

      const mediaId = publishData.id;

      // Step 3: Try to fetch permalink
      let postUrl = `https://www.instagram.com/`;
      try {
        const permalinkRes = await fetch(
          `${IG_GRAPH_BASE}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(decryptedAccessToken)}`
        );
        const permalinkData = await permalinkRes.json();
        if (permalinkData.permalink) {
          postUrl = permalinkData.permalink;
        }
      } catch {
        // Fallback to general IG URL
      }

      return {
        success: true,
        status: 'published',
        platformPostId: mediaId,
        platformPostUrl: postUrl,
        rawResponse: publishData,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error publishing to Instagram';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
