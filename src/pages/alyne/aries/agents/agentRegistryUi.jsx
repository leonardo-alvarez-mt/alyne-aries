import { cn } from '../../../../utils/cn';

export const GOVERNANCE_PAGE = 'mx-auto flex w-full max-w-8xl flex-col gap-6';

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1';

export function GovernanceHeader({ title, description, action }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        <h1 className="m-0 text-2xl font-semibold leading-8 tracking-tight text-[#212121]">{title}</h1>
        <p className="mt-1 text-sm leading-6 text-cool-grey-700">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function Initials({ value, className = 'size-7 text-[11px]' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-cool-grey-200 font-semibold text-cool-grey-800',
        className
      )}
      aria-hidden="true"
    >
      {value}
    </span>
  );
}

const HEALTH = {
  healthy: { label: 'Healthy', dot: 'bg-green-500', text: 'text-grey-900' },
  waiting: { label: 'Needs approval', dot: 'bg-amber-500', text: 'text-amber-800' },
  failed: { label: 'Run failed', dot: 'bg-red-500', text: 'text-red-600' },
  inactive: { label: 'Inactive', dot: 'bg-cool-grey-400', text: 'text-cool-grey-700' },
};

export function HealthLabel({ health }) {
  const meta = HEALTH[health];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-sm', meta.text)}>
      <span className={cn('size-2 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** One segment per step. Steps a person approves are tall blue marks. */
export function StepTrack({ steps, className }) {
  const gates = steps.filter((step) => step.gate).length;
  const summary = gates === 0 ? 'no approvals' : `${gates} ${gates === 1 ? 'approval' : 'approvals'}`;
  return (
    <span
      className={cn('inline-flex flex-col gap-1.5', className)}
      aria-label={`${steps.length} steps, ${summary}`}
      role="img"
    >
      <span className="flex items-end gap-1">
        {steps.map((step) => (
          <span
            key={step.name}
            title={step.gate ? `${step.name} (approval)` : step.name}
            className={cn('w-5 rounded-full', step.gate ? 'h-2.5 bg-blue-500' : 'h-1.5 bg-cool-grey-300')}
          />
        ))}
      </span>
      <span className="text-xs text-cool-grey-600">
        {steps.length} steps · {summary}
      </span>
    </span>
  );
}
