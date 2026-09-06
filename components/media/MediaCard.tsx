'use client';

import React from 'react';
import Image from 'next/image';
import { MediaItem } from '@/lib/types/database';
import { formatBytes, formatDate } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Film, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';

interface MediaCardProps {
  media: MediaItem;
  onPreview: (media: MediaItem) => void;
  onDelete: (media: MediaItem) => void;
  selected?: boolean;
  onSelect?: (media: MediaItem) => void;
}

export function MediaCard({
  media,
  onPreview,
  onDelete,
  selected = false,
  onSelect,
}: MediaCardProps) {
  const isVideo = media.file_type === 'video';

  return (
    <div
      onClick={() => onSelect && onSelect(media)}
      className={`group relative bg-sand-ivory rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
        selected
          ? 'border-gold-primary ring-2 ring-gold-primary/30 shadow-card'
          : 'border-sand-border/80 hover:border-emerald-primary/40 hover:shadow-card'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {/* Media Thumbnail Container */}
      <div className="relative aspect-video w-full bg-charcoal-main/5 overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-dark to-charcoal-main">
            <video
              src={media.public_url}
              className="w-full h-full object-cover opacity-75"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-sand-ivory/90 text-emerald-deep flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5 text-emerald-primary" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-charcoal-main/80 text-sand-ivory px-1.5 py-0.5 rounded">
              VIDEO
            </span>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={media.public_url}
              alt={media.file_name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-0 bg-emerald-deep/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(media);
            }}
            className="p-2 bg-sand-ivory text-emerald-deep hover:text-emerald-primary rounded-lg shadow-sm hover:scale-105 transition-all"
            title="Preview media"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(media);
            }}
            className="p-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm hover:scale-105 transition-all"
            title="Delete media"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="bg-sand-ivory/90 backdrop-blur-xs text-emerald-deep text-[10px] font-mono font-medium px-2 py-0.5 rounded shadow-xs flex items-center gap-1 border border-sand-border/50">
            {isVideo ? <Film className="w-3 h-3 text-gold-primary" /> : <ImageIcon className="w-3 h-3 text-emerald-primary" />}
            {media.file_type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h5
            className="text-xs font-semibold text-emerald-deep truncate mb-1"
            title={media.file_name}
          >
            {media.file_name}
          </h5>
          <div className="flex items-center justify-between text-[11px] text-charcoal-muted">
            <span>{formatBytes(media.file_size)}</span>
            <span>{formatDate(media.created_at)}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-sand-border/40 flex items-center justify-between">
          <Badge
            variant={media.status === 'ready' ? 'ready' : media.status === 'processing' ? 'processing' : 'default'}
            size="sm"
          >
            {media.status}
          </Badge>

          <span className="text-[10px] font-mono text-charcoal-light">
            {media.mime_type.split('/')[1]?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
