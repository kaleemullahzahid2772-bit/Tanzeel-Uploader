import {
  ThumbnailTemplate,
  OverlayLevel,
  DesignStyle,
  CompositionLayout,
  ColorGradingPreset,
  BorderTreatment,
  TypographyTreatment,
  DesignVariation,
} from '@/lib/types/thumbnail';

export interface VisualConceptResult {
  title: string;
  isUrdu: boolean;
  category: string;
  conceptSummary: string;
  subjectDescription: string;
  positivePrompt: string;
  negativePrompt: string;
  recommendedTemplate: ThumbnailTemplate;
  recommendedStyle: DesignStyle;
  recommendedLayout: CompositionLayout;
  recommendedColorGrading: ColorGradingPreset;
  recommendedBorder: BorderTreatment;
  recommendedTypography: TypographyTreatment;
  recommendedOverlay: OverlayLevel;
  variations: DesignVariation[];
}

export interface GeneratedBackgroundResult {
  imageUrl: string;
  prompt: string;
  concept: string;
  provider: 'gemini' | 'imagen' | 'openai' | 'pollinations' | 'curated_library';
  isUrdu: boolean;
  recommendedTemplate: ThumbnailTemplate;
  recommendedStyle: DesignStyle;
  recommendedLayout: CompositionLayout;
  recommendedColorGrading: ColorGradingPreset;
  recommendedBorder: BorderTreatment;
  recommendedTypography: TypographyTreatment;
  recommendedOverlay: OverlayLevel;
  variations: DesignVariation[];
}

// 1. Strict Negative Prompt enforcing 100% Islamic Visual Safety
export const STRICT_ISLAMIC_NEGATIVE_PROMPT =
  'woman, female, girl, lady, female silhouette, woman in hijab, female student, ' +
  'human face, recognizable face, close-up portrait, prophet face, sahaba portrait, religious figure face, ' +
  'people crowd, text, words, letters, typography, watermark, signature, logo, font, title, ' +
  'distorted, cartoon, 3d render, low quality, blurry, deformed';

// 2. High-Resolution Curated Islamic Photography & Architectural Library
const CURATED_ISLAMIC_LIBRARY: {
  category: string;
  keywords: string[];
  url: string;
  description: string;
}[] = [
  {
    category: 'salah',
    keywords: [
      '????', '?????', '????', '????', '????', '???', '????', '????', '??', '????',
      'salah', 'namaz', 'prayer', 'pray', 'sujood', 'ruku', 'fajr', 'jummah', 'masjid', 'mosque'
    ],
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1600&q=85',
    description: 'Grand mosque interior prayer hall with magnificent archways, pristine carpets, and spiritual dawn illumination',
  },
  {
    category: 'quran',
    keywords: [
      '????', '?????', '???', '????', '?????', '???', '????', '????', '?????',
      'quran', 'koran', 'ayat', 'surah', 'read', 'recit', 'tilawat', 'tafseer', 'hafiz'
    ],
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1600&q=85',
    description: 'Holy Quran illuminated on traditional carved wooden rehal with warm amber glow',
  },
  {
    category: 'prophet_history',
    keywords: [
      '???', '????', '????', '????', '?????', '?????', '???', '?????', '????', '????',
      'prophet', 'muhammad', 'rasool', 'nabi', 'seerah', 'sahaba', 'madinah', 'makkah', 'history'
    ],
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=85',
    description: 'Historical Islamic archway corridors overlooking serene minarets and golden horizon',
  },
  {
    category: 'dua_dhikr',
    keywords: [
      '???', '???', '?????', '???????', '????', '?????', '??????', '??', '????',
      'dua', 'dhikr', 'tasbih', 'forgiveness', 'istighfar', 'spiritual', 'peace', 'heart', 'allah'
    ],
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=85',
    description: 'Polished olive-wood tasbih prayer beads resting before ornate mosque lattice window',
  },
  {
    category: 'ramadan',
    keywords: [
      '?????', '????', '?????', '????', '???', '??????', '??????', '?? ???',
      'ramadan', 'fasting', 'roza', 'iftar', 'suhoor', 'eid', 'taraweeh', 'laylat'
    ],
    url: 'https://images.unsplash.com/photo-1590076215667-873d20755a6d?auto=format&fit=crop&w=1600&q=85',
    description: 'Traditional golden brass lantern glowing softly against twilight sky with crescent moon',
  },
  {
    category: 'knowledge_fiqh',
    keywords: [
      '?????', '?????', '???', '???', '????', '?????', '????', '????', '????', '?????', '?????', '???????',
      'knowledge', 'lesson', 'learn', 'education', 'study', 'ilm', 'book', 'fiqh', 'fatwa', 'rules', 'guide'
    ],
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1600&q=85',
    description: 'Classical Islamic scholarly study room with antique leather manuscripts and warm atmospheric lighting',
  },
  {
    category: 'general_islamic',
    keywords: [
      '?????', '??????', '???', '?????', '???', '????', '?????', '??????', '?????',
      'islam', 'muslim', 'deen', 'character', 'akhlaq', 'sunnah', 'charity', 'zakat', 'family', 'life'
    ],
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1600&q=85',
    description: 'Majestic marble Islamic palace courtyard with intricate emerald arabesque mosaic tiles',
  },
];

