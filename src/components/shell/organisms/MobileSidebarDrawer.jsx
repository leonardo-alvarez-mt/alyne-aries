import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { SidebarSection } from '../molecules/SidebarSection';
import { IconButton } from '../atoms/IconButton';
import { useShell } from '../ShellContext';
import { primaryNavSections } from '../../../data/navigation';

export function MobileSidebarDrawer() {
  const { mobileSidebarOpen, closeMobileSidebar } = useShell();
  const drawerRef = useRef(null);

  useEffect(() => {
    if (mobileSidebarOpen) drawerRef.current?.focus();
    function handleKey(e) { if (e.key === 'Escape') closeMobileSidebar(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  if (!mobileSidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 lg:hidden"
        style={{ background: 'rgba(11,31,58,0.4)', zIndex: 40 }}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'sidebar-light fixed left-0 top-0 bottom-0',
          'flex flex-col shadow-lg lg:hidden focus:outline-none'
        )}
        style={{
          width: 'var(--shell-sidebar-expanded)',
          zIndex: 70,
          background: 'var(--sb-bg)',
          borderRight: '1px solid var(--sb-border)',
          animation: 'shellSlideIn 200ms ease-out',
        }}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 'var(--shell-header-height)', borderBottom: '1px solid var(--sb-border)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-sm font-semibold text-neutral-700">Mitratech</span>
          </div>
          <IconButton aria-label="Close navigation menu" onClick={closeMobileSidebar} size="md">
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col" aria-label="Primary navigation">
          {primaryNavSections.map((section, idx) => (
            <SidebarSection key={section.id} section={section} collapsed={false} first={idx === 0} />
          ))}
        </nav>
      </div>
    </>
  );
}
