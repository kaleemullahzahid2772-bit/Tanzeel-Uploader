import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/formatters';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg cursor-pointer';

    const variants = {
      primary:
        'bg-emerald-primary text-sand-ivory hover:bg-emerald-medium active:bg-emerald-dark focus:ring-emerald-primary/40 shadow-sm border border-emerald-border/40',
      secondary:
        'bg-sand-cream text-emerald-deep hover:bg-sand-muted active:bg-sand-border focus:ring-emerald-primary/30 border border-sand-border',
      gold:
        'bg-gradient-to-r from-gold-primary to-gold-dark text-emerald-deep font-semibold hover:from-gold-light hover:to-gold-primary active:brightness-95 focus:ring-gold-primary/50 shadow-sm border border-gold-border',
      outline:
        'border border-emerald-primary/30 text-emerald-primary hover:bg-emerald-subtle/50 active:bg-emerald-subtle focus:ring-emerald-primary/30 bg-transparent',
      ghost:
        'text-charcoal-muted hover:text-emerald-primary hover:bg-emerald-subtle/40 active:bg-emerald-subtle/60 focus:ring-emerald-primary/20',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500/40 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md',
      md: 'text-sm px-4 py-2 gap-2 rounded-lg',
      lg: 'text-base px-6 py-2.5 gap-2.5 rounded-xl',
      icon: 'p-2 rounded-lg aspect-square',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
