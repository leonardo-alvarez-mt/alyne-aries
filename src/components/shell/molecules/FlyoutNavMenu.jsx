import { ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { matchNavPath } from '../../../utils/shellNavigation';
import { useShell } from '../ShellContext';

function FlyoutMenuItem({ child, pathname, onSelect }) {
  const active = matchNavPath(child.path, pathname);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onSelect(child)}
      className={cn(
        'group/item relative flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] leading-snug',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-1',
        active
          ? 'bg-[var(--sb-icon-active-bg)] font-medium text-[#0067d2]'
          : 'font-normal text-[var(--sb-text)] hover:bg-[var(--sb-bg-hover)] hover:text-[#0067d2]'
      )}
    >
      <span className="min-w-0 flex-1 truncate">{child.label}</span>
      <ChevronRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn(
          'shrink-0 transition-all duration-150 ease-out',
          active
            ? 'text-[var(--sb-icon)] opacity-70'
            : 'text-neutral-400 opacity-0 -translate-x-0.5 group-hover/item:translate-x-0 group-hover/item:opacity-60'
        )}
      />
    </button>
  );
}

export function FlyoutNavMenu({
  menuRef,
  style,
  title,
  flyoutEntries,
  pathname,
  onSelect,
  onClose,
  onMenuEnter,
  onMenuLeave,
}) {
  const { sidebarTheme } = useShell();
  const itemCount = flyoutEntries.reduce((sum, entry) => sum + entry.items.length, 0);
  const hoverMode = Boolean(onMenuEnter || onMenuLeave);

  return (
    <>
      {!hoverMode && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9998] bg-[#0f172a]/[0.06] backdrop-blur-[1px] animate-[flyout-backdrop-in_160ms_ease-out]"
          onMouseDown={onClose}
        />
      )}
      <div
        ref={menuRef}
        role="menu"
        aria-label={title}
        style={style}
        onMouseEnter={onMenuEnter}
        onMouseLeave={onMenuLeave}
        className={cn(
          sidebarTheme === 'dark' ? 'sidebar-dark' : 'sidebar-light',
          'z-[9999] flex max-h-[calc(100vh-24px)] w-[17.5rem] flex-col overflow-hidden',
          'rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_48px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.05)]',
          'backdrop-blur-xl animate-[flyout-panel-in_200ms_cubic-bezier(0.16,1,0.3,1)]',
          'origin-left'
        )}
      >
        <div className="relative shrink-0 border-b border-neutral-100/90 px-4 pb-3 pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-neutral-900">{title}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">Additional destinations</p>
            </div>
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-500">
              {itemCount}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain px-2 py-2',
            '[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent]',
            '[&::-webkit-scrollbar]:w-1.5',
            '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-200',
            '[&::-webkit-scrollbar-track]:bg-transparent'
          )}
        >
          {flyoutEntries.map((entry, groupIndex) => (
            <div
              key={entry.label ?? `group-${groupIndex}`}
              className={cn(groupIndex > 0 && 'mt-3 border-t border-neutral-100/90 pt-3')}
            >
              {entry.label && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  {entry.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {entry.items.map((child) => (
                  <FlyoutMenuItem
                    key={child.id}
                    child={child}
                    pathname={pathname}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
