import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'emerald' | 'subtle';
  showCorners?: boolean;
}

export function Card({
  className,
  variant = 'default',
  showCorners = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-sand-ivory border border-sand-border/80 text-charcoal-main shadow-subtle',
    elevated: 'bg-sand-ivory border border-sand-border/90 text-charcoal-main shadow-card',
    emerald: 'bg-gradient-to-br from-emerald-primary to-emerald-dark text-sand-ivory border border-emerald-border/40 shadow-card',
    subtle: 'bg-sand-cream/70 border border-sand-border/60 text-charcoal-main',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {showCorners && (
        <>
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-gold-primary/40 rounded-tl" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-gold-primary/40 rounded-tr" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-gold-primary/40 rounded-bl" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-gold-primary/40 rounded-br" />
        </>
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pb-3 border-b border-sand-border/50', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-serif text-lg font-bold text-emerald-deep leading-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-charcoal-muted mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-3 border-t border-sand-border/50 flex items-center', className)} {...props}>
      {children}
    </div>
  );
}
