import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useShell } from '../ShellContext';
import { isInShell, isShellNavActive, resolveNavPath, matchNavPath, resolveNavGroups } from '../../../utils/shellNavigation';
import { NAV_ROW_INNER_CLASS, NAV_RAIL_ITEM_CLASS, NAV_RAIL_LABEL_CLASS } from '../sidebarNavLayout';
import { FlyoutNavMenu } from './FlyoutNavMenu';

const ACTIVE_TEXT = '#0067d2';
const NAV_ICON_SIZE = 20;
const NAV_ROW_HEIGHT = 'h-8';
const NAV_RAIL_ICON_SIZE = 'h-5 w-5';

/** Duo/Lucide/Tabler icons all inherit `currentColor`; drive color via classes
 *  so hover (group-hover) can recolor them — inline color can't be hovered. */
function renderNavIcon(IconComp, active, extraClassName) {
  return (
    <IconComp
      size={NAV_ICON_SIZE}
      aria-hidden="true"
      className={cn(
        active ? 'text-[#0067d2]' : 'text-[var(--sb-icon)] group-hover/nav:text-[#0067d2]',
        extraClassName
      )}
    />
  );
}

function trackSurfaceClass(active) {
  return cn(
    'transition-colors duration-150 ease-in-out',
    active && 'bg-[var(--sb-icon-active-bg)]',
    !active && 'group-hover/nav:bg-[var(--sb-bg-hover)]'
  );
}

function collapsedIconClass() {
  return cn(NAV_RAIL_ICON_SIZE, 'relative z-[1] flex shrink-0 items-center justify-center');
}

function sidebarRowClass(extra, collapsed = false) {
  return cn(
    'group/nav relative flex w-full',
    collapsed ? 'flex-col items-center' : 'items-center',
    extra
  );
}

function sidebarLabelClass(extra) {
  return cn('text-[13px] font-medium', extra);
}

function resolveIcon(icon, activeIcon, isActive) {
  return isActive && activeIcon ? activeIcon : icon;
}

function railLabelColorClass(active) {
  return active ? 'text-[#0067d2]' : 'text-[var(--sb-text)] group-hover/nav:text-[#0067d2]';
}

function BadgeDot({ active }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full"
      style={{ background: active ? ACTIVE_TEXT : 'var(--sb-accent)', boxShadow: '0 0 0 1.5px var(--sb-bg)' }}
    />
  );
}

/** Collapsed: 5.5rem rail with icon + label stack. Expanded: horizontal inner row. */
function NavRowTrack({ active, collapsed, interactive = true, icon, label, trailing, badge, caret = false }) {
  if (collapsed) {
    return (
      <div className={NAV_RAIL_ITEM_CLASS}>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[10px]',
            trackSurfaceClass(active)
          )}
          aria-hidden
        />
        {caret && (
          <ChevronRight
            size={12}
            strokeWidth={2.25}
            aria-hidden="true"
            className="pointer-events-none absolute right-1 z-[1]"
            style={{ top: '1.25rem', transform: 'translateY(-50%)', color: active ? ACTIVE_TEXT : 'var(--sb-icon)', opacity: 0.65 }}
          />
        )}
        <span className={collapsedIconClass()}>
          {icon}
          {badge !== undefined && <BadgeDot active={active} />}
        </span>
        {label != null && (
          <span
            className={cn(NAV_RAIL_LABEL_CLASS, 'relative z-[1]', railLabelColorClass(active))}
            style={{ opacity: active ? 1 : 0.85 }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative flex w-full items-center', NAV_ROW_HEIGHT)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[10px]',
          trackSurfaceClass(active, interactive)
        )}
        aria-hidden
      />
      <div className={NAV_ROW_INNER_CLASS}>
        <span className={cn(NAV_ROW_HEIGHT, 'flex shrink-0 items-center justify-center')}>
          {icon}
        </span>
        {label != null && (
          <span className={cn(NAV_ROW_HEIGHT, 'flex min-w-0 flex-1 items-center justify-between')}>
            <span
              className={cn(
                'h-5 min-w-0 truncate whitespace-nowrap',
                sidebarLabelClass(),
                railLabelColorClass(active)
              )}
            >
              {label}
            </span>
            {trailing}
          </span>
        )}
      </div>
    </div>
  );
}

function useIsChildActive(item) {
  const { pathname } = useLocation();
  if (!item.children) return false;
  const leaves = resolveNavGroups(item).flatMap((g) => g.items);
  return leaves.some((c) => matchNavPath(c.path, pathname));
}

function shouldUseFlyout(item, collapsed) {
  return item.flyout || item.id === 'more' || collapsed;
}

