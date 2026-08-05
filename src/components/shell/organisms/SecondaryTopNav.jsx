import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useShell } from '../ShellContext';
import {
  isInShell,
  isShellNavActive,
  resolveNavPath,
  matchNavPath,
  resolveNavGroups,
} from '../../../utils/shellNavigation';
import { productNavSections, primaryNavSections } from '../../../data/navigation';

const ACTIVE_TEXT = '#1D2939';
const NAV_ICON_SIZE = 18;

function iconColor(active) {
  return active ? ACTIVE_TEXT : 'var(--sb-icon)';
}

function renderNavIcon(IconComp, active) {
  if (!IconComp) return null;
  const color = iconColor(active);
  return <IconComp size={NAV_ICON_SIZE} color={color} aria-hidden="true" style={{ color }} />;
}

function rowClass(active) {
  return cn(
    'group/top relative flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-1',
    active ? 'bg-[var(--sb-icon-active-bg)]' : 'hover:bg-[var(--sb-bg-hover)]'
  );
}

/** Leaf item — a direct link in the horizontal bar. */
function TopNavLink({ item }) {
  const { pathname } = useLocation();
  const active = matchNavPath(item.path, pathname);
  const IconComp = active && item.activeIcon ? item.activeIcon : item.icon;
  return (
    <NavLink
      to={resolveNavPath(item.path, pathname)}
      end={item.path === '/'}
      isActive={({ isActive, location }) => (
        isInShell(location.pathname) ? isShellNavActive(item.path, location.pathname) : isActive
      )}
      className={() => rowClass(active)}
      style={{ color: active ? ACTIVE_TEXT : 'var(--sb-text)' }}
    >
      {renderNavIcon(IconComp, active)}
      <span className="whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

/** A single leaf link inside the mega-menu. */
function MegaLeaf({ child, pathname, onSelect }) {
  const active = matchNavPath(child.path, pathname);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onSelect(child)}
      className={cn(
        'w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] leading-snug',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-1',
        active
          ? 'bg-[var(--sb-icon-active-bg)] font-medium text-[#1D2939]'
          : 'font-normal text-[var(--sb-text)] hover:bg-[var(--sb-bg-hover)] hover:text-neutral-900'
      )}
    >
      <span className="block truncate">{child.label}</span>
    </button>
  );
}

