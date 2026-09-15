export type ThumbnailTemplate =
  | 'islamic_premium'
  | 'minimal_quran'
  | 'educational'
  | 'blog_news'
  | 'islamic_luxury';

export type DesignStyle =
  | 'cinematic_islamic'
  | 'minimal_luxury'
  | 'islamic_editorial'
  | 'educational'
  | 'modern_islamic'
  | 'premium_blog';

export type CompositionLayout =
  | 'subject_left_text_right'
  | 'subject_right_text_left'
  | 'subject_bottom_text_top'
  | 'center_focus';

export type ColorGradingPreset =
  | 'warm_cinematic'
  | 'deep_emerald'
  | 'royal_gold'
  | 'moody_dusk'
  | 'clean_editorial';

export type TypographyTreatment =
  | 'gold_embossed_luxury'
  | 'white_nastaleeq_shadow'
  | 'gold_highlighted_keyword'
  | 'glassmorphism_card'
  | 'minimal_gold_divider';

export type BorderTreatment =
  | 'none'
  | 'thin_gold_frame'
  | 'corner_accents'
  | 'left_gold_bar'
  | 'double_filigree';

export type TitlePosition = 'top' | 'center' | 'bottom';
export type TextAlign = 'left' | 'center' | 'right';
export type LogoPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'none';
export type LogoSize = 'small' | 'medium' | 'large' | 'none';
export type OverlayLevel = 'light' | 'medium' | 'dark' | 'none';

export interface ThumbnailSizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  aspectRatio: string;
  recommended?: boolean;
}

export const THUMBNAIL_SIZE_PRESETS: ThumbnailSizePreset[] = [
  {
    id: 'wp_featured',
    name: 'WordPress Blog Featured (Standard)',
    width: 1599,
    height: 892,
    description: 'Optimal for WordPress blog post featured images & header banners',
    aspectRatio: '16:9 approx (1599x892)',
    recommended: true,
  },
  {
    id: 'og_social',
    name: 'Web & Social Card (OpenGraph)',
    width: 1200,
    height: 630,
    description: 'Universal standard for Google search snippet, WhatsApp & Facebook preview',
    aspectRatio: '1.91:1 (1200x630)',
  },
  {
    id: 'hd_landscape',
    name: 'Full HD Landscape (16:9)',
    width: 1280,
    height: 720,
    description: 'Standard 720p HD widescreen landscape thumbnail',
    aspectRatio: '16:9 (1280x720)',
  },
  {
    id: 'square_feed',
    name: 'Square Banner',
    width: 1080,
    height: 1080,
    description: 'Square format for blog sidebar or social feed banner',
    aspectRatio: '1:1 (1080x1080)',
  },
];

export interface DesignVariation {
  id: string;
  name: string;
  description: string;
  style: DesignStyle;
  layout: CompositionLayout;
  colorGrading: ColorGradingPreset;
  borderTreatment: BorderTreatment;
  typographyTreatment: TypographyTreatment;
  overlayOpacity: OverlayLevel;
}

export interface QualityCheckReport {
  exactTitlePreserved: boolean;
  fontLoaded: boolean;
  isUrdu: boolean;
  contrastPassed: boolean;
  logoSafe: boolean;
  noFemaleImageryEnforced: boolean;
  // 12-Point Professional Inspection Criteria
  photorealisticVisual?: boolean;
  zeroAiText?: boolean;
  mobileReadability?: boolean;
  readabilityBackdrop?: boolean;
  safeMarginsEnforced?: boolean;
  photoshopShadowOutline?: boolean;
  aspectRatioValid?: boolean;
  colorHarmony?: boolean;
  cleanExport?: boolean;
  score: number; // 0 - 100
  details: string[];
}

export interface BrandKit {
  id: string;
  user_id: string;
  brand_name: string;
  main_logo_url: string | null;
  secondary_logo_url: string | null;
  icon_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  default_logo_position: LogoPosition;
  default_logo_size: LogoSize;
  default_template: ThumbnailTemplate;
  watermark_enabled: boolean;
  watermark_url: string | null;
  created_at: string;
  updated_at: string;
}

export type TextBackdropStyle =
  | 'none'
  | 'dark_pill'
  | 'gold_ribbon'
  | 'glass_card'
  | 'contrast_bar'
  | 'light_grey_card'
  | 'white_card';

