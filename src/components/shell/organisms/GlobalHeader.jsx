import { useState } from 'react';
import { Bell, ChevronDown, PanelLeft, HelpCircle, Search } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ProductSwitcherMenu } from './ProductSwitcherMenu';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { Breadcrumbs } from '../molecules/Breadcrumbs';
import { ProductLogo } from '../molecules/ProductLogo';
import { useShell } from '../ShellContext';
import { notifications } from '../../../data/notifications';
import { products } from '../../../data/products';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function GlobalHeader() {
  const {
    currentUser,
    activeProductId,
    headerBreadcrumbs,
    openMobileSidebar,
  } = useShell();
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = getInitials(currentUser.name);

  function closeAll() {
    setProductMenuOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
  }

  function handleMobileNavOpen() {
    openMobileSidebar();
  }

  return (
    <header
      className="flex w-full flex-shrink-0 items-center px-2 gap-0"
      style={{
        height: 'var(--shell-header-height)',
        zIndex: 'var(--shell-z-header)',
        background: 'var(--shell-header-bg)',
        borderBottom: '1px solid var(--shell-header-border)',
      }}
    >
      <div className="flex items-center min-w-0 shrink gap-4">
        <button
          type="button"
          onClick={handleMobileNavOpen}
          aria-label="Open navigation menu"
          className={cn(
            'lg:hidden flex items-center justify-center w-9 h-9 shrink-0 rounded-lg text-neutral-500',
            'transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1'
          )}
        >
          <PanelLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <ProductLogo product={activeProduct} />
        {headerBreadcrumbs.length > 0 && (
          <>
            <span className="hidden sm:block w-px h-4 shrink-0 bg-neutral-200" aria-hidden="true" />
            <Breadcrumbs items={headerBreadcrumbs} className="min-w-0" />
          </>
        )}
      </div>

      <div className="hidden md:flex min-w-0 flex-1 justify-center px-6">
        <label
          className={cn(
            'flex h-9 w-full max-w-md items-center gap-2 rounded-lg border px-2.5 transition-colors duration-150',
            searchActive
              ? 'border-[#0067D2] bg-white shadow-[0_0_0_3px_rgba(0,103,210,0.14)]'
              : 'border-transparent bg-neutral-100 hover:bg-neutral-200/70'
          )}
        >
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className={cn('shrink-0', searchActive ? 'text-[#0067D2]' : 'text-neutral-400')}
          />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
            placeholder="Search controls, risks, questionnaires"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {globalSearch.length === 0 && (
            <span aria-hidden="true" className="hidden shrink-0 items-center gap-0.5 lg:inline-flex">
              <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-neutral-200/80 bg-white px-1 font-sans text-[11px] font-medium leading-none text-neutral-500">
                ⌘
              </kbd>
              <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-neutral-200/80 bg-white px-1 font-sans text-[11px] font-medium leading-none text-neutral-500">
                K
              </kbd>
            </span>
          )}
        </label>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
        <a
          href="/help"
          onClick={(e) => e.preventDefault()}
          aria-label="Help"
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full text-neutral-600',
            'transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1'
          )}
        >
          <HelpCircle size={18} strokeWidth={1.75} aria-hidden="true" />
        </a>

        <div className="relative">
          <button
            type="button"
            onClick={() => { closeAll(); setNotifOpen((v) => !v); }}
            aria-expanded={notifOpen}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-full text-neutral-600',
              'transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
              notifOpen && 'bg-neutral-100 text-neutral-800'
            )}
          >
            <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-0.5 right-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shrink-0 leading-none"
                style={{ width: 16, height: 16, minWidth: 16 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationMenu onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { closeAll(); setProductMenuOpen((v) => !v); }}
            aria-expanded={productMenuOpen}
            aria-haspopup="dialog"
            aria-label="Switch product"
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full text-neutral-600',
              'transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
              productMenuOpen && 'bg-neutral-100 text-neutral-800'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
              <circle cx="3"  cy="3"  r="1.6" /><circle cx="9"  cy="3"  r="1.6" /><circle cx="15" cy="3"  r="1.6" />
              <circle cx="3"  cy="9"  r="1.6" /><circle cx="9"  cy="9"  r="1.6" /><circle cx="15" cy="9"  r="1.6" />
              <circle cx="3"  cy="15" r="1.6" /><circle cx="9"  cy="15" r="1.6" /><circle cx="15" cy="15" r="1.6" />
            </svg>
          </button>
          {productMenuOpen && <ProductSwitcherMenu onClose={() => setProductMenuOpen(false)} />}
        </div>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => { closeAll(); setUserMenuOpen((v) => !v); }}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label={`User menu for ${currentUser.name}`}
            className={cn(
              'flex items-center gap-2 p-0.5 rounded-lg',
              'transition-colors duration-150 hover:bg-neutral-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
              userMenuOpen && 'bg-neutral-100'
            )}
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold select-none flex-shrink-0"
              style={{ background: '#D8CAE2', color: '#6B3FA0' }}
              aria-hidden="true"
            >
              {initials}
            </span>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={cn('text-neutral-400 transition-transform duration-150 flex-shrink-0', userMenuOpen && 'rotate-180')}
            />
          </button>
          {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