/** Multi-column mega-menu — one column per group. */
function MegaMenu({ menuRef, style, title, groups, pathname, onSelect, onMenuEnter, onMenuLeave }) {
  const { sidebarTheme } = useShell();
  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={title}
      style={style}
      onMouseEnter={onMenuEnter}
      onMouseLeave={onMenuLeave}
      className={cn(
        sidebarTheme === 'dark' ? 'sidebar-dark' : 'sidebar-light',
        'z-[9999] overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-3',
        'shadow-[0_16px_48px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.05)]',
        'backdrop-blur-xl animate-[flyout-panel-in_180ms_cubic-bezier(0.16,1,0.3,1)] origin-top'
      )}
    >
      <div className="flex flex-wrap gap-y-4">
        {groups.map((group, groupIndex) => (
          <div
            key={group.label ?? `group-${groupIndex}`}
            className={cn(
              'flex w-[190px] flex-col px-3',
              groupIndex > 0 && 'border-l border-[var(--sb-border)]'
            )}
          >
            {group.label && (
              <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((child) => (
                <MegaLeaf key={child.id} child={child} pathname={pathname} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Parent item — opens a grouped dropdown below the bar on hover or click. */
function TopNavMenu({ item }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = resolveNavGroups(item);
  const leaves = groups.flatMap((g) => g.items);
  const isChildActive = leaves.some((c) => matchNavPath(c.path, pathname));
  const highlighted = isChildActive || open;
  const IconComp = highlighted && item.activeIcon ? item.activeIcon : item.icon;

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 12;
    const maxHeight = window.innerHeight - rect.bottom - margin;
    const maxWidth = window.innerWidth - margin * 2;
    // Use the real rendered width (once available) so wide mega-menus clamp on-screen.
    const width = menuRef.current ? Math.min(menuRef.current.offsetWidth, maxWidth) : 0;
    // Center the menu under the hovered item; for edge items, align to the item's
    // right (or left) edge instead of forcing a centered menu off-screen.
    let left = rect.left;
    if (width) {
      left = rect.left + rect.width / 2 - width / 2;
      if (left + width > window.innerWidth - margin) {
        left = rect.right - width; // right-align to the item (opens leftward)
      } else if (left < margin) {
        left = rect.left; // left-align to the item (opens rightward)
      }
      left = Math.max(margin, Math.min(left, window.innerWidth - margin - width));
    }
    setMenuStyle({ position: 'fixed', top: rect.bottom + 6, left, maxHeight, maxWidth, zIndex: 9999 });
  }, []);

  function cancelClose() { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } }
  function openMenu() { cancelClose(); updatePosition(); setOpen(true); }
  function closeMenu() { cancelClose(); setOpen(false); }
  function scheduleClose() { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 140); }

  useEffect(() => () => cancelClose(), []);
  useEffect(() => { if (open) updatePosition(); }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') { closeMenu(); buttonRef.current?.focus(); } }
    function onScrollResize() { updatePosition(); }
    function onDown(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) closeMenu();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={open ? closeMenu : openMenu}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        aria-expanded={open}
        aria-haspopup="menu"
        className={rowClass(highlighted)}
        style={{ color: highlighted ? ACTIVE_TEXT : 'var(--sb-text)' }}
      >
        {renderNavIcon(IconComp, highlighted)}
        <span className="whitespace-nowrap">{item.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className="transition-transform duration-150"
          style={{ color: 'var(--sb-icon)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && createPortal(
        <MegaMenu
          menuRef={menuRef}
          style={menuStyle}
          title={item.label}
          groups={groups}
          pathname={pathname}
          onMenuEnter={cancelClose}
          onMenuLeave={scheduleClose}
          onSelect={(child) => {
            navigate(resolveNavPath(child.path, pathname));
            closeMenu();
          }}
        />,
        document.body
      )}
    </>
  );
}

/** Settings item — toggles the shell appearance panel (mirrors sidebar behavior). */
function TopNavSettings({ item }) {
  const { settingsPanelOpen, toggleSettingsPanel } = useShell();
  const IconComp = settingsPanelOpen && item.activeIcon ? item.activeIcon : item.icon;
  return (
    <button
      type="button"
      onClick={toggleSettingsPanel}
      aria-pressed={settingsPanelOpen}
      className={rowClass(settingsPanelOpen)}
      style={{ color: settingsPanelOpen ? ACTIVE_TEXT : 'var(--sb-text)' }}
    >
      {renderNavIcon(IconComp, settingsPanelOpen)}
      <span className="whitespace-nowrap">{item.label}</span>
    </button>
  );
}

export function SecondaryTopNav() {
  const { activeProductId, sidebarTheme } = useShell();
  const isDark = sidebarTheme === 'dark';
  const sections = productNavSections[activeProductId] ?? primaryNavSections;
  const items = sections.flatMap((section) => section.items);

  function renderItem(item) {
    if (item.id === 'settings') return <TopNavSettings key={item.id} item={item} />;
    if (item.children?.length) return <TopNavMenu key={item.id} item={item} />;
    return <TopNavLink key={item.id} item={item} />;
  }

  return (
    <nav
      aria-label="Secondary navigation"
      className={cn(
        isDark ? 'sidebar-dark' : 'sidebar-light',
        'hidden lg:block w-full flex-shrink-0'
      )}
      style={{ background: 'var(--sb-bg)', borderBottom: '1px solid var(--sb-border)' }}
    >
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(renderItem)}
      </div>
    </nav>
  );
}
