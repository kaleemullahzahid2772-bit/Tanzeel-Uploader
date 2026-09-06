'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { MediaItem } from '@/lib/types/database';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaDropzone } from '@/components/media/MediaDropzone';
import { MediaPreviewModal } from '@/components/media/MediaPreviewModal';
import { DeleteConfirmModal } from '@/components/media/DeleteConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Upload,
  Search,
  Image as ImageIcon,
  Film,
  Layers,
} from 'lucide-react';

type FilterType = 'all' | 'image' | 'video';

export default function MediaLibraryPage() {
  const { user, isConfigured, isDemoMode } = useAuth();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deleteMedia, setDeleteMedia] = useState<MediaItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchMedia = async () => {
      if (!user) return;
      setLoading(true);

      try {
        if (!isConfigured || isDemoMode) {
          const stored = localStorage.getItem('nur_demo_media');
          const items: MediaItem[] = stored ? JSON.parse(stored) : [];
          setMediaList(items);
        } else {
          const { data, error } = await supabase
            .from('media')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setMediaList(data || []);
        }
      } catch (err) {
        console.error('Failed to load media library:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [user?.id, isConfigured, isDemoMode]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesType =
        filterType === 'all' ? true : item.file_type === filterType;
      const matchesSearch = item.file_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [mediaList, filterType, searchQuery]);

  const imageCount = mediaList.filter((m) => m.file_type === 'image').length;
  const videoCount = mediaList.filter((m) => m.file_type === 'video').length;

  const handleDeleteSuccess = (deletedId: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleUploadSuccess = (newMedia: MediaItem) => {
    setMediaList((prev) => [newMedia, ...prev]);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 text-gold-deep text-xs font-mono font-medium mb-1">
            <span>✦</span>
            <span>Asset Repository</span>
            <span>✦</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-deep">
            Media Library
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Secure cloud storage for high-resolution images and videos across campaigns.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<Upload className="w-4 h-4 text-gold-light" />}
        >
          Upload Media
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-sand-cream/70 p-3 rounded-2xl border border-sand-border/80">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              filterType === 'all'
                ? 'bg-emerald-primary text-sand-ivory shadow-xs'
                : 'text-charcoal-muted hover:text-emerald-deep hover:bg-sand-muted'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({mediaList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('image')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              filterType === 'image'
                ? 'bg-emerald-primary text-sand-ivory shadow-xs'
                : 'text-charcoal-muted hover:text-emerald-deep hover:bg-sand-muted'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-medium" />
            <span>Images ({imageCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('video')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              filterType === 'video'
                ? 'bg-emerald-primary text-sand-ivory shadow-xs'
                : 'text-charcoal-muted hover:text-emerald-deep hover:bg-sand-muted'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-gold-primary" />
            <span>Videos ({videoCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-sand-ivory py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="aspect-square bg-sand-muted/50 rounded-xl animate-pulse border border-sand-border"
            />
          ))}
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredMedia.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onPreview={(m) => setPreviewMedia(m)}
              onDelete={(m) => setDeleteMedia(m)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="relative rounded-2xl border-2 border-dashed border-sand-border bg-sand-ivory/60 p-12 text-center overflow-hidden">
          <div className="max-w-sm mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-subtle/80 text-emerald-primary flex items-center justify-center mb-4 border border-emerald-border/30">
              <ImageIcon className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-lg font-bold text-emerald-deep">
              {searchQuery ? 'No matching media found' : 'Your media library is empty'}
            </h3>

            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
              {searchQuery
                ? `No assets matched "${searchQuery}". Try a different keyword or reset filters.`
                : 'Upload your high-res photos and video clips to prepare future social campaigns.'}
            </p>

            <div className="mt-6">
              {searchQuery ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  leftIcon={<Upload className="w-4 h-4 text-gold-light" />}
                >
                  Upload Media
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media Asset"
        description="Supported formats: JPG, PNG, WEBP, MP4, MOV. Max file size: 50MB."
        maxWidth="lg"
      >
        <div className="mt-3">
          <MediaDropzone onUploadSuccess={handleUploadSuccess} />
        </div>
      </Modal>

      {/* Full Preview Modal */}
      <MediaPreviewModal
        media={previewMedia}
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        media={deleteMedia}
        isOpen={Boolean(deleteMedia)}
        onClose={() => setDeleteMedia(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
