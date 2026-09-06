'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { MediaItem, DashboardStats } from '@/lib/types/database';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { AIMarketingSummaryCard } from '@/components/dashboard/AIMarketingSummaryCard';
import { QuickDraftCard } from '@/components/dashboard/QuickDraftCard';
import { UpcomingSchedulesCard } from '@/components/dashboard/UpcomingSchedulesCard';
import { RecentMediaSection } from '@/components/dashboard/RecentMediaSection';
import { MediaPreviewModal } from '@/components/media/MediaPreviewModal';
import { DeleteConfirmModal } from '@/components/media/DeleteConfirmModal';

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
      {/* 1. Statistics Cards */}
      <section>
        <StatsGrid
          totalMedia={stats.totalMedia}
          draftPosts={stats.draftPosts}
          publishedPosts={stats.publishedPosts}
          connectedAccounts={stats.connectedAccounts}
          loading={loading}
        />
      </section>

      {/* 2. AI Marketing Intelligence Highlight */}
      <section>
        <AIMarketingSummaryCard />
      </section>

      {/* 3. Quick Action Draft Card */}
      <section>
        <QuickDraftCard />
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
