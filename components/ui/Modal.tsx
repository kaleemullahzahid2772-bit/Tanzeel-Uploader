'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils/formatters';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-emerald-deep/70 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Body */}
      <div
        className={cn(
          'relative w-full bg-sand-ivory rounded-2xl shadow-elevated border border-sand-border/80 overflow-hidden z-10 animate-fadeIn',
          maxWidths[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Gold Trim Accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-primary via-gold-primary to-emerald-dark" />

        <div className="p-6">
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h3 className="font-serif text-xl font-bold text-emerald-deep leading-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-charcoal-light hover:text-emerald-primary hover:bg-sand-muted p-1.5 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
