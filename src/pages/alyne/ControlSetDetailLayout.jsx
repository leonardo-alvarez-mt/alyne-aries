import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useShell } from '../../components/shell/ShellContext';
import { Avatar } from '../../components/shell/atoms/Avatar';
import { t, FONT_HEADING } from './alyneTokens';

/**
 * Control-set-scoped two-level layout. Mirrors `AlyneSectionLayout`'s structure
 * (in-page section sidebar beside the main content) but scoped to a single
 * Control Set: the sidebar shows the set name, its ID + owner, and the
 * record-level tabs (Content, Controls, Comments, …). Tabs are in-page state —
 * only "Content" is built today, so the rest render a lightweight placeholder.
 */
export const CONTROL_SET_TABS = ['Content', 'Controls', 'Comments', 'Attachments', 'Settings'];

export default function ControlSetDetailLayout({ name, id, owner, activeTab, onTabChange, children }) {
  const { setActiveProductId } = useShell();

  // Deep links should surface the Alyne product rail + breadcrumbs.
  useEffect(() => {
    setActiveProductId('alyne');
  }, [setActiveProductId]);

  const tabButton = (tab, base) => {
    const active = tab === activeTab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          base,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0067D2] focus-visible:ring-offset-1',
          active ? 'font-semibold' : 'hover:bg-[#F2F4F7]'
        )}
        style={{
          color: active ? '#000000' : t.textMuted,
          background: active ? '#e3e9ef' : undefined,
        }}
      >
        {tab}
      </button>
    );
  };

  return (
    <div className="flex min-h-full font-[Inter,sans-serif]">
      {/* Desktop scoped sidebar */}
      <aside
        aria-label={`${name} navigation`}
        className="hidden w-[232px] shrink-0 flex-col gap-1 px-3 py-6 lg:flex"
        style={{ borderRight: `1px solid ${t.borderSubtle}` }}
      >
        <div className="mb-4 px-3">
          <h2 className="m-0 text-lg font-bold leading-snug" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
            {name}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: t.textMuted }}>{id}</span>
            {owner?.name && (
              <span className="flex items-center gap-1.5 min-w-0">
                <Avatar name={owner.name} size="sm" className="!h-5 !w-5 !text-[10px]" />
                <span className="truncate text-[12px]" style={{ color: t.textSecondary }}>{owner.name}</span>
              </span>
            )}
          </div>
        </div>
        <nav aria-label={`${name} sections`} className="flex flex-col gap-0.5">
          {CONTROL_SET_TABS.map((tab) =>
            tabButton(tab, 'block rounded-md px-3 py-2 text-left text-[13px] font-medium leading-none transition-colors')
          )}
        </nav>
      </aside>

      {/* Mobile / tablet: horizontal scoped nav */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex items-center gap-2 overflow-x-auto px-6 py-3 lg:hidden"
          style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
        >
          <span className="shrink-0 text-sm font-bold" style={{ color: t.textPrimary }}>{name}</span>
          <nav aria-label={`${name} sections`} className="flex items-center gap-1">
            {CONTROL_SET_TABS.map((tab) =>
              tabButton(tab, 'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors')
            )}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
