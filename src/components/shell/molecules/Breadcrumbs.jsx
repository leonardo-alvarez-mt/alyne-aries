import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

const crumbLinkClass = cn(
  'text-neutral-400 hover:text-neutral-700 transition-colors truncate max-w-[160px]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded'
);

const crumbStaticClass = 'text-neutral-400 truncate max-w-[160px]';

const menuItemClass = cn(
  'block truncate px-3 py-2 text-[13px] text-neutral-600',
  'hover:bg-neutral-100 hover:text-neutral-900 transition-colors',
  'focus-visible:outline-none focus-visible:bg-neutral-100 focus-visible:text-neutral-900'
);

/** Grace period on hover-out, so crossing the gap between the ellipsis and the
 *  menu doesn't dismiss it. */
const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Dropdown of collapsed (hidden) breadcrumb levels. Reveals on hover over the
 * ellipsis — no click needed — and still opens on click/Enter for touch and
 * keyboard. Items with `href` are navigable links; items without `href` render
 * as non-link labels (never fall back to `/`).
 */
function CollapsedMenu({ items }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const closeTimer = useRef(null);
  // Whether the pending open should pull focus into the menu. True for click and
  // keyboard, false for hover — see the focus effect below.
  const focusOnOpen = useRef(false);

  function cancelPendingClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  // Drop a pending close if the trail re-renders away mid-countdown.
  useEffect(() => cancelPendingClose, []);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Move focus into the menu only when a click or key opened it. On hover this
  // would yank focus out from under someone who merely swept the pointer past.
  useEffect(() => {
    if (open && focusOnOpen.current) {
      itemRefs.current[0]?.focus();
      focusOnOpen.current = false;
    }
  }, [open]);

  function openMenu({ withFocus = false } = {}) {
    cancelPendingClose();
    focusOnOpen.current = withFocus;
    setOpen(true);
  }

  function close(focusButton = true) {
    cancelPendingClose();
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }

  // Hover-out. Held open while focus is inside: a keyboard user is still in the
  // menu and the pointer drifting off shouldn't close it under them.
  function scheduleClose() {
    cancelPendingClose();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      if (wrapRef.current?.contains(document.activeElement)) return;
      setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }

  function onMenuKeyDown(e) {
    const last = items.length - 1;
    const current = itemRefs.current.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemRefs.current[current < last ? current + 1 : 0]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemRefs.current[current > 0 ? current - 1 : last]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      itemRefs.current[last]?.focus();
    }
  }

  return (
    <span
      className="relative inline-flex"
      ref={wrapRef}
      onMouseEnter={() => openMenu()}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : openMenu({ withFocus: true }))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Show ${items.length} hidden breadcrumb ${items.length === 1 ? 'level' : 'levels'}`}
        className={cn(
          'inline-flex items-center rounded px-1 leading-none text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
          open ? 'text-neutral-700' : 'text-neutral-400 hover:text-neutral-700'
        )}
      >
        <span aria-hidden="true">...</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Hidden breadcrumb levels"
          onKeyDown={onMenuKeyDown}
          className="absolute left-0 top-full z-[9999] mt-1 min-w-[180px] max-w-[280px] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
        >
          {items.map((item, index) =>
            item.href ? (
              <Link
                key={`${item.label}-${index}`}
                ref={(el) => { itemRefs.current[index] = el; }}
                to={item.href}
                role="menuitem"
                onClick={() => close(false)}
                className={menuItemClass}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={`${item.label}-${index}`}
                ref={(el) => { itemRefs.current[index] = el; }}
                role="menuitem"
                aria-disabled="true"
                tabIndex={0}
                className={cn(menuItemClass, 'cursor-default text-neutral-500 hover:bg-transparent hover:text-neutral-500')}
              >
                {item.label}
              </span>
            )
          )}
        </div>
      )}
    </span>
  );
}

/**
 * Breadcrumb trail with design-system collapsing.
 *
 * When the trail exceeds `maxVisible` items, the intermediate levels collapse
 * into an inline ellipsis (`...`) that opens a dropdown of the hidden levels.
 * The leading `maxVisible - 2` items stay visible (so Home stays visible), and
 * the current page (last item) is always shown and never clickable — only the
 * middle levels ever collapse.
 *
 * Items without `href` render as static labels (never link to `/`).
 *
 * @param {Object[]} items                     `{ label, href? }` in trail order.
 * @param {string}  [className]
 * @param {number}  [maxVisible=3]  Max visible slots (leading items + ellipsis + current).
 */
export function Breadcrumbs({ items, className, maxVisible = 3 }) {
  const collapsed = items.length > maxVisible;
  const beforeCount = Math.max(1, maxVisible - 2); // leading items kept (incl. Home)
  const afterCount = 1; // trailing items kept (the current page)
  const hiddenItems = collapsed ? items.slice(beforeCount, items.length - afterCount) : [];

  // Ordered render list: leading items, a placeholder marking the collapsed
  // dropdown position, then the trailing item(s).
  const rendered = collapsed
    ? [...items.slice(0, beforeCount), { collapsedMenu: hiddenItems }, ...items.slice(items.length - afterCount)]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-sm">
        {rendered.map((entry, index) => {
          const isCollapsedMenu = Boolean(entry.collapsedMenu);
          // The current page is always the trailing crumb, and never a link —
          // even if the caller supplied an href for it.
          const isLast = !isCollapsedMenu && index === rendered.length - 1;
          return (
            <li key={isCollapsedMenu ? 'collapsed' : `${entry.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight size={14} className="text-neutral-300 flex-shrink-0" aria-hidden="true" />
              )}
              {isCollapsedMenu ? (
                <CollapsedMenu items={entry.collapsedMenu} />
              ) : isLast ? (
                <span aria-current="page" className="text-neutral-700 font-medium truncate max-w-[200px]">
                  {entry.label}
                </span>
              ) : entry.href ? (
                <Link to={entry.href} className={crumbLinkClass}>
                  {entry.label}
                </Link>
              ) : (
                <span className={crumbStaticClass}>{entry.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
