'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  MediaItem,
  Post,
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  PlatformContentData,
  QualityCheckResult,
  ContentVersion,
  SocialAccountPublic,
  PublishTarget,
  PlatformPublishResult,
  ScheduleRequestPayload,
  ScheduleTarget,
} from '@/lib/types/database';
import { MediaDropzone } from '@/components/media/MediaDropzone';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { PlatformTabs, PLATFORM_INFO } from '@/components/ai/PlatformTabs';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { PlatformPreviewCard } from '@/components/ai/PlatformPreviewCard';
import { PlatformComparisonTable } from '@/components/ai/PlatformComparisonTable';
import { ContentEditorModal } from '@/components/ai/ContentEditorModal';
import { OptimizeModal } from '@/components/ai/OptimizeModal';
import { VersionHistoryModal } from '@/components/ai/VersionHistoryModal';
import { GenerationProgress } from '@/components/ai/GenerationProgress';
import { PublishConfirmModal } from '@/components/publishing/PublishConfirmModal';
import { PublishProgressModal } from '@/components/publishing/PublishProgressModal';
import { ScheduleModal } from '@/components/scheduling/ScheduleModal';
import { DuplicateCheckWarning } from '@/lib/ai/similarity-engine';
import {
  FileText,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  Languages,
  Sliders,
  Share2,
  Send,
  Save,
  Download,
  ArrowLeft,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  Check,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

const ALL_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'whatsapp',
];

const LANGUAGE_OPTIONS: { id: ContentLanguage; label: string; urdu: string }[] = [
  { id: 'urdu', label: 'Urdu (اردو)', urdu: 'اردو' },
  { id: 'english', label: 'English', urdu: 'انگریزی' },
  { id: 'arabic', label: 'Arabic (العربية)', urdu: 'عربی' },
  { id: 'bilingual_urdu_en', label: 'Bilingual (Urdu + English)', urdu: 'دو لسانی (اردو + انگریزی)' },
  { id: 'bilingual_ar_urdu', label: 'Bilingual (Arabic + Urdu)', urdu: 'دو لسانی (عربی + اردو)' },
  { id: 'auto', label: 'Auto Detect', urdu: 'خودکار' },
];

