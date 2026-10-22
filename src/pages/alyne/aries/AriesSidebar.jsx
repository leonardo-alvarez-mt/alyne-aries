import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  Bot,
  Library,
  Settings,
  SlidersHorizontal,
  PanelLeft,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { publicPath } from '../../../lib/publicPath';
import { useAries } from './AriesContext';
import { customizeItems, settingsItems } from './AriesSectionNav';
import { ariesFocus } from './ariesUi';
import { cn } from '../../../utils/cn';

const rowBase =
  'flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] leading-5 transition-colors';
const rowIdle = 'text-[#1e293b] hover:bg-[#f1f5f9]';
const rowActive = 'bg-[rgba(0,103,210,0.10)] font-medium text-[#001a35]';
const SIDEBAR_COLLAPSED_KEY = 'aries-sidebar-collapsed';

function AriesBrand({ collapsed }) {
  return (
    <img
      src={publicPath('aries/aries-logo.svg')}
      alt="ARIES"
      className={cn(
        'h-6 w-auto shrink-0 group-has-[.aries-side-panel]/aries:hidden',
        collapsed && 'hidden'
      )}
      style={{ width: 80, height: 24 }}
    />
  );
}

function NavRow({ to, icon: Icon, label, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        cn(
          rowBase,
          'group-has-[.aries-side-panel]/aries:justify-center group-has-[.aries-side-panel]/aries:px-0',
          collapsed && 'justify-center px-0',
          ariesFocus,
          isActive ? rowActive : rowIdle
        )
      }
    >
      <Icon size={18} strokeWidth={1.6} className="shrink-0 text-[#334155]" aria-hidden />
      <span
        className={cn(
          'min-w-0 flex-1 truncate group-has-[.aries-side-panel]/aries:sr-only',
          collapsed && 'sr-only'
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}

const SEARCH_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'chats', label: 'Chats' },
  { id: 'pages', label: 'Pages' },
];

