import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/formatters';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-emerald-deep tracking-wide flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-gold-primary text-xs">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-charcoal-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full text-sm bg-sand-ivory text-charcoal-main placeholder:text-charcoal-light/70',
              'rounded-lg border border-sand-border py-2 px-3 transition-all duration-200',
              'focus:outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20',
              'disabled:opacity-60 disabled:bg-sand-cream disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-charcoal-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-charcoal-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