/* ── Flyout submenu (portal) — collapsed rail + expanded “More” overflow ── */
function FlyoutNavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false);
  const [flyoutStyle, setFlyoutStyle] = useState({});
  const buttonRef = useRef(null);
  const flyoutRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isChildActive = useIsChildActive(item);
  const flyoutEntries = resolveNavGroups(item);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 12;
    const maxHeight = window.innerHeight - margin * 2;
    // Vertically center the menu on the hovered item (use the real rendered
    // height once available), then clamp so it never leaves the viewport.
    const menuHeight = flyoutRef.current
      ? Math.min(flyoutRef.current.offsetHeight, maxHeight)
      : maxHeight;
    let top = rect.top + rect.height / 2 - menuHeight / 2;
    top = Math.max(margin, Math.min(top, window.innerHeight - margin - menuHeight));
    setFlyoutStyle({ position: 'fixed', top, left: rect.right + 8, maxHeight, zIndex: 9999 });
  }, []);

  function cancelClose() { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } }
  function openFlyout() { cancelClose(); updatePosition(); setOpen(true); }
  function closeFlyout() { cancelClose(); setOpen(false); }
  function scheduleClose() { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 140); }

  useEffect(() => () => cancelClose(), []);

  // Re-measure once the menu has rendered so centering uses its real height.
  useEffect(() => { if (open) updatePosition(); }, [open, updatePosition]);

  const hoverProps = collapsed
    ? { onMouseEnter: openFlyout, onMouseLeave: scheduleClose }
    : {};

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (
        flyoutRef.current && !flyoutRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) closeFlyout();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (e.key === 'Escape') { closeFlyout(); buttonRef.current?.focus(); } }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('scroll', handler, true); window.removeEventListener('resize', handler); };
  }, [open, updatePosition]);

  const IconComp = resolveIcon(item.icon, item.activeIcon, isChildActive || open);
  const highlighted = isChildActive || open;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={open ? closeFlyout : openFlyout}
        {...hoverProps}
        aria-expanded={open}
        aria-haspopup="menu"
        className={sidebarRowClass(
          cn(
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)]',
            collapsed ? 'focus-visible:ring-offset-1' : 'focus-visible:ring-inset'
          ),
          collapsed
        )}
      >
        <NavRowTrack
          active={highlighted}
          collapsed={collapsed}
          interactive
          icon={renderNavIcon(IconComp, highlighted)}
          label={item.label}
          badge={item.badge}
          caret={collapsed}
        />
      </button>
      {open && createPortal(
        <FlyoutNavMenu
          menuRef={flyoutRef}
          style={flyoutStyle}
          title={item.label}
          flyoutEntries={flyoutEntries}
          pathname={pathname}
          onMenuEnter={collapsed ? cancelClose : undefined}
          onMenuLeave={collapsed ? scheduleClose : undefined}
          onSelect={(child) => {
            navigate(resolveNavPath(child.path, pathname));
            closeFlyout();
          }}
          onClose={closeFlyout}
        />,
        document.body
      )}
    </>
  );
}

