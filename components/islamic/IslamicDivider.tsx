import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface IslamicDividerProps {
  className?: string;
  variant?: 'gold' | 'emerald' | 'subtle';
  starSize?: 'sm' | 'md' | 'lg';
}

export function IslamicDivider({
  className,
  variant = 'gold',
  starSize = 'md',
}: IslamicDividerProps) {
  const getLineColor = () => {
    switch (variant) {
      case 'gold':
        return 'from-transparent via-gold-primary/30 to-transparent';
      case 'emerald':
        return 'from-transparent via-emerald-primary/30 to-transparent';
      default:
        return 'from-transparent via-charcoal-subtle to-transparent';
    }
  };

  const getStarColor = () => {
    switch (variant) {
      case 'gold':
        return 'text-gold-primary';
      case 'emerald':
        return 'text-emerald-primary';
      default:
        return 'text-charcoal-muted';
    }
  };

  const getDimensions = () => {
    switch (starSize) {
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center my-6', className)}>
      <div className={cn('w-full h-px bg-gradient-to-r', getLineColor())} />
      <div className="absolute px-3 bg-sand-cream/80 backdrop-blur-xs flex items-center justify-center">
        {/* 8-pointed star icon */}
        <svg
          className={cn(getStarColor(), getDimensions())}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L14.4 7.6L20 7.2L16.8 12L20 16.8L14.4 16.4L12 22L9.6 16.4L4 16.8L7.2 12L4 7.2L9.6 7.6L12 2Z" />
        </svg>
      </div>
    </div>
  );
}
