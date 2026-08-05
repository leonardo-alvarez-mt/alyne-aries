import { cn } from '../../../utils/cn';

export function Divider({ orientation = 'horizontal', className }) {
  if (orientation === 'vertical') {
    return <span className={cn('block w-px self-stretch bg-neutral-200', className)} aria-hidden="true" />;
  }
  return <hr className={cn('border-0 border-t border-neutral-200', className)} />;
}
