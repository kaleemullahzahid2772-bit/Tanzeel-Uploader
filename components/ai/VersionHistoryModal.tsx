'use client';

import React, { useState, useEffect } from 'react';
import { SocialPlatform, ContentVersion } from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { SocialIcon } from './SocialIcons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  History,
  X,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  platform: SocialPlatform;
  onRestoreVersion: (version: ContentVersion) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  postId,
  platform,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const info = PLATFORM_INFO[platform];

  useEffect(() => {
    if (!isOpen) return;

    const fetchVersions = async () => {
      setLoading(true);
      try {
        if (postId) {
          const res = await fetch(`/api/ai/versions?postId=${postId}&platform=${platform}`);
          if (res.ok) {
            const data = await res.json();
            setVersions(data.versions || []);
          }
        }
      } catch (err) {
        console.warn('Error fetching versions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [isOpen, postId, platform]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-deep/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-sand-ivory rounded-2xl border border-sand-border shadow-elevated p-6 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Top Gold Trim Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-primary via-gold-primary to-emerald-dark" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sand-border/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sand-cream rounded-xl border border-sand-border">
              <History className="w-5 h-5 text-emerald-primary" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-emerald-deep flex items-center gap-1.5">
                <span>Version History: {info.name}</span>
              </h3>
              <p className="text-xs text-charcoal-muted">
                Browse and restore previous AI revision snapshots.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal-muted hover:text-emerald-deep rounded-lg hover:bg-sand-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-charcoal-muted">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-primary" />
              <span className="text-xs">Loading version history...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-muted bg-sand-cream/50 rounded-xl border border-sand-border p-6">
              <p>No historical versions recorded yet for {info.name}.</p>
              <p className="text-[11px] mt-1 text-charcoal-light">
                Each AI revision and optimization creates a permanent snapshot here.
              </p>
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id || ver.version}
                className="p-4 rounded-xl border border-sand-border bg-sand-cream/40 hover:border-gold-primary/60 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-primary text-gold-light">
                      v{ver.version}
                    </span>
                    <span className="text-xs font-semibold text-emerald-deep">
                      {ver.revision_instruction || 'AI Revision'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="ready" size="sm">
                      Score: {ver.quality_score}/100
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onRestoreVersion(ver);
                        onClose();
                      }}
                      leftIcon={<RotateCcw className="w-3 h-3 text-emerald-primary" />}
                    >
                      Restore v{ver.version}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-charcoal-muted line-clamp-2 italic">
                  "{ver.caption || ver.description || ver.title}"
                </p>

                <div className="text-[10px] text-charcoal-light flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-gold-primary" />
                  <span>{new Date(ver.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-sand-border/70 flex justify-end shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
