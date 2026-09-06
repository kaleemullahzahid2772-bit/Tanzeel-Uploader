import { SocialPlatform, HashtagCategoriesData, BrandSettings } from '@/lib/types/database';
import { PLATFORM_OPTIMIZATION_RULES } from './optimization-rules';

export function categorizeHashtags(
  rawHashtags: string[],
  platform: SocialPlatform,
  brandSettings: BrandSettings | null
): HashtagCategoriesData {
  const brandTags: string[] = [];
  const topicTags: string[] = [];
  const audienceTags: string[] = [];

  const brandNameClean = (brandSettings?.brand_name || 'NurSocial').replace(/\s+/g, '');
  brandTags.push(`#${brandNameClean}`);
  if (brandSettings?.brand_name?.includes('نور')) {
    brandTags.push('#نور_سوشل');
  }

  for (const tag of rawHashtags) {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    const lower = cleanTag.toLowerCase();

    if (lower.includes('nur') || lower.includes('نور') || lower.includes(brandNameClean.toLowerCase())) {
      if (!brandTags.includes(cleanTag)) brandTags.push(cleanTag);
    } else if (
      lower.includes('muslim') ||
      lower.includes('youth') ||
      lower.includes('family') ||
      lower.includes('community') ||
      lower.includes('مسلمان') ||
      lower.includes('نوجوان') ||
      lower.includes('خاندان') ||
      lower.includes('تربیت_اولاد')
    ) {
      if (!audienceTags.includes(cleanTag)) audienceTags.push(cleanTag);
    } else {
      if (!topicTags.includes(cleanTag)) topicTags.push(cleanTag);
    }
  }

  return {
    brand: brandTags,
    topic: topicTags,
    audience: audienceTags,
  };
}

export function flattenHashtagsForPlatform(
  categories: HashtagCategoriesData,
  platform: SocialPlatform
): string[] {
  const rules = PLATFORM_OPTIMIZATION_RULES[platform];
  const merged = [
    ...categories.topic,
    ...categories.audience,
    ...categories.brand,
  ];

  const unique = Array.from(new Set(merged));
  return unique.slice(0, rules.maxHashtags);
}
