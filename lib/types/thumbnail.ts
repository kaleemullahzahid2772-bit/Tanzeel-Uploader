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
export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';
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
}

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
