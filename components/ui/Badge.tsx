import React from 'react';
import { cn } from '@/lib/utils/formatters';

export type BadgeVariant =
  | 'default'
  | 'emerald'
  | 'gold'
  | 'ready'
  | 'draft'
  | 'processing'
  | 'published'
  | 'failed'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'default',
  className,
  size = 'md',
  icon,
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-sand-muted text-charcoal-main border-sand-border',
    emerald: 'bg-emerald-subtle text-emerald-primary border-emerald-border/30',
    gold: 'bg-gold-subtle text-gold-deep border-gold-border/40 font-medium',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-800 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
    published: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    outline: 'bg-transparent text-charcoal-muted border-sand-border',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded gap-1',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border tracking-wide uppercase font-mono select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
