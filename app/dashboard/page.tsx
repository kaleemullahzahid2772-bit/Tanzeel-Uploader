'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { MediaItem, DashboardStats } from '@/lib/types/database';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { AIMarketingSummaryCard } from '@/components/dashboard/AIMarketingSummaryCard';
import { QuickDraftCard } from '@/components/dashboard/QuickDraftCard';
import { UpcomingSchedulesCard } from '@/components/dashboard/UpcomingSchedulesCard';
import { RecentMediaSection } from '@/components/dashboard/RecentMediaSection';
import { MediaPreviewModal } from '@/components/media/MediaPreviewModal';
import { DeleteConfirmModal } from '@/components/media/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Wand2, Palette, Image as ImageIcon, Share2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, isConfigured, isDemoMode } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMedia: 0,
    draftPosts: 0,
    publishedPosts: 0,
    connectedAccounts: 0,
  });
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deleteMedia, setDeleteMedia] = useState<MediaItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        if (!isConfigured || isDemoMode) {
          // Load from sandbox localStorage
          const storedMedia = localStorage.getItem('nur_demo_media');
          const mediaItems: MediaItem[] = storedMedia ? JSON.parse(storedMedia) : [];

          const storedPosts = localStorage.getItem('nur_demo_posts');
          const postsList = storedPosts ? JSON.parse(storedPosts) : [];
          const draftCount = postsList.filter((p: { status: string }) => p.status === 'draft').length;

          setMediaList(mediaItems);
          setStats({
            totalMedia: mediaItems.length,
            draftPosts: draftCount,
            publishedPosts: 0,
            connectedAccounts: 0,
          });
        } else {
          // 1. Fetch Media items & Total Media count
          const { data: mediaData, count: mediaCount, error: mediaError } = await supabase
            .from('media')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (mediaError) throw mediaError;

          // 2. Fetch Draft posts count
          const { count: draftCount, error: draftError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'draft');

          if (draftError) throw draftError;

          // 3. Fetch Published posts count from posts or publishing_jobs
          const { count: publishedCount, error: pubError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'published');

          if (pubError) throw pubError;

          // 4. Fetch Connected Social Accounts count safely via API
          let accountsCount = 0;
          try {
            const accRes = await fetch('/api/social-accounts');
            if (accRes.ok) {
              const accData = await accRes.json();
              accountsCount = (accData.accounts || []).filter((a: { status: string }) => a.status === 'connected').length;
            }
          } catch {
            accountsCount = 0;
          }

          setMediaList(mediaData || []);
          setStats({
            totalMedia: mediaCount || 0,
            draftPosts: draftCount || 0,
            publishedPosts: publishedCount || 0,
            connectedAccounts: accountsCount,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, isConfigured, isDemoMode]);

  const handleDeleteSuccess = (deletedId: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== deletedId));
    setStats((prev) => ({
      ...prev,
      totalMedia: Math.max(0, prev.totalMedia - 1),
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. MARKETING WORKSPACE HERO SECTION */}
      <section className="bg-gradient-to-r from-emerald-deep via-emerald-dark to-emerald-deep p-6 sm:p-8 rounded-2xl border border-gold-primary/30 shadow-md text-sand-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold-light text-xs font-mono tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span>Marketing Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-ivory tracking-tight">
              AI Thumbnail Maker
            </h1>
            <p className="text-sand-muted text-xs sm:text-sm max-w-2xl leading-relaxed">
              Craft beautiful, publication-ready thumbnails for your WordPress blog posts with 100% exact title preservation and automatic brand kit integration.
            </p>
          </div>

          <Link href="/dashboard/thumbnail-maker" className="shrink-0">
            <Button className="bg-gold-primary hover:bg-gold-deep text-emerald-deep font-bold text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
              <Wand2 className="w-4 h-4" />
              <span>Create Thumbnail</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. CORE WORKSPACE CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Thumbnail Maker */}
        <Card className="p-5 border-emerald-primary/40 bg-sand-ivory/90 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-primary/10 border border-emerald-primary/30 flex items-center justify-center text-emerald-deep group-hover:bg-emerald-primary group-hover:text-gold-light transition-all">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-emerald-deep text-sm">
                AI Thumbnail Maker
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-snug">
                Generate high-res WordPress blog featured images with exact title preservation.
              </p>
            </div>
          </div>
          <Link href="/dashboard/thumbnail-maker" className="mt-4">
            <Button size="sm" className="w-full text-xs bg-emerald-primary text-gold-light hover:bg-emerald-deep">
              Open Maker
            </Button>
          </Link>
        </Card>

        {/* Card 2: Brand Kit */}
        <Card className="p-5 border-sand-border/70 bg-sand-ivory/90 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-deep group-hover:bg-gold-primary group-hover:text-emerald-deep transition-all">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-emerald-deep text-sm">
                Brand Kit
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-snug">
                Manage your logos, academy colors, and default automated thumbnail branding.
              </p>
            </div>
          </div>
          <Link href="/dashboard/brand-kit" className="mt-4">
            <Button size="sm" variant="outline" className="w-full text-xs text-emerald-deep border-emerald-primary/30 hover:bg-emerald-primary/10">
              Manage Kit
            </Button>
          </Link>
        </Card>

        {/* Card 3: Media Library */}
        <Card className="p-5 border-sand-border/70 bg-sand-ivory/90 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sand-muted/20 border border-sand-border/80 flex items-center justify-center text-emerald-deep group-hover:bg-sand-muted/40 transition-all">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-emerald-deep text-sm">
                Media Library
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-snug">
                Browse and organize your uploaded images, videos, and graphics.
              </p>
            </div>
          </div>
          <Link href="/dashboard/media" className="mt-4">
            <Button size="sm" variant="outline" className="w-full text-xs text-emerald-deep border-emerald-primary/30 hover:bg-emerald-primary/10">
              View Media
            </Button>
          </Link>
        </Card>

        {/* Card 4: Social Accounts (Coming Soon) */}
        <Card className="p-5 border-sand-border/40 bg-sand-muted/10 opacity-75 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sand-muted/20 border border-sand-border/60 flex items-center justify-center text-sand-muted">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-sand-muted/20 text-charcoal-muted uppercase tracking-wider font-semibold">
                Coming Soon
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal-dark text-sm">
                Social Accounts
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-snug">
                Automated publishing to Facebook, Instagram, and TikTok will be available soon.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" disabled variant="outline" className="w-full text-xs opacity-60 cursor-not-allowed">
              In Development
            </Button>
          </div>
        </Card>
      </section>

      {/* 3. Statistics Cards */}
      <section>
        <StatsGrid
          totalMedia={stats.totalMedia}
          draftPosts={stats.draftPosts}
          publishedPosts={stats.publishedPosts}
          connectedAccounts={stats.connectedAccounts}
          loading={loading}
        />
      </section>

      {/* 3. Upcoming Scheduled Posts Section */}
      <section>
        <UpcomingSchedulesCard />
      </section>

      {/* 4. Recent Media Section */}
      <section>
        <RecentMediaSection
          mediaList={mediaList}
          loading={loading}
          onPreview={(media) => setPreviewMedia(media)}
          onDelete={(media) => setDeleteMedia(media)}
        />
      </section>

      {/* Preview Modal */}
      <MediaPreviewModal
        media={previewMedia}
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        media={deleteMedia}
        isOpen={Boolean(deleteMedia)}
        onClose={() => setDeleteMedia(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
