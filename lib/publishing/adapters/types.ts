import {
  SocialPlatform,
  PlatformContentData,
  MediaItem,
  SocialAccount,
} from '@/lib/types/database';

export interface AdapterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AdapterPublishParams {
  account: SocialAccount;
  content: PlatformContentData;
  media?: MediaItem | null;
  decryptedAccessToken: string;
}

export interface AdapterPublishResponse {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  status: 'published' | 'failed' | 'unsupported' | 'needs_reconnect';
  rawResponse?: Record<string, unknown>;
}

export interface PlatformPublishAdapter {
  platform: SocialPlatform;
  validate(params: {
    content: PlatformContentData;
    media?: MediaItem | null;
    account: SocialAccount;
  }): AdapterValidationResult;
  publish(params: AdapterPublishParams): Promise<AdapterPublishResponse>;
}

/**
 * Cleanly format and combine text with hashtags for platforms
 */
export function buildFormattedPostText(content: PlatformContentData, includeHashtags = true): string {
  const parts: string[] = [];

  const mainText = (content.caption || content.description || content.hook || '').trim();
  if (mainText) {
    parts.push(mainText);
  }

  if (content.cta && content.cta.trim()) {
    parts.push(content.cta.trim());
  }

  if (includeHashtags && content.hashtags && content.hashtags.length > 0) {
    const formattedTags = content.hashtags
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .join(' ');
    parts.push(formattedTags);
  }

  return parts.join('\n\n');
}
