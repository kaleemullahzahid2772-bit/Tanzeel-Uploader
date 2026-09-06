'use client';

import React from 'react';
import Link from 'next/link';
import { MediaItem } from '@/lib/types/database';
import { MediaCard } from '@/components/media/MediaCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ImagePlus, Sparkles } from 'lucide-react';

interface RecentMediaSectionProps {
  mediaList: MediaItem[];
  loading?: boolean;
  onPreview: (media: MediaItem) => void;
  onDelete: (media: MediaItem) => void;
}

export function RecentMediaSection({
  mediaList,
  loading = false,
  onPreview,
  onDelete,
}: RecentMediaSectionProps) {
  const displayItems = mediaList.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-emerald-deep flex items-center gap-2">
            <span>Recent Media</span>
            <span className="text-gold-primary text-xs">✦</span>
          </h3>
          <p className="text-xs text-charcoal-muted">
            Latest uploads ready for multi-channel publishing
          </p>
        </div>

        {mediaList.length > 0 && (
          <Link
            href="/dashboard/media"
            className="text-xs font-semibold text-emerald-primary hover:text-emerald-dark flex items-center gap-1 group"
          >
            <span>View All ({mediaList.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-video bg-sand-muted/60 animate-pulse rounded-xl border border-sand-border"
            />
          ))}
        </div>
      ) : displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onPreview={onPreview}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Islamic Minimal Empty State */
        <div className="relative rounded-2xl border-2 border-dashed border-sand-border/80 bg-sand-ivory/50 p-8 sm:p-12 text-center overflow-hidden">
          {/* Subtle 8-point star background motif */}
          <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none text-emerald-deep">
            <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
            </svg>
          </div>

          <div className="relative max-w-sm mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-subtle/80 border border-emerald-border/30 text-emerald-primary flex items-center justify-center mb-3.5 shadow-xs">
              <ImagePlus className="w-6 h-6" />
            </div>

            <h4 className="font-serif text-base font-bold text-emerald-deep">
              Your media library is empty.
            </h4>

            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
              Upload your first piece of content to begin creating posts for your social channels.
            </p>

            <div className="mt-5">
              <Link href="/dashboard/media">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-gold-light" />}
                >
                  Upload Media
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
