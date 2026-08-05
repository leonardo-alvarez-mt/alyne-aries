import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useShell } from '../../components/shell/ShellContext';
import { resolveNavPath, isShellNavActive } from '../../utils/shellNavigation';
import { t, FONT_HEADING } from './alyneTokens';

/**
 * Two-level product layout for Alyne section screens (Governance, Compliance).
 * Renders an in-page section sidebar (title + vertical nav) beside the main
 * content. Mirrors the legacy Ember `screen-navbar` structure without any of
 * its Bootstrap classes.
 */
export default function AlyneSectionLayout({ section, children }) {
  const { setActiveProductId } = useShell();
  const { pathname } = useLocation();

  // Deep links should surface the Alyne product rail + breadcrumbs.
  useEffect(() => {
    setActiveProductId('alyne');
  }, [setActiveProductId]);

  const navItems = section.items.map((item) => {
    const active = isShellNavActive(item.path, pathname);
    return (
      <NavLink
        key={item.id}
        to={resolveNavPath(item.path, pathname)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'block rounded-md px-3 py-2 text-[13px] font-medium leading-none transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0067D2] focus-visible:ring-offset-1',
          active ? 'font-semibold' : 'hover:bg-[#F2F4F7]'
        )}
        style={{
          color: active ? '#000000' : t.textMuted,
          background: active ? '#e3e9ef' : undefined,
        }}
      >
        {item.label}
      </NavLink>
    );
  });

  return (
    <div className="flex min-h-full font-[Inter,sans-serif]">
      {/* Desktop section sidebar */}
      <aside
        aria-label={`${section.title} navigation`}
        className="hidden w-[232px] shrink-0 flex-col gap-1 px-3 py-6 lg:flex"
        style={{ borderRight: `1px solid ${t.borderSubtle}` }}
      >
        <div className="mb-3 px-3">
          <h2 className="m-0 text-lg font-bold" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
            {section.title}
          </h2>
        </div>
        <nav aria-label={`${section.title} sections`} className="flex flex-col gap-0.5">
          {navItems}
        </nav>
      </aside>

      {/* Mobile / tablet: horizontal section nav */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex items-center gap-2 overflow-x-auto px-6 py-3 lg:hidden"
          style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
        >
          <span className="shrink-0 text-sm font-bold" style={{ color: t.textPrimary }}>
            {section.title}
          </span>
          <nav aria-label={`${section.title} sections`} className="flex items-center gap-1">
            {section.items.map((item) => {
              const active = isShellNavActive(item.path, pathname);
              return (
                <NavLink
                  key={item.id}
                  to={resolveNavPath(item.path, pathname)}
                  aria-current={active ? 'page' : undefined}
                  className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors"
                  style={{
                    color: active ? '#000000' : t.textMuted,
                    background: active ? '#e3e9ef' : '#F2F4F7',
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
