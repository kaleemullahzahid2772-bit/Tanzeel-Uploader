'use client';

import React from 'react';
import { Image as ImageIcon, FileEdit, CheckCircle, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatsGridProps {
  totalMedia: number;
  draftPosts: number;
  publishedPosts: number;
  connectedAccounts: number;
  loading?: boolean;
}

export function StatsGrid({
  totalMedia,
  draftPosts,
  publishedPosts,
  connectedAccounts,
  loading = false,
}: StatsGridProps) {
  const stats = [
    {
      label: 'Total Media',
      value: totalMedia,
      icon: ImageIcon,
      description: 'Images & videos stored',
      accent: 'emerald',
      tag: 'Storage',
    },
    {
      label: 'Draft Posts',
      value: draftPosts,
      icon: FileEdit,
      description: 'Awaiting scheduling & AI',
      accent: 'gold',
      tag: 'Drafts',
    },
    {
      label: 'Published Posts',
      value: publishedPosts,
      icon: CheckCircle,
      description: 'Live across channels',
      accent: 'muted',
      tag: 'Phase 5',
    },
    {
      label: 'Connected Accounts',
      value: connectedAccounts,
      icon: Share2,
      description: 'Social platforms',
      accent: 'muted',
      tag: 'Phase 4',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;

        return (
          <Card
            key={i}
            variant="default"
            showCorners={stat.accent === 'gold'}
            className="p-5 hover:border-gold-primary/40 hover:shadow-card transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted">
                  {stat.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-8 w-12 bg-sand-muted animate-pulse rounded-md" />
                  ) : (
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-deep">
                      {stat.value}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
                  stat.accent === 'emerald'
                    ? 'bg-emerald-subtle text-emerald-primary border-emerald-border/30'
                    : stat.accent === 'gold'
                    ? 'bg-gold-subtle text-gold-deep border-gold-border/40'
                    : 'bg-sand-muted text-charcoal-muted border-sand-border'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-sand-border/50 flex items-center justify-between text-[11px] text-charcoal-muted">
              <span>{stat.description}</span>
              <span className="font-mono text-[10px] bg-sand-cream px-1.5 py-0.5 rounded border border-sand-border/60">
                {stat.tag}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
