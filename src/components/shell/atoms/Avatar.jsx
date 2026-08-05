import { cn } from '../../../utils/cn';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function Avatar({ name, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        'bg-blue-100 text-blue-700 select-none',
        sizeClasses[size],
        className
      )}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
