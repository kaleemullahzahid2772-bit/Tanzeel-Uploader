import {
  SocialPlatform,
  PlatformContentData,
  QualityCheckResult,
} from '@/lib/types/database';

export function validatePlatformContent(
  platform: SocialPlatform,
  content: PlatformContentData
): QualityCheckResult {
  const issues: string[] = [];
  const islamicSafetyNotes: string[] = [];
  let score = 100;

  const text = `${content.title || ''} ${content.hook || ''} ${content.caption || ''} ${content.description || ''}`;

  // 1. Platform-Specific Character Checks
  if (platform === 'twitter') {
    const tweetLen = (content.caption || '').length;
    if (tweetLen > 280) {
      issues.push(`X (Twitter) post exceeds 280 characters (${tweetLen} chars).`);
      score -= 25;
    }
  }

  if (platform === 'youtube') {
    if (content.title && content.title.length > 90) {
      issues.push(`YouTube title is slightly long (${content.title.length} chars). Keep under 70 for best mobile display.`);
      score -= 10;
    }
    if (!content.description || content.description.length < 50) {
      issues.push('YouTube description is very short. Add more context and keywords for optimal SEO.');
      score -= 15;
    }
  }

  // 2. Hashtags Validation
  const hashtagsCount = content.hashtags?.length || 0;
  if (platform === 'instagram' && hashtagsCount > 25) {
    issues.push('Excessive hashtags on Instagram (>25). Recommended 10-15 for high quality engagement.');
    score -= 10;
  }
  if (platform === 'twitter' && hashtagsCount > 4) {
    issues.push('Too many hashtags for X. Recommended 2-3 to maximize readability.');
    score -= 10;
  }

  // 3. Hallucination / Fake Placeholder Scans
  if (/\b(555-\d{4}|example\.com|000-000-0000)\b/i.test(text)) {
    issues.push('Contains generic placeholder contact/url. Please verify with actual brand info.');
    score -= 15;
  }

  // 4. Islamic Content Integrity Guardrails
  const hasAyahHadithMention =
    /\b(Hadith|Quran|Ayah|Surah|قال رسول الله|القرآن|حديث|صحيح البخاري|صحيح مسلم|جامع الترمذي)\b/i.test(
      text
    );

  if (hasAyahHadithMention) {
    islamicSafetyNotes.push(
      'Contains Islamic scriptural reference. Please ensure Arabic text and source citations match authentic references.'
    );
  }

  // 5. CTA Check
  if (!content.cta && platform !== 'twitter') {
    issues.push('Call-to-action (CTA) is missing. Adding a clear next step improves audience engagement.');
    score -= 10;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const needsReview = finalScore < 80 || islamicSafetyNotes.length > 0;

  return {
    passed: finalScore >= 70,
    score: finalScore,
    issues,
    suggestions: issues,
    islamicSafetyNotes,
    needsReview,
  };
}