function SearchDialog({ open, query, onQuery, onClose, chats, pages, onPick }) {
  const inputRef = useRef(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!open) return;
    setFilter('all');
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const needle = query.trim().toLowerCase();
  const matches = (label) => !needle || label.toLowerCase().includes(needle);
  const chatHits = (filter === 'all' || filter === 'chats' ? chats : []).filter((chat) => matches(chat.title));
  const pageHits = (filter === 'all' || filter === 'pages' ? pages : []).filter((page) => matches(page.label));
  const showNewChat = (filter === 'all' || filter === 'pages') && matches('New chat');
  const empty = chatHits.length === 0 && pageHits.length === 0 && !showNewChat;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/40 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[min(560px,80vh)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center gap-2 border-b border-[#e8edf2] px-4">
          <Search size={16} strokeWidth={1.75} className="shrink-0 text-[#94a3b8]" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-[#001a35] placeholder:text-[#94a3b8] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className={cn(
              'flex size-8 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#001a35]',
              ariesFocus
            )}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#e8edf2] px-3 py-2" role="tablist" aria-label="Search filters">
          {SEARCH_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[13px] transition-colors',
                ariesFocus,
                filter === item.id
                  ? 'bg-[#f1f5f9] font-medium text-[#001a35]'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#001a35]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {chatHits.length > 0 ? (
            <SearchGroup label="Recents">
              {chatHits.map((chat) => (
                <SearchResult
                  key={chat.id}
                  icon={MessageSquare}
                  label={chat.title}
                  onClick={() => onPick(`/aries/chat/${chat.id}`)}
                />
              ))}
            </SearchGroup>
          ) : null}
          {pageHits.length > 0 ? (
            <SearchGroup label="Pages">
              {pageHits.map((page) => (
                <SearchResult
                  key={page.to}
                  icon={page.icon}
                  label={page.label}
                  onClick={() => onPick(page.to)}
                />
              ))}
            </SearchGroup>
          ) : null}
          {showNewChat ? (
            <SearchGroup label="Actions">
              <SearchResult icon={Plus} label="New chat" onClick={() => onPick('/aries')} />
            </SearchGroup>
          ) : null}
          {empty ? <p className="px-3 py-8 text-center text-sm text-[#94a3b8]">No results</p> : null}
        </div>

        <div className="flex items-center gap-2 border-t border-[#e8edf2] px-4 py-2.5 text-[12px] text-[#64748b]">
          Close
          <kbd className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 font-sans text-[11px] text-[#475569]">
            Esc
          </kbd>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SearchGroup({ label, children }) {
  return (
    <section className="mb-2">
      <h2 className="px-2 py-1.5 text-[12px] font-medium text-[#94a3b8]">{label}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function SearchResult({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[14px] text-[#1e293b] hover:bg-[#f4f6f8]',
        ariesFocus
      )}
    >
      <Icon size={16} strokeWidth={1.6} className="shrink-0 text-[#64748b]" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function CollapsibleSection({ title, defaultOpen = true, children, trailing, className }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn('mt-5', className)}>
      <div className="flex items-center gap-2 px-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'group flex h-8 min-w-0 flex-1 items-center justify-between rounded-md text-left text-[13px] font-medium text-[#64748b] transition-colors hover:text-[#334155]',
            ariesFocus
          )}
        >
          {title}
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            className={cn('shrink-0 text-[#94a3b8] transition-transform group-hover:text-[#64748b]', !open && '-rotate-90')}
            aria-hidden
          />
        </button>
        {trailing}
      </div>
      {open ? <div className="mt-0.5 flex flex-col gap-0.5">{children}</div> : null}
    </section>
  );
}

export function AriesSidebar() {
  const { version, chats } = useAries();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isV2 = version === 'v2';
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const recent = useMemo(
    () => [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [chats]
  );

  const sidebarRecents = recent.slice(0, 6);
  const pages = [
    { to: '/aries/agents', label: 'Agents', icon: Bot },
    ...(isV2 ? [{ to: '/aries/skills', label: 'Skills', icon: Library }] : []),
    { to: '/aries/knowledge', label: 'Customize', icon: SlidersHorizontal },
    { to: '/aries/admin', label: 'Settings', icon: Settings },
    ...customizeItems(isV2),
    ...settingsItems(isV2),
  ];

  return (
    <>
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col overflow-hidden border-r bg-white transition-[width,border-color] duration-200 ease-out motion-reduce:transition-none',
        collapsed
          ? '!w-0 border-r-0'
          : 'w-[248px] border-[#e2e8f0] group-has-[.aries-side-panel]/aries:w-16'
      )}
      aria-label="ARIES navigation"
      aria-hidden={collapsed}
    >
      <div
        className={cn(
          'flex h-full min-h-0 flex-col transition-opacity duration-150',
          collapsed && 'pointer-events-none opacity-0'
        )}
      >
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-4 group-has-[.aries-side-panel]/aries:justify-center group-has-[.aries-side-panel]/aries:px-0">
        <AriesBrand collapsed={collapsed} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search chats"
            aria-pressed={searchOpen}
            title="Search ⌘K"
            className={cn(
              'flex size-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
              ariesFocus,
              searchOpen && 'bg-[#f1f5f9]'
            )}
          >
            <Search size={18} strokeWidth={1.5} aria-hidden />
          </button>
          <NavCollapseButton collapsed={false} onClick={() => setCollapsed(true)} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-4 pt-2">
        <nav aria-label="ARIES" className="flex flex-col">
          <ul className="flex flex-col gap-0.5">
            <li>
              <NavRow to="/aries" end icon={Plus} label="New chat" collapsed={collapsed} />
            </li>
            <li>
              <NavRow to="/aries/agents" icon={Bot} label="Agents" collapsed={collapsed} />
            </li>
            {isV2 ? (
              <li>
                <NavRow to="/aries/skills" icon={Library} label="Skills" collapsed={collapsed} />
              </li>
            ) : null}
            <li>
              <NavRow to="/aries/knowledge" icon={SlidersHorizontal} label="Customize" collapsed={collapsed} />
            </li>
            <li>
              <NavRow to="/aries/admin" icon={Settings} label="Settings" collapsed={collapsed} />
            </li>
          </ul>
        </nav>

        <CollapsibleSection
          className={cn('group-has-[.aries-side-panel]/aries:hidden', collapsed && 'hidden')}
          title="Recents"
          trailing={
            isV2 ? (
              <button
                type="button"
                onClick={() => navigate('/aries/history')}
                className={cn(
                  'shrink-0 rounded text-[12px] font-medium text-[#0067D2] hover:underline',
                  ariesFocus
                )}
              >
                See all
              </button>
            ) : null
          }
        >
          {sidebarRecents.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[14px] text-[#94a3b8]">No recent chats</p>
          ) : (
            sidebarRecents.map((chat) => {
              const active = pathname === `/aries/chat/${chat.id}`;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => navigate(`/aries/chat/${chat.id}`)}
                  className={cn(rowBase, ariesFocus, active ? rowActive : rowIdle)}
                >
                  <span className="truncate">{chat.title}</span>
                </button>
              );
            })
          )}
        </CollapsibleSection>
      </div>
      </div>

      <SearchDialog
        open={searchOpen}
        query={searchQuery}
        onQuery={setSearchQuery}
        onClose={closeSearch}
        chats={recent}
        pages={pages}
        onPick={(to) => {
          navigate(to);
          closeSearch();
        }}
      />
    </aside>
    {collapsed ? (
      <NavCollapseButton
        collapsed
        onClick={() => setCollapsed(false)}
        className="absolute left-3 top-4 z-30"
      />
    ) : null}
    </>
  );
}

function NavCollapseButton({ collapsed, onClick, className }) {
  const label = collapsed ? 'Expand navigation' : 'Collapse navigation';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={!collapsed}
      className={cn(
        'group/collapse flex size-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
        collapsed
          ? 'absolute border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
          : 'relative group-has-[.aries-side-panel]/aries:hidden',
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
