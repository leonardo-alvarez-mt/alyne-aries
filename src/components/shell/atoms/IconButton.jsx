import { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

const sizeClasses = {
  sm: 'w-7 h-7 rounded',
  md: 'w-9 h-9 rounded-md',
  lg: 'w-10 h-10 rounded-md',
};

export const IconButton = forwardRef(function IconButton(
  { 'aria-label': ariaLabel, size = 'md', variant = 'ghost', active, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
        variant === 'ghost'
          ? 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
        active && 'bg-blue-50 text-blue-600',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
