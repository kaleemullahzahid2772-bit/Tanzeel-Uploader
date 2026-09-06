'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Sparkles, Feather } from 'lucide-react';

export function QuickDraftCard() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-primary via-emerald-dark to-emerald-deep text-sand-ivory p-6 sm:p-7 shadow-card border border-emerald-border/40 overflow-hidden">
      {/* Subtle Star Geometry Accents */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-10 pointer-events-none text-gold-light">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
        </svg>
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-subtle/10 border border-gold-primary/30 text-gold-light text-xs font-mono mb-3">
            <Feather className="w-3.5 h-3.5 text-gold-light" />
            <span>Content Studio</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-sand-ivory">
            Create a New Post Draft
          </h3>

          <p className="text-xs sm:text-sm text-sand-muted/80 mt-1.5 leading-relaxed">
            Upload single media once. In Phase 2, Nūr Social will automatically generate tailored copies for Facebook, Instagram, YouTube, and X.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link href="/dashboard/create-post">
            <Button
              variant="gold"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Start Draft
            </Button>
          </Link>
          <Link href="/dashboard/media">
            <Button
              variant="outline"
              size="md"
              className="border-sand-muted/40 text-sand-ivory hover:bg-emerald-dark/60"
              leftIcon={<Sparkles className="w-4 h-4 text-gold-light" />}
            >
              Upload Media
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
