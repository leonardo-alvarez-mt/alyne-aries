import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useShell } from '../ShellContext';
import {
  SIDEBAR_EDGE_TOGGLE_TOP_EXPANDED,
  SIDEBAR_EDGE_TOGGLE_TOP_RAIL,
} from '../sidebarNavLayout';

export function SidebarEdgeToggle() {
  const { sidebarCollapsed, toggleSidebar } = useShell();
  const expanded = !sidebarCollapsed;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-expanded={expanded}
      aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      className={cn(
        'absolute z-[45] hidden lg:flex',
        'h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center',
        'rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm',
        'transition-all duration-[250ms] ease-in-out',
        'hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1'
      )}
      style={{
        right: 0,
        top: sidebarCollapsed ? SIDEBAR_EDGE_TOGGLE_TOP_RAIL : SIDEBAR_EDGE_TOGGLE_TOP_EXPANDED,
      }}
    >
      {expanded
        ? <ChevronLeft size={14} strokeWidth={2.25} aria-hidden="true" />
        : <ChevronRight size={14} strokeWidth={2.25} aria-hidden="true" />}
    </button>
  );
}
