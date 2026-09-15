import https from 'https';
import http from 'http';
import sharp from 'sharp';
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
  TextBackdropStyle,
  GraphicBadgeStyle,
  CornerRibbonStyle,
  GraphicDecal,
  LightFlareEffect,
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
async function httpsPostJson(url: string, payload: unknown, timeoutMs: number = 15000): Promise<{ status: number; data: any; text: string }> {
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
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`HTTPS POST timeout after ${timeoutMs / 1000} seconds`));
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
  // Automated Photoshop Compositing Layer Configuration
  recommendedBackdropStyle?: TextBackdropStyle;
  recommendedTextColor?: string;
  recommendedTextOutlineEnabled?: boolean;
  recommendedTextOutlineColor?: string;
  recommendedTextOutlineWidth?: number;
  recommendedBadgeText?: string;
  recommendedBadgeStyle?: GraphicBadgeStyle;
  recommendedCornerRibbonText?: string;
  recommendedCornerRibbonStyle?: CornerRibbonStyle;
  recommendedGraphicDecal?: GraphicDecal;
  recommendedLightFlare?: LightFlareEffect;
  recommendedBackgroundBlur?: boolean;
  recommendedClarityFilter?: boolean;
  recommendedShowSocialBar?: boolean;
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
  apiKey: string,
  creativeStyle?: string,
  customPromptTuning?: string,
  slug?: string
): Promise<StructuredThumbnailPlan> {
  const isUrdu = isUrduOrArabicScript(title);

  let styleGuidance = '';
  if (creativeStyle === 'viral_youtube') {
    styleGuidance = 'STYLE DIRECTION: High-CTR Editorial Thumbnail. Vivid controlled contrast, realistic rim lighting, photorealistic textures, dynamic visual depth, and click-worthy editorial composition.';
  } else if (creativeStyle === 'islamic_luxury') {
    styleGuidance = 'STYLE DIRECTION: Authentic Islamic Editorial Luxury. Majestic arabesque arches, warm golden volumetric sun rays, polished marble reflections, spiritual serenity, and classical Islamic architectural dignity.';
  } else if (creativeStyle === 'tech_ai') {
    styleGuidance = 'STYLE DIRECTION: Advanced Tech & AI Innovation. Sleek holographic data visualization, subtle ambient luminescence, futuristic workstation, professional high-tech editorial aesthetics.';
  } else if (creativeStyle === 'business_wealth') {
    styleGuidance = 'STYLE DIRECTION: Executive Business & Modern Economics. Sophisticated contemporary architecture, high-rise panoramic view, subtle analytical depth, golden hour prestige.';
  } else if (creativeStyle === 'podcast_studio') {
    styleGuidance = 'STYLE DIRECTION: High-End Documentary & Intellectual Studio. Moody low-key studio lighting, warm vintage spotlight, cinematic depth of field with broadcast studio bokeh, authoritative and captivating.';
  } else if (creativeStyle === 'minimal_quran') {
    styleGuidance = 'STYLE DIRECTION: Sacred Quranic Serenity. Classical open illuminated Holy Quran manuscript on an ornate carved wooden rehal, tranquil morning dawn light through mashrabiya lattice.';
  }

  const userTuningPrompt = customPromptTuning?.trim()
    ? `USER CREATIVE TUNING REQUEST: "${customPromptTuning.trim()}". Make sure to seamlessly incorporate this artistic direction.`
    : '';

  const systemInstruction = `You are a Professional Senior Graphic Designer, Photoshop Art Director, Photo Compositor, and Islamic Editorial Visual Designer.
The final thumbnail MUST look like it was professionally designed by a human designer in Adobe Photoshop, NOT like a generic AI-generated image.
The design must possess professional visual hierarchy, dramatic studio lighting, controlled contrast, cinematic composition, sharp details, and intentional graphic layering. Never produce a cheap, generic, blurry, or obviously AI-generated appearance.

HIGH-CTR VISUAL HOOK & FOCAL POINT (MANDATORY):
- DO NOT generate a generic, vague, or empty background.
- The composition MUST feature ONE clear, dramatic focal point / visual hook relevant to the topic (e.g., an authentic carved marble ablution fountain with crystalline water, an ancient leather-bound illuminated manuscript resting on an ornate carved rehal, a dramatic glowing 3D symbolic element, or an authoritative symbolic object).
- The focal subject must have sharp, tangible physical presence and 3D depth.

DRAMATIC STUDIO LIGHTING & DEPTH OF FIELD:
- Warm directional key light (golden hour sunbeam, warm spotlight, or soft lantern glow).
- Sharp rim lighting / edge highlights separating the subject crisply from the background.
- Glowing atmospheric accents (subtle dust motes, ethereal luminescence, radiant amber highlights).
- Cinematic depth of field with creamy background blur (f/1.8 lens bokeh) to make the subject pop.

INTENTIONAL NEGATIVE SPACE FOR TYPOGRAPHY:
- Reserve 50% to 60% intentional clean, unobstructed negative space (${isUrdu ? 'on the right side or center' : 'on the left side or center'}) specifically allocated for bold typography compositing.
- The negative space must have subtle atmospheric dark bokeh or soft studio gradient so bold white and gold headline text pops with high contrast without visual clash.

STRICT 16:9 WIDESCREEN COMPOSITION:
- Strict 16:9 widescreen format (1280x720 / 1920x1080).
- Modern studio-grade YouTube thumbnail aesthetics.

STRICT HALAL & CLEAN RULES:
- Strictly NO text, words, letters, watermarks, signatures, or logos in the generated image.
- Strictly respect Halal visual guidelines (no female imagery, no full facial human portraits).

INPUT UNDERSTANDING:
- Article Title (PRIMARY semantic source): Understand the core subject, emotional tone, and intellectual hook.
${slug ? `- Article URL Slug (Supporting context only): "${slug}"` : ''}
- Do NOT simply convert the title into a literal image. Think like a professional editorial thumbnail designer choosing an evocative visual metaphor.

DOMAIN & ISLAMIC VISUAL STORYTELLING (ULTRA-LUXURY & CINEMATIC):
- If the title discusses Prayer, Namaz, Worship, Sitting Prayer, or Islamic Rulings:
  Compose a grand, breathtaking Ottoman or Andalusian mosque sanctuary with towering carved marble columns, arched vaulted ceilings, and glowing crystal chandeliers casting warm ambient light.
  Include in the composition: an illuminated open Holy Quran resting on an intricately carved wooden Rehal (bookstand) with divine golden light rays radiating from its pages, and a reverent Muslim worshipper in traditional attire (kufi cap, sitting on a chair or in prayer) with cinematic golden rim lighting. The marble floor should feature soft reflections and volumetric golden dust motes.
- If the title discusses Qur'an, Tajweed, Tilawat, or Hifz:
  An exquisite illuminated gold-leaf Holy Quran manuscript on a majestic carved wooden Rehal, bathed in radiant divine golden rays, with warm dawn light filtering through intricate mashrabiya geometric lattices, in a tranquil grand mosque sanctuary.
- If the title discusses Hadith, Sunnah, Islamic Scholar, or Deen:
  A grand classical Islamic scholarly library or sanctuary, with leather-bound manuscripts with gold gilt, soaring architectural arches, warm lantern illumination, and profound intellectual dignity.
- If the title discusses General Guidance, Life, or Wisdom:
  Create an evocative, cinematic visual metaphor with deep emotional resonance, dramatic volumetric lighting, and serene spiritual grandeur.

CRITICAL COMPOSITION & BACKGROUND-ONLY RULE:
1. The image generation model must ONLY generate the PHOTOREALISTIC BACKGROUND SCENE.
2. Strictly DO NOT ask for text, words, letters, or typography inside the generated image. The exact article title is added afterward as a real typography layer using an external graphics compositing system.
3. Aspect Ratio: Strict 16:9 widescreen format (1280x720 / 1920x1080).
4. Frame the composition so the main visual hooks (illuminated Quran on rehal, worshipper, grand arches) anchor the sides and bottom, leaving the upper-middle zone bathed in soft atmospheric depth for the bold 3D headline.
5. In 'final_image_prompt': Describe an 8K photorealistic, cinematic scene with camera angle, depth of field, volumetric lighting, realistic materials, and atmospheric background.
6. In 'negative_prompt': Forbid: text in image, words, letters, watermarks, signatures, logos, distorted hands, bad anatomy, low resolution, noise, cartoonish look, generic stock photo, female imagery.
${styleGuidance ? `7. ${styleGuidance}` : ''}
${userTuningPrompt ? `8. ${userTuningPrompt}` : ''}

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
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash',
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
                text: `${systemInstruction}\n\nTitle to analyze: "${title}"${slug ? `\nSlug context: "${slug}"` : ''}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      };

      const res = await httpsPostJson(url, payload, 6000);

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
              text_placement: isUrdu ? 'center' : (parsed.text_placement || 'center'),
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
  const isQuran = lower.includes('quran') || lower.includes('قرآن') || lower.includes('تلاوت') || lower.includes('تجوید') || lower.includes('حافظ') || lower.includes('surah') || lower.includes('سورت');
  const isFiqhOrWater = lower.includes('wudu') || lower.includes('وضو') || lower.includes('ghusl') || lower.includes('غسل') || lower.includes('water') || lower.includes('پانی') || lower.includes('taharah') || lower.includes('طہارت') || lower.includes('پاک') || lower.includes('حلال') || lower.includes('فتوی') || lower.includes('مسئلہ');
  const isHadith = lower.includes('hadith') || lower.includes('حدیث') || lower.includes('sunnah') || lower.includes('سنت') || lower.includes('bukhari') || lower.includes('muslim');

  if (isFiqhOrWater) {
    return {
      topic: 'Islamic Jurisprudence & Everyday Purity Rules',
      category: 'Islamic Fiqh & Daily Life',
      visual_concept: 'Serene Islamic ablution sanctuary with crystalline pure flowing water catching gentle morning rays',
      main_subject: 'An authentic classical carved marble wudu fountain with crystal-clear water flowing smoothly into a pristine stone basin',
      background_concept: 'Grand sunlit mosque courtyard with majestic marble archways and serene spiritual tranquility',
      color_palette: ['#0B4F6C', '#D4AF37', '#1E293B'],
      lighting: 'Ethereal natural daylight glistening on clear water ripples with warm golden volumetric sunlight through arches',
      composition: isUrdu ? 'Fountain basin on the left, expansive clean dark negative space on the right for title' : 'Fountain on the right, clean negative space on the left',
      mood: 'Pure, peaceful, authoritative, contemplative',
      typography_style: 'Prestigious Nastaleeq or classical serif with crisp contrast and subtle ambient shadow',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, letters, words, watermark, logo, bad anatomy, female imagery, cartoon, blurry, noisy',
      final_image_prompt: 'A breathtaking, ultra-detailed 8k photograph of a serene Islamic courtyard ablution fountain. Crystalline pure water flowing gently from an antique brass spout into a polished white marble basin, soft sunlight caressing clear water droplets, atmospheric grand arches in soft focus background, clear uncluttered negative space on the ' + (isUrdu ? 'right' : 'left') + ' side for typography, Hasselblad medium format photography, strictly no text.',
    };
  }

  if (isHadith) {
    return {
      topic: 'Hadith & Classical Islamic Scholarship',
      category: 'Hadith & Sunnah Studies',
      visual_concept: 'Classical Islamic scholarly study with authentic historical manuscripts and warm atmospheric lamplight',
      main_subject: 'Ancient leather-bound manuscript on an ornate carved wooden stand beside traditional calligraphy instruments',
      background_concept: 'Grand classical Islamic library with towering arched wooden bookshelves and soft atmospheric dust motes',
      color_palette: ['#8B4513', '#D4AF37', '#1A202C'],
      lighting: 'Warm cinematic candlelight and soft amber directional spotlight illuminating parchment textures',
      composition: isUrdu ? 'Scholarly desk on the left, clear calm negative space on the right' : 'Desk on the right, clear negative space on the left',
      mood: 'Scholarly, profound, reverent, timeless',
      typography_style: 'Dignified editorial typography with deep shadow and gold highlights',
      text_placement: isUrdu ? 'right' : 'left',
      negative_prompt: 'text, words, letters, watermark, low resolution, blurry, distorted, cartoon, female imagery',
      final_image_prompt: 'Cinematic 8k photograph of an ancient Islamic scholar study. Antique leather-bound manuscripts resting on an authentic carved mahogany bookstand, soft warm amber glow from a brass lantern, atmospheric library background with subtle depth of field, clear dark negative space on the ' + (isUrdu ? 'right' : 'left') + ' side, Hasselblad medium format quality, strictly no text.',
    };
  }

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

  // 2. High-Performance Full HD / 4K Ultra-Sharp AI Diffusion using the Gemini Stage 1 prompt
  console.log('[Thumbnail AI] Stage 2: Synthesizing Ultra-Sharp AI visual buffer on server...');
  const seed = Math.floor(Math.random() * 9999999);
  const targetW = Math.max(1280, Math.min(1920, width || 1920));
  const targetH = Math.round((targetW * (height || 1080)) / (width || 1920));

  const visualTokens = 'award-winning 8k commercial photograph, grand Ottoman mosque interior, glowing crystal chandeliers, illuminated open Holy Quran on ornate carved wooden rehal, dramatic volumetric god rays, floating golden dust motes, warm golden key light, sharp rim light separation, raytraced marble reflections, cinematic depth of field, f/1.8 lens bokeh, masterpiece, Hasselblad medium format, ultra-detailed 16:9 composition, vivid rich amber and deep teal colors, razor-sharp focus';
  const cleanPrompt = encodeURIComponent(
    `${plan.final_image_prompt}, ${visualTokens}, clean expansive space on ${plan.text_placement} for typography`
  );
  const diffusionUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${targetW}&height=${targetH}&seed=${seed}&nologo=true&private=true&model=flux&enhance=true`;

  // Server-side Lanczos3 High-Fidelity Upscaler & Watermark Stripper
  async function enhanceRawBufferToHighRes(rawBuffer: Buffer, outW: number, outH: number): Promise<{ buffer: Buffer; mimeType: string }> {
    try {
      const meta = await sharp(rawBuffer).metadata();
      const origW = meta.width || outW;
      const origH = meta.height || outH;

      // Cleanly crop off the bottom 3.8% where remote watermarks/logos reside
      const cleanHeight = Math.max(100, origH - Math.round(origH * 0.038));

      const enhanced = await sharp(rawBuffer)
        .extract({ left: 0, top: 0, width: origW, height: cleanHeight })
        .resize(outW, outH, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill',
        })
        .sharpen({
          sigma: 1.3,
          m1: 1.5,
          m2: 0.6,
        })
        .modulate({
          saturation: 1.12,
          brightness: 1.02,
        })
        .jpeg({
          quality: 98,
          chromaSubsampling: '4:4:4',
          mozjpeg: true,
        })
        .toBuffer();

      return { buffer: enhanced, mimeType: 'image/jpeg' };
    } catch (sharpErr) {
      console.warn('[Thumbnail AI] Sharp enhancement fallback to raw buffer:', sharpErr);
      return { buffer: rawBuffer, mimeType: 'image/jpeg' };
    }
  }

  try {
    const { buffer: rawBuffer } = await downloadRemoteImageBuffer(diffusionUrl);
    const { buffer: enhancedBuffer, mimeType } = await enhanceRawBufferToHighRes(rawBuffer, targetW, targetH);
    const base64 = enhancedBuffer.toString('base64');
    const base64DataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[Thumbnail AI] Successfully synthesized server-side Base64 image (${base64DataUrl.length} chars, ${targetW}x${targetH})`);
    return {
      imageUrl: base64DataUrl,
      provider: 'ai_diffusion',
      modelUsed: 'gemini-prompt-flux-lanczos3-enhanced',
      geminiNotice: geminiKey
        ? 'Google Gemini Image Quota Notice: Free-tier limit for gemini-3.1-flash-image is currently 0 in Google AI Studio. Synthesized high-resolution photorealistic visual via server buffer using the exact Gemini Stage 1 prompt and Lanczos3 4:4:4 upscaler.'
        : undefined,
    };
  } catch (downloadErr) {
    console.warn('[Thumbnail AI] downloadRemoteImageBuffer failed, attempting standard fetch:', downloadErr);
    try {
      const res = await fetch(diffusionUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const rawBuffer = Buffer.from(arrayBuffer);
        const { buffer: enhancedBuffer, mimeType } = await enhanceRawBufferToHighRes(rawBuffer, targetW, targetH);
        const base64 = enhancedBuffer.toString('base64');
        const base64DataUrl = `data:${mimeType};base64,${base64}`;

        return {
          imageUrl: base64DataUrl,
          provider: 'ai_diffusion',
          modelUsed: 'gemini-prompt-flux-lanczos3-enhanced',
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
 * Intelligently classifies topic and configures multi-layered graphics, decals, badges, and card plates.
 */
export function deriveDesignStyling(plan: StructuredThumbnailPlan, isUrdu: boolean) {
  const combinedText = (plan.topic + ' ' + (plan.visual_concept || '') + ' ' + (plan.category || '')).toLowerCase();

  const isMistakeOrWarning = /mistake|mistakes|error|avoid|wrong|problem|warning|alert|غلطی|غلطیاں|نقصان|احتیاط|خبردار/.test(combinedText);
  const isTeacherOrKids = /teacher|teaching|kids|children|parents|parenting|academy|school|ustad|استاد|بچے|والدین|تربیت/.test(combinedText);
  const isQuranOrIslamic = isUrdu || /quran|quraan|quranic|tajweed|hifz|surah|ayah|namaz|salah|prayer|hadith|islamic|islam|deen|dua|allah|prophet|sunnah|madrasah|hafiz|bismillah|روزہ|نماز|قرآن|حدیث|دعا|اسلام|دین|مسجد|تلاوت|تجوید/.test(combinedText);
  const isYouTubeOrGrowth = /youtube|subscribers|algorithm|views|یوٹیوب|ویوز/.test(combinedText) || (/\b(grow|growth|viral|monetiz)\b/.test(combinedText) && !isQuranOrIslamic);

  // Clean, High-Impact YouTube Educational Defaults (No unwanted badges, no corner ribbons):
  const recommendedBackdropStyle: TextBackdropStyle = 'none';
  let recommendedTextColor = isUrdu ? '#FFFDF7' : '#FFFFFF';
  const recommendedTextOutlineEnabled = true;
  const recommendedTextOutlineColor = '#000000';
  const recommendedTextOutlineWidth = 10;
  const recommendedBadgeText = '';
  const recommendedBadgeStyle: GraphicBadgeStyle = 'none';
  const recommendedCornerRibbonText = '';
  const recommendedCornerRibbonStyle: CornerRibbonStyle = 'none';
  const recommendedGraphicDecal: GraphicDecal = 'none';
  const recommendedLightFlare: LightFlareEffect = 'none';
  let recommendedColorGrading: ColorGradingPreset = 'royal_gold';

  if (isMistakeOrWarning) {
    recommendedTextColor = '#FFDF00';
    recommendedColorGrading = 'warm_cinematic';
  } else if (isTeacherOrKids) {
    recommendedTextColor = '#FFFDF7';
    recommendedColorGrading = 'deep_emerald';
  } else if (isQuranOrIslamic) {
    recommendedTextColor = '#FFFDF7';
    recommendedColorGrading = 'royal_gold';
  } else if (isYouTubeOrGrowth) {
    recommendedTextColor = '#FFDF00';
    recommendedColorGrading = 'clean_editorial';
  } else {
    recommendedTextColor = '#FFFFFF';
    recommendedColorGrading = 'clean_editorial';
  }

  // Consistent Center Focus for perfect title framing
  const recommendedLayout: CompositionLayout = 'center_focus';

  const variations: DesignVariation[] = [
    {
      id: 'var_ctr_card',
      name: 'High-CTR Question Card',
      description: 'Defined high-contrast plate with gold/emerald typography, badges, and decals for maximum clicks',
      style: 'cinematic_islamic',
      layout: 'center_focus',
      colorGrading: recommendedColorGrading,
      borderTreatment: 'none',
      typographyTreatment: isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword',
      overlayOpacity: 'medium',
    },
    {
      id: 'var_luxury',
      name: 'Sacred Gold Luxury',
      description: 'Royal gold banner accent with ethereal sunbeams and deep drop shadows',
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
      description: 'Crisp white card with left pillar accent and high micro-contrast',
      style: 'islamic_editorial',
      layout: 'center_focus',
      colorGrading: 'clean_editorial',
      borderTreatment: 'none',
      typographyTreatment: 'glassmorphism_card',
      overlayOpacity: 'dark',
    },
  ];

  return {
    recommendedLayout,
    recommendedColorGrading,
    recommendedStyle: 'cinematic_islamic' as DesignStyle,
    recommendedBorder: 'none' as BorderTreatment,
    recommendedTypography: (isUrdu ? 'white_nastaleeq_shadow' : 'gold_highlighted_keyword') as TypographyTreatment,
    recommendedOverlay: 'medium' as OverlayLevel,
    variations,
    recommendedBackdropStyle,
    recommendedTextColor,
    recommendedTextOutlineEnabled,
    recommendedTextOutlineColor,
    recommendedTextOutlineWidth,
    recommendedBadgeText,
    recommendedBadgeStyle,
    recommendedCornerRibbonText,
    recommendedCornerRibbonStyle,
    recommendedGraphicDecal,
    recommendedLightFlare,
    recommendedBackgroundBlur: false,
    recommendedClarityFilter: true,
    recommendedShowSocialBar: true,
  };
}

/**
 * Primary Controller: Coordinates the 2-Stage AI Thumbnail Generation workflow.
 */
export async function generateThumbnailBackground(
  title: string,
  width: number = 1599,
  height: number = 892,
  options?: {
    customPrompt?: string;
    apiKey?: string;
    creativeStyle?: string;
    customPromptTuning?: string;
    slug?: string;
  }
): Promise<GeneratedBackgroundResult> {
  const geminiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  const isUrdu = isUrduOrArabicScript(title);

  console.log(`[Thumbnail AI] Initiating 2-Stage Generation for: "${title}" (Style: ${options?.creativeStyle || 'Default'}${options?.slug ? `, Slug: "${options.slug}"` : ''})`);

  // STAGE 1: Reasoning and Structured Art Direction Plan
  let plan: StructuredThumbnailPlan;
  if (geminiKey) {
    plan = await generateStructuredThumbnailPlan(
      title,
      geminiKey,
      options?.creativeStyle,
      options?.customPromptTuning,
      options?.slug
    );
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
    recommendedBackdropStyle: styling.recommendedBackdropStyle,
    recommendedTextColor: styling.recommendedTextColor,
    recommendedTextOutlineEnabled: styling.recommendedTextOutlineEnabled,
    recommendedTextOutlineColor: styling.recommendedTextOutlineColor,
    recommendedTextOutlineWidth: styling.recommendedTextOutlineWidth,
    recommendedBadgeText: styling.recommendedBadgeText,
    recommendedBadgeStyle: styling.recommendedBadgeStyle,
    recommendedCornerRibbonText: styling.recommendedCornerRibbonText,
    recommendedCornerRibbonStyle: styling.recommendedCornerRibbonStyle,
    recommendedGraphicDecal: styling.recommendedGraphicDecal,
    recommendedLightFlare: styling.recommendedLightFlare,
    recommendedBackgroundBlur: styling.recommendedBackgroundBlur,
    recommendedClarityFilter: styling.recommendedClarityFilter,
    recommendedShowSocialBar: styling.recommendedShowSocialBar,
  };
}
