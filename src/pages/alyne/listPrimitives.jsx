import { useState, useRef, useEffect, useId } from 'react';
import {
  Search, MoreHorizontal, Settings, Check, Clock, FileText, FileSearch, SearchX,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  t, TOPIC_BADGE, SUBTOPIC_BADGE, STATE_BADGE, RISK_RATING_COLOR, LIFECYCLE_BADGE, FONT_HEADING,
} from './alyneTokens';

/* ─────────────────────────── Buttons ─────────────────────────── */

/**
 * Design-system button. Variants + sizes follow /docs/components/buttons:
 *   Variants — primary, default, secondary, tertiary, danger
 *   Sizes    — sm (4×10), md (6×16, default), lg (8×22); radius 6px; Inter label
 * Palette from the DS MUI theme (primary #0067D2, danger #CD2026, neutral #242A30).
 */
const BUTTON_SIZES = {
  sm: { padding: '4px 10px', fontSize: 13, lineHeight: '22px', letterSpacing: '0.46px' },
  md: { padding: '6px 16px', fontSize: 14, lineHeight: '24px', letterSpacing: '0.4px' },
  lg: { padding: '8px 22px', fontSize: 15, lineHeight: '26px', letterSpacing: '0.46px' },
};

const BUTTON_VARIANTS = {
  primary: 'bg-[#0067D2] text-white border border-[#0067D2] enabled:hover:bg-[#004D9E] enabled:hover:border-[#004D9E]',
  default: 'bg-white text-[#242A30] border border-[#D0D5DD] enabled:hover:bg-[#F9FAFB]',
  secondary: 'bg-[#F2F4F7] text-[#242A30] border border-transparent enabled:hover:bg-[#E4E7EC]',
  tertiary: 'bg-transparent text-[#0067D2] border border-transparent enabled:hover:bg-[#0067D2]/[0.08]',
  danger: 'bg-[#CD2026] text-white border border-[#CD2026] enabled:hover:bg-[#9A181D]',
};

export function Button({ variant = 'default', size = 'md', icon, children, className, style, ...props }) {
  const s = BUTTON_SIZES[size] ?? BUTTON_SIZES.md;
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0067D2] focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.default,
        className
      )}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontStyle: 'normal',
        fontWeight: 500,
        padding: s.padding,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        ...style,
      }}
      {...props}
    >
      {icon && <span className="flex items-center" aria-hidden>{icon}</span>}
      {children}
    </button>
  );
}

/** Square ghost icon button — used for utility + row actions. */
export function IconAction({ label, active, badge, children, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0067D2]',
        active ? 'bg-[#F0FAFD]' : 'hover:bg-[#F2F4F7]',
        className
      )}
      style={{ color: active ? t.textPrimary : t.textMuted }}
      {...props}
    >
      {children}
      {badge != null && (
        <span
          className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: t.primary }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────── Search toolbar ─────────────────────────── */

export function SearchInput({ label, value, onChange, placeholder }) {
  const id = useId();
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md py-2 pl-9 pr-3 text-[13px] outline-none focus:ring-2 placeholder:text-[color:var(--ph)]"
        style={{
          border: `1px solid ${t.borderDefault}`,
          color: t.textPrimary,
          ['--ph']: t.textMuted,
          ['--tw-ring-color']: t.focusRing,
        }}
      />
    </div>
  );
}

export function SearchToolbar({ children }) {
  return <div className="mb-4 flex items-center gap-2">{children}</div>;
}

/* ─────────────────────────── Page header ─────────────────────────── */

