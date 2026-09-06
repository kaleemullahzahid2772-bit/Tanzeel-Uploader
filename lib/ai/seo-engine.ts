import { SocialPlatform, SEOKeywordsData } from '@/lib/types/database';

export function extractAndCategorizeKeywords(
  topic: string,
  platform: SocialPlatform,
  existingKeywords: string[] = []
): SEOKeywordsData {
  const isUrdu = /[\u0600-\u06FF]/.test(topic);

  const cleanWords = topic
    .replace(/[.,/#!$%^&*;:{}=\-_\`~()؟،]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const primary: string[] = [];
  const secondary: string[] = [];
  const long_tail: string[] = [];

  if (cleanWords.length > 0) {
    primary.push(topic.trim());
    if (cleanWords[0]) primary.push(cleanWords.slice(0, 2).join(' '));
  }

  if (isUrdu) {
    secondary.push(`${cleanWords[0] || 'اسلامی'} رہنمائی`);
    secondary.push(`${cleanWords[0] || 'دینی'} تعلیمات`);
    secondary.push('اسلامک ویڈیو');
    long_tail.push(`${topic} کے اہم نکات اور رہنمائی`);
    long_tail.push(`زندگی میں ${cleanWords[0] || 'دین'} پر عمل کا طریقہ`);
  } else {
    secondary.push(`${cleanWords[0] || 'Islamic'} Guidance`);
    secondary.push(`${cleanWords[0] || 'Spiritual'} Lessons`);
    secondary.push('Muslim Lifestyle & Values');
    long_tail.push(`How to apply ${topic.toLowerCase()} in daily life`);
    long_tail.push(`Practical guide and reflections on ${topic.toLowerCase()}`);
  }

  // Merge any user-provided existing keywords
  for (const kw of existingKeywords) {
    if (!primary.includes(kw) && !secondary.includes(kw) && !long_tail.includes(kw)) {
      if (kw.split(' ').length > 2) long_tail.push(kw);
      else secondary.push(kw);
    }
  }

  return {
    primary: Array.from(new Set(primary)).slice(0, 3),
    secondary: Array.from(new Set(secondary)).slice(0, 4),
    long_tail: Array.from(new Set(long_tail)).slice(0, 3),
  };
}
