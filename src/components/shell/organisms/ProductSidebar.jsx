import { cn } from '../../../utils/cn';
import { SidebarSection } from '../molecules/SidebarSection';
import { useShell } from '../ShellContext';
import {
  NAV_LIST_CLASS,
  NAV_PAD_X,
  NAV_RAIL_PAD_X,
  NAV_ROW_INNER_CLASS,
  NAV_RAIL_ITEM_CLASS,
  NAV_RAIL_LABEL_CLASS,
  NAV_SECTION_ITEMS_CLASS,
  NAV_RAIL_ITEMS_GAP,
} from '../sidebarNavLayout';
import { productNavSections, primaryNavSections } from '../../../data/navigation';

export function ProductSidebar() {
  const { sidebarTheme, activeProductId, sidebarCollapsed } = useShell();
  const collapsed = sidebarCollapsed;
  const isDark = sidebarTheme === 'dark';
  const navSections = productNavSections[activeProductId] ?? primaryNavSections;

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        isDark ? 'sidebar-dark' : 'sidebar-light',
        'flex h-full w-full flex-col overflow-hidden'
      )}
      style={{
        background: 'var(--sb-bg)',
        borderRight: '1px solid var(--sb-border)',
      }}
    >
      <nav
        className={cn(
          'flex flex-1 flex-col overflow-x-hidden overflow-y-auto pt-3',
          collapsed ? NAV_RAIL_PAD_X : NAV_PAD_X
        )}
        aria-label="Primary navigation"
      >
        <div className={NAV_LIST_CLASS}>
          {navSections.map((section, idx) => (
            <SidebarSection key={section.id} section={section} collapsed={collapsed} first={idx === 0} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