/* ── Accordion item with children (expanded sidebar) ── */
function AccordionNavItem({ item }) {
  const isChildActive = useIsChildActive(item);
  const [open, setOpen] = useState(isChildActive);
  const { settingsPanelOpen, setSettingsPanelOpen } = useShell();
  const { pathname } = useLocation();
  const groups = resolveNavGroups(item);
  const isActive = isChildActive && !settingsPanelOpen;
  const IconComp = resolveIcon(item.icon, item.activeIcon, isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={sidebarRowClass(
          cn(
            'text-[13px] font-medium select-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sb-accent)]'
          )
        )}
      >
        <NavRowTrack
          active={isActive}
          collapsed={false}
          interactive
          icon={renderNavIcon(IconComp, isActive)}
          label={item.label}
          trailing={(
            <>
              {item.badge !== undefined && (
                <span
                  className="ml-2 flex-shrink-0 h-[18px] min-w-[20px] px-1.5 rounded-full text-[10.5px] font-semibold flex items-center justify-center tabular-nums leading-none"
                  style={{ background: isActive ? 'rgba(29,41,57,0.12)' : 'rgba(0,0,0,0.10)', color: isActive ? ACTIVE_TEXT : 'var(--sb-text)' }}
                >
                  {item.badge}
                </span>
              )}
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="ml-2 flex-shrink-0 transition-transform duration-200"
                style={{ color: 'var(--sb-icon)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              />
            </>
          )}
        />
      </button>
      {open && (
        <div className="ml-3 mt-px flex flex-col border-l pl-8" style={{ borderColor: 'var(--sb-border)' }}>
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className={cn('flex flex-col gap-px', groupIndex > 0 && 'mt-1.5')}>
              {group.label && (
                <p
                  className="px-3 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--sb-text)', opacity: 0.5 }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((child) => (
                <NavLink
                  key={child.id}
                  to={resolveNavPath(child.path, pathname)}
                  end={child.path === '/'}
                  isActive={({ isActive, location }) => (
                    isInShell(location.pathname)
                      ? isShellNavActive(child.path, location.pathname)
                      : isActive
                  )}
                  className={() => cn(
                    'block pl-3 pr-2 py-[6px] rounded-r-lg text-[12.5px] font-medium',
                    'transition-all duration-150 select-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sb-accent)]'
                  )}
                  style={({ isActive }) => ({
                    color: isActive && !settingsPanelOpen ? ACTIVE_TEXT : 'var(--sb-text)',
                    background: isActive && !settingsPanelOpen ? 'var(--sb-icon-active-bg)' : undefined,
                  })}
                  onClick={() => { if (settingsPanelOpen) setSettingsPanelOpen(false); }}
                  onMouseEnter={(e) => { if (e.currentTarget.getAttribute('aria-current') !== 'page') { e.currentTarget.style.background = 'var(--sb-bg-hover)'; e.currentTarget.style.color = ACTIVE_TEXT; } }}
                  onMouseLeave={(e) => { if (e.currentTarget.getAttribute('aria-current') !== 'page') { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--sb-text)'; } }}
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main NavItem export ── */
export function NavItem({ item, collapsed }) {
  const { toggleSettingsPanel, settingsPanelOpen, setSettingsPanelOpen } = useShell();
  const { pathname } = useLocation();
  const isSettingsItem = item.id === 'settings';
  const navTo = resolveNavPath(item.path, pathname);

  if (item.children && item.children.length > 0 && !isSettingsItem) {
    if (shouldUseFlyout(item, collapsed)) {
      return <FlyoutNavItem item={item} collapsed={collapsed} />;
    }
    return <AccordionNavItem item={item} />;
  }

  if (isSettingsItem) {
    const SettingsIcon = resolveIcon(item.icon, item.activeIcon, settingsPanelOpen);
    if (collapsed) {
      return (
        <button
          type="button"
          onClick={toggleSettingsPanel}
          aria-pressed={settingsPanelOpen}
          className={sidebarRowClass(
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-1',
            true
          )}
        >
          <NavRowTrack
            active={settingsPanelOpen}
            collapsed
            interactive
            icon={renderNavIcon(SettingsIcon, settingsPanelOpen)}
            label={item.label}
          />
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={toggleSettingsPanel}
        aria-pressed={settingsPanelOpen}
        className={sidebarRowClass(
          cn(
            'text-[13px] font-medium select-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sb-accent)]'
          )
        )}
      >
        <NavRowTrack
          active={settingsPanelOpen}
          collapsed={false}
          interactive
          icon={renderNavIcon(SettingsIcon, settingsPanelOpen)}
          label={item.label}
        />
      </button>
    );
  }

  return (
    <NavLink
      to={navTo}
      end={item.path === '/'}
      isActive={({ isActive, location }) => (
        isInShell(location.pathname)
          ? isShellNavActive(item.path, location.pathname)
          : isActive
      )}
      className={() => sidebarRowClass(
        cn(
          'text-[13px] font-medium select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sb-accent)]'
        ),
        collapsed
      )}
      onClick={() => { if (settingsPanelOpen) setSettingsPanelOpen(false); }}
    >
      {() => {
        const highlighted = settingsPanelOpen ? false : matchNavPath(item.path, pathname);
        const IconComp = resolveIcon(item.icon, item.activeIcon, highlighted);
        return (
          <NavRowTrack
            active={highlighted}
            collapsed={collapsed}
            interactive
            icon={renderNavIcon(IconComp, highlighted, 'flex-shrink-0')}
            label={item.label}
            badge={collapsed && item.badge !== undefined ? item.badge : undefined}
            trailing={!collapsed && item.badge !== undefined ? (
              <span
                className="ml-2 flex-shrink-0 h-[18px] min-w-[20px] px-1.5 rounded-full text-[10.5px] font-semibold flex items-center justify-center tabular-nums leading-none"
                style={{ background: highlighted ? 'rgba(29,41,57,0.12)' : 'rgba(0,0,0,0.10)', color: highlighted ? ACTIVE_TEXT : 'var(--sb-text)' }}
              >
                {item.badge}
              </span>
            ) : undefined}
          />
        );
      }}
    </NavLink>
  );
}
