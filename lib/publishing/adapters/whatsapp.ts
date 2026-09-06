import {
  PlatformPublishAdapter,
  AdapterValidationResult,
  AdapterPublishParams,
  AdapterPublishResponse,
  buildFormattedPostText,
} from './types';

const META_GRAPH_VERSION = 'v20.0';
const WA_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const whatsappAdapter: PlatformPublishAdapter = {
  platform: 'whatsapp',

  validate({ content, account }): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!account.account_id) {
      errors.push('WhatsApp Business Phone Number ID is missing.');
    }

    const postText = buildFormattedPostText(content);
    if (!postText.trim()) {
      errors.push('WhatsApp message body cannot be empty.');
    }

    if (postText.length > 4096) {
      errors.push(`WhatsApp message exceeds maximum 4,096 character limit. Current: ${postText.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async publish({ account, content, media, decryptedAccessToken }: AdapterPublishParams): Promise<AdapterPublishResponse> {
    const phoneId = account.account_id;
    const postText = buildFormattedPostText(content).slice(0, 4096);
    const recipientPhone = (account.metadata?.recipient_phone as string) || (account.metadata?.phone_number as string) || account.username || '';

    try {
      const endpoint = `${WA_GRAPH_BASE}/${phoneId}/messages`;

      let payload: Record<string, unknown>;

      if (media && media.public_url) {
        if (media.file_type === 'video') {
          payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'video',
            video: {
              link: media.public_url,
              caption: postText,
            },
          };
        } else {
          payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'image',
            image: {
              link: media.public_url,
              caption: postText,
            },
          };
        }
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: postText,
          },
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptedAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const error = data.error || {};
        const code = String(error.code || res.status);
        const message = error.message || `WhatsApp Cloud API error: ${res.statusText}`;

        const isAuthError =
          code === '190' ||
          code === '102' ||
          message.toLowerCase().includes('token') ||
          message.toLowerCase().includes('session') ||
          message.toLowerCase().includes('auth');

        return {
          success: false,
          status: isAuthError ? 'needs_reconnect' : 'failed',
          errorCode: code,
          errorMessage: message,
          rawResponse: data,
        };
      }

      const messageId = data.messages?.[0]?.id || `wamid_${Date.now()}`;
      const platformPostUrl = `https://wa.me/${recipientPhone || ''}`;

      return {
        success: true,
        status: 'published',
        platformPostId: messageId,
        platformPostUrl,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error communicating with WhatsApp Cloud API';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: msg,
      };
    }
  },
};
