import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { notifications } from '../../../data/notifications';

export function NotificationMenu({ onClose }) {
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
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 overflow-hidden"
      style={{ animation: 'shellFadeIn 150ms ease-out' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <p className="text-sm font-semibold text-neutral-900">Notifications</p>
        <div className="flex items-center gap-2">
          <button type="button" className="text-xs text-blue-500 hover:text-blue-600 font-medium">
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul className="divide-y divide-neutral-50">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={cn('px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer', !n.read && 'bg-blue-50/40')}
          >
            <div className="flex items-start gap-3">
              {!n.read
                ? <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />
                : <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0" aria-hidden="true" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', !n.read ? 'font-medium text-neutral-900' : 'text-neutral-700')}>{n.title}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-neutral-400 mt-1">{n.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2.5 border-t border-neutral-100">
        <button type="button" className="text-sm text-blue-500 hover:text-blue-600 font-medium w-full text-center">
          View all notifications
        </button>
      </div>
    </div>
  );
}
