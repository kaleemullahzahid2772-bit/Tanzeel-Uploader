'use client';

import React from 'react';
import Image from 'next/image';
import { MediaItem } from '@/lib/types/database';
import { formatBytes, formatDateTime } from '@/lib/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download, Film, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface MediaPreviewModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaPreviewModal({
  media,
  isOpen,
  onClose,
}: MediaPreviewModalProps) {
  if (!media) return null;

  const isVideo = media.file_type === 'video';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={media.file_name}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Preview Player / Viewport */}
        <div className="relative w-full max-h-[60vh] bg-charcoal-main rounded-xl overflow-hidden flex items-center justify-center border border-charcoal-muted/20">
          {isVideo ? (
            <video
              src={media.public_url}
              controls
              autoPlay
              className="max-h-[55vh] w-full object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <div className="relative w-full h-[50vh]">
              <Image
                src={media.public_url}
                alt={media.file_name}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-sand-cream/70 rounded-xl border border-sand-border/70 text-xs">
          <div>
            <span className="text-charcoal-muted block text-[10px] uppercase font-mono">
              File Format
            </span>
            <div className="font-semibold text-emerald-deep mt-0.5 flex items-center gap-1">
              {isVideo ? <Film className="w-3.5 h-3.5 text-gold-primary" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-primary" />}
              {media.mime_type}
            </div>
          </div>

          <div>
            <span className="text-charcoal-muted block text-[10px] uppercase font-mono">
              File Size
            </span>
            <span className="font-semibold text-emerald-deep mt-0.5 block">
              {formatBytes(media.file_size)}
            </span>
          </div>

          <div>
            <span className="text-charcoal-muted block text-[10px] uppercase font-mono">
              Status
            </span>
            <div className="mt-0.5">
              <Badge variant={media.status === 'ready' ? 'ready' : 'default'} size="sm">
                {media.status}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-charcoal-muted block text-[10px] uppercase font-mono">
              Uploaded On
            </span>
            <span className="font-semibold text-emerald-deep mt-0.5 block truncate">
              {formatDateTime(media.created_at)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <a
            href={media.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-primary hover:text-emerald-dark font-medium inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open original URL
          </a>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = media.public_url;
                link.download = media.file_name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
