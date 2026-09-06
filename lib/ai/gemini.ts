import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  BrandSettings,
  PlatformContentData,
} from '@/lib/types/database';
import {
  buildGenerationSystemPrompt,
  buildPlatformOptimizationPrompt,
} from './prompts';
import { calculateQualityScore } from './scoring-engine';
import { extractAndCategorizeKeywords } from './seo-engine';
import { categorizeHashtags, flattenHashtagsForPlatform } from './hashtag-engine';

interface GenerationRequest {
  topic: string;
  additionalInstructions?: string;
  language: ContentLanguage;
  tone: ContentTone;
  platforms: SocialPlatform[];
  brandSettings: BrandSettings | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
}

export async function generateMultiPlatformContent(
  req: GenerationRequest
): Promise<Record<SocialPlatform, PlatformContentData>> {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = buildGenerationSystemPrompt(
    req.platforms,
    req.language,
    req.tone,
    req.brandSettings
  );

  const userPrompt = `
=== USER CONTENT BRIEF ===
TOPIC: ${req.topic}
${req.additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${req.additionalInstructions}` : ''}
${req.mediaUrl ? `ATTACHED MEDIA: ${req.mediaType?.toUpperCase() || 'IMAGE'} URL: ${req.mediaUrl}` : ''}

Generate tailored content for: ${req.platforms.join(', ')}.
Return ONLY valid JSON adhering to the specified schema.
`;

  let rawResult: Record<SocialPlatform, PlatformContentData> | null = null;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          rawResult = JSON.parse(rawText);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent generator:', err);
    }
  }

  if (!rawResult) {
    rawResult = generateFallbackMultiPlatform(req);
  }

  // Enrich with Phase 3 SEO, Hashtags & Quality Scores
  const enrichedResult = {} as Record<SocialPlatform, PlatformContentData>;
  for (const platform of req.platforms) {
    const raw = rawResult[platform] || {};
    const seo_keywords = extractAndCategorizeKeywords(req.topic, platform, raw.keywords || []);
    const hashtag_categories = categorizeHashtags(raw.hashtags || [], platform, req.brandSettings);
    const hashtags = flattenHashtagsForPlatform(hashtag_categories, platform);

    const mergedContent: PlatformContentData = {
      ...raw,
      hashtags,
      keywords: [...seo_keywords.primary, ...seo_keywords.secondary],
      seo_keywords,
      hashtag_categories,
      optimization_status: 'optimized',
    };

    const quality = calculateQualityScore(platform, mergedContent);
    mergedContent.quality_score = quality.score;
    mergedContent.score_breakdown = quality.breakdown;
    mergedContent.optimization_suggestions = quality.suggestions;

    enrichedResult[platform] = mergedContent;
  }

  return enrichedResult;
}

export async function optimizeSinglePlatformContent(params: {
  platform: SocialPlatform;
  currentContent: PlatformContentData;
  instruction: string;
  topic?: string;
  language: ContentLanguage;
  tone: ContentTone;
  brandSettings: BrandSettings | null;
}): Promise<PlatformContentData> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = buildPlatformOptimizationPrompt(
    params.platform,
    params.currentContent,
    params.instruction,
    params.language,
    params.tone,
    params.brandSettings
  );

  let optimized: PlatformContentData | null = null;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.65,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          optimized = JSON.parse(rawText);
        }
      }
    } catch (err) {
      console.warn('Optimize single platform API call error:', err);
    }
  }

  if (!optimized) {
    optimized = generateFallbackSinglePlatform(params);
  }

  const topicText = params.topic || params.instruction || params.currentContent.title || 'Islamic Reflection';
  const seo_keywords = extractAndCategorizeKeywords(topicText, params.platform, optimized.keywords || []);
  const hashtag_categories = categorizeHashtags(optimized.hashtags || params.currentContent.hashtags || [], params.platform, params.brandSettings);
  const hashtags = flattenHashtagsForPlatform(hashtag_categories, params.platform);

  const finalContent: PlatformContentData = {
    ...optimized,
    hashtags,
    keywords: [...seo_keywords.primary, ...seo_keywords.secondary],
    seo_keywords,
    hashtag_categories,
    optimization_status: 'optimized',
  };

  const quality = calculateQualityScore(params.platform, finalContent);
  finalContent.quality_score = quality.score;
  finalContent.score_breakdown = quality.breakdown;
  finalContent.optimization_suggestions = quality.suggestions;

  return finalContent;
}

export const regenerateSinglePlatformContent = optimizeSinglePlatformContent;


// ---------------------------------------------------------------------------
// Fallback Generator
// ---------------------------------------------------------------------------
function generateFallbackMultiPlatform(
  req: GenerationRequest
): Record<SocialPlatform, PlatformContentData> {
  const result = {} as Record<SocialPlatform, PlatformContentData>;
  const isUrdu = req.language === 'urdu' || req.language === 'bilingual_urdu_en' || (req.language === 'auto' && /[\u0600-\u06FF]/.test(req.topic));
  const isArabic = req.language === 'arabic';

  const brandName = req.brandSettings?.brand_name || 'Nūr Social';
  const website = req.brandSettings?.website || '';

  for (const platform of req.platforms) {
    result[platform] = buildPlatformOutput(platform, req.topic, isUrdu, isArabic, brandName, website, req.tone);
  }

  return result;
}

function generateFallbackSinglePlatform(params: {
  platform: SocialPlatform;
  currentContent: PlatformContentData;
  instruction: string;
  language: ContentLanguage;
  tone: ContentTone;
  brandSettings: BrandSettings | null;
}): PlatformContentData {
  const isUrdu = params.language === 'urdu' || /[\u0600-\u06FF]/.test(params.instruction);
  const isArabic = params.language === 'arabic';
  const brandName = params.brandSettings?.brand_name || 'Nūr Social';
  const website = params.brandSettings?.website || '';

  const topic = params.instruction || params.currentContent.title || 'Islamic Reflection';
  return buildPlatformOutput(params.platform, topic, isUrdu, isArabic, brandName, website, params.tone);
}

function buildPlatformOutput(
  platform: SocialPlatform,
  topic: string,
  isUrdu: boolean,
  isArabic: boolean,
  brandName: string,
  website: string,
  _tone: ContentTone
): PlatformContentData {
  if (isUrdu) {
    return buildUrduPlatformOutput(platform, topic, brandName, website);
  } else if (isArabic) {
    return buildArabicPlatformOutput(platform, topic, brandName, website);
  }
  return buildEnglishPlatformOutput(platform, topic, brandName, website);
}

function buildUrduPlatformOutput(
  platform: SocialPlatform,
  topic: string,
  brandName: string,
  website: string
): PlatformContentData {
  const ctaWebsite = website ? `مزید معلومات کے لیے وزٹ کریں: ${website}` : `ہمارے ساتھ جڑے رہیں • ${brandName}`;

  switch (platform) {
    case 'facebook':
      return {
        title: `${topic} — ایک اہم پیغام اور رہنمائی`,
        caption: `السلام علیکم ورحمۃ اللہ وبرکاتہ\n\n✨ ${topic} کے حوالے سے ایک گہری اور فکر انگیز یاد دہانی۔\n\nدینِ اسلام ہمیں علم، تربیت اور اخلاقی بلندی کی ترغیب دیتا ہے۔ جب ہم اپنی زندگیوں میں ان بنیادی اصولوں کو اپناتے ہیں تو نہ صرف ہماری انفرادی زندگی سنورتی ہے بلکہ پورے معاشرے پر اس کے مثبت اور پائیدار اثرات مرتب ہوتے ہیں۔\n\nآئیے آج سے ہی اس پر عمل پیرا ہونے کا پختہ ارادہ کریں اور اپنے پیاروں تک بھی یہ پیغام پہنچائیں۔`,
        hashtags: ['#اسلامی_تعلیمات', '#تربیت', '#رہنمائی', '#نور_سوشل'],
        cta: `اس پوسٹ کو شیئر کریں اور ${ctaWebsite}`,
      };
    case 'instagram':
      return {
        hook: `✦ کیا آپ نے کبھی اس اہم بات پر غور کیا؟`,
        caption: `✨ ${topic}\n\nزندگی کی مصروفیات میں اکثر ہم اصل مقصد کو فراموش کر دیتے ہیں۔ یہ یاد دہانی ہمارے دلوں کو بیدار کرنے اور نیکی کے راستے پر ثابت قدم رہنے کے لیے ہے۔\n\n📌 اہم نکات:\n• اخلاص اور مستقل مزاجی\n• علم اور عمل کا حسین امتزاج\n• آنے والی نسلوں کی بہترین تربیت\n\nاللہ تعالیٰ ہمیں عمل کی توفیق عطا فرمائے۔ آمین۔`,
        hashtags: ['#اسلامی_پوسٹ', '#دین_اور_دنیا', '#قرآن_و_سنت', '#نصیحت', '#اسلامی_اقدار', '#نور_سوشل', '#دعوت_خیر', '#مسلمان', '#تربیت_اولاد'],
        cta: `اس پوسٹ کو بعد کے لیے Save کریں اور دوسروں تک پہنچائیں ✨`,
        alt_text: `${topic} کے بارے میں اسلامی ڈیزائن گرافک جس پر باوقار عربی خطاطی اور رہنمائی لکھی ہے۔`,
      };
    case 'tiktok':
      return {
        hook: `یہ بات آپ کی سوچ بدل دے گی! 💡`,
        caption: `${topic} کے بارے میں یہ اہم نکتہ ضرور جان لیں۔ دینِ حق پر عمل ہی اصل کامیابی کا راستہ ہے۔`,
        keywords: ['اسلامی رہنمائی', 'تربیت', 'اسلامک ویڈیوز', 'قرآنی تعلیمات'],
        hashtags: ['#IslamicTikTok', '#اردو_اقوال', '#IslamicReminder', '#نور_سوشل'],
        suggested_on_screen_text: `${topic} • 3 باتیں جو ہر مسلمان کو معلوم ہونی چاہئیں!`,
        suggested_opening_line: `کیا آپ جانتے ہیں کہ ${topic} ہماری زندگی کو کیسے بدل سکتا ہے؟`,
        cta: `مزید ویڈیوز کے لیے فالو کریں 📲`,
      };
    case 'youtube':
      return {
        title: `${topic} | مکمل رہنمائی اور اہم اسلامی نکات`,
        description: `اس تفصیلی ویڈیو میں جانیے "${topic}" کے تمام اہم پہلو اور زندگی پر اس کے اثرات۔\n\n📌 ویڈیو کے اہم حصے:\n0:00 - ابتدائی تعارف اور اہمیت\n1:30 - اہم اصول اور عملی رہنمائی\n4:00 - عمومی غلط فہمیاں اور ان کا حل\n6:30 - خلاصہ اور اختتامی دعا\n\n🔔 چینل کو سبسکرائب کریں تاکہ نئی ویڈیوز کی اطلاع بروقت مل سکے۔\n${website ? `ویب سائٹ: ${website}\n` : ''}${brandName} • باوقار اسلامی میڈیا مینجمنٹ`,
        tags: [topic, 'اسلامی بیانات', 'دینی معلومات', 'اردو اسلامک ویڈیوز', 'اسلامی لیکچرز', brandName],
        keywords: [topic, 'اسلامی تعلیمات', 'روحانی رہنمائی', 'دین اسلام'],
        hashtags: ['#اسلامک_ویڈیو', '#اردو_لیکچر', '#یوٹیوب_اسلام'],
        chapters: [
          { timestamp: '0:00', title: 'ابتدائی تعارف اور اہمیت' },
          { timestamp: '1:30', title: 'اہم اصول اور عملی رہنمائی' },
          { timestamp: '4:00', title: 'عمومی غلط فہمیاں اور ان کا حل' },
          { timestamp: '6:30', title: 'خلاصہ اور اختتامی دعا' },
        ],
        cta: `ویڈیو کو لائک کریں اور چینل سبسکرائب کریں 🔔`,
      };
    case 'twitter':
      return {
        caption: `✨ "${topic}"\n\nاصل کامیابی دینی و اخلاقی اقدار کو اپنانے میں ہے۔ چھوٹی سی نیکی بھی دنیا و آخرت میں بڑی تبدیلی کا سبب بن سکتی ہے۔`,
        hashtags: ['#اسلامی_فکر', '#نصیحت'],
        cta: `ریٹویٹ کر کے نیکی عام کریں 🔄`,
      };
    case 'whatsapp':
      return {
        title: `📢 خصوصی پیغام: ${topic}`,
        caption: `السلام علیکم عزیز دوستو!\n\n✨ آج کا اہم پیغام:\n"${topic}"\n\nزندگی میں مثبت تبدیلی لانے کے لیے ان باتوں کو یاد رکھیں اور اپنے حلقۂ احباب میں بھی شیئر فرمائیں۔\n\n${ctaWebsite}`,
        cta: `پیغام کو اپنے واٹس ایپ گروپس میں فارورڈ کریں 📲`,
      };
  }
}

function buildArabicPlatformOutput(
  platform: SocialPlatform,
  topic: string,
  brandName: string,
  website: string
): PlatformContentData {
  switch (platform) {
    case 'facebook':
      return {
        title: `${topic} — رؤية وتأملات إسلامية`,
        caption: `بسم الله الرحمن الرحيم\n\nنشارككم اليوم خاطرة وتذكرة قيّمة حول "${topic}".\n\nإن التمسك بالقيم الإسلامية والأخلاق الحميدة هو السبيل الأكيد لبناء مجتمع قوي ومتماسك تسوده المودة والرحمة.\n\nنسأل الله تعالى أن ينفعنا بما علّمنا وأن يرزقنا الإخلاص في القول والعمل.`,
        hashtags: ['#تأملات_إيمانية', '#قيم_إسلامية', '#نور_سوشيال'],
        cta: `شارك المنشور مع أحبابك ${website ? `• ${website}` : ''}`,
      };
    case 'instagram':
      return {
        hook: `✦ إضاءة إيمانية تلامس القلوب`,
        caption: `✨ ${topic}\n\nفي خضم الحياة المتسارعة، نحتاج دائماً إلى وقفات نتزود فيها بالتقوى والعمل الصالح.\n\n📌 نقاط جوهرية:\n• استحضار النية والإخلاص\n• التطبيق العملي للقيم النبيلة\n• الحرص على نفع الآخرين`,
        hashtags: ['#خواطر_دينية', '#إسلاميات', '#نصائح_إسلامية', '#تذكير', '#أخلاق_المسلم'],
        cta: `احفظ المنشور وشاركه في قصتك 📌`,
        alt_text: `تصميم إسلامي راقٍ يتناول موضوع ${topic} بخط عربي مميز.`,
      };
    case 'tiktok':
      return {
        hook: `فائدة مهمة تستحق التأمل! 💡`,
        caption: `تأملات في ${topic}. التمسك بالقيم الأصيلة هو طريق النجاح في الدنيا والآخرة.`,
        keywords: ['تأملات إسلامية', 'فائدة دينية', 'خواطر'],
        hashtags: ['#IslamicTikTok', '#خواطر', '#نصيحة'],
        suggested_on_screen_text: `${topic} • رسالة ملهمة لك اليوم`,
        suggested_opening_line: `تأمل معي هذه الفائدة العظيمة في ${topic}`,
        cta: `تابعنا لمزيد من الإضاءات اليومية 📲`,
      };
    case 'youtube':
      return {
        title: `${topic} | تأملات ودلائل إيمانية قيمة`,
        description: `في هذا المقطع نتناول موضوع "${topic}" بشرح وافٍ وتأصيل إيماني متكامل.\n\nاشترك في القناة وفعّل جرس التنبيهات ليصلك كل جديد.\n${brandName} • إدارة المحتوى الرقمي الهادف`,
        tags: [topic, 'محاضرات إسلامية', 'تأملات قرآنية', 'دروس دينية', brandName],
        keywords: [topic, 'قيم إسلامية', 'تربية إسلامية'],
        hashtags: ['#يوتيوب_إسلامي', '#دروس', '#محاضرات'],
        chapters: [
          { timestamp: '0:00', title: 'المقدمة والأهمية' },
          { timestamp: '2:00', title: 'الدروس والتأملات العملية' },
          { timestamp: '5:00', title: 'الخاتمة والدعاء' },
        ],
        cta: `اشترك في القناة للمزيد 🔔`,
      };
    case 'twitter':
      return {
        caption: `✨ "${topic}"\n\nأثر المبادئ الإسلامية الصادقة ينعكس نوراً وطمأنينة على حياة الفرد والمجتمع.`,
        hashtags: ['#تغريدة_إيمانية', '#تأملات'],
        cta: `أعد التغريد لنشر الخير 🔄`,
      };
    case 'whatsapp':
      return {
        title: `📢 رسالة اليوم: ${topic}`,
        caption: `السلام علیکم ورحمة الله وبركاته\n\nإليكم تذكرة اليوم حول: "${topic}"\n\nنسأل الله أن يجعلنا وإياكم من الهداة المهتدين.`,
        cta: `أعد توجيه الرسالة للمجموعات 📲`,
      };
  }
}

function buildEnglishPlatformOutput(
  platform: SocialPlatform,
  topic: string,
  brandName: string,
  website: string
): PlatformContentData {
  const ctaWebsite = website ? `Learn more at: ${website}` : `Stay connected with ${brandName}`;

  switch (platform) {
    case 'facebook':
      return {
        title: `${topic} — Reflections & Practical Guidance`,
        caption: `Assalamu Alaikum wa Rahmatullah,\n\nToday, we reflect upon a vital theme: **${topic}**.\n\nIn our fast-paced lives, returning to core ethical and spiritual principles provides clarity, grounding, and purpose. When we align our daily habits with continuous learning and compassion, we cultivate a flourishing household and community.\n\nTake a moment today to reflect on how you can implement these timeless values into your routine.`,
        hashtags: ['#IslamicReminders', '#PersonalGrowth', '#FaithInAction', '#NurSocial'],
        cta: `Share your thoughts in the comments below! ${ctaWebsite}`,
      };
    case 'instagram':
      return {
        hook: `✦ A timely reminder for your week 🌿`,
        caption: `✨ **${topic}**\n\nReal transformation starts with small, consistent steps rooted in sincerity and faith.\n\n📌 **Key Takeaways:**\n• Align your daily intention with higher purpose\n• Strive for excellence (Ihsan) in all endeavors\n• Nurture the next generation with love and sound values\n\nMay Allah guide our hearts and bless our efforts.`,
        hashtags: ['#IslamicMindset', '#DailyReminder', '#MuslimLife', '#Ihsan', '#FaithAndFamily', '#IslamicValues', '#NurSocial', '#SpiritualGrowth'],
        cta: `📌 Save this post for later and share it with someone who needs this reminder today!`,
        alt_text: `Inspiring Islamic graphic aesthetic with reflective calligraphy on the theme of ${topic}.`,
      };
    case 'tiktok':
      return {
        hook: `This reminder will reframe your mindset! 💡`,
        caption: `Here's why **${topic}** matters more than ever. Focus on what truly brings long-term barakah and purpose.`,
        keywords: ['Islamic mindset', 'spiritual habits', 'daily reminder', 'Muslim creators'],
        hashtags: ['#MuslimTikTok', '#IslamicReminder', '#MindsetShift', '#NurSocial'],
        suggested_on_screen_text: `${topic} • 3 Habits that change everything!`,
        suggested_opening_line: `Did you know how much ${topic} impacts your daily peace?`,
        cta: `Follow for uplifting daily reminders 📲`,
      };
    case 'youtube':
      return {
        title: `${topic} | In-Depth Guide & Practical Lessons`,
        description: `Explore the significance and practical application of **${topic}** in our comprehensive guide.\n\n⏱️ **Timestamps:**\n0:00 - Introduction & Core Concept\n1:45 - Key Principles & Actionable Steps\n4:15 - Common Obstacles & How to Overcome Them\n6:30 - Final Reflection & Action Plan\n\n🔔 Subscribe to the channel to never miss an update.\n${website ? `Official Website: ${website}\n` : ''}${brandName} — AI-Powered Islamic Social Media Management`,
        tags: [topic, 'Islamic Education', 'Muslim Growth', 'Faith Reflections', 'Islamic Lectures', brandName],
        keywords: [topic, 'Islamic wisdom', 'spiritual development', 'educational content'],
        hashtags: ['#IslamicContent', '#SpiritualGuide', '#FaithCommunity'],
        chapters: [
          { timestamp: '0:00', title: 'Introduction & Core Concept' },
          { timestamp: '1:45', title: 'Key Principles & Actionable Steps' },
          { timestamp: '4:15', title: 'Common Obstacles & How to Overcome Them' },
          { timestamp: '6:30', title: 'Final Reflection & Action Plan' },
        ],
        cta: `Like the video and subscribe with notifications turned on! 🔔`,
      };
    case 'twitter':
      return {
        caption: `✨ "${topic}"\n\nConsistency in good deeds—no matter how small—creates lasting barakah in our lives and communities.`,
        hashtags: ['#DailyReflection', '#IslamicWisdom'],
        cta: `Retweet to benefit others 🔄`,
      };
    case 'whatsapp':
      return {
        title: `📢 Broadcast: ${topic}`,
        caption: `Assalamu Alaikum dear community!\n\nToday's highlight reflection:\n✨ **${topic}**\n\nLet us strive to embody these values with sincerity and excellence today.\n\n${ctaWebsite}`,
        cta: `Forward this message to your family and study circles 📲`,
      };
  }
}

/**
 * Executes a direct prompt to Gemini and returns raw string response (e.g. for AI performance summary).
 */
export async function generateGeminiResponse(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Gemini API error status: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}
