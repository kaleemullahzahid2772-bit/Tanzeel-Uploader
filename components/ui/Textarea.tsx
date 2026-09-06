import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/formatters';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-emerald-deep tracking-wide flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-gold-primary text-xs">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full text-sm bg-sand-ivory text-charcoal-main placeholder:text-charcoal-light/70',
            'rounded-lg border border-sand-border p-3 transition-all duration-200 resize-y',
            'focus:outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20',
            'disabled:opacity-60 disabled:bg-sand-cream disabled:cursor-not-allowed',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20',
            className
          )}
          {...props}
        />

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-charcoal-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
