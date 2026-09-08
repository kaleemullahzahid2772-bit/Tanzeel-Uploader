'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import {
  THUMBNAIL_SIZE_PRESETS,
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
} from '@/lib/thumbnail/canvas-renderer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  Download,
  RefreshCw,
  Sliders,
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
} from 'lucide-react';

export default function ThumbnailMakerPage() {
  const { user } = useAuth();

  // Tab State: 'editor' | 'history'
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  // Core Inputs
  const [title, setTitle] = useState('نمازی کے آگے سے کتنے فاصلے تک گزر جا سکتا ہے؟');
  const [selectedPresetId, setSelectedPresetId] = useState('wp_featured');
  const [customWidth, setCustomWidth] = useState(1599);
  const [customHeight, setCustomHeight] = useState(892);
  const [template, setTemplate] = useState<ThumbnailTemplate>('islamic_premium');

  // Advanced Art Direction & Photoshop Compositing State
  const [designStyle, setDesignStyle] = useState<DesignStyle>('cinematic_islamic');
  const [compositionLayout, setCompositionLayout] = useState<CompositionLayout>('subject_left_text_right');
  const [colorGrading, setColorGrading] = useState<ColorGradingPreset>('deep_emerald');
  const [borderTreatment, setBorderTreatment] = useState<BorderTreatment>('corner_accents');
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
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('bottom-right');
  const [logoSize, setLogoSize] = useState<LogoSize>('medium');

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

  // History State
  const [projectsHistory, setProjectsHistory] = useState<ThumbnailProject[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Load Brand Kit & History on Mount
  useEffect(() => {
    async function loadBrandKit() {
      try {
        const cached = localStorage.getItem('nur_brand_kit');
        if (cached) {
          const parsed = JSON.parse(cached);
          setBrandKit(parsed);
          if (parsed.default_logo_position) setLogoPosition(parsed.default_logo_position);
          if (parsed.default_logo_size) setLogoSize(parsed.default_logo_size);
          if (parsed.default_template) setTemplate(parsed.default_template);
        }

        const res = await fetch('/api/brand-kit');
        if (res.ok) {
          const json = await res.json();
          if (json.brandKit) {
            setBrandKit(json.brandKit);
            if (json.brandKit.default_logo_position) setLogoPosition(json.brandKit.default_logo_position);
            if (json.brandKit.default_logo_size) setLogoSize(json.brandKit.default_logo_size);
            if (json.brandKit.default_template) setTemplate(json.brandKit.default_template);
          }
        }
      } catch (err) {
        console.warn('Could not load Brand Kit:', err);
      }
    }

    loadBrandKit();
    loadHistory();
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
    };

    try {
      await renderThumbnailCanvas(config, canvasRef.current);
      const report = evaluateThumbnailQuality(title, activeWidth, activeHeight);
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
          width: activeWidth,
          height: activeHeight,
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
      };

      const blob = await exportThumbnailBlob(config);
      const url = URL.createObjectURL(blob);
      const cleanSlug = title
        .replace(/[\u0600-\u06FF\s]+/g, '_')
        .replace(/[^a-zA-Z0-9_-]+/g, '')
        .slice(0, 30) || 'urdu_thumbnail';

      const filename = `thumbnail_${cleanSlug}_${activeWidth}x${activeHeight}.png`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage(`Downloaded "${filename}" (${activeWidth}×${activeHeight} PNG)`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Download failed:', err);
      setErrorMessage('Failed to export thumbnail. Please try again.');
    } finally {
      setDownloading(false);
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

          <div className="flex items-center gap-2">
            <span className="text-emerald-deep font-medium">Brand Kit:</span>
            {brandKit?.main_logo_url ? (
              <span className="text-emerald-primary font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Logo Active ({brandKit.brand_name || 'Al Tanzeel Academy'})
              </span>
            ) : (
              <span className="text-charcoal-muted">No logo configured</span>
            )}
          </div>
        </div>

        <Link
          href="/dashboard/brand-kit"
          className="text-gold-deep hover:text-emerald-deep font-semibold flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
        >
          <span>Configure Brand Kit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
                  onChange={(e) => setTitle(e.target.value)}
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

              {/* Generate Primary Action Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !title.trim()}
                className="w-full bg-gradient-to-r from-emerald-primary via-emerald-deep to-emerald-primary hover:from-emerald-dark hover:to-emerald-deep text-gold-light border border-gold-primary/40 font-serif font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 mt-4 transition-all"
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
            </Card>

            {/* Photoshop-Style Art Direction Controls */}
            <Card className="p-6 border-emerald-border/30 bg-sand-ivory/90 backdrop-blur-xs shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-sand-border/60 pb-3">
                <Sliders className="w-4 h-4 text-gold-deep" />
                <h3 className="text-xs font-bold text-emerald-deep uppercase tracking-wider">
                  Photoshop-Style Composition & Tuning
                </h3>
              </div>

              {/* Composition Layout & Color Grading */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Composition Layout
                  </label>
                  <select
                    value={compositionLayout}
                    onChange={(e) => setCompositionLayout(e.target.value as CompositionLayout)}
                    className="w-full text-xs rounded-lg border border-sand-border/80 bg-white p-2 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                  >
                    <option value="subject_left_text_right">Subject Left → Text Right</option>
                    <option value="subject_right_text_left">Subject Right → Text Left</option>
                    <option value="center_focus">Center Focus Vignette</option>
                    <option value="subject_bottom_text_top">Subject Bottom → Text Top</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Color Grading
                  </label>
                  <select
                    value={colorGrading}
                    onChange={(e) => setColorGrading(e.target.value as ColorGradingPreset)}
                    className="w-full text-xs rounded-lg border border-sand-border/80 bg-white p-2 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                  >
                    <option value="deep_emerald">Deep Emerald Wash</option>
                    <option value="warm_cinematic">Warm Golden Glow</option>
                    <option value="royal_gold">Royal Gold Accent</option>
                    <option value="moody_dusk">Moody Twilight Indigo</option>
                    <option value="clean_editorial">Clean Editorial High Contrast</option>
                  </select>
                </div>
              </div>

              {/* Border & Typography Treatment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Border Styling
                  </label>
                  <select
                    value={borderTreatment}
                    onChange={(e) => setBorderTreatment(e.target.value as BorderTreatment)}
                    className="w-full text-xs rounded-lg border border-sand-border/80 bg-white p-2 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                  >
                    <option value="corner_accents">Islamic Corner Accents (Modern)</option>
                    <option value="none">None (Clean Borderless)</option>
                    <option value="left_gold_bar">Left Islamic Pillar Bar</option>
                    <option value="thin_gold_frame">Thin Gold Frame</option>
                    <option value="double_filigree">Double Luxury Filigree</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Typography Treatment
                  </label>
                  <select
                    value={typographyTreatment}
                    onChange={(e) => setTypographyTreatment(e.target.value as TypographyTreatment)}
                    className="w-full text-xs rounded-lg border border-sand-border/80 bg-white p-2 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                  >
                    <option value="white_nastaleeq_shadow">Floating Drop Shadow</option>
                    <option value="gold_highlighted_keyword">Gold Keyword Accent</option>
                    <option value="glassmorphism_card">Glassmorphism Dark Card</option>
                    <option value="minimal_gold_divider">Minimal Gold Divider</option>
                  </select>
                </div>
              </div>

              {/* Logo Position & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Logo Placement
                  </label>
                  <select
                    value={logoPosition}
                    onChange={(e) => setLogoPosition(e.target.value as LogoPosition)}
                    className="w-full text-xs rounded-lg border border-sand-border/80 bg-white p-2 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                  >
                    <option value="bottom-right">Bottom Right (Standard)</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="none">Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-deep block mb-1">
                    Logo Size
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['small', 'medium', 'large'] as LogoSize[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setLogoSize(size)}
                        className={`py-1 rounded-md border text-[10px] capitalize transition-all ${
                          logoSize === size
                            ? 'bg-emerald-primary text-gold-light border-gold-primary font-semibold'
                            : 'bg-white border-sand-border/70 text-charcoal-dark'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
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

              {/* Primary Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* 1. Download Thumbnail */}
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
                  <span>Download Thumbnail (PNG)</span>
                </Button>

                {/* 2. Regenerate Background Visual Only */}
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackground}
                  disabled={generating || !title.trim()}
                  className="border-emerald-primary/40 text-emerald-deep hover:bg-emerald-primary/10 text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gold-deep ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Visual</span>
                </Button>

                {/* 3. Save to History */}
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
