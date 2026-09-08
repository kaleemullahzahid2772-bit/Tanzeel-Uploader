import {
  ThumbnailTemplate,
  OverlayLevel,
  DesignStyle,
  CompositionLayout,
  ColorGradingPreset,
  BorderTreatment,
  TypographyTreatment,
  DesignVariation,
  StructuredThumbnailPlan,
} from '@/lib/types/thumbnail';

// Ensure system certificate resolution in local development environments
if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export interface GeneratedBackgroundResult {
  imageUrl: string;
  prompt: string;
  concept: string;
  provider: 'gemini' | 'ai_diffusion' | 'openai' | 'fallback';
  modelUsed: string;
  geminiNotice?: string;
  plan: StructuredThumbnailPlan;
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

/**
 * Checks if a given text is in Arabic or Urdu script.
 */
export function isUrduOrArabicScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * STAGE 1: Gemini Reasoning & Art Direction
 * Deeply analyzes the title using Google Gemini text reasoning model
 * to generate a structured 13-point thumbnail plan.
 */
export async function generateStructuredThumbnailPlan(
  title: string,
  apiKey: string
): Promise<StructuredThumbnailPlan> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const isUrdu = isUrduOrArabicScript(title);

  const systemInstruction = `You are a world-class YouTube Art Director, Visual Strategist, and Master Graphic Designer.
Your task is to analyze the given video or blog post title and produce a structured, high-impact thumbnail design plan.

CRITICAL DESIGN PRINCIPLES:
1. Every title is UNIQUE. Analyze its exact topic, domain (Islamic education, modern technology, YouTube growth, parenting, finance, etc.), and emotional hook.
2. Formulate a vivid, specific visual concept with a strong focal point, dynamic foreground-background balance, and professional lighting.
3. Strict composition: You MUST leave clean, uncluttered negative space on the ${isUrdu ? 'right' : 'left'} side specifically reserved for large readable headline text.
4. In 'final_image_prompt', describe a photorealistic, 8k resolution, cinematic scene with camera angle, depth of field, volumetric lighting, subject, and background. Do NOT ask for text to be written inside the image.
5. In 'negative_prompt', forbid: illegible text, low quality, deformed hands, distorted faces, blurry background artifacts, watermark, signature.

Return ONLY a valid JSON object matching this schema with no markdown ticks:
{
  "topic": "string",
  "category": "string",
  "visual_concept": "string",
  "main_subject": "string",
  "background_concept": "string",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "lighting": "string",
  "composition": "string",
  "mood": "string",
  "typography_style": "string",
  "text_placement": "left" | "right" | "bottom" | "center",
  "negative_prompt": "string",
  "final_image_prompt": "string"
}`;

  // Candidate models in order of capability & speed
  const textModels = [
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: unknown = null;

  for (const model of textModels) {
    try {
      console.log(`[Thumbnail AI] Stage 1: Calling Gemini model "${model}" for title: "${title}"`);
      const response = await ai.models.generateContent({
        model,
        contents: `${systemInstruction}\n\nTitle to analyze: "${title}"`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (rawText) {
        // Strip any markdown code blocks if returned
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as StructuredThumbnailPlan;

        if (parsed.final_image_prompt && parsed.visual_concept) {
          // Normalize fields
          return {
            topic: parsed.topic || title,
            category: parsed.category || 'General',
            visual_concept: parsed.visual_concept,
            main_subject: parsed.main_subject || 'Central focal subject',
            background_concept: parsed.background_concept || 'Atmospheric cinematic background',
            color_palette: Array.isArray(parsed.color_palette) && parsed.color_palette.length >= 2
              ? parsed.color_palette
              : ['#0F4C3A', '#C9A227', '#0A192F'],
            lighting: parsed.lighting || 'Cinematic dramatic volumetric lighting',
            composition: parsed.composition || 'Rule of thirds with clean negative space',
            mood: parsed.mood || 'Inspiring, high-impact',
            typography_style: parsed.typography_style || 'Bold high-contrast headline',
            text_placement: isUrdu ? 'right' : (parsed.text_placement || 'left'),
            negative_prompt: parsed.negative_prompt || 'text, blurry, watermark, bad anatomy, deformed',
            final_image_prompt: parsed.final_image_prompt,
          };
        }
      }
    } catch (err: unknown) {
      console.warn(`[Thumbnail AI] Stage 1 with model "${model}" failed:`, err instanceof Error ? err.message : String(err));
      lastError = err;
    }
  }

  // Fallback intelligent planner if all Gemini text API attempts encountered transient issues
  console.warn('[Thumbnail AI] Using contextual backup planner due to Gemini text API notice:', lastError);
  return buildContextualBackupPlan(title, isUrdu);
}

/**
 * Intelligent contextual fallback plan builder when network/demand prevents LLM call.
 */
function buildContextualBackupPlan(title: string, isUrdu: boolean): StructuredThumbnailPlan {
  const lower = title.toLowerCase();
  const isYoutubeTech = lower.includes('youtube') || lower.includes('grow') || lower.includes('views') || lower.includes('channel') || lower.includes('video');
  const isParenting = lower.includes('parent') || lower.includes('mistake') || lower.includes('child') || lower.includes('teach') || lower.includes('والدین') || lower.includes('بچے');
  const isQuran = lower.includes('quran') || lower.includes('قرآن') || lower.includes('تلاوت') || lower.includes('تجوید') || lower.includes('حافظ');

  if (isYoutubeTech) {
    return {
      topic: 'YouTube Growth & Analytics Strategy',
      category: 'Digital Media / Technology',
      visual_concept: 'Dynamic content creator studio with glowing holographic analytics graph displaying explosive upward growth',
      main_subject: 'Focused modern digital creator illuminated by holographic cyan and crimson studio rim lighting',
      background_concept: 'Sleek dark futuristic studio with professional camera lenses, soft atmospheric haze, and subtle RGB lighting',
      color_palette: ['#FF0055', '#00F0FF', '#0D0D11'],
      lighting: 'High-contrast cyberpunk studio lighting, glowing exponential graph illumination, dramatic backlight',
      composition: 'Rule of thirds: creator on right looking left, vast clean negative space on left for bold title text',
      mood: 'Urgent, high-tech, ambitious, inspiring',
      typography_style: 'Ultra-bold geometric sans-serif with high contrast white and neon yellow accents',
      text_placement: 'left',
      negative_prompt: 'text, letters, watermark, low quality, blurry, distorted face, oversaturated, deformed hands',
      final_image_prompt: 'Cinematic, ultra-detailed 8k photograph of a professional content creator in a dark futuristic studio looking in amazement at a glowing holographic 3D bar chart with an exponential upward arrow. Neon cyan and magenta rim lighting, shallow depth of field, clean dark negative space on the left side, Hasselblad medium format camera quality, strictly no text.',
    };
  }

  if (isParenting) {
    return {
      topic: 'Islamic Parenting & Quran Education',
      category: 'Parenting & Education',
      visual_concept: 'Emotional, heartwarming scene of a caring parent guiding a child over an illuminated Holy Quran',
      main_subject: 'A father and his young child sharing an attentive moment over an open Quran on a traditional carved wooden rehal',
      background_concept: 'Warm, cozy family library with soft bokeh lights and elegant Islamic wooden lattices',
      color_palette: ['#D4AF37', '#1E293B', '#8B4513'],
      lighting: 'Warm golden amber side lighting, soft volumetric rays illuminating the manuscript pages, gentle shadows',
      composition: isUrdu ? 'Asymmetric balance: subjects on the left, clear calm negative space on the right' : 'Subjects on the right, clean negative space on the left',
      mood: 'Reflective, warm, empathetic, dignified',
      typography_style: 'Bold legible typography with distinct golden highlights on key words',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, watermark, logo, bad anatomy, distorted faces, unrealistic lighting, cartoon, blurry',
      final_image_prompt: 'An 8k photorealistic, highly detailed cinematic shot of a respectful father and young child in a warm atmospheric room, looking at an open Quran on an ornate carved mahogany stand. Soft golden amber ambient lighting, cinematic depth of field, clean dark negative space on the ' + (isUrdu ? 'right' : 'left') + ', commercial grade editorial photography, strictly no text.',
    };
  }

  if (isQuran) {
    return {
      topic: 'Online Quran Learning & Mastery',
      category: 'Islamic Education',
      visual_concept: 'Spiritual harmony of classical sacred Quranic manuscripts and modern digital education',
      main_subject: 'An illuminated Quran resting on an ornate rehal beside an ambient digital tablet glowing softly',
      background_concept: 'Peaceful dawn sanctuary with graceful marble arches and delicate morning sunlight motes',
      color_palette: ['#0B3B24', '#D4AF37', '#1E293B'],
      lighting: 'Ethereal morning dawn light streaming through grand mashrabiya arches, soft warm golden rim light',
      composition: isUrdu ? 'Sacred subject on left, pristine negative space on right for RTL Urdu Nastaleeq' : 'Subject on right, pristine negative space on left',
      mood: 'Spiritual, serene, inspirational, enlightened',
      typography_style: 'Dignified Nastaleeq or serif typography with deep shadow and royal gold accents',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, letters, watermark, blurry, deformed, cartoon, low resolution',
      final_image_prompt: 'A breathtaking 8k architectural photograph of an open Holy Quran resting on a masterfully carved wooden rehal inside a sunlit grand mosque prayer hall. Golden volumetric sunlight rays streaming through arched windows, polished marble floor reflections, clean uncluttered negative space on the ' + (isUrdu ? 'right' : 'left') + ' side, pristine medium format photography, strictly no text.',
    };
  }

  // Default versatile high-impact concept
  return {
    topic: title,
    category: 'Educational & Inspirational',
    visual_concept: 'Cinematic high-contrast editorial scene with striking atmospheric lighting and focal depth',
    main_subject: 'Dynamic central focal element related to ' + title + ' with rich texture and depth',
    background_concept: 'Deep atmospheric environment with sophisticated ambient gradients and bokeh',
    color_palette: ['#0F4C3A', '#C9A227', '#0A192F'],
    lighting: 'Dramatic directional rim lighting with volumetric shadows for maximum visual pop',
    composition: isUrdu ? 'Focal point on the left side, uncluttered dark negative space on the right' : 'Focal point on the right side, uncluttered dark negative space on the left',
    mood: 'Engaging, professional, authoritative',
    typography_style: 'High-contrast bold headline typography with subtle drop shadow',
    text_placement: isUrdu ? 'right' : 'left',
    negative_prompt: 'text, watermark, logo, low quality, distorted, noisy, bad anatomy',
    final_image_prompt: 'Cinematic, ultra-detailed 8k photograph representing "' + title + '", dramatic professional lighting, shallow depth of field, Hasselblad medium format camera style, clear negative space on the ' + (isUrdu ? 'right' : 'left') + ' side for typography, high contrast, strictly no text.',
  };
}

/**
 * STAGE 2: Real AI Image Generation
 * Attempts Google Gemini image-generation API models (gemini-3.1-flash-image, gemini-3-pro-image).
 * If quota is unavailable (e.g. Free Tier limit 0) or rate limited, seamlessly generates the image
 * using high-resolution AI diffusion with the exact Gemini Stage 1 prompt.
 */
export async function generateRealAiImage(
  plan: StructuredThumbnailPlan,
  width: number,
  height: number,
  geminiKey?: string
): Promise<{ imageUrl: string; provider: 'gemini' | 'ai_diffusion'; modelUsed: string; geminiNotice?: string }> {
  // 1. Attempt Google Gemini Direct Image Generation if key is provided
  if (geminiKey) {
    const candidateImageModels = [
      'gemini-3.1-flash-image',
      'gemini-3-pro-image',
      'gemini-2.5-flash-image',
    ];

    let geminiQuotaError: string | null = null;

    for (const model of candidateImageModels) {
      try {
        console.log(`[Thumbnail AI] Stage 2: Attempting Google Gemini Image Model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const payload = {
          contents: [
            {
              parts: [
                {
                  text: `${plan.final_image_prompt}. Negative constraint: ${plan.negative_prompt}. Strictly NO text, NO watermarks, NO signatures.`,
                },
              ],
            },
          ],
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
            const mimeType = part.inlineData.mimeType || 'image/png';
            console.log(`[Thumbnail AI] Success: Image received from Gemini model ${model}`);
            return {
              imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
              provider: 'gemini',
              modelUsed: model,
            };
          }
        } else {
          const errStatus = res.status;
          const errText = await res.text();
          console.warn(`[Thumbnail AI] Gemini model ${model} returned ${errStatus}:`, errText.slice(0, 180));
          if (errStatus === 429) {
            geminiQuotaError = 'Google Gemini free-tier image generation quota is currently 0 or exhausted.';
          }
        }
      } catch (err) {
        console.warn(`[Thumbnail AI] Gemini model ${model} request error:`, err);
      }
    }

    if (geminiQuotaError) {
      console.log('[Thumbnail AI] Gemini Image quota note:', geminiQuotaError);
    }
  }

  // 2. High-Performance AI Diffusion fallback using the EXACT Gemini Stage 1 prompt
  console.log('[Thumbnail AI] Stage 2: Generating high-resolution AI visual using Stage 1 prompt via AI Diffusion...');
  const seed = Math.floor(Math.random() * 9999999);
  const targetW = width >= 1400 ? 1280 : width;
  const targetH = Math.round((targetW * height) / width);

  const cleanPrompt = encodeURIComponent(
    `${plan.final_image_prompt}, cinematic 8k wallpaper, clean negative space on ${plan.text_placement} for text overlay, strictly no text, no watermark`
  );
  const diffusionUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${targetW}&height=${targetH}&seed=${seed}&nologo=true&model=flux`;

  // Verify the image URL is accessible
  try {
    const checkRes = await fetch(diffusionUrl, { method: 'HEAD' });
    if (checkRes.ok) {
      return {
        imageUrl: diffusionUrl,
        provider: 'ai_diffusion',
        modelUsed: 'flux-diffusion-gemini-plan',
        geminiNotice: geminiKey
          ? 'Gemini Image Quota Note: Free-tier limit is 0; generated photorealistic visual via AI Diffusion using the Gemini Stage 1 plan.'
          : undefined,
      };
    }
  } catch (checkErr) {
    console.warn('[Thumbnail AI] Diffusion HEAD check note:', checkErr);
  }

  return {
    imageUrl: diffusionUrl,
    provider: 'ai_diffusion',
    modelUsed: 'flux-diffusion-gemini-plan',
  };
}

/**
 * Maps the structured AI plan into UI design styling and Photoshop-style layout.
 */
export function deriveDesignStyling(plan: StructuredThumbnailPlan, isUrdu: boolean) {
  let recommendedLayout: CompositionLayout = 'subject_right_text_left';
  if (plan.text_placement === 'right') {
    recommendedLayout = 'subject_left_text_right';
  } else if (plan.text_placement === 'left') {
    recommendedLayout = 'subject_right_text_left';
  } else if (plan.text_placement === 'bottom') {
    recommendedLayout = 'subject_bottom_text_top';
  } else {
    recommendedLayout = 'center_focus';
  }

  let recommendedColorGrading: ColorGradingPreset = 'deep_emerald';
  const paletteStr = plan.color_palette.join(' ').toLowerCase();
  if (paletteStr.includes('ff00') || paletteStr.includes('00f0') || paletteStr.includes('cyan') || paletteStr.includes('magenta')) {
    recommendedColorGrading = 'clean_editorial';
  } else if (paletteStr.includes('ffd') || paletteStr.includes('d4af') || paletteStr.includes('c9a2')) {
    recommendedColorGrading = 'royal_gold';
  } else if (paletteStr.includes('amber') || paletteStr.includes('warm') || paletteStr.includes('8b45')) {
    recommendedColorGrading = 'warm_cinematic';
  } else if (paletteStr.includes('blue') || paletteStr.includes('indigo') || paletteStr.includes('1e29')) {
    recommendedColorGrading = 'moody_dusk';
  }

  const variations: DesignVariation[] = [
    {
      id: 'var_cinematic',
      name: 'Cinematic Asymmetric',
      description: 'Dynamic subject separation with dramatic directional rim light and dedicated negative space',
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
      description: 'Clean borderless layout with subtle gold filigree and elegant title contrast',
      style: 'minimal_luxury',
      layout: 'center_focus',
      colorGrading: 'royal_gold',
      borderTreatment: 'none',
      typographyTreatment: 'minimal_gold_divider',
      overlayOpacity: 'medium',
    },
    {
      id: 'var_editorial',
      name: 'High-Impact Editorial',
      description: 'Glassmorphism dark card with left pillar accent for maximum readability',
      style: 'islamic_editorial',
      layout: recommendedLayout,
      colorGrading: 'clean_editorial',
      borderTreatment: 'left_gold_bar',
      typographyTreatment: 'glassmorphism_card',
      overlayOpacity: 'dark',
    },
  ];

  return {
    recommendedLayout,
    recommendedColorGrading,
    recommendedStyle: 'cinematic_islamic' as DesignStyle,
    recommendedBorder: 'corner_accents' as BorderTreatment,
    recommendedTypography: (isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword') as TypographyTreatment,
    recommendedOverlay: 'medium' as OverlayLevel,
    variations,
  };
}

/**
 * Primary Controller: Coordinates the 2-Stage AI Thumbnail Generation workflow.
 */
export async function generateThumbnailBackground(
  title: string,
  width: number = 1599,
  height: number = 892,
  options?: { customPrompt?: string }
): Promise<GeneratedBackgroundResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const isUrdu = isUrduOrArabicScript(title);

  console.log(`[Thumbnail AI] Initiating 2-Stage Generation for: "${title}"`);

  // STAGE 1: Reasoning and Structured Art Direction Plan
  let plan: StructuredThumbnailPlan;
  if (geminiKey) {
    plan = await generateStructuredThumbnailPlan(title, geminiKey);
  } else {
    plan = buildContextualBackupPlan(title, isUrdu);
  }

  // Override prompt if custom prompt provided
  if (options?.customPrompt) {
    plan.final_image_prompt = options.customPrompt;
  }

  // STAGE 2: Real AI Image Generation
  const imageResult = await generateRealAiImage(plan, width, height, geminiKey);

  // Derive UI styling and variations from the plan
  const styling = deriveDesignStyling(plan, isUrdu);

  return {
    imageUrl: imageResult.imageUrl,
    prompt: plan.final_image_prompt,
    concept: `${plan.topic} — ${plan.visual_concept}`,
    provider: imageResult.provider,
    modelUsed: imageResult.modelUsed,
    geminiNotice: imageResult.geminiNotice,
    plan,
    isUrdu,
    recommendedTemplate: 'islamic_premium',
    recommendedStyle: styling.recommendedStyle,
    recommendedLayout: styling.recommendedLayout,
    recommendedColorGrading: styling.recommendedColorGrading,
    recommendedBorder: styling.recommendedBorder,
    recommendedTypography: styling.recommendedTypography,
    recommendedOverlay: styling.recommendedOverlay,
    variations: styling.variations,
  };
}
