import { cn } from '../../../utils/cn';
import { NavItem } from './NavItem';
import {
  NAV_SECTION_CLASS,
  NAV_SECTION_HEADER_CLASS,
  NAV_SECTION_ITEMS_CLASS,
  NAV_SECTION_ITEMS_GAP_EXPANDED,
  NAV_RAIL_ITEMS_GAP,
} from '../sidebarNavLayout';

export function SidebarSection({ section, collapsed, first }) {
  const showCollapsedDivider = collapsed && !first;

  return (
    <div className={NAV_SECTION_CLASS}>
      {section.label && (
        <div
          className={cn(
            NAV_SECTION_HEADER_CLASS,
            collapsed ? 'justify-center' : 'justify-start'
          )}
          aria-hidden={collapsed ? true : undefined}
        >
          {collapsed ? (
            showCollapsedDivider ? (
              <div
                className="h-px w-8 shrink-0"
                style={{ background: 'var(--sb-border)' }}
              />
            ) : null
          ) : (
            <p
              className="truncate pl-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] select-none leading-none"
              style={{ color: 'var(--sb-label)' }}
            >
              {section.label}
            </p>
          )}
        </div>
      )}
      <div className={cn(NAV_SECTION_ITEMS_CLASS, collapsed ? NAV_RAIL_ITEMS_GAP : NAV_SECTION_ITEMS_GAP_EXPANDED)}>
        {section.items.map((item) => (
          <NavItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
