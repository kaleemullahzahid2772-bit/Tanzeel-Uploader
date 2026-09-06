import {
  SocialPlatform,
  PlatformContentData,
  QualityCheckResult,
  ScoreBreakdown,
} from '@/lib/types/database';
import { PLATFORM_OPTIMIZATION_RULES } from './optimization-rules';

export function calculateQualityScore(
  platform: SocialPlatform,
  content: PlatformContentData
): QualityCheckResult {
  const rules = PLATFORM_OPTIMIZATION_RULES[platform];
  const issues: string[] = [];
  const suggestions: string[] = [];
  const islamicSafetyNotes: string[] = [];

  const text = `${content.title || ''} ${content.hook || ''} ${content.caption || ''} ${content.description || ''}`;
  const isUrdu = /[\u0600-\u06FF]/.test(text);

  let hookScore = 20;
  let platformFitScore = 20;
  let seoScore = 20;
  let ctaScore = 15;
  let hashtagScore = 15;
  let islamicAdabScore = 10;

  // -------------------------------------------------------------------------
  // 1. Hook Evaluation (Max 20)
  // -------------------------------------------------------------------------
  if (rules.requiresHook) {
    const hookText = content.hook || (content.caption ? content.caption.split('\n')[0] : '');
    if (!hookText || hookText.trim().length === 0) {
      hookScore -= 12;
      issues.push(isUrdu ? 'پوسٹ میں کوئی واضح ہک موجود نہیں ہے۔' : 'Opening hook is missing.');
      suggestions.push(isUrdu ? 'پہلی 1-2 لائنوں میں متوجہ کرنے والا ہک شامل کریں۔' : 'Add an engaging 1-2 line hook at the start.');
    } else if (hookText.length > 180) {
      hookScore -= 5;
      suggestions.push(isUrdu ? 'ہک کو زیادہ مختصر اور پر اثر بنائیں (120 حروف کے اندر)۔' : 'Shorten the hook to under 120 characters for higher impact.');
    }

    // Check for cheap sensationalism
    if (/(حیران رہ جائیں گے|راز فاش|شاکنگ|shocking secret|you won\'t believe)/i.test(hookText)) {
      hookScore -= 8;
      islamicAdabScore -= 3;
      issues.push(isUrdu ? 'سنسنی خیز (Clickbait) الفاظ سے پرہیز کریں۔' : 'Avoid sensational clickbait phrases in Islamic content.');
      suggestions.push(isUrdu ? 'وقار اور سچائی پر مبنی معلوماتی ہک استعمال کریں۔' : 'Use a dignified, value-driven opening hook.');
    }
  }

  // -------------------------------------------------------------------------
  // 2. Platform Fit & Length (Max 20)
  // -------------------------------------------------------------------------
  if (platform === 'twitter') {
    const tweetLen = (content.caption || '').length;
    if (tweetLen > 280) {
      platformFitScore = 0;
      issues.push(isUrdu ? `ٹوئٹ 280 حروف سے تجاوز کر گئی ہے (${tweetLen} حروف)۔` : `X post exceeds 280 characters (${tweetLen} chars).`);
      suggestions.push(isUrdu ? 'ٹوئٹ کو مختصر کر کے 280 حروف کے اندر لائیں۔' : 'Trim post content to strictly under 280 characters.');
    } else if (tweetLen < 40) {
      platformFitScore -= 8;
      suggestions.push(isUrdu ? 'پیغام میں کچھ مزید جامعیت اور ربط شامل کریں۔' : 'Add slightly more substance to provide full context.');
    }
  } else if (platform === 'youtube') {
    if (content.title) {
      if (content.title.length > 70) {
        platformFitScore -= 4;
        suggestions.push(isUrdu ? 'یوٹیوب ٹائٹل 70 حروف سے کم رکھیں تاکہ موبائل اسکرین پر کٹے نہیں۔' : 'Keep YouTube title under 70 characters to prevent truncation on mobile.');
      }
      if (content.title.length > 95) {
        platformFitScore -= 8;
        issues.push(isUrdu ? 'یوٹیوب ٹائٹل بہت لمبا ہے۔' : 'YouTube title is excessively long.');
      }
    } else {
      platformFitScore -= 10;
      issues.push(isUrdu ? 'یوٹیوب ویڈیو کا ٹائٹل غائب ہے۔' : 'YouTube video title is missing.');
    }

    if (!content.description || content.description.length < 100) {
      platformFitScore -= 10;
      seoScore -= 8;
      issues.push(isUrdu ? 'ویڈیو ڈسکرپشن بہت مختصر ہے۔' : 'YouTube description is too short for SEO.');
      suggestions.push(isUrdu ? 'ڈسکرپشن میں موضوع کی تفصیل، اہم ٹائم اسٹیمپ اور برانڈ لنکس شامل کریں۔' : 'Expand description with chapter timestamps, summary, and brand links.');
    }
  } else {
    // Facebook, Instagram, TikTok, WhatsApp
    const captionLen = (content.caption || '').length;
    if (captionLen === 0) {
      platformFitScore -= 15;
      issues.push(isUrdu ? 'کیپشن خالی ہے۔' : 'Caption content is empty.');
    } else if (captionLen < 30) {
      platformFitScore -= 6;
      suggestions.push(isUrdu ? 'کیپشن میں مزید تفصیل اور قدرتی ربط شامل کریں۔' : 'Provide more context and structure in the caption.');
    }
  }

  // -------------------------------------------------------------------------
  // 3. SEO & Keywords Strategy (Max 20)
  // -------------------------------------------------------------------------
  const keywordsCount = (content.keywords?.length || 0) + (content.tags?.length || 0);
  if (platform === 'youtube' || platform === 'tiktok') {
    if (keywordsCount >= 5) {
      seoScore = 20;
    } else if (keywordsCount >= 2) {
      seoScore = 14;
      suggestions.push(isUrdu ? 'سرچ رینکنگ بہتر بنانے کے لیے مزید بنیادی اور تفصیلی کی ورڈز شامل کریں۔' : 'Add more primary and long-tail keywords for search discovery.');
    } else {
      seoScore = 6;
      issues.push(isUrdu ? 'سرچ کی ورڈز اور ٹیگز کی تعداد ناکافی ہے۔' : 'SEO search keywords and tags are insufficient.');
      suggestions.push(isUrdu ? 'کم از کم 4 سے 6 سرچ کی ورڈز شامل کریں۔' : 'Include at least 4-6 search keywords.');
    }
  } else {
    if (keywordsCount > 0) {
      seoScore = 20;
    } else {
      seoScore = 16;
    }
  }

  // -------------------------------------------------------------------------
  // 4. CTA Evaluation (Max 15)
  // -------------------------------------------------------------------------
  if (rules.requiresCTA) {
    if (!content.cta || content.cta.trim().length === 0) {
      ctaScore -= 10;
      issues.push(isUrdu ? 'کال ٹو ایکشن (CTA) شامل نہیں ہے۔' : 'Call-to-action (CTA) is missing.');
      suggestions.push(isUrdu ? 'پوسٹ کے اختتام پر سامعین کے لیے واضح اقدام (شیئر، کمنٹ، سیو، وزٹ) تجویز کریں۔' : 'Add a clear engagement prompt (Share, Save, Comment, or Visit).');
    }
  }

  // -------------------------------------------------------------------------
  // 5. Hashtag Strategy (Max 15)
  // -------------------------------------------------------------------------
  const tagCount = content.hashtags?.length || 0;
  if (tagCount < rules.minHashtags && rules.minHashtags > 0) {
    hashtagScore -= 6;
    suggestions.push(isUrdu ? `کم از کم ${rules.minHashtags} موضوعاتی ہیش ٹیگز شامل کریں۔` : `Add at least ${rules.minHashtags} relevant hashtags.`);
  } else if (tagCount > rules.maxHashtags) {
    hashtagScore -= 8;
    issues.push(isUrdu ? `ہیش ٹیگز کی تعداد بہت زیادہ ہے (${tagCount})۔ تجویز کردہ حد ${rules.maxHashtags} ہے۔` : `Too many hashtags (${tagCount}). Recommended limit is ${rules.maxHashtags}.`);
    suggestions.push(isUrdu ? 'غیر ضروری ہیش ٹیگز ہٹا کر صرف اہم موضوعاتی ٹیگز رکھیں۔' : 'Remove generic tags and keep only high-relevance topic tags.');
  }

  // Check for spam hashtags
  if (content.hashtags?.some((t) => /#(fyp|foryou|viral|followme|like4like)/i.test(t))) {
    hashtagScore -= 5;
    issues.push(isUrdu ? 'اسپام ہیش ٹیگز (#fyp, #viral) سے گریز کریں۔' : 'Avoid low-quality spam tags like #fyp or #viral.');
  }

  // -------------------------------------------------------------------------
  // 6. Islamic Adab & Brand Integrity (Max 10)
  // -------------------------------------------------------------------------
  // Check for placeholder fake contact data
  if (/\b(555-\d{4}|example\.com|000-000-0000|test@test\.com)\b/i.test(text)) {
    islamicAdabScore -= 6;
    issues.push(isUrdu ? 'پوسٹ میں فرضی فون یا ای میل ایڈریس موجود ہے۔' : 'Contains generic placeholder contact information.');
    suggestions.push(isUrdu ? 'برانڈ سیٹنگز سے اصل رابطہ معلومات استعمال کریں۔' : 'Replace placeholder info with authentic brand details.');
  }

  // Check for scriptural references to flag for adab review
  const hasScripturalQuote = /\b(Hadith|Quran|Ayah|Surah|قال رسول الله|القرآن|حديث|صحيح البخاري|صحيح مسلم|جامع الترمذي)\b/i.test(text);
  if (hasScripturalQuote) {
    islamicSafetyNotes.push(
      isUrdu
        ? 'پوسٹ میں قرآنی آیت یا حدیث کا حوالہ موجود ہے۔ براہ کرم متن اور ترجمے کی صحت کی تصدیق فرمائیں۔'
        : 'Scriptural reference detected. Verify that Arabic text and source citation are authentic.'
    );
  }

  // Calculate Total Score
  const totalScore = Math.max(0, Math.min(100, hookScore + platformFitScore + seoScore + ctaScore + hashtagScore + islamicAdabScore));
  const breakdown: ScoreBreakdown = {
    hookScore: Math.max(0, hookScore),
    platformFitScore: Math.max(0, platformFitScore),
    seoScore: Math.max(0, seoScore),
    ctaScore: Math.max(0, ctaScore),
    hashtagScore: Math.max(0, hashtagScore),
    islamicAdabScore: Math.max(0, islamicAdabScore),
  };

  const needsReview = totalScore < 80 || islamicSafetyNotes.length > 0 || issues.length > 0;

  return {
    passed: totalScore >= 70,
    score: totalScore,
    breakdown,
    issues,
    suggestions,
    islamicSafetyNotes,
    needsReview,
  };
}
