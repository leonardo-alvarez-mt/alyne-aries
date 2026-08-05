import { useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { ProductSidebar } from './ProductSidebar';
import { SecondaryTopNav } from './SecondaryTopNav';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { ShellAppearancePanel } from './ShellAppearancePanel';
import { SidebarEdgeToggle } from '../molecules/SidebarEdgeToggle';
import { useShell } from '../ShellContext';
import { useShellBreadcrumbs } from '../useShellBreadcrumbs';

/**
 * @param {Array}  [breadcrumbs] Explicit trail. Omit to derive one from the
 *                               navigation model — the normal case.
 * @param {Array}  [trailing]    Leaf crumbs for pages below the nav tree
 *                               (e.g. a record name on a detail page).
 */
export function ShellLayout({ children, breadcrumbs, trailing }) {
  const { setHeaderBreadcrumbs, sidebarCollapsed, settingsPanelOpen, shellAppearance } = useShell();
  const topNav = shellAppearance.navLayout === 'topbar';
  const derivedBreadcrumbs = useShellBreadcrumbs(trailing);
  const trail = breadcrumbs ?? derivedBreadcrumbs;

  useEffect(() => {
    setHeaderBreadcrumbs(trail);
    return () => setHeaderBreadcrumbs([]);
  }, [trail, setHeaderBreadcrumbs]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100vh', background: 'var(--shell-page-bg)' }}>
      <GlobalHeader />
      {topNav && <SecondaryTopNav />}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!topNav && (
          <div
            className="relative hidden lg:block flex-shrink-0 h-full overflow-visible transition-[width] duration-[250ms] ease-in-out"
            style={{
              width: sidebarCollapsed
                ? 'var(--shell-sidebar-collapsed)'
                : 'var(--shell-sidebar-expanded)',
            }}
          >
            <div className="h-full overflow-hidden">
              <ProductSidebar />
            </div>
            <SidebarEdgeToggle />
          </div>
        )}
        <main
          id="shell-main-content"
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ background: 'var(--shell-page-bg)' }}
          tabIndex={-1}
        >
          {settingsPanelOpen ? <ShellAppearancePanel /> : children}
        </main>
      </div>
      <MobileSidebarDrawer />
    </div>
  );
}
