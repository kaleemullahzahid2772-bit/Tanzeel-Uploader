'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { BrandKit, LogoPosition, LogoSize, ThumbnailTemplate } from '@/lib/types/thumbnail';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Palette,
  Type,
  Layout,
  ShieldCheck,
} from 'lucide-react';

const PRESET_FONTS = [
  { name: 'Playfair Display (Elegant Serif)', value: 'Playfair Display' },
  { name: 'Cinzel (Classical Luxury)', value: 'Cinzel' },
  { name: 'Amiri (Traditional Quranic Arabic/Latin)', value: 'Amiri' },
  { name: 'Cairo (Modern Arabic/English Geometric)', value: 'Cairo' },
  { name: 'Inter (Clean Modern Sans)', value: 'Inter' },
  { name: 'Merriweather (Readable Editorial)', value: 'Merriweather' },
];

export default function BrandKitPage() {
  const { user, isConfigured, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [brandName, setBrandName] = useState('Al Tanzeel Quran Academy');
  const [mainLogoUrl, setMainLogoUrl] = useState<string | null>(null);
  const [secondaryLogoUrl, setSecondaryLogoUrl] = useState<string | null>(null);
  const [iconLogoUrl, setIconLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0F4C3A');
  const [secondaryColor, setSecondaryColor] = useState('#083B2E');
  const [accentColor, setAccentColor] = useState('#C9A227');
  const [backgroundColor, setBackgroundColor] = useState('#F8F4E8');
  const [textColor, setTextColor] = useState('#FFFDF7');
  const [headingFont, setHeadingFont] = useState('Playfair Display');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [defaultLogoPosition, setDefaultLogoPosition] = useState<LogoPosition>('bottom-right');
  const [defaultLogoSize, setDefaultLogoSize] = useState<LogoSize>('medium');
  const [defaultTemplate, setDefaultTemplate] = useState<ThumbnailTemplate>('islamic_premium');

  // File Uploading States
  const [uploadingLogoType, setUploadingLogoType] = useState<string | null>(null);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Load Brand Kit on mount
  useEffect(() => {
    async function loadBrandKit() {
      setLoading(true);
      try {
        // Try local storage first if demo mode
        const cached = localStorage.getItem('nur_brand_kit');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            applyBrandKitData(parsed);
          } catch {
            // ignore
          }
        }

        const res = await fetch('/api/brand-kit');
        if (res.ok) {
          const json = await res.json();
          if (json.brandKit) {
            applyBrandKitData(json.brandKit);
            localStorage.setItem('nur_brand_kit', JSON.stringify(json.brandKit));
          }
        }
      } catch (err) {
        console.warn('Could not load Brand Kit:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBrandKit();
  }, []);

  const applyBrandKitData = (kit: Partial<BrandKit>) => {
    if (kit.brand_name) setBrandName(kit.brand_name);
    if (kit.main_logo_url) setMainLogoUrl(kit.main_logo_url);
    if (kit.secondary_logo_url) setSecondaryLogoUrl(kit.secondary_logo_url);
    if (kit.icon_logo_url) setIconLogoUrl(kit.icon_logo_url);
    if (kit.primary_color) setPrimaryColor(kit.primary_color);
    if (kit.secondary_color) setSecondaryColor(kit.secondary_color);
    if (kit.accent_color) setAccentColor(kit.accent_color);
    if (kit.background_color) setBackgroundColor(kit.background_color);
    if (kit.text_color) setTextColor(kit.text_color);
    if (kit.heading_font) setHeadingFont(kit.heading_font);
    if (kit.body_font) setBodyFont(kit.body_font);
    if (kit.default_logo_position) setDefaultLogoPosition(kit.default_logo_position);
    if (kit.default_logo_size) setDefaultLogoSize(kit.default_logo_size);
    if (kit.default_template) setDefaultTemplate(kit.default_template);
  };

  // Upload handler for logos
  const handleLogoUpload = async (file: File, type: 'main' | 'secondary' | 'icon') => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    setUploadingLogoType(type);
    setErrorMessage(null);

    try {
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user?.id || 'demo_user'}/brand-kit/${timestamp}_${type}_${cleanName}`;

      let finalUrl = '';

      if (!isConfigured || isDemoMode) {
        // Read as base64 Data URL so it persists cleanly in browser session
        const reader = new FileReader();
        finalUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          // Fallback to base64 data url if bucket policy is restricted
          console.warn('Supabase storage upload error, using local data URL:', uploadError.message);
          const reader = new FileReader();
          finalUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } else {
          const { data } = supabase.storage.from('media').getPublicUrl(filePath);
          finalUrl = data.publicUrl;
        }
      }

      if (type === 'main') setMainLogoUrl(finalUrl);
      else if (type === 'secondary') setSecondaryLogoUrl(finalUrl);
      else if (type === 'icon') setIconLogoUrl(finalUrl);

      setSaveSuccess(`Logo uploaded! Click "Save Brand Kit" to finalize.`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: unknown) {
      console.error('Logo upload failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingLogoType(null);
    }
  };

  // Save all Brand Kit settings
  const handleSaveBrandKit = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    const payload: Partial<BrandKit> = {
      brand_name: brandName.trim(),
      main_logo_url: mainLogoUrl,
      secondary_logo_url: secondaryLogoUrl,
      icon_logo_url: iconLogoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      background_color: backgroundColor,
      text_color: textColor,
      heading_font: headingFont,
      body_font: bodyFont,
      default_logo_position: defaultLogoPosition,
      default_logo_size: defaultLogoSize,
      default_template: defaultTemplate,
    };

    try {
      // 1. Save to local storage for instant access across tabs/refreshes
      localStorage.setItem('nur_brand_kit', JSON.stringify(payload));

      // 2. Save to Supabase API
      const res = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save brand kit');
      }

      setSaveSuccess('Brand Kit settings saved successfully! Your Main Logo will now be automatically added to all new thumbnails.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: unknown) {
      console.error('Save Brand Kit error:', err);
      // Even if API route had an issue, local storage saved it
      setSaveSuccess('Brand Kit saved locally! Your settings are active.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-sand-muted">
        <Loader2 className="w-8 h-8 text-gold-primary animate-spin" />
        <p className="font-serif text-sm">Loading Brand Kit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-deep via-emerald-dark to-emerald-deep p-6 sm:p-8 rounded-2xl border border-gold-primary/30 shadow-md text-sand-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold-light text-xs font-mono tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span>Identity & Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-ivory tracking-tight">
              Brand Kit Workspace
            </h1>
            <p className="text-sand-muted text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Configure your academy logos, signature colors, typography, and default placement.
              The <strong className="text-gold-light font-semibold">Main Logo</strong> will be automatically placed on every thumbnail you create.
            </p>
          </div>

          <Button
            onClick={handleSaveBrandKit}
            disabled={saving}
            className="bg-gold-primary hover:bg-gold-deep text-emerald-deep font-semibold px-6 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start md:self-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Brand Kit</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-dark/10 border border-emerald-primary/40 text-emerald-deep px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-primary shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Logos & Brand Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Brand Logos */}
          <Card className="p-6 border-emerald-border/30 bg-sand-ivory/80 backdrop-blur-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-sand-border/60 pb-3">
              <Upload className="w-5 h-5 text-gold-deep" />
              <h2 className="text-base font-serif font-bold text-emerald-deep">
                Brand Logos
              </h2>
            </div>

            {/* 1. Main Logo (Auto-Used on Thumbnails) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider block">
                    Main Logo <span className="text-gold-deep font-semibold">(Automatically Embedded on Thumbnails)</span>
                  </label>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    Recommended: Transparent PNG or SVG with high contrast.
                  </p>
                </div>
                {mainLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setMainLogoUrl(null)}
                    className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {mainLogoUrl ? (
                <div className="p-4 bg-emerald-deep rounded-xl border border-gold-primary/30 flex items-center justify-between">
                  <div className="p-2 bg-emerald-dark/60 rounded-lg border border-sand-border/10 max-w-[200px] max-h-[80px] flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainLogoUrl}
                      alt="Main Logo"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={uploadingLogoType === 'main'}
                    className="text-xs border-gold-primary/40 text-sand-ivory hover:bg-emerald-primary"
                  >
                    Change Logo
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => mainFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gold-primary/40 hover:border-gold-primary rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-gold-subtle/20 hover:bg-gold-subtle/40 transition-colors"
                >
                  {uploadingLogoType === 'main' ? (
                    <Loader2 className="w-6 h-6 text-gold-deep animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-gold-deep mb-2" />
                      <p className="text-xs font-semibold text-emerald-deep">
                        Click to upload Main Logo
                      </p>
                      <p className="text-[10px] text-charcoal-muted mt-1">
                        PNG, JPG, SVG, WebP up to 10MB
                      </p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleLogoUpload(e.target.files[0], 'main');
                }}
              />
            </div>

            {/* 2. Secondary & Icon Logos in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Secondary Logo */}
              <div className="space-y-2 p-3 bg-sand-muted/10 rounded-xl border border-sand-border/40">
                <label className="text-xs font-semibold text-emerald-deep block">
                  Secondary / Horizontal Logo
                </label>
                {secondaryLogoUrl ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-deep rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={secondaryLogoUrl}
                      alt="Secondary Logo"
                      className="max-h-8 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setSecondaryLogoUrl(null)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => secondaryFileInputRef.current?.click()}
                    disabled={uploadingLogoType === 'secondary'}
                  >
                    <Upload className="w-3 h-3 mr-1.5" />
                    Upload Secondary
                  </Button>
                )}
                <input
                  ref={secondaryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0], 'secondary');
                  }}
                />
              </div>

              {/* Icon Logo */}
              <div className="space-y-2 p-3 bg-sand-muted/10 rounded-xl border border-sand-border/40">
                <label className="text-xs font-semibold text-emerald-deep block">
                  Icon / Brand Mark Only
                </label>
                {iconLogoUrl ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-deep rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={iconLogoUrl}
                      alt="Icon Logo"
                      className="max-h-8 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setIconLogoUrl(null)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => iconFileInputRef.current?.click()}
                    disabled={uploadingLogoType === 'icon'}
                  >
                    <Upload className="w-3 h-3 mr-1.5" />
                    Upload Icon
                  </Button>
                )}
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0], 'icon');
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Brand Identity Details */}
          <Card className="p-6 border-emerald-border/30 bg-sand-ivory/80 backdrop-blur-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-sand-border/60 pb-3">
              <Type className="w-5 h-5 text-gold-deep" />
              <h2 className="text-base font-serif font-bold text-emerald-deep">
                Brand Name & Typography
              </h2>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-deep uppercase tracking-wider block mb-1.5">
                Brand / Academy Name
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Al Tanzeel Quran Academy"
                className="bg-sand-ivory border-sand-border/80 focus:border-gold-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-emerald-deep block mb-1.5">
                  Heading Font
                </label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full text-xs rounded-xl border border-sand-border/80 bg-sand-ivory p-2.5 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                >
                  {PRESET_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-deep block mb-1.5">
                  Body Font
                </label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full text-xs rounded-xl border border-sand-border/80 bg-sand-ivory p-2.5 text-charcoal-dark focus:border-gold-primary focus:outline-none"
                >
                  <option value="Inter">Inter (Modern Clean Sans)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Amiri">Amiri (Traditional)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Colors & Default Placement */}
        <div className="space-y-6">
          {/* Card 3: Brand Palette */}
          <Card className="p-6 border-emerald-border/30 bg-sand-ivory/80 backdrop-blur-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-sand-border/60 pb-3">
              <Palette className="w-5 h-5 text-gold-deep" />
              <h2 className="text-base font-serif font-bold text-emerald-deep">
                Brand Colors
              </h2>
            </div>

            {/* Primary Color */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-deep block">Primary Color</span>
                <span className="text-[10px] text-charcoal-muted font-mono">{primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-sand-border"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-deep block">Secondary Color</span>
                <span className="text-[10px] text-charcoal-muted font-mono">{secondaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-sand-border"
                />
              </div>
            </div>

            {/* Accent Gold */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-deep block">Accent Gold</span>
                <span className="text-[10px] text-charcoal-muted font-mono">{accentColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-sand-border"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-deep block">Background Sand</span>
                <span className="text-[10px] text-charcoal-muted font-mono">{backgroundColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-sand-border"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-deep block">Title Text Color</span>
                <span className="text-[10px] text-charcoal-muted font-mono">{textColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-sand-border"
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Default Thumbnail Placement */}
          <Card className="p-6 border-emerald-border/30 bg-sand-ivory/80 backdrop-blur-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-sand-border/60 pb-3">
              <Layout className="w-5 h-5 text-gold-deep" />
              <h2 className="text-base font-serif font-bold text-emerald-deep">
                Thumbnail Defaults
              </h2>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-deep block mb-1.5">
                Default Logo Position
              </label>
              <select
                value={defaultLogoPosition}
                onChange={(e) => setDefaultLogoPosition(e.target.value as LogoPosition)}
                className="w-full text-xs rounded-xl border border-sand-border/80 bg-sand-ivory p-2.5 text-charcoal-dark focus:border-gold-primary focus:outline-none"
              >
                <option value="bottom-right">Bottom Right (Standard)</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="none">No Logo</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-deep block mb-1.5">
                Default Logo Size
              </label>
              <select
                value={defaultLogoSize}
                onChange={(e) => setDefaultLogoSize(e.target.value as LogoSize)}
                className="w-full text-xs rounded-xl border border-sand-border/80 bg-sand-ivory p-2.5 text-charcoal-dark focus:border-gold-primary focus:outline-none"
              >
                <option value="small">Small (Subtle)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="large">Large (Prominent)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-deep block mb-1.5">
                Default Template Style
              </label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value as ThumbnailTemplate)}
                className="w-full text-xs rounded-xl border border-sand-border/80 bg-sand-ivory p-2.5 text-charcoal-dark focus:border-gold-primary focus:outline-none"
              >
                <option value="islamic_premium">Islamic Premium (Gold Frame)</option>
                <option value="minimal_quran">Minimal Quran (Deep Spiritual)</option>
                <option value="educational">Educational (Academy Bar)</option>
                <option value="blog_news">Blog News (High Contrast)</option>
                <option value="islamic_luxury">Islamic Luxury (Double Filigree)</option>
              </select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
