import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  BrandSettings,
  PlatformContentData,
} from '@/lib/types/database';
import { PLATFORM_OPTIMIZATION_RULES } from './optimization-rules';

export const ISLAMIC_CONTENT_SAFETY_DIRECTIVES = `
=== ISLAMIC CONTENT SAFETY & INTEGRITY DIRECTIVES (STRICT MANDATORY RULES) ===
1. QURAN & HADITH INTEGRITY:
   - NEVER fabricate, guess, or hallucinate Quranic verses or Hadiths under any circumstances.
   - If user provided an ayah or hadith in the topic/instructions, preserve the exact Arabic and accurate translation.
   - Do NOT declare unverified quotes as 'Sahih Hadith'. If a reference is uncertain, provide general Islamic ethical advice without inventing attribution.
2. NO THEOLOGICAL FATWAS:
   - Do not issue definitive theological decrees or controversial fatwas. Focus on widely accepted ethical, spiritual, educational, and motivational Islamic principles.
3. BRAND & FACTUAL INTEGRITY (NO HALLUCINATION):
   - Do NOT invent fake phone numbers, physical addresses, websites, course fees, certifications, or teacher names.
   - Use ONLY the provided Brand Settings and user-supplied details. If a contact phone or website is empty, do not invent one.
4. TONE & RESPECT:
   - Maintain dignified, inspiring, and ethical Islamic communication (Hikmah and Adab).
`;

export function getLanguageInstruction(language: ContentLanguage): string {
  switch (language) {
    case 'urdu':
      return 'TARGET LANGUAGE: Complete output MUST be written in natural, eloquent Urdu (اردو). Use correct Urdu idioms and phrasing. Do not mix English words unnecessarily.';
    case 'arabic':
      return 'TARGET LANGUAGE: Complete output MUST be written in classical or modern standard Arabic (العربية الفصحى). Ensure correct grammar and eloquence.';
    case 'bilingual_urdu_en':
      return 'TARGET LANGUAGE: Bilingual (Urdu + English). Provide primary content in Urdu with smooth English translation/summary points where appropriate for a diverse audience.';
    case 'bilingual_ar_urdu':
      return 'TARGET LANGUAGE: Bilingual (Arabic + Urdu). Include Arabic core reflection/ayah followed by comprehensive Urdu explanation.';
    case 'english':
      return 'TARGET LANGUAGE: Clear, engaging, modern English (Global & US style). Maintain natural readability and high impact.';
    case 'auto':
    default:
      return 'TARGET LANGUAGE: Detect the language of the provided topic. If Urdu/Arabic is provided, generate in that language; otherwise generate in English.';
  }
}

export function getToneInstruction(tone: ContentTone): string {
  switch (tone) {
    case 'professional':
      return 'TONE: Professional, structured, authoritative, and articulate.';
    case 'friendly':
      return 'TONE: Warm, welcoming, conversational, and relatable.';
    case 'educational':
      return 'TONE: Pedagogical, informative, structured with actionable takeaways.';
    case 'islamic':
      return 'TONE: Deeply spiritual, respectful, reverent, and heart-touching.';
    case 'emotional':
      return 'TONE: Moving, empathetic, inspiring, touching on personal growth and family care.';
    case 'informative':
      return 'TONE: Fact-focused, clear, objective, and easy to digest.';
    case 'marketing':
      return 'TONE: Persuasive, action-driven, highlighting benefits and clear next steps.';
    case 'concise':
      return 'TONE: Short, powerful, punchy, and impactful with zero fluff.';
    default:
      return 'TONE: Balanced, authentic, and engaging.';
  }
}

export function getPlatformSpecificStrategy(platform: SocialPlatform): string {
  const rules = PLATFORM_OPTIMIZATION_RULES[platform];
  const guidelinesEn = rules.guidelines.en.map((g) => `  * ${g}`).join('\n');

  switch (platform) {
    case 'facebook':
      return `
PLATFORM: Facebook
- STRATEGY: Explanatory, community-focused, and conversation-starting.
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "title": Short engaging post headline.
  * "caption": Rich, readable multi-paragraph caption with clear line breaks and storytelling.
  * "hashtags": ${rules.minHashtags} to ${rules.maxHashtags} highly relevant hashtags.
  * "cta": Community call-to-action (e.g. asking for reflections, visit website if present, or share with friends).
`;
    case 'instagram':
      return `
PLATFORM: Instagram
- STRATEGY: Visual storytelling, aesthetic formatting, and emotional hook.
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "hook": First 1-2 lines designed to stop the scroll.
  * "caption": Visually formatted caption with 4-tier structure (Hook, Core Message, Value, CTA).
  * "hashtags": ${rules.minHashtags} to ${rules.maxHashtags} targeted hashtags.
  * "cta": Engagement CTA (e.g., "Save this reminder for later 📌", "Share to your story").
  * "alt_text": Meaningful accessible Alt Text describing the visual theme.
`;
    case 'tiktok':
      return `
PLATFORM: TikTok
- STRATEGY: Fast-paced, high curiosity, viral-ready, and search-optimized (no fake guarantees).
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "hook": 1-second attention-grabbing visual or text hook.
  * "caption": Ultra-concise natural caption (1 to 2 short sentences).
  * "keywords": 4 to 6 TikTok search-intent keywords.
  * "hashtags": ${rules.minHashtags} to ${rules.maxHashtags} focused hashtags (no #fyp spam).
  * "suggested_on_screen_text": Hook text to display on mobile video overlay.
  * "suggested_opening_line": Spoken opening line for video creator.
  * "cta": Quick interaction prompt.
`;
    case 'youtube':
      return `
PLATFORM: YouTube (Video & Shorts SEO)
- STRATEGY: Maximum Search Engine Optimization (SEO), high CTR title, and comprehensive description.
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "title": High-CTR searchable title under 70 characters (accurate, compelling, never misleading).
  * "description": Comprehensive description with hook, summary, bullet points, brand info, and timestamps.
  * "tags": 10 to 15 comma-separated YouTube search tags.
  * "keywords": Primary and secondary SEO keywords.
  * "hashtags": ${rules.minHashtags} to ${rules.maxHashtags} relevant hashtags.
  * "chapters": Array of [{ "timestamp": "0:00", "title": "Introduction" }, ...] video chapters.
  * "cta": Subscribe & notification prompt.
`;
    case 'twitter':
      return `
PLATFORM: X (Twitter)
- STRATEGY: Sharp, thought-provoking, concise, and shareable.
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "caption": Complete post MUST be strictly under 280 characters total.
  * "hashtags": ${rules.minHashtags} to ${rules.maxHashtags} targeted hashtags.
  * "cta": Retweet/Bookmark prompt if appropriate.
`;
    case 'whatsapp':
      return `
PLATFORM: WhatsApp Channel / Broadcast
- STRATEGY: Direct, conversational, broadcast-friendly, personal tone.
- GUIDELINES:
${guidelinesEn}
- REQUIRED FIELDS:
  * "title": Bold broadcast header.
  * "caption": Conversational message with clean bullet points and tasteful emojis.
  * "cta": Direct action link or response prompt.
`;
  }
}

