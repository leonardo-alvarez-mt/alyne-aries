import { NavLink, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutTemplate,
  Building2,
  Scale,
  Library,
  BookMarked,
  Users,
  Grid3X3,
  Settings,
  Database,
  KeyRound,
  Clock,
} from 'lucide-react';
import { useAries } from './AriesContext';
import { ariesFocus } from './ariesUi';
import { cn } from '../../../utils/cn';

export function customizeItems(isV2) {
  const items = [
    { to: '/aries/knowledge/company-profile', label: 'Company profile', icon: Building2 },
    { to: '/aries/knowledge/frameworks', label: 'Frameworks & policies', icon: Scale },
    { to: '/aries/knowledge/skills', label: 'Skills', icon: Library },
    { to: '/aries/knowledge/glossary', label: 'Glossary', icon: BookMarked },
  ];
  if (isV2) {
    items.unshift({ to: '/aries/knowledge/templates', label: 'Templates', icon: LayoutTemplate });
    return items.filter((item) => item.to !== '/aries/knowledge/skills');
  }
  return items;
}

export function settingsItems(isV2) {
  const items = [
    { to: '/aries/admin/teams', label: 'Teams', icon: Users },
    { to: '/aries/admin/workflow', label: 'Workflow access', icon: Grid3X3 },
  ];
  if (isV2) {
    items.push(
      { to: '/aries/admin/general', label: 'General', icon: Settings },
      { to: '/aries/admin/data-access', label: 'Data access', icon: Database },
      { to: '/aries/admin/roles', label: 'Roles & permissions', icon: KeyRound },
      { to: '/aries/admin/retention', label: 'Retention & audit', icon: Clock }
    );
  }
  return items;
}

export function AriesSectionNav() {
  const { pathname } = useLocation();
  const { version } = useAries();
  const isSettings = pathname.startsWith('/aries/admin');
  const title = isSettings ? 'Settings' : 'Customize';
  const items = isSettings ? settingsItems(version === 'v2') : customizeItems(version === 'v2');

  return (
    <aside
      className="flex h-full w-[248px] shrink-0 flex-col border-r border-[#e2e8f0] bg-white"
      aria-label={title}
    >
      <div className="px-3 pb-2 pt-3">
        <NavLink
          to="/aries"
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-1.5 text-[13px] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#001a35]',
            ariesFocus
          )}
        >
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          Back
        </NavLink>
        <h1 className="m-0 mt-2 px-1.5 text-[16px] font-semibold text-[#001a35]">{title}</h1>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4" aria-label={title}>
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[14px] transition-colors',
                    ariesFocus,
                    isActive
                      ? 'bg-[#f1f5f9] font-medium text-[#001a35]'
                      : 'text-[#1e293b] hover:bg-[#f8fafc]'
                  )
                }
              >
                <item.icon size={18} strokeWidth={1.6} className="shrink-0 text-[#334155]" aria-hidden />
                <span className="min-w-0 truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
