import { SocialPlatform } from '@/lib/types/database';

export interface PlatformRuleDefinition {
  platform: SocialPlatform;
  displayName: string;
  urduName: string;
  maxTitleLength?: number;
  recommendedTitleLength?: number;
  maxCaptionLength?: number;
  recommendedCaptionLength?: number;
  maxDescriptionLength?: number;
  recommendedDescriptionLength?: number;
  minHashtags: number;
  maxHashtags: number;
  optimalHashtags: number;
  requiresHook: boolean;
  requiresCTA: boolean;
  supportsAltText: boolean;
  supportsChapters: boolean;
  supportsOnScreenText: boolean;
  guidelines: {
    en: string[];
    ur: string[];
  };
}

export const PLATFORM_OPTIMIZATION_RULES: Record<SocialPlatform, PlatformRuleDefinition> = {
  facebook: {
    platform: 'facebook',
    displayName: 'Facebook',
    urduName: 'فیس بک',
    maxTitleLength: 100,
    recommendedTitleLength: 60,
    maxCaptionLength: 63206,
    recommendedCaptionLength: 450,
    minHashtags: 2,
    maxHashtags: 6,
    optimalHashtags: 4,
    requiresHook: true,
    requiresCTA: true,
    supportsAltText: true,
    supportsChapters: false,
    supportsOnScreenText: false,
    guidelines: {
      en: [
        'Engaging hook in the first 1-2 lines before the "See more" cutoff.',
        'Storytelling with structured paragraphs and aesthetic line breaks.',
        'Community discussion CTA inviting constructive thoughts.',
        'Topic-relevant keywords used naturally without keyword stuffing.',
      ],
      ur: [
        'پہلی 1 سے 2 لائنوں میں دلچسپ اور متوجہ کرنے والا ہک۔',
        'پیراگراف کی خوبصورت ترتیب اور پڑھنے میں آسان ساخت۔',
        'کمیونٹی ڈسکشن اور شرکت کے لیے واضح کال ٹو ایکشن (CTA)۔',
        'موضوع سے متعلق قدرتی انداز میں استعمال شدہ اہم الفاظ۔',
      ],
    },
  },
  instagram: {
    platform: 'instagram',
    displayName: 'Instagram',
    urduName: 'انسٹاگرام',
    maxCaptionLength: 2200,
    recommendedCaptionLength: 600,
    minHashtags: 8,
    maxHashtags: 20,
    optimalHashtags: 12,
    requiresHook: true,
    requiresCTA: true,
    supportsAltText: true,
    supportsChapters: false,
    supportsOnScreenText: false,
    guidelines: {
      en: [
        'High-impact scroll-stopping hook on line 1.',
        '4-Tier Structure: Hook -> Core Message -> Value Bullet Points -> Engagement CTA.',
        'Aesthetic whitespace formatting with tasteful emojis.',
        'Alt Text generated for image/poster accessibility.',
        'Niche and topic-focused hashtags (10-15 recommended).',
      ],
      ur: [
        'اسکرول روکنے والا پرکشش ہک۔',
        '4 سطحی ساخت: ہک -> بنیادی پیغام -> معلوماتی نکات -> سی ٹی اے (CTA)۔',
        'تصویر کے لیے قابل رسائی Alt Text کی شمولیت۔',
        '10 سے 15 موضوعاتی اور ہدف شدہ ہیش ٹیگز۔',
      ],
    },
  },
  tiktok: {
    platform: 'tiktok',
    displayName: 'TikTok',
    urduName: 'ٹک ٹاک',
    maxCaptionLength: 2200,
    recommendedCaptionLength: 150,
    minHashtags: 3,
    maxHashtags: 7,
    optimalHashtags: 5,
    requiresHook: true,
    requiresCTA: true,
    supportsAltText: false,
    supportsChapters: false,
    supportsOnScreenText: true,
    guidelines: {
      en: [
        'Immediate 1-second attention-grabbing visual or text hook.',
        'Suggested on-screen text overlay for mobile viewers.',
        'Suggested 3-second opening spoken line.',
        'Search-intent keywords for TikTok SEO.',
        'No false viral claims or artificial guarantees.',
      ],
      ur: [
        'پہلے ہی سیکنڈ میں متوجہ کرنے والا طاقتور ہک۔',
        'موبائل اسکرین کے لیے آن اسکرین ٹیکسٹ تجویز۔',
        'ابتدائی 3 سیکنڈ کی اثر انگیز بولنے والی لائن۔',
        'ٹک ٹاک سرچ کے لیے موضوعاتی کی ورڈز۔',
      ],
    },
  },
  youtube: {
    platform: 'youtube',
    displayName: 'YouTube',
    urduName: 'یوٹیوب',
    maxTitleLength: 100,
    recommendedTitleLength: 68,
    maxDescriptionLength: 5000,
    recommendedDescriptionLength: 1200,
    minHashtags: 3,
    maxHashtags: 5,
    optimalHashtags: 3,
    requiresHook: true,
    requiresCTA: true,
    supportsAltText: false,
    supportsChapters: true,
    supportsOnScreenText: false,
    guidelines: {
      en: [
        'High-CTR SEO Title under 70 characters (compelling, truthful, never clickbait).',
        'Comprehensive description with summary, key takeaways, brand links, and CTA.',
        'Primary, secondary, and long-tail search keywords naturally integrated.',
        '10-15 targeted video tags.',
        'Proposed structured video chapters/timestamps if video breakdown is provided.',
      ],
      ur: [
        '70 حروف کے اندر اعلیٰ درجے کا ایس ای او سرچ ایبل ٹائٹل (بغیر گمراہ کن کلک بیٹ کے)۔',
        'تفصیلی اور معلوماتی ڈسکرپشن بمعہ اہم نکات، برانڈ معلومات اور سبسکرائب سی ٹی اے۔',
        'بنیادی، ثانوی اور لانگ ٹیل سرچ کی ورڈز کا فطری استعمال۔',
        '10 سے 15 متعلقہ ویڈیو سرچ ٹیگز۔',
        'ویڈیو کے منظم ابواب اور ٹائم اسٹیمپ تجاویز۔',
      ],
    },
  },
  twitter: {
    platform: 'twitter',
    displayName: 'X (Twitter)',
    urduName: 'ایکس (ٹوئٹر)',
    maxCaptionLength: 280,
    recommendedCaptionLength: 240,
    minHashtags: 1,
    maxHashtags: 3,
    optimalHashtags: 2,
    requiresHook: true,
    requiresCTA: false,
    supportsAltText: true,
    supportsChapters: false,
    supportsOnScreenText: false,
    guidelines: {
      en: [
        'Strict character limit: Must stay firmly under 280 characters.',
        'Punchy, thought-provoking opening.',
        'Maximum clarity with zero fluff.',
        '1-3 natural hashtags seamlessly embedded.',
      ],
      ur: [
        'سختی سے 280 حروف کی حد کے اندر جامع تحریر۔',
        'فکر انگیز اور اثر دار شروعات۔',
        'غیر ضروری طوالت کے بغیر واضح پیغام۔',
        'صرف 1 سے 3 موزوں ہیش ٹیگز۔',
      ],
    },
  },
  whatsapp: {
    platform: 'whatsapp',
    displayName: 'WhatsApp Channel',
    urduName: 'واٹس ایپ چینل',
    maxTitleLength: 80,
    recommendedTitleLength: 45,
    maxCaptionLength: 4000,
    recommendedCaptionLength: 350,
    minHashtags: 0,
    maxHashtags: 2,
    optimalHashtags: 0,
    requiresHook: false,
    requiresCTA: true,
    supportsAltText: false,
    supportsChapters: false,
    supportsOnScreenText: false,
    guidelines: {
      en: [
        'Bold, eye-catching broadcast header/title.',
        'Conversational, personal, and respectful tone for direct messaging.',
        'Clean bullet points with tasteful emojis.',
        'Direct forward/contact call to action.',
        'No hashtag clutter.',
      ],
      ur: [
        'بولڈ اور نمایاں براڈکاسٹ ہیڈر/ٹائٹل۔',
        'براہ راست پیغام رسانی کے لیے دوستانہ اور باوقار انداز۔',
        'صاف ستھرے بلٹ پوائنٹس اور مناسب ایموجیز۔',
        'فارورڈ یا رابطے کا واضح لنک/سی ٹی اے۔',
        'غیر ضروری ہیش ٹیگز سے مکمل پرہیز۔',
      ],
    },
  },
};

export function getPlatformRule(platform: SocialPlatform): PlatformRuleDefinition {
  return PLATFORM_OPTIMIZATION_RULES[platform] || PLATFORM_OPTIMIZATION_RULES.facebook;
}