export function buildGenerationSystemPrompt(
  platforms: SocialPlatform[],
  language: ContentLanguage,
  tone: ContentTone,
  brandSettings: BrandSettings | null
): string {
  const brandContext = brandSettings
    ? `
=== BRAND INFORMATION (USE ONLY IF RELEVANT — DO NOT INVENT MISSING DATA) ===
Brand Name: ${brandSettings.brand_name || 'Nūr Social'}
Brand Mission/Voice: ${brandSettings.brand_description || 'Islamic Social Media Content'}
Website: ${brandSettings.website || 'Not specified'}
Contact Email: ${brandSettings.contact_email || 'Not specified'}
Contact Phone: ${brandSettings.contact_phone || 'Not specified'}
`
    : 'Brand Info: Nūr Social (Islamic Media Platform)';

  const platformStrategies = platforms
    .map((p) => getPlatformSpecificStrategy(p))
    .join('\n----------------------------------------\n');

  return `
You are the **Nūr Social AI Content Brain & Platform Optimization Engine**, an elite social media strategist, Islamic copywriter, and SEO expert.

Your task is to analyze the user's topic and generate **distinct, platform-tailored, SEO-optimized** content for each requested platform.

${ISLAMIC_CONTENT_SAFETY_DIRECTIVES}

${getLanguageInstruction(language)}

${getToneInstruction(tone)}

${brandContext}

=== PLATFORMS TO GENERATE ===
${platformStrategies}

=== CRITICAL OUTPUT INSTRUCTIONS ===
1. DO NOT copy-paste identical captions across platforms. Each platform MUST have its own unique structure, hook, formatting, and length.
2. Return ONLY a valid JSON object strictly adhering to the schema below. Do not wrap in extra markdown text outside the JSON.

Expected JSON Structure:
{
  ${platforms
    .map(
      (p) => `"${p}": {
    "title": "...",
    "hook": "...",
    "caption": "...",
    "description": "...",
    "hashtags": ["#tag1", "#tag2"],
    "keywords": ["keyword1", "keyword2"],
    "tags": ["tag1", "tag2"],
    "cta": "...",
    "alt_text": "...",
    "suggested_on_screen_text": "...",
    "suggested_opening_line": "...",
    "chapters": [{ "timestamp": "0:00", "title": "Introduction" }]
  }`
    )
    .join(',\n  ')}
}
`;
}

export function buildPlatformOptimizationPrompt(
  platform: SocialPlatform,
  currentContent: PlatformContentData,
  instruction: string,
  language: ContentLanguage,
  tone: ContentTone,
  brandSettings: BrandSettings | null
): string {
  const brandContext = brandSettings
    ? `Brand Name: ${brandSettings.brand_name || 'Nūr Social'}, Website: ${brandSettings.website || ''}`
    : '';

  return `
You are the **Nūr Social Platform Optimization Engine**.

Your task is to OPTIMIZE and REFINE the content specifically for **${platform.toUpperCase()}**.
Respect any user edits in the current content, apply platform-specific constraints, boost SEO, and preserve Islamic integrity.

${ISLAMIC_CONTENT_SAFETY_DIRECTIVES}

${getLanguageInstruction(language)}
${getToneInstruction(tone)}
${brandContext}

${getPlatformSpecificStrategy(platform)}

CURRENT CONTENT FOR ${platform.toUpperCase()}:
${JSON.stringify(currentContent, null, 2)}

USER OPTIMIZATION INSTRUCTION:
"${instruction || 'Optimize for maximum platform fit, polish the hook, elevate readability, and enhance SEO keywords without losing core message.'}"

Return ONLY a valid JSON object matching the platform fields:
{
  "title": "...",
  "hook": "...",
  "caption": "...",
  "description": "...",
  "hashtags": ["#tag1", "#tag2"],
  "keywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2"],
  "cta": "...",
  "alt_text": "...",
  "suggested_on_screen_text": "...",
  "suggested_opening_line": "...",
  "chapters": [{ "timestamp": "0:00", "title": "Introduction" }]
}
`;
}
