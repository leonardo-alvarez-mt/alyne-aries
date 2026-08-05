import { useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronRight, Palette } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar } from '../atoms/Avatar';
import { Divider } from '../atoms/Divider';
import { useShell } from '../ShellContext';

export function UserMenu({ onClose }) {
  const { currentUser, setSettingsPanelOpen } = useShell();
  const containerRef = useRef(null);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    function handleClick(e) { if (containerRef.current && !containerRef.current.contains(e.target)) onClose(); }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label="User menu"
      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 overflow-hidden"
      style={{ animation: 'shellFadeIn 150ms ease-out' }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <Avatar name={currentUser.name} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{currentUser.name}</p>
          <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
        </div>
      </div>
      <Divider />
      <ul className="py-1">
        {[{ icon: User, label: 'My Profile' }, { icon: Settings, label: 'Account Settings' }].map((item) => (
          <li key={item.label}>
            <a
              href="#"
              role="menuitem"
              onClick={(e) => { e.preventDefault(); onClose(); }}
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-2',
                'text-sm text-neutral-700 hover:bg-neutral-50 transition-colors',
                'focus-visible:outline-none focus-visible:bg-neutral-50'
              )}
            >
              <span className="flex items-center gap-2.5">
                <item.icon size={15} className="text-neutral-400" aria-hidden="true" />
                {item.label}
              </span>
              <ChevronRight size={12} className="text-neutral-300" aria-hidden="true" />
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setSettingsPanelOpen(true); onClose(); }}
            className={cn(
              'flex w-full items-center justify-between gap-3 px-4 py-2',
              'text-sm text-neutral-700 hover:bg-neutral-50 transition-colors',
              'focus-visible:outline-none focus-visible:bg-neutral-50'
            )}
          >
            <span className="flex items-center gap-2.5">
              <Palette size={15} className="text-neutral-400" aria-hidden="true" />
              Shell appearance
            </span>
            <ChevronRight size={12} className="text-neutral-300" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <Divider />
      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:bg-red-50"
        >
          <LogOut size={15} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
