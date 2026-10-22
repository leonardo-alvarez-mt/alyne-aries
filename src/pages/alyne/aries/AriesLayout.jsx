import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AriesProvider } from './AriesContext';
import { AriesSidebar } from './AriesSidebar';
import { AriesSectionNav } from './AriesSectionNav';
import { AriesVersionPill } from './AriesVersionPill';
import { NavCollapseButton, useAriesNavCollapse } from './AriesNavCollapse';

/**
 * Full-bleed ARIES workspace inside the Alyne shell.
 * Fills the main content area below the product header.
 */
export default function AriesLayout() {
  const { pathname } = useLocation();
  const sectionNav = pathname.startsWith('/aries/knowledge') || pathname.startsWith('/aries/admin');
  const workspaceRef = useRef(null);
  const { collapsed, collapse, expand } = useAriesNavCollapse(workspaceRef);

  return (
    <AriesProvider>
      <div
        ref={workspaceRef}
        className="aries-workspace relative flex overflow-hidden bg-white"
        style={{ height: 'calc(100vh - var(--shell-header-height))' }}
      >
        {sectionNav ? (
          <AriesSectionNav collapsed={collapsed} onCollapse={collapse} />
        ) : (
          <AriesSidebar collapsed={collapsed} onCollapse={collapse} />
        )}
        {collapsed ? (
          <NavCollapseButton collapsed onClick={expand} className="left-3 top-4 z-30" />
        ) : null}
        <div className="group/workspace relative min-w-0 flex-1 overflow-hidden bg-white">
          <AriesVersionPill className="group-has-[#recovery-output-panel]/workspace:hidden" />
          <Outlet />
        </div>
      </div>
    </AriesProvider>
  );
}
