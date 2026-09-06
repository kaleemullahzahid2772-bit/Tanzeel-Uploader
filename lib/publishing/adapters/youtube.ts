import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

export const youtubeAdapter: PlatformPublishAdapter = {
  platform: 'youtube',

  validate({ content, media }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!media || media.file_type !== 'video' || !media.public_url) {
      errors.push('YouTube publishing requires an attached video file.');
    }

    const title = (content.title || content.hook || 'Nūr Social Video').trim();
    if (title.length > 100) {
      errors.push(`YouTube video title exceeds maximum 100 character limit. Current: ${title.length}`);
    }

    const description = buildFormattedPostText(content);
    if (description.length > 5000) {
      errors.push(`YouTube video description exceeds maximum 5,000 character limit. Current: ${description.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ content, media, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    if (!media || media.file_type !== 'video' || !media.public_url) {
      return {
        success: false,
        status: 'unsupported',
        errorCode: 'VIDEO_REQUIRED',
        errorMessage: 'YouTube Data API v3 requires a video file.',
      };
    }

    const title = (content.title || content.hook || 'Nūr Social Islamic Reflection').slice(0, 100);
    const description = buildFormattedPostText(content).slice(0, 5000);
    const tags = content.tags || content.hashtags || ['Islam', 'NurSocial'];

    try {
      // Fetch the video stream or binary buffer from public_url
      const videoFetchRes = await fetch(media.public_url);
      if (!videoFetchRes.ok) {
        return {
          success: false,
          status: 'failed',
          errorCode: 'MEDIA_DOWNLOAD_FAILED',
          errorMessage: `Failed to fetch video file from ${media.public_url}`,
        };
      }

      const videoBuffer = await videoFetchRes.arrayBuffer();

      // Initiate Multipart Upload to YouTube Data API v3
      const metadata = {
        snippet: {
          title,
          description,
          tags,
          categoryId: '22', // People & Blogs
          defaultLanguage: 'ur',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      };

      const boundary = 'foo_bar_baz_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart =
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata);

      const mediaHeader = `Content-Type: ${media.mime_type || 'video/mp4'}\r\n\r\n`;

      const preBuffer = Buffer.from(delimiter + metadataPart + delimiter + mediaHeader);
      const postBuffer = Buffer.from(closeDelimiter);
      const videoData = Buffer.from(videoBuffer);

      const combinedBody = Buffer.concat([preBuffer, videoData, postBuffer]);

      const res = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${decryptedAccessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': String(combinedBody.length),
          },
          body: combinedBody,
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        const error = data.error || {};
        const code = String(error.code || res.status);
        const message = error.message || `YouTube API error: ${res.statusText}`;

        const isAuthError =
          code === '401' ||
          code === '403' ||
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

      const videoId = data.id;
      const platformPostUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return {
        success: true,
        status: 'published',
        platformPostId: videoId,
        platformPostUrl,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error communicating with YouTube API';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