/**
 * Checks if a given text is in Arabic or Urdu script.
 */
export function isUrduOrArabicScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * AI Art Direction & Topic Semantics Analyzer.
 * Decides subject selection, composition planning, lighting, color grading,
 * and text placement like an experienced Photoshop Art Director.
 */
export function analyzeTitleAndFormulateConcept(title: string): VisualConceptResult {
  const isUrdu = isUrduOrArabicScript(title);
  const lowerTitle = title.toLowerCase();

  let category = 'general_islamic';
  let conceptSummary = 'Majestic Islamic architectural ambiance with intricate geometric motifs';
  let subjectDescription =
    'Grand Islamic palace interior with soaring marble archways, delicate golden arabesque wall carvings, elegant emerald accents, soft ambient rays of sunlight beaming through ornate mashrabiya latticework';
  let recommendedTemplate: ThumbnailTemplate = 'islamic_premium';
  let recommendedStyle: DesignStyle = 'cinematic_islamic';
  let recommendedLayout: CompositionLayout = isUrdu ? 'subject_left_text_right' : 'subject_right_text_left';
  let recommendedColorGrading: ColorGradingPreset = 'deep_emerald';
  let recommendedBorder: BorderTreatment = 'corner_accents';
  let recommendedTypography: TypographyTreatment = isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword';
  let recommendedOverlay: OverlayLevel = 'medium';

  // Keyword Matching across Urdu & English
  for (const item of CURATED_ISLAMIC_LIBRARY) {
    const hasMatch = item.keywords.some(
      (kw) => lowerTitle.includes(kw.toLowerCase()) || title.includes(kw)
    );
    if (hasMatch) {
      category = item.category;
      break;
    }
  }

  // Specific Category Art Direction
  if (category === 'salah') {
    conceptSummary = 'Tranquil grand mosque prayer hall with plush prayer mat and spiritual dawn light';
    subjectDescription =
      'A serene, authentic prayer space inside a majestic mosque with elegant archways, soft ethereal dawn light streaming across polished marble floors, an ornate prayer mat aligned in perspective, dignified silence and reverence';
    recommendedTemplate = 'islamic_premium';
    recommendedStyle = 'cinematic_islamic';
    recommendedLayout = isUrdu ? 'subject_left_text_right' : 'subject_right_text_left';
    recommendedColorGrading = 'deep_emerald';
    recommendedBorder = 'corner_accents';
    recommendedTypography = isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword';
    recommendedOverlay = 'medium';
  } else if (category === 'quran') {
    conceptSummary = 'Illuminated Holy Quran on wooden rehal with warm spiritual depth';
    subjectDescription =
      'A venerable illuminated Holy Quran resting gently on an intricately carved mahogany wooden rehal stand, warm golden amber candlelight, soft morning rays filtering into an ancient peaceful stone sanctuary, pristine depth of field';
    recommendedTemplate = 'minimal_quran';
    recommendedStyle = 'minimal_luxury';
    recommendedLayout = 'center_focus';
    recommendedColorGrading = 'royal_gold';
    recommendedBorder = 'none';
    recommendedTypography = 'gold_highlighted_keyword';
    recommendedOverlay = 'medium';
  } else if (category === 'prophet_history') {
    conceptSummary = 'Historical Islamic architectural atmosphere with golden sunset & desert minarets';
    subjectDescription =
      'Atmospheric historical Islamic heritage landscape inspired by ancient Madinah, majestic stone archways with intricate arabesque carvings, warm desert twilight with golden dust motes, subtle crescent moon in a deep indigo twilight sky, zero human figures, dignified and reverent';
    recommendedTemplate = 'islamic_luxury';
    recommendedStyle = 'cinematic_islamic';
    recommendedLayout = isUrdu ? 'subject_left_text_right' : 'subject_right_text_left';
    recommendedColorGrading = 'moody_dusk';
    recommendedBorder = 'double_filigree';
    recommendedTypography = isUrdu ? 'white_nastaleeq_shadow' : 'minimal_gold_divider';
    recommendedOverlay = 'dark';
  } else if (category === 'dua_dhikr') {
    conceptSummary = 'Contemplative spiritual ambiance with tasbih beads and soft lantern bokeh';
    subjectDescription =
      'Handcrafted polished dark olive-wood tasbih beads resting peacefully beside an open classical Islamic manuscript, warm amber glow from a traditional Moroccan brass lantern, soft out-of-focus background of starry night through mosque arches';
    recommendedTemplate = 'minimal_quran';
    recommendedStyle = 'minimal_luxury';
    recommendedLayout = 'center_focus';
    recommendedColorGrading = 'warm_cinematic';
    recommendedBorder = 'corner_accents';
    recommendedTypography = 'white_nastaleeq_shadow';
    recommendedOverlay = 'medium';
  } else if (category === 'ramadan') {
    conceptSummary = 'Warm Ramadan evening atmosphere with glowing lantern and crescent moon';
    subjectDescription =
      'An ornate gold filigree Ramadan lantern radiating warm amber candlelight on a marble sill, panoramic twilight view of distant mosque minarets against a cobalt blue twilight sky with slender crescent moon';
    recommendedTemplate = 'islamic_premium';
    recommendedStyle = 'cinematic_islamic';
    recommendedLayout = 'subject_bottom_text_top';
    recommendedColorGrading = 'royal_gold';
    recommendedBorder = 'thin_gold_frame';
    recommendedTypography = 'gold_highlighted_keyword';
    recommendedOverlay = 'dark';
  } else if (category === 'knowledge_fiqh') {
    conceptSummary = 'Dignified Islamic academic study with classical manuscripts & warm glow';
    subjectDescription =
      'An ancient Islamic scholarly study chamber, dark walnut shelves lined with classical leather-bound manuscripts, brass astrolabe and inkwell in soft focus, warm ray of sunlight highlighting delicate parchment';
    recommendedTemplate = 'educational';
    recommendedStyle = 'islamic_editorial';
    recommendedLayout = isUrdu ? 'subject_left_text_right' : 'subject_right_text_left';
    recommendedColorGrading = 'clean_editorial';
    recommendedBorder = 'left_gold_bar';
    recommendedTypography = 'glassmorphism_card';
    recommendedOverlay = 'medium';
  }

  // 3 Smart Design Variations
  const variations: DesignVariation[] = [
    {
      id: 'var_cinematic',
      name: 'Cinematic Islamic',
      description: 'Deep contrast, dramatic directional lighting, and dynamic subject/text split',
      style: 'cinematic_islamic',
      layout: recommendedLayout,
      colorGrading: recommendedColorGrading,
      borderTreatment: 'corner_accents',
      typographyTreatment: isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword',
      overlayOpacity: 'medium',
    },
    {
      id: 'var_luxury',
      name: 'Minimal Luxury',
      description: 'Clean layout, borderless negative space, and refined gold accents',
      style: 'minimal_luxury',
      layout: 'center_focus',
      colorGrading: 'royal_gold',
      borderTreatment: 'none',
      typographyTreatment: 'minimal_gold_divider',
      overlayOpacity: 'medium',
    },
    {
      id: 'var_editorial',
      name: 'Islamic Editorial',
      description: 'Translucent dark glassmorphism card for maximum text impact',
      style: 'islamic_editorial',
      layout: isUrdu ? 'subject_left_text_right' : 'subject_bottom_text_top',
      colorGrading: 'clean_editorial',
      borderTreatment: 'left_gold_bar',
      typographyTreatment: 'glassmorphism_card',
      overlayOpacity: 'dark',
    },
  ];

  // Compose Prompt with Negative Space instruction
  const positivePrompt =
    `${subjectDescription}, ultra-high-resolution architectural photography, Hasselblad medium format camera, ` +
    `8k resolution, cinematic lighting, natural textures, rich color grading, perfectly balanced composition ` +
    `with intentional negative space reserved for typography on the ${isUrdu ? 'right' : 'left'} side, completely clean background without any text or writing.`;

  return {
    title,
    isUrdu,
    category,
    conceptSummary,
    subjectDescription,
    positivePrompt,
    negativePrompt: STRICT_ISLAMIC_NEGATIVE_PROMPT,
    recommendedTemplate,
    recommendedStyle,
    recommendedLayout,
    recommendedColorGrading,
    recommendedBorder,
    recommendedTypography,
    recommendedOverlay,
    variations,
  };
}

