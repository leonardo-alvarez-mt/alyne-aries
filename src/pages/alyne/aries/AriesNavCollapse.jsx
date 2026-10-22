import { useCallback, useEffect, useState } from 'react';
import { PanelLeft } from 'lucide-react';
import { ariesFocus } from './ariesUi';
import { cn } from '../../../utils/cn';

const COLLAPSED_KEY = 'aries-sidebar-collapsed';

/**
 * Collapse state shared by every ARIES nav. A right panel (.aries-side-panel)
 * hides the nav until the user expands it again or the panel closes.
 */
export function useAriesNavCollapse(workspaceRef) {
  const [pinnedCollapsed, setPinnedCollapsed] = useState(
    () => window.localStorage.getItem(COLLAPSED_KEY) === 'true'
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedOverPanel, setExpandedOverPanel] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, String(pinnedCollapsed));
  }, [pinnedCollapsed]);

  useEffect(() => {
    const root = workspaceRef.current;
    if (!root) return undefined;
    const sync = () => setPanelOpen(Boolean(root.querySelector('.aries-side-panel')));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [workspaceRef]);

  useEffect(() => {
    setExpandedOverPanel(false);
  }, [panelOpen]);

  const collapse = useCallback(() => {
    setPinnedCollapsed(true);
    setExpandedOverPanel(false);
  }, []);

  const expand = useCallback(() => {
    setPinnedCollapsed(false);
    setExpandedOverPanel(true);
  }, []);

  const collapsed = pinnedCollapsed || (panelOpen && !expandedOverPanel);
  return { collapsed, collapse, expand };
}

export function NavAside({ collapsed, label, children }) {
  return (
    <aside
      className={cn(
        'h-full shrink-0 overflow-hidden bg-white transition-[width] duration-200 ease-out motion-reduce:transition-none',
        collapsed ? 'w-0' : 'w-[248px] border-r border-[#e2e8f0]'
      )}
      aria-label={label}
      aria-hidden={collapsed}
      inert={collapsed}
    >
      <div
        className={cn(
          'flex h-full w-[248px] flex-col transition-opacity duration-150 motion-reduce:transition-none',
          collapsed && 'opacity-0'
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export function NavCollapseButton({ collapsed, onClick, className }) {
  const label = collapsed ? 'Expand navigation' : 'Collapse navigation';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={!collapsed}
      className={cn(
        'group/collapse flex size-8 shrink-0 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
        collapsed
          ? 'absolute border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
          : 'relative',
        ariesFocus,
        className
      )}
    >
      <PanelLeft size={18} strokeWidth={1.5} aria-hidden />
      <span
        role="tooltip"
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-full z-20 mt-1.5 whitespace-nowrap rounded-md bg-[#0f172a] px-2 py-1 text-[12px] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-opacity group-hover/collapse:opacity-100 group-focus-visible/collapse:opacity-100',
          collapsed ? 'left-0' : 'right-0'
        )}
      >
        {label}
      </span>
    </button>
  );
}
