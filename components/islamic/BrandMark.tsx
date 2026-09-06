import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/formatters';

interface BrandMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  href?: string;
  theme?: 'dark' | 'light';
}

export function BrandMark({
  className,
  size = 'md',
  showSubtitle = true,
  href = '/',
  theme = 'light',
}: BrandMarkProps) {
  const isDark = theme === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      {/* 8-Point Islamic Geometric Star Emblem */}
      <div className={cn('relative flex items-center justify-center shrink-0', iconSizes[size])}>
        <div className="absolute inset-0 bg-gradient-to-br from-gold-light to-gold-primary rounded-lg rotate-45 opacity-20 group-hover:rotate-90 transition-transform duration-500 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-primary to-emerald-dark rounded-lg group-hover:rotate-45 transition-transform duration-500 ease-out shadow-sm border border-gold-primary/30" />
        <svg
          className="relative w-3/5 h-3/5 text-gold-light"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Subtle 8-point geometric star */}
          <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-serif font-bold tracking-tight text-emerald-deep leading-tight transition-colors',
              titleSizes[size],
              isDark ? 'text-sand-ivory group-hover:text-gold-light' : 'text-emerald-deep group-hover:text-emerald-primary'
            )}
          >
            Nūr Social
          </span>
          <span className="inline-block text-gold-primary text-xs font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-gold-subtle/80 border border-gold-border/40">
            AI
          </span>
        </div>

        {showSubtitle && size !== 'sm' && (
          <span
            className={cn(
              'text-[10px] tracking-wider uppercase font-medium',
              isDark ? 'text-sand-muted/70' : 'text-charcoal-muted'
            )}
          >
            Islamic Social Media Manager
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