/**
 * Uses Google Gemini semantic AI to analyze the title and formulate
 * an exact Photoshop-grade visual prompt.
 */
export async function formulateGeminiVisualPrompt(
  title: string,
  isUrdu: boolean,
  geminiKey: string
): Promise<string | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const systemInstruction =
      'You are an expert Islamic art director designing high-impact YouTube and WordPress blog featured thumbnails. ' +
      'Given an article title, you formulate a vivid, photorealistic prompt for generating a background visual asset. ' +
      'Rules: ' +
      '1. Strictly ZERO human faces, ZERO women, ZERO girls, ZERO prophets or companions. ' +
      '2. Strictly ZERO text, letters, calligraphy, or symbols in the image. ' +
      '3. Must leave clean, unobstructed negative space on the ' + (isUrdu ? 'right' : 'left') + ' side for typography overlay. ' +
      '4. Output ONLY the descriptive English prompt without commentary or quotes.';

    console.log('[Thumbnail AI] Calling Gemini Semantic Art Director for title:', title);

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `${systemInstruction}\n\nTitle: "${title}"`,
    });

    const generatedPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (generatedPrompt && generatedPrompt.length > 20) {
      console.log('[Thumbnail AI] Gemini Art Director formulated visual prompt successfully.');
      return generatedPrompt;
    }
  } catch (err: unknown) {
    console.warn('[Thumbnail AI] Gemini Semantic Art Director note:', err instanceof Error ? err.message : String(err));
  }
  return null;
}

