'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'gradient';
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, variant = 'default', ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variants = {
      default: 'bg-cyan-500',
      success: 'bg-emerald-500',
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    };

    return (
      <div className={cn('relative w-full', className)} ref={ref} {...props}>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', variants[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {showLabel && (
          <span className="absolute right-0 -top-6 text-xs text-slate-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

interface StepProgressProps {
  steps: { label: string; completed: boolean; active?: boolean }[];
}

const StepProgress = ({ steps }: StepProgressProps) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center flex-1">
          <motion.div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border-2 transition-colors',
              step.completed
                ? 'bg-cyan-500 border-cyan-500 text-white'
                : step.active
                ? 'bg-slate-800 border-cyan-500 text-cyan-500'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {step.completed ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              index + 1
            )}
          </motion.div>
          <span
            className={cn(
              'ml-2 text-xs hidden sm:block',
              step.completed
                ? 'text-cyan-400'
                : step.active
                ? 'text-slate-200'
                : 'text-slate-500'
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-4',
                step.completed ? 'bg-cyan-500' : 'bg-slate-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { Progress, StepProgress };