export type TextShadowStyle =
  | 'none'
  | 'soft'
  | 'deep'
  | '3d_pop';

export type CreativeStyleCategory =
  | 'viral_youtube'
  | 'islamic_luxury'
  | 'tech_ai'
  | 'business_wealth'
  | 'podcast_studio'
  | 'minimal_quran';

export interface ThumbnailProject {
  id: string;
  user_id: string;
  title: string;
  width: number;
  height: number;
  template: ThumbnailTemplate;
  design_style?: DesignStyle;
  composition_layout?: CompositionLayout;
  background_image_url: string | null;
  final_thumbnail_url: string | null;
  image_prompt?: string | null;
  visual_concept?: string | null;
  logo_url?: string | null;
  logo_position: LogoPosition;
  logo_size: LogoSize;
  title_position: TitlePosition;
  text_align: TextAlign;
  overlay_opacity: OverlayLevel;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type GraphicBadgeStyle =
  | 'none'
  | 'gold_pill'
  | 'emerald_pill'
  | 'neon_pill'
  | 'crimson_badge';

export type CornerRibbonStyle =
  | 'none'
  | 'gold_slash'
  | 'emerald_slash'
  | 'crimson_slash'
  | 'cyber_slash';

export type GraphicDecal =
  | 'none'
  | 'islamic_star'
  | 'viral_arrow'
  | 'cyber_hexagon'
  | 'verified_shield';

export type LightFlareEffect =
  | 'none'
  | 'golden_sunbeam'
  | 'cyber_cyan_flare'
  | 'emerald_aurora'
  | 'sunset_flare';

export interface ThumbnailConfig {
  title: string;
  width: number;
  height: number;
  template?: ThumbnailTemplate;
  designStyle?: DesignStyle;
  compositionLayout?: CompositionLayout;
  colorGrading?: ColorGradingPreset;
  borderTreatment?: BorderTreatment;
  typographyTreatment?: TypographyTreatment;
  backgroundImageUrl: string | null;
  logoUrl: string | null;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  titlePosition: TitlePosition;
  textAlign: TextAlign;
  overlayOpacity: OverlayLevel;
  headingFont?: string;
  primaryColor?: string;
  accentColor?: string;
  brandName?: string;
  showTitleOverlay?: boolean;
  // Advanced Typography & Outline properties (Backward-compatible)
  textColor?: string;
  textOutlineEnabled?: boolean;
  textOutlineColor?: string;
  textOutlineWidth?: number;
  textGlowEnabled?: boolean;
  textGlowColor?: string;
  textShadowStyle?: TextShadowStyle;
  textBackdropStyle?: TextBackdropStyle;
  fontSizeMultiplier?: number;
  creativeStyle?: CreativeStyleCategory;
  customPromptTuning?: string;
  // 4K Graphics, Decals, Badges & Multi-layer Lighting
  badgeText?: string;
  badgeStyle?: GraphicBadgeStyle;
  cornerRibbonText?: string;
  cornerRibbonStyle?: CornerRibbonStyle;
  graphicDecal?: GraphicDecal;
  lightFlare?: LightFlareEffect;
  clarityFilter?: boolean;
  // Background depth blur & bottom social bar
  backgroundBlur?: boolean;
  showSocialBar?: boolean;
  socialHandle?: string;
}

export interface ProThumbnailTheme {
  id: string;
  name: string;
  badge: string;
  description: string;
  textColor: string;
  textOutlineEnabled: boolean;
  textOutlineColor: string;
  textOutlineWidth: number;
  textGlowEnabled: boolean;
  textGlowColor: string;
  textShadowStyle: TextShadowStyle;
  textBackdropStyle: TextBackdropStyle;
  borderTreatment: BorderTreatment;
  colorGrading: ColorGradingPreset;
  compositionLayout: CompositionLayout;
  titlePosition: TitlePosition;
  textAlign: TextAlign;
}

export const PRO_THUMBNAIL_THEMES: ProThumbnailTheme[] = [
  {
    id: 'luxury_islamic_3d',
    name: 'Ultra-Luxury 3D Islamic (الٹرا لگژری)',
    badge: '3D Gold',
    description: '3D Embossed Royal Gold & Diamond Chrome with golden energy ribbons, star sparkles, and grand mosque atmosphere',
    textColor: '#FFDF00',
    textOutlineEnabled: true,
    textOutlineColor: '#2A1800',
    textOutlineWidth: 9,
    textGlowEnabled: true,
    textGlowColor: '#FFD700',
    textShadowStyle: '3d_pop',
    textBackdropStyle: 'none',
    borderTreatment: 'none',
    colorGrading: 'deep_emerald',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'nur_royal_gold',
    name: 'Nūr Royal Gold',
    badge: 'Signature',
    description: 'Crisp ivory title with deep charcoal outline, soft gold glow, and corner accents',
    textColor: '#FFFDF7',
    textOutlineEnabled: true,
    textOutlineColor: '#071A14',
    textOutlineWidth: 8,
    textGlowEnabled: true,
    textGlowColor: '#C9A227',
    textShadowStyle: '3d_pop',
    textBackdropStyle: 'none',
    borderTreatment: 'corner_accents',
    colorGrading: 'deep_emerald',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'youtube_viral_impact',
    name: 'YouTube Viral High-CTR',
    badge: 'Popular',
    description: 'Electric gold/yellow with punchy midnight black stroke for maximum thumbnail clickability',
    textColor: '#FFDF00',
    textOutlineEnabled: true,
    textOutlineColor: '#000000',
    textOutlineWidth: 12,
    textGlowEnabled: true,
    textGlowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowStyle: '3d_pop',
    textBackdropStyle: 'dark_pill',
    borderTreatment: 'none',
    colorGrading: 'clean_editorial',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'cyber_neon_glow',
    name: 'Cyber Tech & AI',
    badge: 'Futuristic',
    description: 'Brilliant white text with electric cyan outline glow on dark cinematic canvas',
    textColor: '#FFFFFF',
    textOutlineEnabled: true,
    textOutlineColor: '#081326',
    textOutlineWidth: 8,
    textGlowEnabled: true,
    textGlowColor: '#00F0FF',
    textShadowStyle: 'deep',
    textBackdropStyle: 'glass_card',
    borderTreatment: 'none',
    colorGrading: 'moody_dusk',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'sacred_urdu_nastaleeq',
    name: 'Sacred Nastaleeq Urdu',
    badge: 'Islamic',
    description: 'Pure calligraphic Jameel Noori Nastaleeq with deep shadow and delicate emerald stroke',
    textColor: '#FFFDF5',
    textOutlineEnabled: true,
    textOutlineColor: '#0B2E21',
    textOutlineWidth: 7,
    textGlowEnabled: true,
    textGlowColor: '#D4AF37',
    textShadowStyle: 'deep',
    textBackdropStyle: 'gold_ribbon',
    borderTreatment: 'corner_accents',
    colorGrading: 'royal_gold',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'islamic_ctr_card',
    name: 'High-CTR Islamic Question Card',
    badge: 'High-CTR',
    description: 'Clean light backdrop plate, golden-yellow Nastaleeq typography, and prominent outline for maximum mobile CTR',
    textColor: '#D97706',
    textOutlineEnabled: true,
    textOutlineColor: '#FFFFFF',
    textOutlineWidth: 10,
    textGlowEnabled: true,
    textGlowColor: 'rgba(217, 119, 6, 0.4)',
    textShadowStyle: '3d_pop',
    textBackdropStyle: 'light_grey_card',
    borderTreatment: 'none',
    colorGrading: 'warm_cinematic',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
  {
    id: 'clean_editorial_luxury',
    name: 'Editorial Minimalist',
    badge: 'Clean',
    description: 'High-contrast white lettering with subtle shadow and translucent dark contrast bar',
    textColor: '#FFFFFF',
    textOutlineEnabled: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 0,
    textGlowEnabled: false,
    textGlowColor: 'transparent',
    textShadowStyle: 'soft',
    textBackdropStyle: 'contrast_bar',
    borderTreatment: 'none',
    colorGrading: 'clean_editorial',
    compositionLayout: 'center_focus',
    titlePosition: 'center',
    textAlign: 'center',
  },
];

export interface StructuredThumbnailPlan {
  topic: string;
  category: string;
  visual_concept: string;
  main_subject: string;
  background_concept: string;
  color_palette: string[];
  lighting: string;
  composition: string;
  mood: string;
  typography_style: string;
  text_placement: 'left' | 'right' | 'bottom' | 'center';
  negative_prompt: string;
  final_image_prompt: string;
}
