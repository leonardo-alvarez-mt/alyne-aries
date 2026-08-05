import { useState } from 'react';
import { Bell, ChevronDown, PanelLeft, HelpCircle, Sparkles } from 'lucide-react';
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
  const [searchFlare, setSearchFlare] = useState(false);

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

      <div className="hidden md:flex min-w-0 flex-1 justify-center px-3">
        <div
          className={cn(
            'aries-outline flex w-full max-w-xl rounded-xl p-[1.5px] transition-colors duration-150',
            searchFlare && 'aries-flare-run',
            searchActive && !searchFlare && 'ring-2 ring-blue-100'
          )}
          onMouseDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const angle = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
            e.currentTarget.style.setProperty('--aries-from', `${angle}deg`);
          }}
          onAnimationEnd={() => setSearchFlare(false)}
          style={{
            background: searchFlare
              ? 'linear-gradient(135deg, #0067D2 0%, #00B8D9 100%)'
              : searchActive
                ? '#60A5FA' /* blue-400 — normal focused border */
                : '#E5E7EB', /* neutral-200 */
          }}
        >
          <div className="relative z-[1] flex w-full items-center rounded-[10px] bg-white">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Sparkles size={16} strokeWidth={2} aria-hidden="true" style={{ color: '#0067D2' }} />
            </span>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => { setSearchActive(true); setSearchFlare(true); }}
              onBlur={() => setSearchActive(false)}
              placeholder="Search or ask AI anything…"
              aria-label="Global AI search"
              className="w-full rounded-[10px] bg-transparent py-1.5 pl-9 pr-16 text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400"
            >
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
        <button
          type="button"
          aria-label="Ask ARIES"
          onMouseEnter={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            // Compass angle (clockwise from top) from the button center to the cursor.
            const angle = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
            e.currentTarget.style.setProperty('--aries-from', `${angle}deg`);
          }}
          className={cn(
            'aries-outline group/aries mr-1 flex shrink-0 items-center rounded-xl p-[1.5px]',
            'transition-shadow duration-150 hover:shadow-[0_2px_10px_-2px_rgba(0,103,210,0.45)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1'
          )}
          style={{ background: 'linear-gradient(135deg, #0067D2 0%, #00B8D9 100%)' }}
        >
          <span
            className="relative z-[1] flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150 group-hover/aries:bg-[#F5FAFF]"
            style={{ color: '#0067D2' }}
          >
            <Sparkles size={15} strokeWidth={2} aria-hidden="true" />
            <span className="whitespace-nowrap">Ask ARIES</span>
          </span>
        </button>

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
