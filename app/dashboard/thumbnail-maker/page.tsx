'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import {
  THUMBNAIL_SIZE_PRESETS,
  PRO_THUMBNAIL_THEMES,
  ProThumbnailTheme,
  CreativeStyleCategory,
  GraphicBadgeStyle,
  CornerRibbonStyle,
  GraphicDecal,
  LightFlareEffect,
  TextBackdropStyle,
  TextShadowStyle,
  ThumbnailTemplate,
  DesignStyle,
  CompositionLayout,
  ColorGradingPreset,
  BorderTreatment,
  TypographyTreatment,
  DesignVariation,
  TitlePosition,
  TextAlign,
  LogoPosition,
  LogoSize,
  OverlayLevel,
  ThumbnailConfig,
  ThumbnailProject,
  BrandKit,
  QualityCheckReport,
  StructuredThumbnailPlan,
} from '@/lib/types/thumbnail';
import {
  renderThumbnailCanvas,
  exportThumbnailBlob,
  exportThumbnailDataUrl,
  isUrduScript,
  evaluateThumbnailQuality,
  ExportResolutionPreset,
  ExportImageFormat,
} from '@/lib/thumbnail/canvas-renderer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  Download,
  RefreshCw,
  History,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookmarkPlus,
  Trash2,
  ShieldCheck,
  Maximize2,
  ArrowRight,
  Layers,
  Palette,
  Check,
  Wand2,
  Flame,
  Sun,
  Eye,
  Globe,
  UploadCloud,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  WordPressClientSettings,
  WordPressPostMatch,
  WordPressUploadResult,
} from '@/lib/types/wordpress';

