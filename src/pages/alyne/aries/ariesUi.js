/** Shared class bundles mirroring ARIES-widget grcTokens / sidebar patterns. */

export const ariesFocus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067D2]';

export const ariesSectionLabel =
  'px-2.5 pb-1 font-medium uppercase tracking-[0.06em] text-[11px] text-[#64748b]';

export const ariesNavItem = (active) =>
  [
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
    ariesFocus,
    active
      ? 'bg-[#f1f5f9] font-medium text-[#001a35]'
      : 'font-normal text-[#475569] hover:bg-[#f8fafc] hover:text-[#001a35]',
  ].join(' ');

export const ariesChatRow = (active) =>
  [
    'flex w-full items-center rounded-xl px-2.5 py-2.5 text-left transition-colors',
    ariesFocus,
    active
      ? 'bg-[#f1f5f9] font-medium text-[#001a35]'
      : 'font-normal text-[#475569] hover:bg-[#f8fafc] hover:text-[#001a35]',
  ].join(' ');

export const ariesPrimaryBtn =
  `rounded-lg bg-[#0067D2] px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#005bb8] disabled:opacity-60 ${ariesFocus}`;

export const ariesSecondaryBtn =
  `rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] ${ariesFocus}`;

export const ariesField =
  'w-full rounded-xl border border-[#cbd5e1] bg-white px-3 py-2.5 text-sm text-[#001a35] placeholder:text-[#64748b] transition-colors focus:border-[#0067D2] focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,103,210,0.08)]';