const TONE_OPTIONS: { id: ContentTone; label: string; desc: string }[] = [
  { id: 'islamic', label: '🌿 Islamic & Dignified (باوقار و روحانی)', desc: 'Faithful, respectful, spiritually uplifting' },
  { id: 'professional', label: '💼 Professional & Authoritative (پیشہ ورانہ)', desc: 'Polished, structured, clear and reliable' },
  { id: 'friendly', label: '🤝 Warm & Engaging (دوستانہ و پرخلوص)', desc: 'Accessible, conversational, community-centric' },
  { id: 'educational', label: '📚 Educational & Informative (تعلیمی و فکری)', desc: 'Insightful, step-by-step, analytical' },
  { id: 'emotional', label: '❤️ Emotional & Heartfelt (دل نشین و جذباتی)', desc: 'Deeply moving, inspirational, heartfelt' },
  { id: 'marketing', label: '🚀 High Conversion & Marketing (مارکیٹنگ)', desc: 'Strong hook, action-oriented, viral' },
  { id: 'concise', label: '⚡ Concise & Direct (مختصر و جامع)', desc: 'Punchy, straight to the point, minimal' },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isConfigured, isDemoMode } = useAuth();
  const supabase = createClient();

  // Media state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Form Inputs
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [language, setLanguage] = useState<ContentLanguage>('urdu');
  const [tone, setTone] = useState<ContentTone>('islamic');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(ALL_PLATFORMS);

  // UI Flow State: 'input' | 'generating' | 'studio'
  const [currentView, setCurrentView] = useState<'input' | 'generating' | 'studio'>('input');
  const [studioSubView, setStudioSubView] = useState<'mockup' | 'matrix'>('mockup');
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('facebook');

  // Generated Content & Validation
  const [generatedContent, setGeneratedContent] = useState<Record<SocialPlatform, PlatformContentData>>({} as Record<SocialPlatform, PlatformContentData>);
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateCheckWarning[]>([]);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishProgressOpen, setIsPublishProgressOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [publishResults, setPublishResults] = useState<PlatformPublishResult[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccountPublic[]>([]);

  // Status flags
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch Media Library & Connected Social Accounts
  useEffect(() => {
    const fetchExistingMedia = async () => {
      if (!user) return;
      try {
        if (!isConfigured || isDemoMode) {
          const stored = localStorage.getItem('nur_demo_media');
          if (stored) setExistingMedia(JSON.parse(stored));
        } else {
          const { data, error: fetchError } = await supabase
            .from('media')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          setExistingMedia(data || []);
        }
      } catch (err) {
        console.warn('Error fetching media for picker:', err);
      }
    };

    const fetchConnectedAccounts = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/social-accounts');
        if (res.ok) {
          const data = await res.json();
          setConnectedAccounts(data.accounts || []);
        }
      } catch (err) {
        console.warn('Error fetching connected accounts:', err);
      }
    };

    fetchExistingMedia();
    fetchConnectedAccounts();
  }, [user?.id, isConfigured, isDemoMode]);

  // Pre-fill from URL Search Parameters (e.g. from AI Marketing Ideas / Repurpose Engine)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTopic = params.get('topic');
      const urlNotes = params.get('notes');
      const urlPlatform = params.get('platform') as SocialPlatform | null;

      if (urlTopic) {
        setTopic(urlTopic);
        setTitle(urlTopic);
      }
      if (urlNotes) {
        setAdditionalInstructions(urlNotes);
      }
      if (urlPlatform && ALL_PLATFORMS.includes(urlPlatform)) {
        setActivePlatform(urlPlatform);
        setSelectedPlatforms([urlPlatform]);
      }
    }
  }, []);

  // Platform selection toggling
  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) return;
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSelectAllPlatforms = () => {
    if (selectedPlatforms.length === ALL_PLATFORMS.length) {
      setSelectedPlatforms(['facebook']);
    } else {
      setSelectedPlatforms(ALL_PLATFORMS);
    }
  };

  // Generate All AI Content
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!topic.trim()) {
      setError('Please provide a topic or concept for the post.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one social media platform.');
      return;
    }

    setCurrentView('generating');

    try {
      // 1. Create a Post entry if Supabase is connected
      let newPostId: string | null = null;
      if (user && isConfigured && !isDemoMode) {
        const { data: postRow, error: postErr } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            media_id: selectedMedia?.id || null,
            title: title.trim() || null,
            topic: topic.trim(),
            notes: additionalInstructions.trim() || null,
            status: 'processing',
          })
          .select('id')
          .single();

        if (postErr) {
          console.warn('Post creation warning:', postErr);
        } else if (postRow) {
          newPostId = postRow.id;
          setCreatedPostId(postRow.id);
        }
      }

      // 2. Call Generation API Route
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: newPostId,
          topic: topic.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined,
          language,
          tone,
          platforms: selectedPlatforms,
          mediaId: selectedMedia?.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate AI content');
      }

      const data = await response.json();

      setGeneratedContent(data.content || {});
      setDuplicateWarnings(data.duplicateWarnings || []);

      if (selectedPlatforms.length > 0) {
        setActivePlatform(selectedPlatforms[0]);
      }

      setCurrentView('studio');
      setSuccess('AI Platform Optimization complete! Review scores, suggestions, and platform copy below.');
    } catch (err: unknown) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'AI generation failed');
      setCurrentView('input');
    }
  };

  // One-Click Single Platform AI Optimization
  const handleOptimizePlatform = async (instruction: string) => {
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: createdPostId,
          platform: activePlatform,
          currentContent: generatedContent[activePlatform] || {},
          instruction,
          topic: topic.trim(),
          language,
          tone,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to optimize platform');
      }

      const data = await response.json();

      setGeneratedContent((prev) => ({
        ...prev,
        [activePlatform]: data.content,
      }));

      setSuccess(`AI successfully optimized content for ${PLATFORM_INFO[activePlatform].name} (v${data.version})!`);
    } catch (err) {
      throw err;
    }
  };

  // Restore previous version
  const handleRestoreVersion = (versionSnapshot: ContentVersion) => {
    const restored: PlatformContentData = {
      title: versionSnapshot.title || undefined,
      hook: versionSnapshot.hook || undefined,
      caption: versionSnapshot.caption || undefined,
      description: versionSnapshot.description || undefined,
      hashtags: versionSnapshot.hashtags || [],
      keywords: versionSnapshot.keywords || [],
      tags: versionSnapshot.tags || [],
      cta: versionSnapshot.cta || undefined,
      alt_text: versionSnapshot.alt_text || undefined,
      suggested_on_screen_text: versionSnapshot.suggested_on_screen_text || undefined,
      suggested_opening_line: versionSnapshot.suggested_opening_line || undefined,
      chapters: versionSnapshot.chapters || [],
      quality_score: versionSnapshot.quality_score,
      score_breakdown: versionSnapshot.score_breakdown,
      optimization_suggestions: versionSnapshot.optimization_suggestions,
      optimization_status: 'optimized',
    };

    setGeneratedContent((prev) => ({
      ...prev,
      [activePlatform]: restored,
    }));

    setSuccess(`Restored ${PLATFORM_INFO[activePlatform].name} to Version ${versionSnapshot.version}!`);
  };

  // Manual Inline Edit Save
  const handleSaveInlineEdit = (updated: PlatformContentData) => {
    setGeneratedContent((prev) => ({
      ...prev,
      [activePlatform]: {
        ...updated,
        optimization_status: 'edited',
      },
    }));
    setSuccess(`Saved edits for ${PLATFORM_INFO[activePlatform].name}`);
  };

  // Toggle approval status for a platform
  const handleToggleApprovePlatform = (platform: SocialPlatform) => {
    setGeneratedContent((prev) => {
      const current = prev[platform];
      if (!current) return prev;
      const isCurrentlyApproved = current.optimization_status === 'approved';
      return {
        ...prev,
        [platform]: {
          ...current,
          optimization_status: isCurrentlyApproved ? 'optimized' : 'approved',
        },
      };
    });
  };

  // Save All as Ready Posts to Supabase / Local Storage
  const handleSaveAllDrafts = async () => {
    setSavingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      if (user && isConfigured && !isDemoMode && createdPostId) {
        await supabase
          .from('posts')
          .update({ status: 'ready', updated_at: new Date().toISOString() })
          .eq('id', createdPostId);

        for (const platform of selectedPlatforms) {
          const content = generatedContent[platform];
          if (!content) continue;

          await supabase.from('platform_content').upsert(
            {
              post_id: createdPostId,
              user_id: user.id,
              platform,
              title: content.title || null,
              hook: content.hook || null,
              caption: content.caption || null,
              description: content.description || null,
              hashtags: content.hashtags || [],
              keywords: content.keywords || [],
              tags: content.tags || [],
              cta: content.cta || null,
              alt_text: content.alt_text || null,
              suggested_on_screen_text: content.suggested_on_screen_text || null,
              suggested_opening_line: content.suggested_opening_line || null,
              chapters: content.chapters || [],
              seo_keywords: content.seo_keywords || {},
              hashtag_categories: content.hashtag_categories || {},
              status: content.optimization_status === 'approved' ? 'approved' : 'draft',
              optimization_status: content.optimization_status || 'optimized',
              quality_score: content.quality_score || 95,
              score_breakdown: content.score_breakdown || {},
              optimization_suggestions: content.optimization_suggestions || [],
              optimized_at: new Date().toISOString(),
            },
            { onConflict: 'post_id,platform' }
          );
        }
      } else {
        const demoPost: Post = {
          id: createdPostId || `post_${Date.now()}`,
          user_id: user?.id || '00000000-0000-0000-0000-000000000001',
          media_id: selectedMedia?.id || null,
          media: selectedMedia,
          title: title.trim() || null,
          topic: topic.trim(),
          notes: additionalInstructions.trim() || null,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const storedPosts = localStorage.getItem('nur_demo_posts');
        const list = storedPosts ? JSON.parse(storedPosts) : [];
        list.unshift(demoPost);
        localStorage.setItem('nur_demo_posts', JSON.stringify(list));
      }

      setSuccess('All optimized platform content saved successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: unknown) {
      console.error('Save drafts error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save drafts');
    } finally {
      setSavingDraft(false);
    }
  };

  // Export all platform content as JSON
  const handleExportAll = () => {
    const exportData = {
      project: 'Nūr Social - Phase 3 Platform Optimization Engine Export',
      topic,
      language,
      tone,
      timestamp: new Date().toISOString(),
      platforms: generatedContent,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nur-social-optimized-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Phase 5: Execute Multi-Platform Publishing
  const handleExecutePublish = async (targets: PublishTarget[]) => {
    setIsPublishing(true);
    setIsPublishConfirmOpen(false);
    setIsPublishProgressOpen(true);

    // Populate initial progress states
    setPublishResults(
      targets.map((t) => ({
        jobId: `temp_${t.platform}_${Date.now()}`,
        platform: t.platform,
        accountId: t.accountId,
        accountName: t.accountName || t.platform,
        status: 'processing',
      }))
    );

    try {
      const res = await fetch('/api/publishing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: createdPostId || undefined,
          mediaId: selectedMedia?.id || undefined,
          targets,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publishing request failed');
      }

      setPublishResults(data.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publishing failed';
      setPublishResults((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'failed',
          errorMessage: msg,
        }))
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRetrySingleJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/publishing/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPublishResults((prev) =>
          prev.map((j) => (j.jobId === jobId ? updated : j))
        );
      }
    } catch (e) {
      console.error('Retry error:', e);
    }
  };

  // Phase 6: Open Schedule Modal (with Approved Content validation check)
  const handleOpenScheduleModal = () => {
    // Check if at least one selected platform is approved
    const hasApproved = selectedPlatforms.some(
      (p) => generatedContent[p] && generatedContent[p].optimization_status === 'approved'
    );
    if (!hasApproved) {
      setError('اس content کو schedule کرنے سے پہلے approve کرنا ضروری ہے۔ (Please approve content for at least one platform before scheduling)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setIsScheduleModalOpen(true);
  };

  // Phase 6: Confirm and Dispatch Scheduling
  const handleConfirmSchedule = async (payload: {
    scheduledForUtc: string;
    timezone: string;
    targets: ScheduleTarget[];
  }) => {
    try {
      const res = await fetch('/api/scheduling/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: payload.scheduledForUtc,
          timezone: payload.timezone,
          targets: payload.targets,
          postId: createdPostId || undefined,
          mediaId: selectedMedia?.id || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule post');
      }

      setSuccess(data.message || `Successfully scheduled ${data.schedules?.length || 0} post(s)! Redirecting to Content Calendar...`);
      setTimeout(() => {
        router.push('/dashboard/calendar');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Scheduling failed';
      setError(msg);
      throw err;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 text-gold-deep text-xs font-mono font-medium mb-1">
            <span>✦</span>
            <span>Nūr Social Engine • فیز 3</span>
            <span>✦</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-deep">
            {currentView === 'studio' ? 'Platform Optimization Studio' : 'Create & Optimize Social Post'}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            {currentView === 'studio'
              ? 'Multi-platform optimization matrix, quality scores, SEO keywords, and realistic channel mockups.'
              : 'Provide your topic and media once. AI will engineer distinct, SEO-optimized, platform-tailored copy.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentView === 'studio' ? (
            <Badge variant="ready" size="md">
              Phase 3 • Optimized
            </Badge>
          ) : (
            <Badge variant="gold" size="md">
              Phase 3 • Optimization Engine
            </Badge>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* VIEW 1: Input Setup Form */}
      {currentView === 'input' && (
        <form onSubmit={handleGenerateAI} className="space-y-6 animate-fadeIn">
          {/* Section 1: Media Attachment */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="w-4 h-4 text-emerald-primary" />
                    <span>1. Media Attachment (Optional)</span>
                  </CardTitle>
                  <CardDescription>
                    Attach an image or video. AI will inspect and align captions with the media format.
                  </CardDescription>
                </div>

                {existingMedia.length > 0 && !selectedMedia && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    leftIcon={<Layers className="w-3.5 h-3.5" />}
                  >
                    {showMediaPicker ? 'Hide Library' : 'Choose from Library'}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {selectedMedia ? (
                <div className="relative bg-sand-cream/80 rounded-xl border border-sand-border p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-24 bg-charcoal-main rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {selectedMedia.file_type === 'video' ? (
                      <div className="flex flex-col items-center justify-center text-sand-ivory">
                        <Film className="w-6 h-6 text-gold-primary mb-1" />
                        <span className="text-[10px] font-mono uppercase">Video</span>
                      </div>
                    ) : (
                      <Image
                        src={selectedMedia.public_url}
                        alt={selectedMedia.file_name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] font-mono uppercase text-gold-deep bg-gold-subtle px-1.5 py-0.5 rounded border border-gold-border/40 inline-block mb-1">
                      Attached {selectedMedia.file_type}
                    </span>
                    <h4 className="text-sm font-semibold text-emerald-deep truncate" title={selectedMedia.file_name}>
                      {selectedMedia.file_name}
                    </h4>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      {selectedMedia.mime_type} • Status: {selectedMedia.status}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMedia(null)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Remove
                  </Button>
                </div>
              ) : showMediaPicker ? (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-emerald-deep flex items-center justify-between">
                    <span>Select from your Media Library:</span>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(false)}
                      className="text-xs text-charcoal-muted hover:text-emerald-primary"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                    {existingMedia.map((media) => (
                      <div
                        key={media.id}
                        onClick={() => {
                          setSelectedMedia(media);
                          setShowMediaPicker(false);
                        }}
                        className="group cursor-pointer rounded-lg border border-sand-border bg-sand-ivory p-2 hover:border-gold-primary hover:shadow-subtle transition-all flex flex-col"
                      >
                        <div className="relative aspect-video w-full bg-charcoal-main/5 rounded overflow-hidden flex items-center justify-center mb-1.5">
                          {media.file_type === 'video' ? (
                            <Film className="w-5 h-5 text-gold-primary" />
                          ) : (
                            <Image
                              src={media.public_url}
                              alt={media.file_name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-emerald-deep truncate">
                          {media.file_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <MediaDropzone
                  onUploadSuccess={(uploadedMedia) => {
                    setSelectedMedia(uploadedMedia);
                    setExistingMedia((prev) => [uploadedMedia, ...prev]);
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Section 2: Topic & Context */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-emerald-primary" />
                <span>2. Topic, Theme & Islamic Nuance</span>
              </CardTitle>
              <CardDescription>
                Describe the core idea or Islamic lesson you wish to convey.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Campaign Title (Optional Reference)"
                placeholder="e.g., Friday Reflection — Virtues of Sadaqah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="Post Topic & Context *"
                rows={4}
                required
                placeholder="Describe what this post is about in detail... (Urdu, English or Arabic) e.g., اہمیتِ وقت اور اسلامی طرزِ زندگی، قرآن کے حقوق، یا اخلاقی رہنمائی..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                helperText="AI analyzes this prompt to create tailored copy across all platforms."
              />

              <Textarea
                label="Additional Instructions / Callout Guidelines (Optional)"
                rows={2}
                placeholder="e.g., Include reference to our upcoming online course, keep hooks energetic, mention website link..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Section 3: Language & Tone Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Languages className="w-4 h-4 text-emerald-primary" />
                  <span>3. Content Language</span>
                </CardTitle>
                <CardDescription>Choose output linguistic style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      language === opt.id
                        ? 'bg-gold-subtle/40 border-gold-primary text-emerald-deep font-semibold shadow-subtle'
                        : 'border-sand-border/70 hover:bg-sand-muted/40 text-charcoal-main'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="contentLanguage"
                        checked={language === opt.id}
                        onChange={() => setLanguage(opt.id)}
                        className="text-emerald-primary focus:ring-gold-primary"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Tone Selector */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sliders className="w-4 h-4 text-emerald-primary" />
                  <span>4. Tone & Voice</span>
                </CardTitle>
                <CardDescription>Select messaging atmosphere</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {TONE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      tone === opt.id
                        ? 'bg-gold-subtle/40 border-gold-primary text-emerald-deep font-semibold shadow-subtle'
                        : 'border-sand-border/70 hover:bg-sand-muted/40 text-charcoal-main'
                    }`}
                  >
                    <input
                      type="radio"
                      name="contentTone"
                      checked={tone === opt.id}
                      onChange={() => setTone(opt.id)}
                      className="text-emerald-primary focus:ring-gold-primary mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-emerald-deep">{opt.label}</div>
                      <div className="text-[11px] text-charcoal-muted mt-0.5 font-normal">
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Target Platforms */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Share2 className="w-4 h-4 text-emerald-primary" />
                    <span>5. Target Social Platforms</span>
                  </CardTitle>
                  <CardDescription>
                    AI will engineer tailored copy for each selected channel.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllPlatforms}
                  className="text-xs text-emerald-primary"
                >
                  {selectedPlatforms.length === ALL_PLATFORMS.length ? 'Deselect All' : 'Select All (6)'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ALL_PLATFORMS.map((platform) => {
                  const info = PLATFORM_INFO[platform];
                  const isSelected = selectedPlatforms.includes(platform);

                  return (
                    <div
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col items-center text-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-subtle/60 border-emerald-primary shadow-subtle text-emerald-deep font-semibold'
                          : 'bg-sand-ivory border-sand-border text-charcoal-muted hover:border-gold-primary/50 opacity-60'
                      }`}
                    >
                      <SocialIcon platform={platform} className={`w-5 h-5 ${isSelected ? info.color : 'text-charcoal-light'}`} />
                      <div className="text-xs">
                        <div>{info.name}</div>
                        <div className="text-[10px] text-charcoal-muted">{info.urduName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Generation Action Bar */}
          <div className="p-6 bg-sand-ivory rounded-2xl border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-emerald-deep">
                Ready to unleash Nūr AI Platform Optimization Engine?
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Targeting {selectedPlatforms.length} platform(s) • Tone: {tone} • Language: {language}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Sparkles className="w-5 h-5 text-gold-light animate-pulse" />}
              className="w-full sm:w-auto shadow-elevated"
            >
              Generate & Optimize All Platforms
            </Button>
          </div>
        </form>
      )}

      {/* VIEW 2: Generation Progress Animation */}
      {currentView === 'generating' && (
        <div className="py-8 max-w-2xl mx-auto">
          <GenerationProgress />
        </div>
      )}

      {/* VIEW 3: Studio & Multi-Platform Previews */}
      {currentView === 'studio' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Studio Navigation / Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-sand-ivory rounded-2xl border border-sand-border shadow-xs">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('input')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Input Setup
              </Button>

              {/* View Switcher: Mockup vs Matrix Table */}
              <div className="inline-flex rounded-xl bg-sand-cream p-1 border border-sand-border">
                <button
                  type="button"
                  onClick={() => setStudioSubView('mockup')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    studioSubView === 'mockup'
                      ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                      : 'text-charcoal-muted hover:text-emerald-deep'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Channel Mockup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioSubView('matrix')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    studioSubView === 'matrix'
                      ? 'bg-sand-ivory text-emerald-deep shadow-xs border border-sand-border/80'
                      : 'text-charcoal-muted hover:text-emerald-deep'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Comparison Matrix</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export All (JSON)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveAllDrafts}
                loading={savingDraft}
                leftIcon={<Save className="w-3.5 h-3.5 text-gold-light" />}
              >
                Save Draft
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenScheduleModal}
                leftIcon={<Calendar className="w-3.5 h-3.5 text-gold-deep" />}
                className="border-gold-primary/60 text-emerald-deep hover:bg-gold-subtle font-semibold"
              >
                📅 Schedule (شیڈول کریں)
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsPublishConfirmOpen(true)}
                leftIcon={<Send className="w-3.5 h-3.5 text-gold-light" />}
                className="shadow-elevated bg-emerald-primary hover:bg-emerald-deep text-gold-light border border-gold-primary/40 font-semibold"
              >
                🚀 Publish Now (اب پبلش کریں)
              </Button>
            </div>
          </div>

          {/* Duplicate Content Warnings (if any) */}
          {duplicateWarnings.length > 0 && (
            <div className="p-4 bg-amber-50/95 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-900 animate-fadeIn">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Duplicate Content Warning (مشابہت کی تنبیہ):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 pl-1">
                {duplicateWarnings.map((dw, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {dw.message.ur} ({dw.message.en})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SUB-VIEW 1: Visual Channel Mockups */}
          {studioSubView === 'mockup' && (
            <div className="space-y-6">
              {/* Platform Switcher Tabs */}
              <PlatformTabs
                activePlatform={activePlatform}
                onSelectPlatform={setActivePlatform}
                availablePlatforms={selectedPlatforms}
              />

              {/* Active Platform Preview Card */}
              {generatedContent[activePlatform] ? (
                <PlatformPreviewCard
                  platform={activePlatform}
                  content={generatedContent[activePlatform]}
                  media={selectedMedia}
                  onEdit={() => setIsEditorOpen(true)}
                  onOptimize={() => setIsOptimizeOpen(true)}
                  onOpenVersions={() => setIsVersionsOpen(true)}
                  onToggleApprove={() => handleToggleApprovePlatform(activePlatform)}
                />
              ) : (
                <div className="p-8 text-center bg-sand-ivory rounded-2xl border border-sand-border space-y-3">
                  <p className="text-xs text-charcoal-muted">
                    No content generated for {PLATFORM_INFO[activePlatform]?.name} yet.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsOptimizeOpen(true)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Optimize for {PLATFORM_INFO[activePlatform]?.name}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: Multi-Platform Comparison Matrix */}
          {studioSubView === 'matrix' && (
            <PlatformComparisonTable
              contents={generatedContent}
              availablePlatforms={selectedPlatforms}
              onSelectPlatform={(p) => {
                setActivePlatform(p);
                setStudioSubView('mockup');
              }}
              onOptimizePlatform={(p) => {
                setActivePlatform(p);
                setIsOptimizeOpen(true);
              }}
              onApprovePlatform={handleToggleApprovePlatform}
            />
          )}

          {/* Inline Edit Modal */}
          {isEditorOpen && generatedContent[activePlatform] && (
            <ContentEditorModal
              isOpen={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              platform={activePlatform}
              initialContent={generatedContent[activePlatform]}
              onSave={handleSaveInlineEdit}
            />
          )}

          {/* One-Click AI Optimization Modal */}
          {isOptimizeOpen && (
            <OptimizeModal
              isOpen={isOptimizeOpen}
              onClose={() => setIsOptimizeOpen(false)}
              platform={activePlatform}
              currentContent={generatedContent[activePlatform] || {}}
              onOptimize={handleOptimizePlatform}
            />
          )}

          {/* Version History Modal */}
          {isVersionsOpen && (
            <VersionHistoryModal
              isOpen={isVersionsOpen}
              onClose={() => setIsVersionsOpen(false)}
              postId={createdPostId}
              platform={activePlatform}
              onRestoreVersion={handleRestoreVersion}
            />
          )}

          {/* Phase 5: Publish Confirmation Modal */}
          {isPublishConfirmOpen && (
            <PublishConfirmModal
              isOpen={isPublishConfirmOpen}
              onClose={() => setIsPublishConfirmOpen(false)}
              onConfirm={handleExecutePublish}
              platforms={selectedPlatforms}
              contents={generatedContent}
              media={selectedMedia}
              accounts={connectedAccounts}
              isPublishing={isPublishing}
            />
          )}

          {/* Phase 5: Live Publish Progress Modal */}
          {isPublishProgressOpen && (
            <PublishProgressModal
              isOpen={isPublishProgressOpen}
              onClose={() => setIsPublishProgressOpen(false)}
              results={publishResults}
              isLoading={isPublishing}
              onRetrySingle={handleRetrySingleJob}
            />
          )}

          {/* Phase 6: Smart Scheduling Modal */}
          {isScheduleModalOpen && (
            <ScheduleModal
              isOpen={isScheduleModalOpen}
              onClose={() => setIsScheduleModalOpen(false)}
              onConfirm={handleConfirmSchedule}
              platforms={selectedPlatforms}
              contents={generatedContent}
              media={selectedMedia}
              accounts={connectedAccounts}
            />
          )}
        </div>
      )}
    </div>
  );
}
