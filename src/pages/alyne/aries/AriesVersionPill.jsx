import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { useAries } from './AriesContext';

/** Routes that only exist in V2 — drop back to a V1 equivalent when switching down. */
const V2_ONLY_REDIRECTS = [
  { test: (p) => p.startsWith('/aries/history'), to: '/aries' },
  { test: (p) => p.startsWith('/aries/skills'), to: '/aries/knowledge/skills' },
  { test: (p) => p.startsWith('/aries/knowledge/templates'), to: '/aries/knowledge/company-profile' },
  { test: (p) => p.startsWith('/aries/admin/general'), to: '/aries/admin/teams' },
  { test: (p) => p.startsWith('/aries/admin/data-access'), to: '/aries/admin/teams' },
  { test: (p) => p.startsWith('/aries/admin/roles'), to: '/aries/admin/teams' },
  { test: (p) => p.startsWith('/aries/admin/retention'), to: '/aries/admin/teams' },
];

export function AriesVersionPill({ className }) {
  const { version, setVersion } = useAries();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (version !== 'v1') return;
    const hit = V2_ONLY_REDIRECTS.find((r) => r.test(pathname));
    if (hit) navigate(hit.to, { replace: true });
  }, [version, pathname, navigate]);

  return (
    <div
      className={cn(
        'absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center gap-1 rounded-b-2xl border border-t-0 border-[#e2e8f0] bg-white p-1 shadow-[0_4px_12px_rgba(0,26,53,0.06)]',
        className
      )}
      role="group"
      aria-label="ARIES prototype version"
    >
      <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#64748b]">
        Prototype
      </span>
      {(['v1', 'v2']).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setVersion(v)}
          className={cn(
            'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
            version === v
              ? 'bg-[#0067D2] text-white hover:bg-[#005bb8]'
              : 'text-[#475569] hover:bg-[#f1f5f9]'
          )}
        >
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
