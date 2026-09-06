'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Building,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Mail,
  Phone,
  Clock,
  Shield,
} from 'lucide-react';
import { COMMON_TIMEZONES } from '@/lib/scheduling/timezone';

type SettingsTab = 'profile' | 'brand' | 'preferences';

export default function SettingsPage() {
  const {
    user,
    profile,
    brandSettings,
    contentPreferences,
    updateProfile,
    updateBrandSettings,
    updateContentPreferences,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Brand Settings Form State
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Content Preferences Form State
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [defaultTimezone, setDefaultTimezone] = useState('UTC');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync initial state
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (brandSettings) {
      setBrandName(brandSettings.brand_name || 'Nūr Social');
      setBrandDescription(brandSettings.brand_description || '');
      setWebsite(brandSettings.website || '');
      setContactEmail(brandSettings.contact_email || '');
      setContactPhone(brandSettings.contact_phone || '');
    }
    if (contentPreferences) {
      setDefaultLanguage(contentPreferences.default_language || 'English');
      setDefaultTimezone(contentPreferences.default_timezone || 'UTC');
    }
  }, [profile, brandSettings, contentPreferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'profile') {
        const { error: profileError } = await updateProfile({
          full_name: fullName,
          avatar_url: avatarUrl || null,
        });
        if (profileError) throw profileError;
        setSuccess('Profile updated successfully!');
      } else if (activeTab === 'brand') {
        const { error: brandError } = await updateBrandSettings({
          brand_name: brandName,
          brand_description: brandDescription,
          website,
          contact_email: contactEmail,
          contact_phone: contactPhone,
        });
        if (brandError) throw brandError;
        setSuccess('Brand settings updated successfully!');
      } else if (activeTab === 'preferences') {
        const { error: prefError } = await updateContentPreferences({
          default_language: defaultLanguage,
          default_timezone: defaultTimezone,
        });
        if (prefError) throw prefError;
        setSuccess('Content preferences updated successfully!');
      }
    } catch (err: unknown) {
      console.error('Settings save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  const languages = [
    { code: 'English', name: 'English (US & Global)' },
    { code: 'Arabic', name: 'العربية (Arabic Standard)' },
    { code: 'Urdu', name: 'اردو (Urdu)' },
    { code: 'Bahasa', name: 'Bahasa Indonesia' },
    { code: 'Malay', name: 'Bahasa Melayu' },
    { code: 'Turkish', name: 'Türkçe (Turkish)' },
    { code: 'French', name: 'Français (French)' },
  ];

  const timezones = [
    { code: 'UTC', name: 'UTC (Coordinated Universal Time)' },
    { code: 'Asia/Dubai', name: 'Asia/Dubai (GST, UTC+4)' },
    { code: 'Asia/Riyadh', name: 'Asia/Riyadh (AST, UTC+3)' },
    { code: 'Asia/Karachi', name: 'Asia/Karachi (PKT, UTC+5)' },
    { code: 'Asia/Jakarta', name: 'Asia/Jakarta (WIB, UTC+7)' },
    { code: 'Europe/London', name: 'Europe/London (GMT/BST)' },
    { code: 'America/New_York', name: 'America/New_York (EST/EDT)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 text-gold-deep text-xs font-mono font-medium mb-1">
            <span>✦</span>
            <span>Configuration</span>
            <span>✦</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-deep">
            Settings &amp; Preferences
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Configure your account identity, organization parameters, and future AI preferences.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-border pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 -mb-1 ${
            activeTab === 'profile'
              ? 'border-emerald-primary text-emerald-deep bg-sand-cream/80'
              : 'border-transparent text-charcoal-muted hover:text-emerald-deep'
          }`}
        >
          <User className="w-4 h-4 text-emerald-primary" />
          <span>User Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 -mb-1 ${
            activeTab === 'brand'
              ? 'border-emerald-primary text-emerald-deep bg-sand-cream/80'
              : 'border-transparent text-charcoal-muted hover:text-emerald-deep'
          }`}
        >
          <Building className="w-4 h-4 text-gold-primary" />
          <span>Brand Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 -mb-1 ${
            activeTab === 'preferences'
              ? 'border-emerald-primary text-emerald-deep bg-sand-cream/80'
              : 'border-transparent text-charcoal-muted hover:text-emerald-deep'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-primary" />
          <span>Content Preferences</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: User Profile */}
        {activeTab === 'profile' && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-primary" />
                <span>Personal Profile</span>
              </CardTitle>
              <CardDescription>
                Manage your name, contact information, and role permissions.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-sand-cream/60 rounded-xl border border-sand-border/70">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-primary to-emerald-dark text-sand-ivory flex items-center justify-center font-serif text-2xl font-bold shadow-sm border border-gold-primary/30">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-emerald-deep">
                    {fullName || 'Marketing User'}
                  </h4>
                  <p className="text-xs text-charcoal-muted">
                    {user?.email || profile?.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge variant="gold" size="sm" icon={<Shield className="w-3 h-3 text-gold-dark" />}>
                      Role: {profile?.role || 'Admin'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tariq Mansoor"
                required
              />

              <Input
                label="Email Address"
                value={user?.email || profile?.email || ''}
                disabled
                helperText="Email is managed by Supabase Authentication"
              />

              <Input
                label="Avatar URL (Optional)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                helperText="Link to your public profile image"
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Brand Settings */}
        {activeTab === 'brand' && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-gold-primary" />
                <span>Brand Identity</span>
              </CardTitle>
              <CardDescription>
                Information about your organization or brand. Future AI models will utilize these details to preserve brand voice.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Nūr Social / Al-Huda Academy"
                required
              />

              <Textarea
                label="Brand Description & Voice"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                rows={3}
                placeholder="Describe your brand values, tone of voice, ethical guidelines, and target audience..."
                helperText="Used by future AI to generate on-brand captions"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  leftIcon={<Globe className="w-4 h-4" />}
                />

                <Input
                  label="Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="marketing@brand.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Contact Phone / WhatsApp"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Content Preferences */}
        {activeTab === 'preferences' && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-primary" />
                <span>Content &amp; Localization Preferences</span>
              </CardTitle>
              <CardDescription>
                Set your default language and publishing timezone.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-deep tracking-wide flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-primary" />
                  <span>Default Language</span>
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full text-sm bg-sand-ivory text-charcoal-main rounded-lg border border-sand-border py-2 px-3 focus:outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-charcoal-muted">
                  Default language for AI copy generation and interface formatting.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-deep tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-primary" />
                  <span>Default Timezone</span>
                </label>
                <select
                  value={defaultTimezone}
                  onChange={(e) => setDefaultTimezone(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-sand-ivory text-charcoal-main rounded-lg border border-sand-border py-2 px-3 focus:outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 font-mono"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-charcoal-muted">
                  Used for scheduling posts and calculating accurate background execution times across global timezones.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Actions */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            leftIcon={<Save className="w-4 h-4 text-gold-light" />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
