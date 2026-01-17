'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
      success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      danger: 'bg-red-500/20 text-red-400 border-red-500/30',
      info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      outline: 'bg-transparent text-slate-400 border-slate-500',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