export function ListPageHeader({ title, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="m-0 text-[26px] font-bold leading-tight" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
        {title}
      </h1>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────── Table card ─────────────────────────── */

export function DataTableCard({ countLabel, children }) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: `1px solid ${t.borderSubtle}`, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
      >
        <span className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>{countLabel}</span>
        <IconAction label="Table settings"><Settings size={16} aria-hidden /></IconAction>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/* ─────────────────────────── Badges ─────────────────────────── */

function pill(cfg, extra) {
  return {
    className: cn(
      'inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-0.5 text-xs font-medium',
      extra
    ),
    style: { background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` },
  };
}

export function TopicBadge({ children }) {
  const p = pill(TOPIC_BADGE);
  return <span className={p.className} style={p.style} title={children}>{children}</span>;
}

export function SubtopicBadge({ children }) {
  const p = pill(SUBTOPIC_BADGE);
  return <span className={p.className} style={p.style} title={children}>{children}</span>;
}

const STATE_ICONS = { check: Check, clock: Clock, file: FileText };

export function StateBadge({ state }) {
  const cfg = STATE_BADGE[state];
  if (!cfg) return null;
  const Icon = STATE_ICONS[cfg.icon];
  const p = pill(cfg, 'whitespace-nowrap');
  return (
    <span className={p.className} style={p.style}>
      {Icon && <Icon size={12} aria-hidden className="shrink-0" />}
      {cfg.label}
    </span>
  );
}

/** Residual risk rating — white text on the canonical risk-scale color. */
export function RiskRatingBadge({ rating, score }) {
  const color = RISK_RATING_COLOR[rating] ?? RISK_RATING_COLOR.Low;
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 font-semibold text-white"
      style={{ background: color, fontSize: '10.5px' }}
    >
      {rating} ({score})
    </span>
  );
}

const LIFECYCLE_ICONS = { draft: FileText, review: FileSearch, done: Check };

export function LifecycleStatusBadge({ status }) {
  const cfg = LIFECYCLE_BADGE[status];
  if (!cfg) return null;
  const Icon = LIFECYCLE_ICONS[cfg.icon];
  const p = pill(cfg, 'whitespace-nowrap');
  return (
    <span className={p.className} style={{ ...p.style, fontSize: '10.5px' }}>
      {Icon && <Icon size={12} aria-hidden className="shrink-0" />}
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────── Info alert / callout ─────────────────────────── */

export function InfoAlert({ children }) {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg px-4 py-3 text-[13px]"
      style={{ background: '#FFFFFF', border: `1px solid ${t.borderSubtle}`, color: t.textSecondary }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── User cell ─────────────────────────── */

export function UserCell({ user }) {
  const tooltip = user.email ? `${user.name} · ${user.email}` : user.name;
  return (
    <span className="flex min-w-0 items-center gap-2" title={tooltip}>
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: '#E7F7FB', color: '#0E7490' }}
      >
        {user.initials}
      </span>
      <span className="min-w-0 truncate text-[13px]" style={{ color: t.tableBody }}>{user.name}</span>
    </span>
  );
}

/* ─────────────────────────── Row / header action menu ─────────────────────────── */

export function ActionMenu({ label, items, align = 'right', trigger }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={wrapRef}>
      {trigger ? (
        trigger({ open, toggle: () => setOpen((v) => !v) })
      ) : (
        <IconAction
          label={label}
          active={open}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MoreHorizontal size={16} aria-hidden />
        </IconAction>
      )}
      {open && (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            'absolute top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-lg bg-white py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          style={{ border: `1px solid ${t.borderSubtle}`, boxShadow: '0 8px 24px rgba(16,24,40,0.12)' }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => { item.onSelect?.(); setOpen(false); }}
              className="flex w-full items-center px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: item.danger ? '#B42318' : t.textSecondary }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Empty state ─────────────────────────── */

export function EmptyState({ title, description, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <SearchX size={36} aria-hidden style={{ color: '#CBD5E1' }} strokeWidth={1.5} />
          <p className="m-0 text-sm font-semibold" style={{ color: t.textPrimary }}>{title}</p>
          <p className="m-0 text-[13px]" style={{ color: t.textMuted }}>{description}</p>
        </div>
      </td>
    </tr>
  );
}
