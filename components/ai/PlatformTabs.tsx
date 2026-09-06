'use client';

import React from 'react';
import { SocialPlatform } from '@/lib/types/database';
import { cn } from '@/lib/utils/formatters';
import { SocialIcon } from './SocialIcons';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface PlatformTabsProps {
  activePlatform: SocialPlatform;
  onSelectPlatform: (platform: SocialPlatform) => void;
  availablePlatforms?: SocialPlatform[];
  validationStatus?: Record<string, { passed: boolean; needsReview: boolean }>;
}

export const PLATFORM_INFO: Record<
  SocialPlatform,
  {
    name: string;
    urduName: string;
    color: string;
    bgHover: string;
  }
> = {
  facebook: {
    name: 'Facebook',
    urduName: 'فیس بک',
    color: 'text-blue-600',
    bgHover: 'hover:bg-blue-50',
  },
  instagram: {
    name: 'Instagram',
    urduName: 'انسٹاگرام',
    color: 'text-pink-600',
    bgHover: 'hover:bg-pink-50',
  },
  tiktok: {
    name: 'TikTok',
    urduName: 'ٹک ٹاک',
    color: 'text-zinc-900',
    bgHover: 'hover:bg-zinc-100',
  },
  youtube: {
    name: 'YouTube',
    urduName: 'یوٹیوب',
    color: 'text-red-600',
    bgHover: 'hover:bg-red-50',
  },
  twitter: {
    name: 'X (Twitter)',
    urduName: 'ایکس (ٹوئٹر)',
    color: 'text-sky-600',
    bgHover: 'hover:bg-sky-50',
  },
  whatsapp: {
    name: 'WhatsApp',
    urduName: 'واٹس ایپ',
    color: 'text-emerald-600',
    bgHover: 'hover:bg-emerald-50',
  },
};

export function PlatformTabs({
  activePlatform,
  onSelectPlatform,
  availablePlatforms = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp'],
  validationStatus = {},
}: PlatformTabsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-sand-muted/80 rounded-xl border border-sand-border overflow-x-auto scrollbar-none">
      {availablePlatforms.map((platform) => {
        const info = PLATFORM_INFO[platform];
        const isActive = activePlatform === platform;
        const val = validationStatus[platform];

        return (
          <button
            key={platform}
            type="button"
            onClick={() => onSelectPlatform(platform)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 select-none relative',
              isActive
                ? 'bg-sand-ivory text-emerald-deep shadow-subtle border border-gold-border/60 font-semibold'
                : 'text-charcoal-muted hover:text-charcoal-main hover:bg-sand-cream/70'
            )}
          >
            <SocialIcon platform={platform} className={cn('w-4 h-4 shrink-0', isActive ? info.color : 'text-charcoal-light')} />
            <span>{info.name}</span>
            <span className="text-[10px] text-charcoal-light hidden sm:inline">({info.urduName})</span>

            {/* Validation Pill */}
            {val && (
              <span className="shrink-0" title={val.needsReview ? 'Review recommended' : 'Passed safety checks'}>
                {val.needsReview ? (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
