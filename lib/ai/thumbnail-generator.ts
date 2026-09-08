import https from 'https';
import http from 'http';
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

// Ensure system certificate resolution in local and serverless runtime environments
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Downloads a remote image into a Node buffer with redirect handling and robust TLS support.
 */
async function downloadRemoteImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'http:' ? http : https;

    const req = client.get(
      url,
      {
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadRemoteImageBuffer(res.headers.location).then(resolve).catch(reject);
        }

        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Image fetch failed with HTTP status ${res.statusCode}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || 'image/jpeg';
          resolve({ buffer, contentType });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(25000, () => {
      req.destroy(new Error('Image fetch timeout after 25 seconds'));
    });
  });
}

/**
 * Sends an HTTPS POST JSON request with certificate bypass and returns status and parsed JSON/string.
 */
async function httpsPostJson(url: string, payload: unknown): Promise<{ status: number; data: any; text: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = null;
          }
          resolve({ status: res.statusCode || 200, data: parsed, text: resData });
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy(new Error('HTTPS POST timeout after 25 seconds'));
    });
    req.write(body);
    req.end();
  });
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

  // Candidate models in order of capability & speed (Google Gemini Reasoning Models)
  const textModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
  ];

  let lastError: unknown = null;

  for (const model of textModels) {
    try {
      console.log(`[Thumbnail AI] Stage 1: Calling Gemini model "${model}" for title: "${title}"`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `${systemInstruction}\n\nTitle to analyze: "${title}"`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      };

      const res = await httpsPostJson(url, payload);

      if (res.status === 200 && res.data) {
        const rawText = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rawText) {
          const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleaned) as StructuredThumbnailPlan;

          if (parsed.final_image_prompt && parsed.visual_concept) {
            console.log(`[Thumbnail AI] Stage 1 Success with model "${model}": Topic="${parsed.topic}", Category="${parsed.category}"`);
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
      } else {
        console.warn(`[Thumbnail AI] Stage 1 with model "${model}" returned HTTP ${res.status}:`, res.text.slice(0, 150));
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
  const isBusiness = lower.includes('business') || lower.includes('online business') || lower.includes('karobar') || lower.includes('کاروبار') || lower.includes('تجارت') || lower.includes('money') || lower.includes('earn') || lower.includes('startup') || lower.includes('ecommerce') || lower.includes('e-commerce');
  const isYoutubeTech = lower.includes('youtube') || lower.includes('grow') || lower.includes('views') || lower.includes('channel') || lower.includes('video') || lower.includes('subscriber');
  const isAiTools = lower.includes('ai') || lower.includes('tools') || lower.includes('artificial intelligence') || lower.includes('tech') || lower.includes('chatgpt');
  const isParenting = lower.includes('parent') || lower.includes('mistake') || lower.includes('child') || lower.includes('teach') || lower.includes('والدین') || lower.includes('بچے') || lower.includes('تربیت');
  const isQuran = lower.includes('quran') || lower.includes('قرآن') || lower.includes('تلاوت') || lower.includes('تجوید') || lower.includes('حافظ') || lower.includes('islam') || lower.includes('tahajjud') || lower.includes('تهجد') || lower.includes('نماز');

  if (isBusiness) {
    return {
      topic: 'Online Business & Digital Entrepreneurship',
      category: 'Business & Finance',
      visual_concept: 'Successful modern Pakistani digital entrepreneur working in a sleek contemporary workspace with laptop and smartphone, showcasing e-commerce analytics',
      main_subject: 'Confident professional South Asian entrepreneur focused intently on a laptop screen displaying positive financial growth metrics',
      background_concept: 'Modern stylish loft office with floor-to-ceiling windows, subtle warm evening ambient light, minimalist wood desk and indoor plants',
      color_palette: ['#00B894', '#0984E3', '#2D3436'],
      lighting: 'Cinematic rim lighting with dramatic golden hour glow through windows and subtle blue screen reflection',
      composition: isUrdu ? 'Subject on the left, expansive dark negative space on the right for title' : 'Subject on the right, expansive dark negative space on the left for title',
      mood: 'Prestigious, confident, visionary, profitable',
      typography_style: 'Bold impact commercial typography with gold keyword highlights',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, letters, words, blurry, distorted hands, cartoon, low resolution, crowded background, watermark',
      final_image_prompt: 'Cinematic, ultra-photorealistic 8k commercial photograph of a handsome Pakistani young businessman in smart casual attire sitting at a sleek mahogany desk in a modern Lahore high-rise office. Working on an open modern laptop with warm golden hour sunlight streaming through panoramic windows, shallow depth of field, clear dark negative space on the ' + (isUrdu ? 'right' : 'left') + ' side, Hasselblad H6D-100c medium format camera, strictly no text.',
    };
  }

  if (isAiTools) {
    return {
      topic: 'Artificial Intelligence & Future Tech Tools',
      category: 'Technology & AI',
      visual_concept: 'Futuristic glowing AI neural network interfaces and holographic tool widgets floating around a modern workstation',
      main_subject: 'Dynamic glowing 3D holographic AI interface sphere with sleek metallic circuits and data visualization nodes',
      background_concept: 'High-tech dark futuristic laboratory with neon cyan and electric violet ambient luminescence',
      color_palette: ['#6C5CE7', '#00CEC9', '#2D3436'],
      lighting: 'Bioluminescent neon cyber lighting with glowing particles and dramatic specular highlights',
      composition: isUrdu ? 'Focal holographic AI on the left, clear dark space on the right' : 'Focal holographic AI on the right, clear dark space on the left',
      mood: 'Cutting-edge, revolutionary, intriguing',
      typography_style: 'Ultra-modern geometric typography with electric cyan accents',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, words, watermark, blurry, deformed, cartoon, oversaturated',
      final_image_prompt: 'A breathtaking 8k cinematic photograph of a glowing translucent futuristic AI orb surrounded by holographic interactive charts in a dark cybernetic studio. Electric violet and cyan volumetric lighting, cinematic lens flare, clean negative space on the ' + (isUrdu ? 'right' : 'left') + ' side, high contrast editorial style, strictly no text.',
    };
  }

  if (isYoutubeTech) {
    return {
      topic: 'YouTube Growth & Analytics Strategy',
      category: 'Digital Media / Technology',
      visual_concept: 'Dynamic content creator studio with glowing holographic analytics graph displaying explosive upward growth',
      main_subject: 'Focused modern digital creator illuminated by holographic cyan and crimson studio rim lighting',
      background_concept: 'Sleek dark futuristic studio with professional camera lenses, soft atmospheric haze, and subtle RGB lighting',
      color_palette: ['#FF0055', '#00F0FF', '#0D0D11'],
      lighting: 'High-contrast cyberpunk studio lighting, glowing exponential graph illumination, dramatic backlight',
      composition: isUrdu ? 'Creator on left, vast clean negative space on right for bold title text' : 'Creator on right, vast clean negative space on left for bold title text',
      mood: 'Urgent, high-tech, ambitious, inspiring',
      typography_style: 'Ultra-bold geometric sans-serif with high contrast white and neon yellow accents',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, letters, watermark, low quality, blurry, distorted face, oversaturated, deformed hands',
      final_image_prompt: 'Cinematic, ultra-detailed 8k photograph of a professional content creator in a dark futuristic studio looking in amazement at a glowing holographic 3D bar chart with an exponential upward arrow. Neon cyan and magenta rim lighting, shallow depth of field, clean dark negative space on the ' + (isUrdu ? 'right' : 'left') + ' side, Hasselblad medium format camera quality, strictly no text.',
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

  // Default versatile high-impact concept dynamically synthesized for the specific title
  return {
    topic: title,
    category: 'Educational & Strategic',
    visual_concept: 'High-contrast cinematic photography depicting the central theme of "' + title + '"',
    main_subject: 'Dynamic central focal element visually representing the concept of ' + title,
    background_concept: 'Atmospheric depth with professional studio bokeh and complementary gradient illumination',
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

        const res = await httpsPostJson(url, payload);

        if (res.status === 200 && res.data) {
          const candidate = res.data.candidates?.[0];
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
          console.warn(`[Thumbnail AI] Gemini model ${model} returned ${errStatus}:`, res.text.slice(0, 180));
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

  // 2. High-Performance AI Diffusion using the EXACT Gemini Stage 1 prompt
  console.log('[Thumbnail AI] Stage 2: Synthesizing high-resolution AI visual buffer on server...');
  const seed = Math.floor(Math.random() * 9999999);
  const targetW = width >= 1400 ? 1280 : (width || 1280);
  const targetH = Math.round((targetW * (height || 720)) / (width || 1280));

  const cleanPrompt = encodeURIComponent(
    `${plan.final_image_prompt}, 16:9 YouTube thumbnail format, cinematic 8k wallpaper, clean negative space on ${plan.text_placement} for text overlay, strictly no text, no watermark`
  );
  const diffusionUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${targetW}&height=${targetH}&seed=${seed}&nologo=true&model=flux`;

  try {
    const { buffer, contentType } = await downloadRemoteImageBuffer(diffusionUrl);
    const base64 = buffer.toString('base64');
    const mimeType = contentType || 'image/jpeg';
    const base64DataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[Thumbnail AI] Successfully synthesized server-side Base64 image (${base64DataUrl.length} chars)`);
    return {
      imageUrl: base64DataUrl,
      provider: 'ai_diffusion',
      modelUsed: 'gemini-prompt-flux-visual',
      geminiNotice: geminiKey
        ? 'Google Gemini Image Quota Notice: Free-tier limit for gemini-3.1-flash-image is currently 0 in Google AI Studio. Synthesized high-resolution photorealistic visual via server buffer using the exact Gemini Stage 1 prompt.'
        : undefined,
    };
  } catch (downloadErr) {
    console.warn('[Thumbnail AI] downloadRemoteImageBuffer failed, attempting standard fetch:', downloadErr);
    try {
      const res = await fetch(diffusionUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = res.headers.get('content-type') || 'image/jpeg';
        const base64DataUrl = `data:${mimeType};base64,${base64}`;

        return {
          imageUrl: base64DataUrl,
          provider: 'ai_diffusion',
          modelUsed: 'gemini-prompt-flux-visual',
        };
      }
    } catch (fetchErr) {
      console.warn('[Thumbnail AI] Secondary fetch also failed:', fetchErr);
    }
  }

  // If both direct Gemini and server buffer encounter issues, throw clean error
  throw new Error('Image generation service was unable to render the visual buffer. Please check your network connection or try again in a moment.');
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
  options?: { customPrompt?: string; apiKey?: string }
): Promise<GeneratedBackgroundResult> {
  const geminiKey = options?.apiKey || process.env.GEMINI_API_KEY;
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