/**
 * Attempts direct image generation using Google Gemini image generation models
 * (e.g. gemini-3.1-flash-image, gemini-2.5-flash-image, gemini-3.1-flash-lite-image).
 */
async function callGeminiDirectImageGeneration(
  prompt: string,
  geminiKey: string
): Promise<{ imageUrl: string; modelUsed: string } | null> {
  const models = [
    'gemini-3.1-flash-image',
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3-pro-image',
  ];

  for (const model of models) {
    try {
      console.log(`[Thumbnail AI] Attempting Gemini Image Model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [{ parts: [{ text: `${prompt}. Strictly NO text, NO women, NO faces.` }] }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/jpeg';
          console.log(`[Thumbnail AI] Successfully received image from Gemini model: ${model}`);
          return {
            imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
            modelUsed: model,
          };
        }
      } else {
        const errText = await res.text();
        console.warn(`[Thumbnail AI] Gemini model ${model} response ${res.status}:`, errText.slice(0, 150));
      }
    } catch (err) {
      console.warn(`[Thumbnail AI] Gemini model ${model} request error:`, err);
    }
  }

  return null;
}

/**
 * Generates the background image with real AI,
 * returning full art direction and 3 variations.
 */
export async function generateThumbnailBackground(
  title: string,
  width: number = 1599,
  height: number = 892,
  options?: { customPrompt?: string }
): Promise<GeneratedBackgroundResult> {
  console.log('[Thumbnail AI] Starting generation for title:', title);
  const concept = analyzeTitleAndFormulateConcept(title);

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let visualPrompt = options?.customPrompt || concept.positivePrompt;

  // Step 1: Enrich visual prompt using Gemini Semantic Art Director if key is available
  if (geminiKey && !options?.customPrompt) {
    const enriched = await formulateGeminiVisualPrompt(title, concept.isUrdu, geminiKey);
    if (enriched) {
      visualPrompt = enriched;
    }
  }

  // Step 2: Attempt Google Gemini Direct Image Generation (gemini-3.1-flash-image)
  if (geminiKey) {
    console.log('[Thumbnail AI] Calling Gemini Image Generation with key...');
    const geminiImg = await callGeminiDirectImageGeneration(visualPrompt, geminiKey);
    if (geminiImg) {
      console.log('[Thumbnail AI] Image received from Gemini successfully!');
      return {
        imageUrl: geminiImg.imageUrl,
        prompt: visualPrompt,
        concept: `${concept.conceptSummary} (Model: ${geminiImg.modelUsed})`,
        provider: 'gemini',
        isUrdu: concept.isUrdu,
        recommendedTemplate: concept.recommendedTemplate,
        recommendedStyle: concept.recommendedStyle,
        recommendedLayout: concept.recommendedLayout,
        recommendedColorGrading: concept.recommendedColorGrading,
        recommendedBorder: concept.recommendedBorder,
        recommendedTypography: concept.recommendedTypography,
        recommendedOverlay: concept.recommendedOverlay,
        variations: concept.variations,
      };
    }
  }

  // Step 3: OpenAI DALL-E 3 (if configured)
  if (openaiKey) {
    try {
      console.log('[Thumbnail AI] Calling OpenAI DALL-E 3...');
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${visualPrompt}. Absolute requirement: Do NOT draw any text, letters, or fonts. Do NOT depict any women, girls, or human faces.`,
          n: 1,
          size: width >= height ? '1792x1024' : '1024x1024',
          quality: 'standard',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;
        if (imageUrl) {
          console.log('[Thumbnail AI] Image received from OpenAI DALL-E 3');
          return {
            imageUrl,
            prompt: visualPrompt,
            concept: concept.conceptSummary,
            provider: 'openai',
            isUrdu: concept.isUrdu,
            recommendedTemplate: concept.recommendedTemplate,
            recommendedStyle: concept.recommendedStyle,
            recommendedLayout: concept.recommendedLayout,
            recommendedColorGrading: concept.recommendedColorGrading,
            recommendedBorder: concept.recommendedBorder,
            recommendedTypography: concept.recommendedTypography,
            recommendedOverlay: concept.recommendedOverlay,
            variations: concept.variations,
          };
        }
      }
    } catch (err) {
      console.warn('[Thumbnail AI] OpenAI Image generation note:', err);
    }
  }

  // Step 4: High-Performance AI Diffusion (Pollinations / Flux)
  try {
    console.log('[Thumbnail AI] Requesting AI Diffusion visual render...');
    const seed = Math.floor(Math.random() * 1000000);
    const pollW = width >= 1400 ? 1280 : width;
    const pollH = Math.round((pollW * height) / width);
    const cleanPrompt = `${visualPrompt} (cinematic lighting, ultra-high resolution photography, negative space on ${concept.isUrdu ? 'right' : 'left'}, strictly no text, no woman, no faces, Islamic architectural masterwork)`;
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${pollW}&height=${pollH}&seed=${seed}&nologo=true&model=flux`;

    return {
      imageUrl: pollinationsUrl,
      prompt: visualPrompt,
      concept: concept.conceptSummary,
      provider: 'pollinations',
      isUrdu: concept.isUrdu,
      recommendedTemplate: concept.recommendedTemplate,
      recommendedStyle: concept.recommendedStyle,
      recommendedLayout: concept.recommendedLayout,
      recommendedColorGrading: concept.recommendedColorGrading,
      recommendedBorder: concept.recommendedBorder,
      recommendedTypography: concept.recommendedTypography,
      recommendedOverlay: concept.recommendedOverlay,
      variations: concept.variations,
    };
  } catch (err) {
    console.warn('[Thumbnail AI] Diffusion engine notice:', err);
  }

  // Step 5: Guaranteed Curated High-Res Islamic Architecture Asset
  console.log('[Thumbnail AI] Using verified high-res Islamic asset fallback');
  const matched =
    CURATED_ISLAMIC_LIBRARY.find((item) => item.category === concept.category) ||
    CURATED_ISLAMIC_LIBRARY[0];

  return {
    imageUrl: matched.url,
    prompt: visualPrompt,
    concept: `${concept.conceptSummary} (${matched.description})`,
    provider: 'curated_library',
    isUrdu: concept.isUrdu,
    recommendedTemplate: concept.recommendedTemplate,
    recommendedStyle: concept.recommendedStyle,
    recommendedLayout: concept.recommendedLayout,
    recommendedColorGrading: concept.recommendedColorGrading,
    recommendedBorder: concept.recommendedBorder,
    recommendedTypography: concept.recommendedTypography,
    recommendedOverlay: concept.recommendedOverlay,
    variations: concept.variations,
  };
}
