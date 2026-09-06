import { SocialPlatform } from '@/lib/types/database';
import { PlatformPublishAdapter } from './types';
import { facebookAdapter } from './facebook';
import { instagramAdapter } from './instagram';
import { tiktokAdapter } from './tiktok';
import { youtubeAdapter } from './youtube';
import { twitterAdapter } from './twitter';
import { whatsappAdapter } from './whatsapp';

export * from './types';

export const PLATFORM_ADAPTERS: Record<SocialPlatform, PlatformPublishAdapter> = {
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  tiktok: tiktokAdapter,
  youtube: youtubeAdapter,
  twitter: twitterAdapter,
  whatsapp: whatsappAdapter,
};

export function getPlatformAdapter(platform: SocialPlatform): PlatformPublishAdapter | undefined {
  return PLATFORM_ADAPTERS[platform];
}
