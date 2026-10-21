import { ariesFocus } from './ariesUi';
import { selectChevronClass } from '../../../components/ui/selectField';
import { cn } from '../../../utils/cn';

export function SettingsPage({ title, description, action, children }) {
  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] px-8 pb-12 pt-10">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-[22px] font-semibold tracking-[-0.01em] text-[#0f172a]">{title}</h1>
            {description && <p className="m-0 mt-1 text-[13px] text-[#64748b]">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="mt-7 space-y-9">{children}</div>
      </div>
    </div>
  );
}

export function SettingsSection({ title, description, action, children }) {
  return (
    <section>
      {(title || action) && (
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="m-0 text-[15px] font-semibold text-[#0f172a]">{title}</h2>}
            {description && <p className="m-0 mt-0.5 text-[13px] text-[#64748b]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SettingsCard({ children, className }) {
  return (
    <div
      className={cn(
        'divide-y divide-[#eef2f6] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsRow({ label, description, htmlFor, control, children, muted }) {
  const LabelTag = htmlFor ? 'label' : 'p';
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <LabelTag
            htmlFor={htmlFor}
            className={cn('m-0 block text-[14px] font-medium', muted ? 'text-[#64748b]' : 'text-[#0f172a]')}
          >
            {label}
          </LabelTag>
          {description && <p className="m-0 mt-0.5 text-[12.5px] leading-[18px] text-[#64748b]">{description}</p>}
        </div>
        {control && <div className="flex shrink-0 items-center gap-2">{control}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-[#0067D2]' : 'bg-[#cbd5e1]',
        ariesFocus
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.2)] transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export const pillButton = cn(
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#f1f5f9] px-3.5 text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#e2e8f0] disabled:cursor-not-allowed disabled:opacity-50',
  ariesFocus
);

export const primaryPillButton = cn(
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#0067D2] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#004D9E] disabled:cursor-not-allowed disabled:opacity-40',
  ariesFocus
);

export const settingsInput =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-[#0f172a] placeholder:text-[#64748b] transition-colors focus:border-[#0067D2] focus:outline-none focus:ring-1 focus:ring-[#0067D2]';

export const settingsTextarea =
  'w-full resize-none rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#64748b] transition-colors focus:border-[#0067D2] focus:outline-none focus:ring-1 focus:ring-[#0067D2]';

export function PillSelect({ value, onChange, options, label, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={id ? undefined : label}
      className={cn(
        'h-8 rounded-full border-0 bg-[#f1f5f9] pl-3.5 text-[13px] font-medium text-[#0f172a] hover:bg-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0067D2]',
        selectChevronClass
      )}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
