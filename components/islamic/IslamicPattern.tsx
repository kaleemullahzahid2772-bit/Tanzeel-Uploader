'use client';

import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface IslamicPatternProps {
  className?: string;
  variant?: 'subtle' | 'gold' | 'emerald' | 'border' | 'radial';
  opacity?: number;
}

export function IslamicPattern({
  className,
  variant = 'subtle',
  opacity = 0.04,
}: IslamicPatternProps) {
  // SVG 8-Point Star (Khatam) & Geometric Girih Interlace Pattern
  const getStrokeColor = () => {
    switch (variant) {
      case 'gold':
        return '#C9A227';
      case 'emerald':
        return '#0F4C3A';
      default:
        return 'currentColor';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="islamic-khatam-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Central 8-pointed star */}
            <path
              d="M 30,10 L 35,22 L 47,17 L 42,29 L 54,34 L 42,39 L 47,51 L 35,46 L 30,58 L 25,46 L 13,51 L 18,39 L 6,34 L 18,29 L 13,17 L 25,22 Z"
              fill="none"
              stroke={getStrokeColor()}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            {/* Surrounding interlacing octagon grid */}
            <path
              d="M 0,0 L 15,0 L 30,10 L 45,0 L 60,0 L 60,15 L 50,30 L 60,45 L 60,60 L 45,60 L 30,50 L 15,60 L 0,60 L 0,45 L 10,30 L 0,15 Z"
              fill="none"
              stroke={getStrokeColor()}
              strokeWidth="0.6"
              strokeDasharray="2,2"
            />
            {/* Corner star quarters */}
            <path
              d="M 0,0 L 8,3 L 3,8 Z M 60,0 L 52,3 L 57,8 Z M 60,60 L 52,57 L 57,52 Z M 0,60 L 8,57 L 3,52 Z"
              fill={getStrokeColor()}
              fillOpacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-khatam-pattern)" />
      </svg>
    </div>
  );
}

export function IslamicCornerAccents({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      {/* Top Left */}
      <svg
        className="absolute top-2 left-2 w-5 h-5 text-gold-primary/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M 2,14 L 2,2 L 14,2 M 2,2 L 8,8" />
        <circle cx="2" cy="2" r="1.5" fill="currentColor" />
      </svg>

      {/* Top Right */}
      <svg
        className="absolute top-2 right-2 w-5 h-5 text-gold-primary/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M 22,14 L 22,2 L 10,2 M 22,2 L 16,8" />
        <circle cx="22" cy="2" r="1.5" fill="currentColor" />
      </svg>

      {/* Bottom Left */}
      <svg
        className="absolute bottom-2 left-2 w-5 h-5 text-gold-primary/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M 2,10 L 2,22 L 14,22 M 2,22 L 8,16" />
        <circle cx="2" cy="22" r="1.5" fill="currentColor" />
      </svg>

      {/* Bottom Right */}
      <svg
        className="absolute bottom-2 right-2 w-5 h-5 text-gold-primary/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M 22,10 L 22,22 L 10,22 M 22,22 L 16,16" />
        <circle cx="22" cy="22" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}
