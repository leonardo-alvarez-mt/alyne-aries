import { Outlet, useLocation } from 'react-router-dom';
import { AriesProvider } from './AriesContext';
import { AriesSidebar } from './AriesSidebar';
import { AriesSectionNav } from './AriesSectionNav';
import { AriesVersionPill } from './AriesVersionPill';

/**
 * Full-bleed ARIES workspace inside the Alyne shell.
 * Fills the main content area below the product header.
 */
export default function AriesLayout() {
  const { pathname } = useLocation();
  const sectionNav = pathname.startsWith('/aries/knowledge') || pathname.startsWith('/aries/admin');

  return (
    <AriesProvider>
      <div
        className="aries-workspace relative flex overflow-hidden bg-white"
        style={{ height: 'calc(100vh - var(--shell-header-height))' }}
      >
        {sectionNav ? <AriesSectionNav /> : <AriesSidebar />}
        <div className="group/workspace relative min-w-0 flex-1 overflow-hidden bg-white">
          <AriesVersionPill className="group-has-[#recovery-output-panel]/workspace:hidden" />
          <Outlet />
        </div>
      </div>
    </AriesProvider>
  );
}
