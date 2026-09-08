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
  provider: 'imagen' | 'openai' | 'pollinations' | 'curated_library';
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
      'نماز', 'نمازی', 'سجدہ', 'مسجد', 'رکوع', 'فجر', 'جمعہ', 'قبلہ', 'صف', 'سترہ',
      'salah', 'namaz', 'prayer', 'pray', 'sujood', 'ruku', 'fajr', 'jummah', 'masjid', 'mosque'
    ],
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1600&q=85',
    description: 'Grand mosque interior prayer hall with magnificent archways, pristine carpets, and spiritual dawn illumination',
  },
  {
    category: 'quran',
    keywords: [
      'قرآن', 'تلاوت', 'آیت', 'سورۃ', 'تفسیر', 'حفظ', 'قاری', 'مصحف', 'قرآنی',
      'quran', 'koran', 'ayat', 'surah', 'read', 'recit', 'tilawat', 'tafseer', 'hafiz'
    ],
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1600&q=85',
    description: 'Holy Quran illuminated on traditional carved wooden rehal with warm amber glow',
  },
  {
    category: 'prophet_history',
    keywords: [
      'نبی', 'رسول', 'محمد', 'سیرت', 'صحابہ', 'مدینہ', 'مکہ', 'تاریخ', 'ہجرت', 'غزوہ',
      'prophet', 'muhammad', 'rasool', 'nabi', 'seerah', 'sahaba', 'madinah', 'makkah', 'history'
    ],
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=85',
    description: 'Historical Islamic archway corridors overlooking serene minarets and golden horizon',
  },
  {
    category: 'dua_dhikr',
    keywords: [
      'دعا', 'ذکر', 'تسبیح', 'استغفار', 'توبہ', 'وظیفہ', 'روحانی', 'دل', 'سکون',
      'dua', 'dhikr', 'tasbih', 'forgiveness', 'istighfar', 'spiritual', 'peace', 'heart', 'allah'
    ],
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=85',
    description: 'Polished olive-wood tasbih prayer beads resting before ornate mosque lattice window',
  },
  {
    category: 'ramadan',
    keywords: [
      'رمضان', 'روزہ', 'افطار', 'سحری', 'عید', 'تراویح', 'اعتکاف', 'شب قدر',
      'ramadan', 'fasting', 'roza', 'iftar', 'suhoor', 'eid', 'taraweeh', 'laylat'
    ],
    url: 'https://images.unsplash.com/photo-1590076215667-873d20755a6d?auto=format&fit=crop&w=1600&q=85',
    description: 'Traditional golden brass lantern glowing softly against twilight sky with crescent moon',
  },
  {
    category: 'knowledge_fiqh',
    keywords: [
      'مسئلہ', 'فتویٰ', 'علم', 'درس', 'کتاب', 'احکام', 'حلال', 'حرام', 'شرعی', 'شریعت', 'اسباق', 'رہنمائی',
      'knowledge', 'lesson', 'learn', 'education', 'study', 'ilm', 'book', 'fiqh', 'fatwa', 'rules', 'guide'
    ],
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1600&q=85',
    description: 'Classical Islamic scholarly study room with antique leather manuscripts and warm atmospheric lighting',
  },
  {
    category: 'general_islamic',
    keywords: [
      'اسلام', 'مسلمان', 'دین', 'اخلاق', 'سنت', 'صدقہ', 'زکوٰۃ', 'معاشرہ', 'زندگی',
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
 * Generates the background image with real AI or high-res curated assets,
 * returning full art direction and 3 variations.
 */
export async function generateThumbnailBackground(
  title: string,
  width: number = 1599,
  height: number = 892,
  options?: { customPrompt?: string }
): Promise<GeneratedBackgroundResult> {
  const concept = analyzeTitleAndFormulateConcept(title);
  const finalPrompt = options?.customPrompt || concept.positivePrompt;

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Provider 1: OpenAI DALL-E 3
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${finalPrompt}. Absolute requirement: Do NOT draw any text, letters, or fonts. Do NOT depict any women, girls, or human faces.`,
          n: 1,
          size: width >= height ? '1792x1024' : '1024x1024',
          quality: 'standard',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;
        if (imageUrl) {
          return {
            imageUrl,
            prompt: finalPrompt,
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
      console.warn('OpenAI Image generation notice:', err);
    }
  }

  // Provider 2: Google Imagen 3
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: finalPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: width >= height ? '16:9' : '1:1',
              negativePrompt: STRICT_ISLAMIC_NEGATIVE_PROMPT,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const imageUrl = `data:image/jpeg;base64,${b64}`;
          return {
            imageUrl,
            prompt: finalPrompt,
            concept: concept.conceptSummary,
            provider: 'imagen',
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
      console.warn('Google Imagen generation notice:', err);
    }
  }

  // Provider 3: Pollinations AI / Flux
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const pollW = width >= 1400 ? 1280 : width;
    const pollH = Math.round((pollW * height) / width);
    const encodedPrompt = encodeURIComponent(
      `${finalPrompt} (Strictly no text, no woman, no faces, Islamic architectural masterwork)`
    );
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${pollW}&height=${pollH}&seed=${seed}&nologo=true&model=flux`;

    const testRes = await fetch(pollinationsUrl, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    if (testRes.ok) {
      return {
        imageUrl: pollinationsUrl,
        prompt: finalPrompt,
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
    }
  } catch (err) {
    console.warn('Pollinations connection notice, using curated 4K Islamic asset:', err);
  }

  // Provider 4: Guaranteed High-Res Curated Islamic Architectural Asset
  const matched =
    CURATED_ISLAMIC_LIBRARY.find((item) => item.category === concept.category) ||
    CURATED_ISLAMIC_LIBRARY[0];

  return {
    imageUrl: matched.url,
    prompt: finalPrompt,
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