export default function ThumbnailMakerPage() {
  const { user } = useAuth();

  // Tab State: 'editor' | 'history'
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  // Core Inputs
  const [title, setTitle] = useState('How to Start an Online Business in Pakistan');
  const [slug, setSlug] = useState('how-to-start-an-online-business-in-pakistan');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('hd_landscape');
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [template, setTemplate] = useState<ThumbnailTemplate>('islamic_premium');
  const [showTitleOverlay, setShowTitleOverlay] = useState(true);

  // Advanced Art Direction & Photoshop Compositing State
  const [designStyle, setDesignStyle] = useState<DesignStyle>('cinematic_islamic');
  const [compositionLayout, setCompositionLayout] = useState<CompositionLayout>('center_focus');
  const [colorGrading, setColorGrading] = useState<ColorGradingPreset>('deep_emerald');
  const [borderTreatment, setBorderTreatment] = useState<BorderTreatment>('none');
  const [typographyTreatment, setTypographyTreatment] = useState<TypographyTreatment>('white_nastaleeq_shadow');

  // Visual & Background State
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [visualConcept, setVisualConcept] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<StructuredThumbnailPlan | null>(null);
  const [geminiNotice, setGeminiNotice] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<'idle' | 'analyzing' | 'concept' | 'generating' | 'complete'>('idle');

  // Manual Adjustments
  const [titlePosition, setTitlePosition] = useState<TitlePosition>('center');
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [overlayOpacity, setOverlayOpacity] = useState<OverlayLevel>('medium');
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-right');
  const [logoSize, setLogoSize] = useState<LogoSize>('medium');

  // Advanced Typography & Graphic Studio State
  const [textColor, setTextColor] = useState('#FFDF00');
  const [textOutlineEnabled, setTextOutlineEnabled] = useState(true);
  const [textOutlineColor, setTextOutlineColor] = useState('#2A1800');
  const [textOutlineWidth, setTextOutlineWidth] = useState(9);
  const [textGlowEnabled, setTextGlowEnabled] = useState(true);
  const [textGlowColor, setTextGlowColor] = useState('#FFD700');
  const [textShadowStyle, setTextShadowStyle] = useState<TextShadowStyle>('3d_pop');
  const [textBackdropStyle, setTextBackdropStyle] = useState<TextBackdropStyle>('none');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [creativeStyle, setCreativeStyle] = useState<CreativeStyleCategory>('viral_youtube');
  const [customPromptTuning, setCustomPromptTuning] = useState('');
  const [activeThemeId, setActiveThemeId] = useState<string>('luxury_islamic_3d');

  // Graphic Badges, Decals & Cinematic Flares State
  const [badgeText, setBadgeText] = useState('');
  const [badgeStyle, setBadgeStyle] = useState<GraphicBadgeStyle>('none');
  const [cornerRibbonText, setCornerRibbonText] = useState('');
  const [cornerRibbonStyle, setCornerRibbonStyle] = useState<CornerRibbonStyle>('none');
  const [graphicDecal, setGraphicDecal] = useState<GraphicDecal>('none');
  const [lightFlare, setLightFlare] = useState<LightFlareEffect>('none');
  const [clarityFilter, setClarityFilter] = useState(true);

  // Background Depth Blur & Social Bar State
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [showSocialBar, setShowSocialBar] = useState(true);
  const [socialHandle, setSocialHandle] = useState('tanzeel.org');

  // Export Resolution & Format Options (Defaults to exact user-selected dimensions)
  const [exportResolution, setExportResolution] = useState<ExportResolutionPreset>('original');
  const [exportFormat, setExportFormat] = useState<ExportImageFormat>('png');

  // 1-Click Pro Theme Selector
  const handleSelectTheme = (theme: ProThumbnailTheme) => {
    setActiveThemeId(theme.id);
    setTextColor(theme.textColor);
    setTextOutlineEnabled(theme.textOutlineEnabled);
    setTextOutlineColor(theme.textOutlineColor);
    setTextOutlineWidth(theme.textOutlineWidth);
    setTextGlowEnabled(theme.textGlowEnabled);
    setTextGlowColor(theme.textGlowColor);
    setTextShadowStyle(theme.textShadowStyle);
    setTextBackdropStyle(theme.textBackdropStyle);
    setBorderTreatment(theme.borderTreatment);
    setColorGrading(theme.colorGrading);
    setCompositionLayout(theme.compositionLayout);
    setTitlePosition(theme.titlePosition);
    setTextAlign(theme.textAlign);
    setStatusMessage(`Applied 1-Click Pro Theme: "${theme.name}"`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Variations & Quality
  const [variations, setVariations] = useState<DesignVariation[]>([]);
  const [activeVariationId, setActiveVariationId] = useState<string>('var_cinematic');
  const [qualityReport, setQualityReport] = useState<QualityCheckReport | null>(null);

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  // Processing States
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WordPress Integration State
  const [wpSettings, setWpSettings] = useState<WordPressClientSettings | null>(null);
  const [wpLoadingSettings, setWpLoadingSettings] = useState(false);
  const [wpModalOpen, setWpModalOpen] = useState(false);
  const [wpStage, setWpStage] = useState<
    | 'idle'
    | 'generating'
    | 'rendering'
    | 'connecting'
    | 'finding_post'
    | 'confirm_replace'
    | 'confirm_not_found'
    | 'uploading'
    | 'setting_featured'
    | 'complete'
    | 'error'
  >('idle');
  const [wpPostMatch, setWpPostMatch] = useState<WordPressPostMatch | null>(null);
  const [wpUploadResult, setWpUploadResult] = useState<WordPressUploadResult | null>(null);
  const [wpError, setWpError] = useState<string | null>(null);

  // History State
  const [projectsHistory, setProjectsHistory] = useState<ThumbnailProject[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Quick Direct Logo Upload Handler (Instantly persists and renders on canvas)
  const handleQuickLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let finalUrl = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'main');

      const uploadRes = await fetch('/api/brand-kit/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        if (uploadJson.url) {
          finalUrl = uploadJson.url;
        }
      }
    } catch (uploadErr) {
      console.warn('API logo upload fallback:', uploadErr);
    }

    if (!finalUrl) {
      const reader = new FileReader();
      finalUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const updatedKit: BrandKit = {
      ...(brandKit || {
        id: 'local_kit',
        user_id: user?.id || '00000000-0000-0000-0000-000000000001',
        brand_name: 'Al Tanzeel Quran Academy',
        primary_color: '#0F4C3A',
        secondary_color: '#083B2E',
        accent_color: '#C9A227',
        background_color: '#F8F4E8',
        text_color: '#FFFDF7',
        heading_font: 'Playfair Display',
        body_font: 'Inter',
        default_logo_position: 'top-right',
        default_logo_size: 'medium',
        default_template: 'islamic_premium',
        watermark_enabled: false,
        watermark_url: null,
        secondary_logo_url: null,
        icon_logo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      main_logo_url: finalUrl,
      default_logo_position: 'top-right',
      default_logo_size: 'medium',
      updated_at: new Date().toISOString(),
    };

    setBrandKit(updatedKit);
    setLogoPosition('top-right');
    setLogoSize('medium');

    try {
      localStorage.setItem('nur_brand_kit', JSON.stringify(updatedKit));
      fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKit),
      }).catch((err) => console.warn('Quick logo save error:', err));
    } catch (err) {
      console.warn('Local save warning:', err);
    }
  };

  const isUrdu = isUrduScript(title);

  // Calculate active dimensions
  const activeWidth =
    selectedPresetId === 'custom'
      ? Math.max(200, Math.min(4000, Number(customWidth) || 1599))
      : THUMBNAIL_SIZE_PRESETS.find((p) => p.id === selectedPresetId)?.width || 1599;

  const activeHeight =
    selectedPresetId === 'custom'
      ? Math.max(200, Math.min(4000, Number(customHeight) || 892))
      : THUMBNAIL_SIZE_PRESETS.find((p) => p.id === selectedPresetId)?.height || 892;

  // Helper to slugify title
  const generateSlugFromTitle = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF]+/g, (match) => match) // preserve urdu/arabic if needed
      .replace(/[^\w\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManuallyEdited) {
      const generated = generateSlugFromTitle(newTitle);
      setSlug(generated || 'thumbnail-post');
    }
  };

  // Load WordPress Client Settings
  const loadWordPressClientSettings = async () => {
    setWpLoadingSettings(true);
    try {
      const res = await fetch('/api/wordpress/settings');
      if (res.ok) {
        const json = await res.json();
        const cfg = json.data || json.settings;
        if (cfg) {
          setWpSettings(cfg);
        }
      }
    } catch (err) {
      console.warn('Could not load WordPress settings:', err);
    } finally {
      setWpLoadingSettings(false);
    }
  };

  // Load Brand Kit & History on Mount
  useEffect(() => {
    async function loadBrandKit() {
      try {
        let localKit: any = null;
        const cached = localStorage.getItem('nur_brand_kit');
        if (cached) {
          try {
            localKit = JSON.parse(cached);
            setBrandKit(localKit);
            const cachedPos = localKit.default_logo_position;
            if (cachedPos === 'top-right' || cachedPos === 'top-center' || cachedPos === 'top-left') {
              setLogoPosition(cachedPos);
            } else {
              setLogoPosition('top-right');
            }
            if (localKit.default_logo_size) setLogoSize(localKit.default_logo_size);
            if (localKit.default_template) setTemplate(localKit.default_template);
          } catch (e) {
            console.warn('Error reading local brand kit:', e);
          }
        }

        const res = await fetch('/api/brand-kit');
        if (res.ok) {
          const json = await res.json();
          if (json.brandKit) {
            // MERGE: Keep logo from localKit if API returned null or fallback
            const mergedKit: BrandKit = {
              ...json.brandKit,
              main_logo_url: json.brandKit.main_logo_url || localKit?.main_logo_url || null,
              secondary_logo_url: json.brandKit.secondary_logo_url || localKit?.secondary_logo_url || null,
              icon_logo_url: json.brandKit.icon_logo_url || localKit?.icon_logo_url || null,
            };
            setBrandKit(mergedKit);
            const apiPos = mergedKit.default_logo_position;
            if (apiPos === 'top-right' || apiPos === 'top-center' || apiPos === 'top-left') {
              setLogoPosition(apiPos);
            } else {
              setLogoPosition('top-right');
            }
            if (mergedKit.default_logo_size) setLogoSize(mergedKit.default_logo_size);
            if (mergedKit.default_template) setTemplate(mergedKit.default_template);
          }
        }
      } catch (err) {
        console.warn('Could not load Brand Kit:', err);
      }
    }

    loadBrandKit();
    loadHistory();
    loadWordPressClientSettings();
  }, []);

  // Load Thumbnail History
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const stored = localStorage.getItem('nur_thumbnail_history');
      if (stored) {
        setProjectsHistory(JSON.parse(stored));
      }

      const res = await fetch('/api/thumbnail/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          setProjectsHistory(data.projects);
          localStorage.setItem('nur_thumbnail_history', JSON.stringify(data.projects));
        }
      }
    } catch (err) {
      console.warn('Could not load thumbnail history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Re-render Canvas whenever state changes
  const redrawCanvas = useCallback(async () => {
    if (!canvasRef.current) return;

    const config: ThumbnailConfig = {
      title: title.trim() || 'Enter Your Blog Post Title',
      width: activeWidth,
      height: activeHeight,
      template,
      designStyle,
      compositionLayout,
      colorGrading,
      borderTreatment,
      typographyTreatment,
      backgroundImageUrl,
      logoUrl: brandKit?.main_logo_url || null,
      logoPosition,
      logoSize,
      titlePosition,
      textAlign: isUrdu ? 'center' : textAlign,
      overlayOpacity,
      headingFont: isUrdu ? 'Jameel Noori Nastaleeq' : (brandKit?.heading_font || 'Playfair Display'),
      primaryColor: brandKit?.primary_color || '#0F4C3A',
      accentColor: brandKit?.accent_color || '#C9A227',
      brandName: brandKit?.brand_name,
      showTitleOverlay,
      textColor,
      textOutlineEnabled,
      textOutlineColor,
      textOutlineWidth,
      textGlowEnabled,
      textGlowColor,
      textShadowStyle,
      textBackdropStyle,
      fontSizeMultiplier,
      badgeText: badgeText.trim() || undefined,
      badgeStyle,
      cornerRibbonText: cornerRibbonText.trim() || undefined,
      cornerRibbonStyle,
      graphicDecal,
      lightFlare,
      clarityFilter,
      backgroundBlur,
      showSocialBar,
      socialHandle,
    };

    try {
      await renderThumbnailCanvas(config, canvasRef.current);
      const report = evaluateThumbnailQuality(title, activeWidth, activeHeight, config);
      setQualityReport(report);
    } catch (err) {
      console.warn('Canvas rendering error:', err);
    }
  }, [
    title,
    activeWidth,
    activeHeight,
    template,
    designStyle,
    compositionLayout,
    colorGrading,
    borderTreatment,
    typographyTreatment,
    backgroundImageUrl,
    brandKit,
    logoPosition,
    logoSize,
    titlePosition,
    textAlign,
    overlayOpacity,
    isUrdu,
    showTitleOverlay,
    textColor,
    textOutlineEnabled,
    textOutlineColor,
    textOutlineWidth,
    textGlowEnabled,
    textGlowColor,
    textShadowStyle,
    textBackdropStyle,
    fontSizeMultiplier,
    badgeText,
    badgeStyle,
    cornerRibbonText,
    cornerRibbonStyle,
    graphicDecal,
    lightFlare,
    clarityFilter,
    backgroundBlur,
    showSocialBar,
    socialHandle,
  ]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Primary Generation Handler with Art Direction
  const handleGenerate = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter your blog post title first.');
      return;
    }

    setGenerating(true);
    setGenerationStage('analyzing');
    setErrorMessage(null);
    setGeminiNotice(null);
    setStatusMessage('Analyzing title semantics with Google Gemini reasoning model...');

    // Progress stage timer updates for smooth visual UX
    const t1 = setTimeout(() => {
      setGenerationStage('concept');
      setStatusMessage('Creating visual concept, lighting, and composition plan...');
    }, 1200);

    const t2 = setTimeout(() => {
      setGenerationStage('generating');
      setStatusMessage('Generating high-resolution AI thumbnail visual...');
    }, 2800);

    try {
      const res = await fetch('/api/ai/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: (slug.trim() || generateSlugFromTitle(title)).toLowerCase(),
          width: activeWidth,
          height: activeHeight,
          creativeStyle,
          customPromptTuning: customPromptTuning.trim() || undefined,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate visual background.');
      }

      const json = await res.json();
      const result = json.data;

      setBackgroundImageUrl(result.imageUrl);
      setVisualConcept(result.concept);
      setAiProvider(result.provider);
      setModelUsed(result.modelUsed);
      if (result.geminiNotice) setGeminiNotice(result.geminiNotice);
      if (result.plan) setAiPlan(result.plan);

      if (result.recommendedLayout) setCompositionLayout(result.recommendedLayout);
      if (result.recommendedColorGrading) setColorGrading(result.recommendedColorGrading);
      if (result.recommendedBorder) setBorderTreatment(result.recommendedBorder);
      if (result.recommendedTypography) setTypographyTreatment(result.recommendedTypography);
      if (result.recommendedStyle) setDesignStyle(result.recommendedStyle);
      if (result.recommendedOverlay) setOverlayOpacity(result.recommendedOverlay);

      // Clean, High-Impact Compositing (No unwanted badges, ribbons, or obstructive cards)
      setTextBackdropStyle('none');
      if (result.recommendedTextColor) setTextColor(result.recommendedTextColor);
      if (result.recommendedTextOutlineEnabled !== undefined) setTextOutlineEnabled(result.recommendedTextOutlineEnabled);
      if (result.recommendedTextOutlineColor) setTextOutlineColor(result.recommendedTextOutlineColor);
      if (result.recommendedTextOutlineWidth !== undefined) setTextOutlineWidth(result.recommendedTextOutlineWidth);
      setBadgeText('');
      setBadgeStyle('none');
      setCornerRibbonText('');
      setCornerRibbonStyle('none');
      setGraphicDecal('none');
      setLightFlare('none');
      setBorderTreatment('none');
      if (result.recommendedBackgroundBlur !== undefined) setBackgroundBlur(result.recommendedBackgroundBlur);
      if (result.recommendedClarityFilter !== undefined) setClarityFilter(result.recommendedClarityFilter);
      if (result.recommendedShowSocialBar !== undefined) setShowSocialBar(result.recommendedShowSocialBar);

      if (result.variations && result.variations.length > 0) {
        setVariations(result.variations);
        setActiveVariationId(result.variations[0].id);
      }

      setGenerationStage('complete');
      setStatusMessage('Real AI Graphic Thumbnail generated successfully!');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: unknown) {
      clearTimeout(t1);
      clearTimeout(t2);
      setGenerationStage('idle');
      console.error('Thumbnail generation error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Switch Design Variations (Design 1, Design 2, Design 3)
  const handleSelectVariation = (v: DesignVariation) => {
    setActiveVariationId(v.id);
    setDesignStyle(v.style);
    setCompositionLayout(v.layout);
    setColorGrading(v.colorGrading);
    setBorderTreatment(v.borderTreatment);
    setTypographyTreatment(v.typographyTreatment);
    setOverlayOpacity(v.overlayOpacity);
    setStatusMessage(`Switched to "${v.name}" style`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Regenerate Visual Background Only
  const handleRegenerateBackground = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    setStatusMessage('Regenerating new visual composition (Title and typography remain 100% untouched)...');

    try {
      const res = await fetch('/api/ai/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          width: activeWidth,
          height: activeHeight,
          customPrompt: visualConcept ? `${visualConcept}, alternate photographic composition` : undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setBackgroundImageUrl(json.data.imageUrl);
        setAiProvider(json.data.provider);
        setStatusMessage('New visual applied! Exact title & branding intact.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // High-Resolution Download Handler
  const handleDownload = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a title before downloading.');
      return;
    }

    setDownloading(true);
    try {
      const config: ThumbnailConfig = {
        title: title.trim(),
        width: activeWidth,
        height: activeHeight,
        template,
        designStyle,
        compositionLayout,
        colorGrading,
        borderTreatment,
        typographyTreatment,
        backgroundImageUrl,
        logoUrl: brandKit?.main_logo_url || null,
        logoPosition,
        logoSize,
        titlePosition,
        textAlign: isUrdu ? 'center' : textAlign,
        overlayOpacity,
        headingFont: isUrdu ? 'Jameel Noori Nastaleeq' : (brandKit?.heading_font || 'Playfair Display'),
        primaryColor: brandKit?.primary_color || '#0F4C3A',
        accentColor: brandKit?.accent_color || '#C9A227',
        brandName: brandKit?.brand_name,
        showTitleOverlay,
        textColor,
        textOutlineEnabled,
        textOutlineColor,
        textOutlineWidth,
        textGlowEnabled,
        textGlowColor,
        textShadowStyle,
        textBackdropStyle,
        fontSizeMultiplier,
        badgeText: badgeText.trim() || undefined,
        badgeStyle,
        cornerRibbonText: cornerRibbonText.trim() || undefined,
        cornerRibbonStyle,
        graphicDecal,
        lightFlare,
        clarityFilter,
        backgroundBlur,
        showSocialBar,
        socialHandle,
      };

      const blob = await exportThumbnailBlob(config, exportFormat, exportResolution);
      const url = URL.createObjectURL(blob);
      const cleanSlug = title
        .replace(/[\u0600-\u06FF\s]+/g, '_')
        .replace(/[^a-zA-Z0-9_-]+/g, '')
        .slice(0, 30) || 'thumbnail';

      const ext = exportFormat === 'jpeg' ? 'jpg' : 'png';
      const resSuffix = exportResolution === 'original'
        ? `${activeWidth}x${activeHeight}`
        : exportResolution === '2x'
        ? `${activeWidth * 2}x${activeHeight * 2}`
        : exportResolution.toUpperCase();
      const filename = `thumbnail_${cleanSlug}_${resSuffix}.${ext}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const downloadDimLabel = exportResolution === 'original'
        ? `${activeWidth}×${activeHeight}px`
        : exportResolution === '2x'
        ? `${activeWidth * 2}×${activeHeight * 2}px`
        : exportResolution.toUpperCase();

      setStatusMessage(`Downloaded "${filename}" (${downloadDimLabel} • ${exportFormat.toUpperCase()})`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Download failed:', err);
      setErrorMessage('Failed to export thumbnail. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Build ThumbnailConfig object for current settings
  const getCurrentThumbnailConfig = (): ThumbnailConfig => ({
    title: title.trim(),
    width: activeWidth,
    height: activeHeight,
    template,
    designStyle,
    compositionLayout,
    colorGrading,
    borderTreatment,
    typographyTreatment,
    backgroundImageUrl,
    logoUrl: brandKit?.main_logo_url || null,
    logoPosition,
    logoSize,
    titlePosition,
    textAlign: isUrdu ? 'center' : textAlign,
    overlayOpacity,
    headingFont: isUrdu ? 'Jameel Noori Nastaleeq' : (brandKit?.heading_font || 'Playfair Display'),
    primaryColor: brandKit?.primary_color || '#0F4C3A',
    accentColor: brandKit?.accent_color || '#C9A227',
    brandName: brandKit?.brand_name,
    showTitleOverlay,
    textColor,
    textOutlineEnabled,
    textOutlineColor,
    textOutlineWidth,
    textGlowEnabled,
    textGlowColor,
    textShadowStyle,
    textBackdropStyle,
    fontSizeMultiplier,
    badgeText: badgeText.trim() || undefined,
    badgeStyle,
    cornerRibbonText: cornerRibbonText.trim() || undefined,
    cornerRibbonStyle,
    graphicDecal,
    lightFlare,
    clarityFilter,
    backgroundBlur,
    showSocialBar,
    socialHandle,
  });

  // WordPress Auto Upload Flow
  const handleUploadToWordPress = async (options?: { forceGenerateFirst?: boolean; replaceExisting?: boolean }) => {
    const activeSlug = (slug.trim() || generateSlugFromTitle(title)).toLowerCase();
    if (!title.trim()) {
      setErrorMessage('Please enter a blog title first.');
      return;
    }
    if (!activeSlug) {
      setErrorMessage('Please provide a valid slug for WordPress.');
      return;
    }

    setWpModalOpen(true);
    setWpError(null);
    setWpUploadResult(null);

    try {
      // Step 1: If requested, generate AI image first
      if (options?.forceGenerateFirst || (!backgroundImageUrl && !options?.replaceExisting)) {
        setWpStage('generating');
        const res = await fetch('/api/ai/generate-thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            width: activeWidth,
            height: activeHeight,
            creativeStyle,
            customPromptTuning: customPromptTuning.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to generate thumbnail image.');
        }

        const json = await res.json();
        const result = json.data;
        setBackgroundImageUrl(result.imageUrl);
        setVisualConcept(result.concept);
        setAiProvider(result.provider);
        setModelUsed(result.modelUsed);
        if (result.geminiNotice) setGeminiNotice(result.geminiNotice);
        if (result.plan) setAiPlan(result.plan);
      }

      // Step 2: Render full canvas image to Base64
      setWpStage('rendering');
      const currentConfig = getCurrentThumbnailConfig();
      const imageBase64 = await exportThumbnailDataUrl(currentConfig, exportFormat, exportResolution);

      // Step 3: Check/Find WordPress Post by Slug (unless user already confirmed replace or upload only)
      if (!options?.replaceExisting) {
        setWpStage('connecting');
        setWpStage('finding_post');
        const findRes = await fetch('/api/wordpress/find-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: activeSlug }),
        });

        const matchData: WordPressPostMatch = await findRes.json();
        setWpPostMatch(matchData);

        // Case A: Post not found
        if (!matchData.found) {
          setWpStage('confirm_not_found');
          return;
        }

        // Case B: Post already has featured image
        if (matchData.has_existing_featured_image) {
          setWpStage('confirm_replace');
          return;
        }
      }

      // Step 4 & 5: Upload Media & Set Featured Image
      await executeWordPressUpload(imageBase64, activeSlug, wpPostMatch?.post_id);
    } catch (err: unknown) {
      console.error('WordPress upload error:', err);
      const msg = err instanceof Error ? err.message : 'WordPress auto-upload failed';
      setWpError(msg);
      setWpStage('error');
    }
  };

  // Helper to execute media upload and assign featured image
  const executeWordPressUpload = async (imageBase64: string, activeSlug: string, postId?: number) => {
    try {
      setWpStage('uploading');
      const uploadRes = await fetch('/api/wordpress/upload-featured-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64,
          image_base64: imageBase64,
          slug: activeSlug,
          postTitle: title.trim(),
          post_title: title.trim(),
          postId: postId,
          post_id: postId,
          mimeType: exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png',
          image_format: exportFormat,
        }),
      });

      const uploadData: WordPressUploadResult = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload media to WordPress');
      }

      setWpStage('setting_featured');
      setWpUploadResult(uploadData);
      setWpStage('complete');
      setStatusMessage(`Featured image attached to WordPress post "${uploadData.post_title || activeSlug}"!`);
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize WordPress upload';
      setWpError(msg);
      setWpStage('error');
    }
  };

  // Handler for when user confirms replacing existing featured image
  const handleConfirmReplace = async () => {
    try {
      setWpStage('rendering');
      const activeSlug = (slug.trim() || generateSlugFromTitle(title)).toLowerCase();
      const currentConfig = getCurrentThumbnailConfig();
      const imageBase64 = await exportThumbnailDataUrl(currentConfig, exportFormat, exportResolution);
      await executeWordPressUpload(imageBase64, activeSlug, wpPostMatch?.post_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed during replacement';
      setWpError(msg);
      setWpStage('error');
    }
  };

  // Handler for when user confirms uploading media only without existing post
  const handleConfirmUploadOnly = async () => {
    try {
      setWpStage('rendering');
      const activeSlug = (slug.trim() || generateSlugFromTitle(title)).toLowerCase();
      const currentConfig = getCurrentThumbnailConfig();
      const imageBase64 = await exportThumbnailDataUrl(currentConfig, exportFormat, exportResolution);
      await executeWordPressUpload(imageBase64, activeSlug, undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media upload failed';
      setWpError(msg);
      setWpStage('error');
    }
  };

  // Save Project to History
  const handleSaveProject = async () => {
    if (!title.trim()) return;
    setSavingProject(true);

    try {
      const config: ThumbnailConfig = {
        title: title.trim(),
        width: activeWidth,
        height: activeHeight,
        template,
        designStyle,
        compositionLayout,
        colorGrading,
        borderTreatment,
        typographyTreatment,
        backgroundImageUrl,
        logoUrl: brandKit?.main_logo_url || null,
        logoPosition,
        logoSize,
        titlePosition,
        textAlign: isUrdu ? 'center' : textAlign,
        overlayOpacity,
        headingFont: isUrdu ? 'Jameel Noori Nastaleeq' : (brandKit?.heading_font || 'Playfair Display'),
        showTitleOverlay,
        textColor,
        textOutlineEnabled,
        textOutlineColor,
        textOutlineWidth,
        textGlowEnabled,
        textGlowColor,
        textShadowStyle,
        textBackdropStyle,
        fontSizeMultiplier,
        badgeText: badgeText.trim() || undefined,
        badgeStyle,
        cornerRibbonText: cornerRibbonText.trim() || undefined,
        cornerRibbonStyle,
        graphicDecal,
        lightFlare,
        clarityFilter,
        backgroundBlur,
        showSocialBar,
        socialHandle,
      };

      const dataUrl = await exportThumbnailDataUrl(config);

      const projectData: Partial<ThumbnailProject> = {
        title: title.trim(),
        width: activeWidth,
        height: activeHeight,
        template,
        design_style: designStyle,
        composition_layout: compositionLayout,
        background_image_url: backgroundImageUrl,
        final_thumbnail_url: dataUrl,
        visual_concept: visualConcept,
        logo_url: brandKit?.main_logo_url || null,
        logo_position: logoPosition,
        logo_size: logoSize,
        title_position: titlePosition,
        text_align: textAlign,
        overlay_opacity: overlayOpacity,
      };

      const res = await fetch('/api/thumbnail/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        const json = await res.json();
        const savedItem = json.project || {
          id: `local_${Date.now()}`,
          ...projectData,
          created_at: new Date().toISOString(),
        };

        setProjectsHistory((prev) => [savedItem, ...prev]);
        const updated = [savedItem, ...projectsHistory];
        localStorage.setItem('nur_thumbnail_history', JSON.stringify(updated));

        setStatusMessage('Thumbnail saved to history!');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setSavingProject(false);
    }
  };

  // Delete project from history
  const handleDeleteProject = async (id: string) => {
    try {
      setProjectsHistory((prev) => prev.filter((p) => p.id !== id));
      const updated = projectsHistory.filter((p) => p.id !== id);
      localStorage.setItem('nur_thumbnail_history', JSON.stringify(updated));

      await fetch(`/api/thumbnail/projects?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete project failed:', err);
    }
  };

  // Load project from history into workspace
  const handleLoadProject = (p: ThumbnailProject) => {
    setTitle(p.title);
    setTemplate(p.template);
    if (p.design_style) setDesignStyle(p.design_style);
    if (p.composition_layout) setCompositionLayout(p.composition_layout);
    setBackgroundImageUrl(p.background_image_url || null);
    setVisualConcept(p.visual_concept || null);
    setTitlePosition(p.title_position || 'center');
    setTextAlign(p.text_align || 'center');
    setOverlayOpacity(p.overlay_opacity || 'medium');
    setLogoPosition(p.logo_position || 'bottom-right');
    setLogoSize(p.logo_size || 'medium');

    const matchedPreset = THUMBNAIL_SIZE_PRESETS.find(
      (preset) => preset.width === p.width && preset.height === p.height
    );

    if (matchedPreset) {
      setSelectedPresetId(matchedPreset.id);
    } else {
      setSelectedPresetId('custom');
      setCustomWidth(p.width);
      setCustomHeight(p.height);
    }

    setActiveTab('editor');
    setStatusMessage(`Loaded "${p.title}" into workspace`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-deep via-emerald-dark to-emerald-deep p-6 sm:p-8 rounded-2xl border border-gold-primary/30 shadow-md text-sand-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold-light text-xs font-mono tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span>Professional AI Graphic Design Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-ivory tracking-tight">
              AI Thumbnail Studio
            </h1>
            <p className="text-sand-muted text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Photoshop-level art direction, authentic <strong className="text-gold-light font-semibold">Jameel Noori Nastaleeq</strong> Urdu typography, and intelligent multi-layer compositing.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-gold-primary text-emerald-deep shadow-md'
                  : 'bg-emerald-dark/60 text-sand-muted hover:text-sand-ivory border border-emerald-border/40'
              }`}
            >
              Studio Workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-gold-primary text-emerald-deep shadow-md'
                  : 'bg-emerald-dark/60 text-sand-muted hover:text-sand-ivory border border-emerald-border/40'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({projectsHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="bg-emerald-dark/10 border border-emerald-primary/40 text-emerald-deep px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-primary shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Brand Kit & Font Active Status Banner */}
      <div className="bg-sand-ivory border border-gold-primary/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {isUrdu && (
            <span className="inline-flex items-center gap-1.5 text-emerald-deep font-semibold bg-emerald-primary/10 border border-emerald-primary/30 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-primary animate-pulse" />
              ✦ Jameel Noori Nastaleeq Active (Urdu RTL)
            </span>
          )}

          <input
            type="file"
            ref={logoFileInputRef}
            onChange={handleQuickLogoUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-deep font-medium">Brand Logo:</span>
            {brandKit?.main_logo_url ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-900/80 border border-gold-primary/40 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-2xs">
                  <img src={brandKit.main_logo_url} alt="Brand Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-emerald-primary font-semibold hidden md:inline text-xs">
                  {brandKit.brand_name || 'Logo Active'}
                </span>
                {/* Logo Placement Selector */}
                <div className="flex items-center gap-1 bg-emerald-primary/10 border border-emerald-primary/30 rounded-md px-2 py-0.5">
                  <span className="text-[10px] text-emerald-deep font-medium">Position:</span>
                  <select
                    value={logoPosition}
                    onChange={(e) => setLogoPosition(e.target.value as LogoPosition)}
                    className="text-[11px] font-bold bg-transparent text-emerald-deep focus:outline-none cursor-pointer"
                  >
                    <option value="top-right">Top Right (Recommended)</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="none">Hidden</option>
                  </select>
                </div>
                {/* Logo Size Selector */}
                <div className="flex items-center gap-1 bg-emerald-primary/10 border border-emerald-primary/30 rounded-md px-2 py-0.5">
                  <span className="text-[10px] text-emerald-deep font-medium">Size:</span>
                  <select
                    value={logoSize}
                    onChange={(e) => setLogoSize(e.target.value as LogoSize)}
                    className="text-[11px] font-bold bg-transparent text-emerald-deep focus:outline-none cursor-pointer"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                {/* Quick Change Logo Button */}
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="text-[11px] font-medium text-emerald-deep hover:text-gold-deep underline cursor-pointer ml-1"
                >
                  Change Logo
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-charcoal-muted">No logo active</span>
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-deep text-sand-ivory rounded-md text-[11px] font-semibold hover:bg-emerald-primary transition-colors cursor-pointer shadow-xs"
                >
                  <UploadCloud className="w-3 h-3 text-gold-primary" />
                  <span>Upload Logo Now</span>
                </button>
                <Link
                  href="/dashboard/brand-kit"
                  className="text-gold-deep hover:text-emerald-deep font-semibold underline text-[11px]"
                >
                  Brand Kit
                </Link>
              </div>
            )}
          </div>

          {/* WordPress Connection Status Indicator */}
          <div className="flex items-center gap-2 pl-2 border-l border-sand-border/80">
            <Globe className="w-3.5 h-3.5 text-gold-deep" />
            <span className="text-emerald-deep font-medium">WordPress:</span>
            {wpSettings?.is_configured ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Connected ({wpSettings.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')})
              </span>
            ) : (
              <Link
                href="/dashboard/settings"
                className="text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1"
              >
                <span>Not Configured</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="text-emerald-deep hover:text-gold-deep font-semibold flex items-center gap-1 transition-colors underline-offset-2 hover:underline text-[11px]"
          >
            <span>WordPress Settings</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/dashboard/brand-kit"
            className="text-gold-deep hover:text-emerald-deep font-semibold flex items-center gap-1 transition-colors underline-offset-2 hover:underline text-[11px]"
          >
            <span>Brand Kit</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* TAB 1: STUDIO WORKSPACE */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Input Form & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-emerald-border/30 bg-sand-ivory/90 backdrop-blur-xs shadow-xs space-y-5">
              {/* Step 1: Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider">
                    1. Blog Title
                  </label>
                  <span className="text-[10px] font-mono text-gold-deep font-semibold">
                    100% Exact Display Text
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  placeholder="Paste your exact WordPress blog title here... (e.g. نمازی کے آگے سے کتنے فاصلے تک گزر جا سکتا ہے؟)"
                  className={`w-full text-base rounded-xl border border-sand-border/90 bg-white p-3 text-charcoal-dark font-medium focus:border-gold-primary focus:ring-1 focus:ring-gold-primary focus:outline-none transition-all placeholder:text-charcoal-muted/60 ${
                    isUrdu ? 'font-serif leading-loose' : 'font-serif'
                  }`}
                  style={isUrdu ? { fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Amiri', serif" } : undefined}
                />
                <p className="text-[11px] text-charcoal-muted leading-tight">
                  <strong className="text-emerald-deep">Golden Rule:</strong> Zero spelling modification. Title renders character-for-character with authentic Nastaleeq ligatures.
                </p>
              </div>

              {/* Step 1B: WordPress Blog Post Slug */}
              <div className="space-y-1.5 bg-sand-cream/70 p-3 rounded-xl border border-sand-border/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gold-deep" />
                    <span>WordPress Blog Slug</span>
                  </label>
                  <span className="text-[10px] font-mono text-charcoal-muted">
                    Auto-derived from title
                  </span>
                </div>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="e.g. how-to-start-an-online-business-in-pakistan"
                  className="bg-white text-xs font-mono text-charcoal-dark"
                />
                <div className="flex items-center justify-between text-[10px] text-charcoal-muted">
                  <span>Used to automatically locate the WordPress post &amp; set SEO file name.</span>
                  {isSlugManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSlugManuallyEdited(false);
                        setSlug(generateSlugFromTitle(title) || 'thumbnail-post');
                      }}
                      className="text-gold-deep hover:underline font-medium"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Thumbnail Size Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider block">
                  2. Thumbnail Size
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THUMBNAIL_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        selectedPresetId === preset.id
                          ? 'bg-emerald-primary/10 border-gold-primary text-emerald-deep font-semibold shadow-xs'
                          : 'bg-white border-sand-border/70 text-charcoal-dark hover:border-sand-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{preset.name}</span>
                        {preset.recommended && (
                          <span className="text-[9px] bg-gold-primary/20 text-gold-deep px-1.5 py-0.2 rounded-xs font-mono font-bold">
                            WP
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-charcoal-muted font-mono mt-1">
                        {preset.width} × {preset.height} px
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedPresetId('custom')}
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      selectedPresetId === 'custom'
                        ? 'bg-emerald-primary/10 border-gold-primary text-emerald-deep font-semibold shadow-xs'
                        : 'bg-white border-sand-border/70 text-charcoal-dark hover:border-sand-border'
                    }`}
                  >
                    <span>Custom Dimensions</span>
                    <span className="text-[10px] text-charcoal-muted font-mono mt-1">
                      User Defined
                    </span>
                  </button>
                </div>

                {selectedPresetId === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 bg-sand-muted/10 p-3 rounded-xl border border-sand-border/60 animate-fadeIn">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-deep uppercase block mb-1">
                        Width (px)
                      </label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="text-xs bg-white"
                        min={300}
                        max={4000}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-deep uppercase block mb-1">
                        Height (px)
                      </label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="text-xs bg-white"
                        min={200}
                        max={4000}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: AI Art Direction & Style (Gemini 3.8 Flash) */}
              <div className="space-y-2.5 pt-2 border-t border-sand-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider block">
                    3. AI Visual Style & Art Direction
                  </label>
                  <span className="text-[10px] font-mono text-gold-deep font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-primary" />
                    Gemini 3.8
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'viral_youtube', label: '🔥 YouTube Viral', desc: 'High-CTR Contrasting' },
                    { id: 'islamic_luxury', label: '🕌 Islamic Luxury', desc: 'Royal Gold & Arches' },
                    { id: 'tech_ai', label: '⚡ Cyber Tech / AI', desc: 'Neon Luminescence' },
                    { id: 'business_wealth', label: '📈 Executive Wealth', desc: 'Growth Analytics' },
                    { id: 'podcast_studio', label: '🎙️ Podcast Studio', desc: 'Moody Spotlight' },
                    { id: 'minimal_quran', label: '📖 Sacred Quranic', desc: 'Illuminated Dawn' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCreativeStyle(style.id as CreativeStyleCategory)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        creativeStyle === style.id
                          ? 'bg-emerald-primary/10 border-gold-primary text-emerald-deep font-bold shadow-xs ring-1 ring-gold-primary/40'
                          : 'bg-white border-sand-border/70 text-charcoal-dark hover:border-sand-border'
                      }`}
                    >
                      <span className="font-semibold">{style.label}</span>
                      <span className="text-[9px] text-charcoal-muted mt-0.5">{style.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Optional Custom AI Prompt Tuning */}
                <div className="pt-1">
                  <Input
                    value={customPromptTuning}
                    onChange={(e) => setCustomPromptTuning(e.target.value)}
                    placeholder="Optional AI visual tweak (e.g. dramatic amber sunset, floating 3D icons...)"
                    className="text-xs bg-white text-charcoal-dark placeholder:text-charcoal-muted/60"
                  />
                </div>
              </div>

              {/* Generate Primary Action Button */}
              <div className="space-y-2 mt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !title.trim()}
                  className="w-full bg-gradient-to-r from-emerald-primary via-emerald-deep to-emerald-primary hover:from-emerald-dark hover:to-emerald-deep text-gold-light border border-gold-primary/40 font-serif font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
                      <span>Executing AI Art Direction...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-gold-primary" />
                      <span>Generate Graphic Design Thumbnail</span>
                    </>
                  )}
                </Button>

                {/* Generate & Auto Upload to WordPress Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUploadToWordPress({ forceGenerateFirst: true })}
                  disabled={generating || !title.trim()}
                  className="w-full bg-sand-cream/80 hover:bg-gold-primary/15 border-gold-primary/50 text-emerald-deep font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                  title="Generate AI visual and automatically upload & set featured image in WordPress"
                >
                  <UploadCloud className="w-4 h-4 text-gold-deep" />
                  <span>Generate &amp; Upload to WordPress</span>
                </Button>
              </div>
            </Card>


            {/* Automated Quality Check Card */}
            {qualityReport && (
              <div className="p-4 bg-emerald-dark/5 border border-emerald-primary/20 rounded-xl text-emerald-deep space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center justify-between font-serif font-bold text-emerald-deep">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-primary" />
                    <span>Automated Quality Assessment</span>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-primary/10 text-emerald-deep px-2 py-0.5 rounded-md font-bold">
                    {qualityReport.score}/100 Passed
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-charcoal-muted">
                  {qualityReport.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Interactive Canvas Preview & Variations (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1-Click Pro Aesthetic Themes Carousel */}
            <div className="bg-sand-ivory/95 border border-gold-primary/30 rounded-2xl p-4 shadow-xs space-y-2.5 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-deep font-serif font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-gold-deep" />
                  <span>1-Click Pro Themes (Instant Studio Magic)</span>
                </div>
                <span className="text-[10px] text-charcoal-muted">
                  YouTube & Studio Presets
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRO_THUMBNAIL_THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleSelectTheme(th)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      activeThemeId === th.id
                        ? 'bg-gradient-to-br from-emerald-primary/15 to-gold-primary/20 border-gold-primary text-emerald-deep shadow-xs ring-1 ring-gold-primary/50'
                        : 'bg-white border-sand-border/70 text-charcoal-dark hover:border-gold-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold truncate">{th.name}</span>
                      <span className="text-[8px] bg-gold-primary/20 text-gold-deep px-1.5 py-0.2 rounded font-mono font-bold">
                        {th.badge}
                      </span>
                    </div>
                    <p className="text-[9px] text-charcoal-muted line-clamp-1 mt-1">
                      {th.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-sand-border/40">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: th.textColor }}
                        title={`Text: ${th.textColor}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: th.textOutlineColor }}
                        title={`Outline: ${th.textOutlineColor}`}
                      />
                      <span className="text-[9px] font-mono text-gold-deep font-semibold ml-auto">
                        {th.textOutlineWidth}px
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="p-4 sm:p-6 border-emerald-border/30 bg-sand-ivory/90 backdrop-blur-xs shadow-xs space-y-4">
              {/* Preview Header & Variations Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-gold-deep" />
                  <h3 className="text-xs font-bold text-emerald-deep uppercase tracking-wider">
                    Full-DPI Graphic Preview ({activeWidth} × {activeHeight} px)
                  </h3>
                </div>

                {/* 3 Design Variations Toggle */}
                {variations.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-sand-muted/20 p-1 rounded-lg">
                    {variations.map((v, i) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariation(v)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                          activeVariationId === v.id
                            ? 'bg-gold-primary text-emerald-deep shadow-xs'
                            : 'text-charcoal-dark hover:text-emerald-deep'
                        }`}
                      >
                        Design {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Canvas Preview Container */}
              <div className="relative w-full rounded-xl overflow-hidden bg-emerald-deep/95 border border-emerald-border/40 shadow-inner flex items-center justify-center p-1 sm:p-2">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[520px] object-contain rounded-lg shadow-md"
                  style={{ aspectRatio: `${activeWidth} / ${activeHeight}` }}
                />

                {generating && (
                  <div className="absolute inset-0 bg-emerald-deep/90 backdrop-blur-xs flex flex-col items-center justify-center text-sand-ivory gap-4 p-6 text-center animate-fadeIn z-20">
                    <IslamicLoader />
                    <div className="space-y-3 max-w-sm w-full">
                      <h4 className="font-serif text-sm font-bold text-gold-light">
                        AI Thumbnail Generation in Progress
                      </h4>
                      <div className="space-y-2 bg-emerald-dark/80 border border-gold-primary/20 rounded-xl p-3.5 text-xs text-left shadow-lg">
                        {/* Stage 1: Analyzing title */}
                        <div className="flex items-center gap-2.5">
                          {generationStage === 'analyzing' ? (
                            <Loader2 className="w-4 h-4 text-gold-primary animate-spin shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-primary shrink-0" />
                          )}
                          <span className={generationStage === 'analyzing' ? 'text-gold-light font-bold' : 'text-sand-ivory'}>
                            1. Analyzing title...
                          </span>
                        </div>

                        {/* Stage 2: Creating visual concept */}
                        <div className="flex items-center gap-2.5">
                          {generationStage === 'concept' ? (
                            <Loader2 className="w-4 h-4 text-gold-primary animate-spin shrink-0" />
                          ) : generationStage === 'generating' || generationStage === 'complete' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-primary shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-sand-muted/40 shrink-0" />
                          )}
                          <span
                            className={
                              generationStage === 'concept'
                                ? 'text-gold-light font-bold'
                                : generationStage === 'generating' || generationStage === 'complete'
                                ? 'text-sand-ivory'
                                : 'text-sand-muted'
                            }
                          >
                            2. Creating visual concept...
                          </span>
                        </div>

                        {/* Stage 3: Generating thumbnail */}
                        <div className="flex items-center gap-2.5">
                          {generationStage === 'generating' ? (
                            <Loader2 className="w-4 h-4 text-gold-primary animate-spin shrink-0" />
                          ) : generationStage === 'complete' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-primary shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-sand-muted/40 shrink-0" />
                          )}
                          <span
                            className={
                              generationStage === 'generating'
                                ? 'text-gold-light font-bold'
                                : generationStage === 'complete'
                                ? 'text-sand-ivory'
                                : 'text-sand-muted'
                            }
                          >
                            3. Generating thumbnail...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real AI Plan & Art Direction Metadata Card */}
              {aiPlan && (
                <div className="p-4 bg-white/90 backdrop-blur-xs rounded-xl border border-gold-primary/30 text-xs text-charcoal-dark space-y-2.5 shadow-xs animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-primary/10 text-emerald-deep font-bold text-[11px] border border-emerald-primary/20">
                        {aiPlan.category}
                      </span>
                      <span className="font-semibold text-emerald-deep text-[11px] truncate max-w-xs">
                        {aiPlan.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gold-deep bg-gold-primary/10 px-2 py-0.5 rounded border border-gold-primary/20">
                      <Sparkles className="w-3 h-3 text-gold-deep" />
                      <span>{modelUsed || aiProvider || 'Gemini AI'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-charcoal-dark">
                      <strong className="text-emerald-deep">Visual Concept: </strong>
                      <span>{aiPlan.visual_concept}</span>
                    </div>
                    <div className="text-[11px] text-charcoal-muted">
                      <strong className="text-emerald-deep">Lighting & Atmosphere: </strong>
                      <span>{aiPlan.lighting}</span>
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  {aiPlan.color_palette && aiPlan.color_palette.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-sand-border/40">
                      <span className="text-[10px] font-bold text-emerald-deep uppercase tracking-wider">
                        Color Palette:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {aiPlan.color_palette.map((color, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-sand-border/70 bg-sand-ivory/50 text-[10px] font-mono"
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: color }}
                            />
                            <span>{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {geminiNotice && (
                    <div className="text-[10px] text-emerald-deep/80 bg-emerald-primary/5 p-2 rounded-lg border border-emerald-primary/15 mt-1">
                      {geminiNotice}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Concept Fallback Caption (if no full aiPlan yet) */}
              {!aiPlan && visualConcept && (
                <div className="p-3 bg-white/75 rounded-xl border border-sand-border/60 text-xs text-charcoal-muted flex items-start gap-2">
                  <Palette className="w-4 h-4 text-gold-deep shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-deep">Art Concept: </span>
                    <span>{visualConcept}</span>
                  </div>
                </div>
              )}

              {/* High-Resolution Export Selector Bar */}
              <div className="bg-white/90 p-3 rounded-xl border border-sand-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-deep text-[11px] uppercase tracking-wider">
                    Export Resolution:
                  </span>
                  <div className="flex items-center gap-1 bg-sand-muted/20 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExportResolution('original')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        exportResolution === 'original'
                          ? 'bg-emerald-primary text-white shadow-xs'
                          : 'text-charcoal-dark hover:text-emerald-deep'
                      }`}
                      title={`Exact selected dimensions: ${activeWidth} × ${activeHeight} px`}
                    >
                      Exact ({activeWidth}×{activeHeight})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportResolution('2x')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        exportResolution === '2x'
                          ? 'bg-emerald-primary text-white shadow-xs'
                          : 'text-charcoal-dark hover:text-emerald-deep'
                      }`}
                      title={`2× High-DPI Retina: ${activeWidth * 2} × ${activeHeight * 2} px`}
                    >
                      2× Retina ({activeWidth * 2}×{activeHeight * 2})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportResolution('4k')}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                        exportResolution === '4k'
                          ? 'bg-gold-primary text-emerald-deep shadow-xs'
                          : 'text-charcoal-dark hover:text-emerald-deep'
                      }`}
                    >
                      <span>4K UHD</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-deep text-[11px] uppercase tracking-wider">
                    Format:
                  </span>
                  <div className="flex items-center gap-1 bg-sand-muted/20 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExportFormat('png')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        exportFormat === 'png'
                          ? 'bg-emerald-primary text-white shadow-xs'
                          : 'text-charcoal-dark hover:text-emerald-deep'
                      }`}
                    >
                      PNG (Lossless)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('jpeg')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        exportFormat === 'jpeg'
                          ? 'bg-emerald-primary text-white shadow-xs'
                          : 'text-charcoal-dark hover:text-emerald-deep'
                      }`}
                    >
                      JPG (Web 95%)
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {/* 1. Download Thumbnail (Untouched Core Workflow) */}
                <Button
                  onClick={handleDownload}
                  disabled={downloading || !title.trim()}
                  className="bg-gold-primary hover:bg-gold-deep text-emerald-deep font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Download Thumbnail ({exportResolution === 'original' ? `${activeWidth}×${activeHeight}` : exportResolution === '2x' ? `${activeWidth * 2}×${activeHeight * 2}` : exportResolution.toUpperCase()})
                  </span>
                </Button>

                {/* 2. Auto Upload to WordPress */}
                <Button
                  onClick={() => handleUploadToWordPress()}
                  disabled={downloading || !title.trim()}
                  className="bg-emerald-deep hover:bg-emerald-dark text-gold-light border border-gold-primary/40 font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                  title="Upload this thumbnail directly to WordPress and assign it as Featured Image"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-gold-primary" />
                  <span>Upload to WordPress</span>
                </Button>

                {/* 3. Regenerate Background Visual Only */}
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackground}
                  disabled={generating || !title.trim()}
                  className="border-emerald-primary/40 text-emerald-deep hover:bg-emerald-primary/10 text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gold-deep ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Visual</span>
                </Button>

                {/* 4. Save to History */}
                <Button
                  variant="outline"
                  onClick={handleSaveProject}
                  disabled={savingProject || !title.trim()}
                  className="border-sand-border/90 text-charcoal-dark hover:bg-sand-muted/20 text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  {savingProject ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-deep" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5 text-emerald-deep" />
                  )}
                  <span>Save to History</span>
                </Button>
              </div>
            </Card>

            {/* Workflow Banner */}
            <div className="bg-emerald-deep/90 text-sand-ivory p-4 rounded-xl border border-gold-primary/20 text-xs space-y-1">
              <span className="text-gold-light font-bold">Graphic Design Guarantee:</span>
              <p className="text-sand-muted leading-relaxed">
                Rendered with Jameel Noori Nastaleeq for Urdu, high-DPI Canvas compositing, and automated Brand Kit logo protection. Upload directly to WordPress as <strong className="text-sand-ivory">Featured Image</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THUMBNAIL HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-emerald-deep">
                Generated Graphic Thumbnails History
              </h2>
              <p className="text-xs text-charcoal-muted">
                Quickly re-download, inspect, or reload previously generated thumbnails into your workspace.
              </p>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-sand-muted">
              <Loader2 className="w-7 h-7 text-gold-primary animate-spin" />
              <p className="text-xs font-serif">Loading history...</p>
            </div>
          ) : projectsHistory.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-sand-border bg-sand-ivory/60 space-y-3">
              <ImageIcon className="w-12 h-12 text-gold-deep mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-emerald-deep text-sm">
                No Thumbnails Saved Yet
              </h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Generate a thumbnail in the workspace and click &quot;Save to History&quot; to keep an archive of your WordPress featured images.
              </p>
              <Button
                onClick={() => setActiveTab('editor')}
                className="bg-emerald-primary text-gold-light text-xs font-medium mt-2"
              >
                Create Your First Thumbnail
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsHistory.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-emerald-border/30 bg-sand-ivory/90 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-[16/9] bg-emerald-deep overflow-hidden">
                      {item.final_thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.final_thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sand-muted text-xs">
                          Preview Unavailable
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-emerald-deep/90 text-gold-light px-2 py-0.5 rounded-md border border-gold-primary/30">
                        {item.width} × {item.height}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-serif font-bold text-emerald-deep text-sm line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-muted">
                        <span className="capitalize">{item.template.replace('_', ' ')}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-sand-border/40 mt-2 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadProject(item)}
                      className="text-xs flex-1 text-emerald-deep border-emerald-primary/30 hover:bg-emerald-primary/10"
                    >
                      Load in Editor
                    </Button>

                    {item.final_thumbnail_url && (
                      <a
                        href={item.final_thumbnail_url}
                        download={`thumbnail_${item.width}x${item.height}.png`}
                        className="p-2 rounded-lg border border-gold-primary/40 text-gold-deep hover:bg-gold-subtle/40 transition-colors"
                        title="Download PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete from History"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WordPress Auto-Upload Stepper & Confirmation Modal */}
      {wpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-sand-ivory rounded-2xl border border-gold-primary/30 max-w-lg w-full p-6 shadow-2xl space-y-5 text-charcoal-dark relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sand-border/70 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-primary" />
                <h3 className="font-serif font-bold text-emerald-deep text-base">
                  WordPress Auto-Upload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWpModalOpen(false)}
                className="text-charcoal-muted hover:text-emerald-deep p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Post / Slug Information Pill */}
            <div className="bg-sand-cream/80 p-3 rounded-xl border border-sand-border/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-deep">Target Post Slug:</span>
                <span className="font-mono text-[11px] bg-sand-ivory px-2 py-0.5 rounded border border-sand-border text-charcoal-dark font-medium">
                  {slug || 'auto-slug'}
                </span>
              </div>
              <div className="text-[11px] text-charcoal-muted truncate">
                <strong>Title:</strong> {title}
              </div>
            </div>

            {/* STEPPER PROGRESS VIEW (When in progress) */}
            {wpStage !== 'confirm_replace' && wpStage !== 'confirm_not_found' && wpStage !== 'complete' && wpStage !== 'error' && (
              <div className="space-y-3 py-2">
                <div className="text-xs font-bold text-emerald-deep uppercase tracking-wider mb-2">
                  Integration Progress:
                </div>

                {/* Step 1: AI Graphic Generation */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'generating' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : ['rendering', 'connecting', 'finding_post', 'uploading', 'setting_featured', 'complete'].includes(wpStage) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'generating' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    1. AI Visual Generation (Google Gemini &amp; Art Concept)
                  </span>
                </div>

                {/* Step 2: High-DPI Canvas Compositing */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'rendering' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : ['connecting', 'finding_post', 'uploading', 'setting_featured', 'complete'].includes(wpStage) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'rendering' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    2. High-DPI Compositing &amp; Jameel Noori Nastaleeq Rendering
                  </span>
                </div>

                {/* Step 3: WordPress REST API Connection */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'connecting' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : ['finding_post', 'uploading', 'setting_featured', 'complete'].includes(wpStage) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'connecting' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    3. Authenticating with WordPress REST API
                  </span>
                </div>

                {/* Step 4: Slug Matching */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'finding_post' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : ['uploading', 'setting_featured', 'complete'].includes(wpStage) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'finding_post' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    4. Matching Post / Page by Slug (<code className="text-[10px]">{slug}</code>)
                  </span>
                </div>

                {/* Step 5: Uploading Media */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'uploading' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : ['setting_featured', 'complete'].includes(wpStage) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'uploading' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    5. Uploading PNG to WordPress Media Library
                  </span>
                </div>

                {/* Step 6: Setting Featured Image */}
                <div className="flex items-center gap-3 text-xs">
                  {wpStage === 'setting_featured' ? (
                    <Loader2 className="w-4 h-4 text-gold-deep animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-sand-border shrink-0" />
                  )}
                  <span className={wpStage === 'setting_featured' ? 'font-bold text-emerald-deep' : 'text-charcoal-muted'}>
                    6. Assigning as Post Featured Image
                  </span>
                </div>
              </div>
            )}

            {/* CASE A: CONFIRM REPLACE EXISTING FEATURED IMAGE */}
            {wpStage === 'confirm_replace' && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2 text-amber-900 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Featured Image Already Exists</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  WordPress post <strong>&quot;{wpPostMatch?.post_title || slug}&quot;</strong> (ID: {wpPostMatch?.post_id}) already has a Featured Image attached.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWpModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmReplace}
                    className="text-xs bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    Replace Existing Image
                  </Button>
                </div>
              </div>
            )}

            {/* CASE B: CONFIRM POST NOT FOUND (UPLOAD ONLY) */}
            {wpStage === 'confirm_not_found' && (
              <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl text-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2 text-blue-900 font-semibold">
                  <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>No WordPress Post Found with this Slug</span>
                </div>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  No published or draft post was found matching slug <code>{slug}</code>. Would you like to upload this thumbnail directly to the WordPress Media Library without attaching it to a specific post?
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWpModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmUploadOnly}
                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Upload Image Only
                  </Button>
                </div>
              </div>
            )}

            {/* CASE C: UPLOAD SUCCESS VIEW */}
            {wpStage === 'complete' && wpUploadResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>🎉 Upload Successfully Completed!</span>
                </div>
                <div className="space-y-1 text-emerald-800 text-[11px]">
                  <div>
                    <strong>Media ID:</strong> {wpUploadResult.media_id}
                  </div>
                  {wpUploadResult.post_id && (
                    <div>
                      <strong>Post Attached:</strong> {wpUploadResult.post_title || wpUploadResult.post_id} (Featured Image set)
                    </div>
                  )}
                  <p className="text-emerald-700 pt-1">{wpUploadResult.message}</p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                  {wpUploadResult.post_url && (
                    <a
                      href={wpUploadResult.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Open WordPress Post</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {wpUploadResult.media_url && !wpUploadResult.post_url && (
                    <a
                      href={wpUploadResult.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>View Uploaded Media</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDownload();
                      setWpModalOpen(false);
                    }}
                    className="text-xs"
                  >
                    Download Image Also
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWpModalOpen(false)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* CASE D: ERROR VIEW */}
            {wpStage === 'error' && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2 text-rose-900 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>WordPress Auto-Upload Failed</span>
                </div>
                <p className="text-rose-800 text-[11px] leading-relaxed">
                  {wpError || 'An unknown error occurred during WordPress upload. Please check your credentials under WordPress Settings.'}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200">
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sand-ivory border border-sand-border text-emerald-deep hover:text-gold-deep text-xs font-semibold"
                  >
                    <span>Check Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWpModalOpen(false)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleUploadToWordPress()}
                    className="text-xs bg-rose-700 hover:bg-rose-800 text-white"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IslamicLoader() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 border-2 border-gold-primary/30 border-t-gold-primary rounded-xl animate-spin" />
      <div className="w-6 h-6 bg-gold-primary/20 rounded-md rotate-45 animate-pulse" />
    </div>
  );
}
