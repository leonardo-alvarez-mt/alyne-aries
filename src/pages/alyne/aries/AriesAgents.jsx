import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ShieldCheck, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { selectChevronClass } from '../../../components/ui/selectField';
import { cn } from '../../../utils/cn';
import { useAries } from './AriesContext';
import { REGISTRY_SUMMARY, agentHealth, oldestPendingDays } from './agents/agentRegistryData';
import { VISIBILITY_OPTIONS } from './ariesData';
import { GovernanceHeader, HealthLabel, Initials, StepTrack, focusRing } from './agents/agentRegistryUi';

const OLD_APPROVAL_DAYS = 7;

function orderByPending(agents) {
  return agents
    .map((agent, index) => ({ agent, index }))
    .sort((a, b) => {
      const aPending = a.agent.pending.length > 0;
      const bPending = b.agent.pending.length > 0;
      if (aPending !== bPending) return aPending ? -1 : 1;
      if (aPending && bPending) {
        const byAge = oldestPendingDays(b.agent) - oldestPendingDays(a.agent);
        if (byAge !== 0) return byAge;
      }
      return a.index - b.index;
    })
    .map((item) => item.agent);
}

const fieldClass =
  'h-9 rounded-full border border-cool-grey-200 bg-white text-sm text-grey-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function AriesAgents() {
  const { startAgentSetup, registryAgents } = useAries();
  const navigate = useNavigate();
  const owners = useMemo(() => [...new Set(registryAgents.map((agent) => agent.owner))], [registryAgents]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState('all');
  const [status, setStatus] = useState('all');
  const [runType, setRunType] = useState('all');
  const [owner, setOwner] = useState('all');

  const selectedId = searchParams.get('agent');
  const selected = registryAgents.find((agent) => agent.id === selectedId) ?? null;

  const selectAgent = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('agent', id);
    else next.delete('agent');
    setSearchParams(next, { replace: true });
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = registryAgents.filter((agent) => {
      if (focus === 'pending' && agent.pending.length === 0) return false;
      if (focus === 'oldest' && agent.id !== REGISTRY_SUMMARY.oldest.id) return false;
      if (focus === 'failed' && agent.lastRunOutcome !== 'failed') return false;
      if (status !== 'all' && agent.status !== status) return false;
      if (runType === 'scheduled' && !agent.cadence.startsWith('Scheduled')) return false;
      if (runType === 'manual' && agent.cadence.startsWith('Scheduled')) return false;
      if (owner !== 'all' && agent.owner !== owner) return false;
      if (!needle) return true;
      return [agent.name, agent.owner, agent.cadence, ...agent.subAgents]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
    return [
      { id: 'scheduled', label: 'Scheduled', agents: orderByPending(matched.filter((agent) => agent.cadence.startsWith('Scheduled'))) },
      { id: 'manual', label: 'Manual', agents: orderByPending(matched.filter((agent) => !agent.cadence.startsWith('Scheduled'))) },
    ].filter((group) => group.agents.length > 0);
  }, [focus, owner, query, registryAgents, runType, status]);

  const agentCount = visible.reduce((sum, group) => sum + group.agents.length, 0);
  const filtered = focus !== 'all' || status !== 'all' || runType !== 'all' || owner !== 'all' || query.trim() !== '';
  const clearFilters = () => {
    if (focus === 'oldest') selectAgent(null);
    setFocus('all');
    setStatus('all');
    setRunType('all');
    setOwner('all');
    setQuery('');
  };

  const chooseFocus = (next) => {
    setFocus(next);
    selectAgent(next === 'oldest' ? REGISTRY_SUMMARY.oldest.id : null);
  };

  const closeInspector = () => {
    if (focus === 'oldest') setFocus('all');
    selectAgent(null);
  };

  const startNewAgent = () => {
    const id = startAgentSetup();
    navigate(`/aries/chat/${id}`);
  };

  const tabs = [
    { id: 'all', label: 'All', count: registryAgents.length },
    { id: 'pending', label: 'Pending', count: registryAgents.filter((agent) => agent.pending.length > 0).length },
    { id: 'oldest', label: 'Oldest pending', count: 1 },
    { id: 'failed', label: 'Failed', count: registryAgents.filter((agent) => agent.lastRunOutcome === 'failed').length },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] px-8 pb-10 pt-16">
      <div className="mx-auto flex w-full max-w-8xl flex-col">
        <GovernanceHeader
          title="Workflow agents"
          description="Every agent in the workspace, who owns it, and where a person has to step in."
          action={
            <button
              type="button"
              onClick={startNewAgent}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-500 px-3.5 text-sm font-medium text-white hover:bg-[#005bb8]',
                focusRing
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              New agent
            </button>
          }
        />

        <div className="mt-4 flex items-end gap-6 border-b border-[#e3e9ef]" role="tablist" aria-label="Filter agents">
          {tabs.map((tab) => (
            <FilterTab
              key={tab.id}
              label={tab.label}
              count={tab.count}
              selected={focus === tab.id}
              onClick={() => chooseFocus(tab.id)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative min-w-0 sm:w-64">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-cool-grey-600">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search agents"
              className={cn(fieldClass, 'w-full pl-9 pr-3')}
            />
          </label>
          <label className="sr-only" htmlFor="registry-status">
            Status
          </label>
          <select
            id="registry-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={cn(fieldClass, 'px-3', selectChevronClass)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <label className="sr-only" htmlFor="registry-run-type">
            Run type
          </label>
          <select
            id="registry-run-type"
            value={runType}
            onChange={(event) => setRunType(event.target.value)}
            className={cn(fieldClass, 'px-3', selectChevronClass)}
          >
            <option value="all">All run types</option>
            <option value="scheduled">Scheduled</option>
            <option value="manual">Manual</option>
          </select>
          <label className="sr-only" htmlFor="registry-owner">
            Owner
          </label>
          <select
            id="registry-owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            className={cn(fieldClass, 'px-3', selectChevronClass)}
          >
            <option value="all">All owners</option>
            {owners.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="text-xs text-cool-grey-600 sm:ml-auto" aria-live="polite">
            {filtered
              ? `${agentCount} of ${registryAgents.length} agents`
              : `${agentCount} ${agentCount === 1 ? 'agent' : 'agents'}`}
            {filtered ? (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={clearFilters}
                  className={cn('rounded font-medium text-blue-600 hover:underline', focusRing)}
                >
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>

        <div className={cn('mt-4 grid items-start gap-4', selected && 'lg:grid-cols-[minmax(0,1fr)_380px]')}>
          <div className="risk-feed-table">
            <Table>
              <TableHeader>
                {selected ? (
                  <TableRow>
                    <TableHead className="w-[50%]">Agent</TableHead>
                    <TableHead className="w-[26%]">Health</TableHead>
                    <TableHead className="w-[24%]">Pending review</TableHead>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableHead className="w-[34%]">Agent</TableHead>
                    <TableHead className="w-[19%]">Owner</TableHead>
                    <TableHead className="w-[17%]">Health</TableHead>
                    <TableHead className="w-[15%]">Pending review</TableHead>
                    <TableHead className="w-[15%]">Steps</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={selected ? 3 : 5}
                      className="py-10 text-center text-sm text-cool-grey-700"
                    >
                      No agents match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((group) => (
                    <AgentGroup
                      key={group.id}
                      group={group}
                      columns={selected ? 3 : 5}
                      selectedId={selected?.id}
                      compact={selected !== null}
                      onSelect={(id) => (id === selected?.id ? closeInspector() : selectAgent(id))}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selected ? <AgentInspector agent={selected} onClose={closeInspector} /> : null}
        </div>
      </div>
    </div>
  );
}

function AgentGroup({ group, columns, selectedId, compact, onSelect }) {
  return (
    <>
      <TableRow className="agent-section-row">
        <TableCell colSpan={columns}>
          {group.label}
          <span className="ml-1.5 font-normal tabular-nums text-[#94a3b8]">{group.agents.length}</span>
        </TableCell>
      </TableRow>
      {group.agents.map((agent) => (
        <RegistryRow
          key={agent.id}
          agent={agent}
          selected={agent.id === selectedId}
          compact={compact}
          onSelect={() => onSelect(agent.id)}
        />
      ))}
    </>
  );
}

function FilterTab({ label, count, selected, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={`${label}, ${count}`}
      onClick={onClick}
      className={cn(
        'relative -mb-px pb-2.5 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        selected ? 'font-medium text-[#001a35]' : 'text-[#64748b] hover:text-[#001a35]'
      )}
    >
      {label}
      <span className="ml-1 tabular-nums">({count})</span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 -bottom-px h-0.5 rounded-full',
          selected ? 'bg-[#0067D2]' : 'bg-transparent'
        )}
      />
    </button>
  );
}

function WaitingCell({ agent }) {
  if (agent.pending.length === 0) {
    return <span className="text-sm text-cool-grey-600">None</span>;
  }
  const oldest = oldestPendingDays(agent);
  return (
    <span className="block">
      <span className="block text-sm font-medium text-grey-900">{agent.pending.length} waiting</span>
      <span
        className={cn(
          'mt-0.5 block text-xs',
          oldest >= OLD_APPROVAL_DAYS ? 'font-medium text-red-600' : 'text-cool-grey-600'
        )}
      >
        Oldest {oldest} {oldest === 1 ? 'day' : 'days'}
      </span>
    </span>
  );
}

function RegistryRow({ agent, selected, compact, onSelect }) {
  return (
    <TableRow
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-colors',
        selected ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-cool-grey-50'
      )}
    >
      <TableCell>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-expanded={selected}
          className={cn('block max-w-full rounded text-left', focusRing)}
        >
          <span className="block font-medium leading-5 text-grey-900">{agent.name}</span>
          <span className="mt-0.5 block text-xs text-cool-grey-600">
            {agent.cadence} · {agent.subAgents.join(', ')}
            {agent.visibility ? ` · ${VISIBILITY_OPTIONS.find((option) => option.id === agent.visibility)?.label}` : ''}
          </span>
        </button>
      </TableCell>
      {compact ? null : (
        <TableCell>
          <span className="flex items-center gap-2">
            <Initials value={agent.ownerInitials} />
            <span className="min-w-0">
              <span className="block truncate text-sm text-grey-900">{agent.owner}</span>
              {agent.ownerNote ? (
                <span className="block text-xs text-cool-grey-600">{agent.ownerNote}</span>
              ) : null}
            </span>
          </span>
        </TableCell>
      )}
      <TableCell>
        <HealthLabel health={agentHealth(agent)} />
        <span className="mt-0.5 block text-xs text-cool-grey-600">Last run {agent.lastRun}</span>
      </TableCell>
      <TableCell>
        <WaitingCell agent={agent} />
      </TableCell>
      {compact ? null : (
        <TableCell>
          <StepTrack steps={agent.steps} />
        </TableCell>
      )}
    </TableRow>
  );
}

function AgentInspector({ agent, onClose }) {
  return (
    <aside
      aria-label={`${agent.name} details`}
      className="rounded-xl border border-cool-grey-200 bg-white lg:sticky lg:top-0"
    >
      <div className="flex items-start justify-between gap-3 border-b border-cool-grey-200 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-6 text-grey-900">{agent.name}</h2>
          <p className="mt-0.5 text-xs text-cool-grey-600">{agent.cadence}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close agent details"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md text-cool-grey-700 hover:bg-cool-grey-50 hover:text-grey-900',
            focusRing
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-sm">
        <div>
          <dt className="text-xs text-cool-grey-600">Health</dt>
          <dd className="mt-1">
            <HealthLabel health={agentHealth(agent)} />
          </dd>
        </div>
        {agent.visibility ? (
          <div>
            <dt className="text-xs text-cool-grey-600">Who can use it</dt>
            <dd className="mt-1 text-grey-900">
              {VISIBILITY_OPTIONS.find((option) => option.id === agent.visibility)?.label}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-cool-grey-600">Owner</dt>
          <dd className="mt-1 flex items-center gap-2">
            <Initials value={agent.ownerInitials} className="size-6 text-[10px]" />
            <span className="min-w-0">
              <span className="block text-grey-900">{agent.owner}</span>
              {agent.ownerNote ? (
                <span className="block text-xs text-cool-grey-600">{agent.ownerNote}</span>
              ) : null}
            </span>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-cool-grey-600">Last run</dt>
          <dd className="mt-1 text-grey-900">
            {agent.lastRun}
            <span className="block text-xs text-cool-grey-700">{agent.lastRunNote}</span>
          </dd>
        </div>
      </dl>

      <section className="border-t border-cool-grey-200 px-5 py-4" aria-labelledby={`${agent.id}-waiting`}>
        <h3
          id={`${agent.id}-waiting`}
          className="text-xs font-semibold uppercase tracking-wide text-cool-grey-600"
        >
          Waiting on a human
        </h3>
        {agent.pending.length === 0 ? (
          <p className="mt-2 text-sm text-cool-grey-700">Nothing is waiting.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {agent.pending.map((item) => (
              <li key={item.step} className="rounded-lg border border-cool-grey-200 px-3 py-2.5">
                <p className="text-sm font-medium text-grey-900">{item.step}</p>
                <p className="mt-0.5 text-xs text-cool-grey-700">
                  {item.assignee} · requested {item.requested} ·{' '}
                  <span className={cn(item.ageDays >= OLD_APPROVAL_DAYS && 'font-medium text-red-600')}>
                    {item.ageDays} {item.ageDays === 1 ? 'day' : 'days'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-cool-grey-200 px-5 py-4" aria-labelledby={`${agent.id}-steps`}>
        <h3
          id={`${agent.id}-steps`}
          className="text-xs font-semibold uppercase tracking-wide text-cool-grey-600"
        >
          Steps
        </h3>
        <ol className="mt-3 flex flex-col">
          {agent.steps.map((step, index) => (
            <li key={step.name} className="relative flex gap-3 pb-4 last:pb-0">
              {index < agent.steps.length - 1 ? (
                <span
                  className="absolute bottom-0 left-[11px] top-6 w-px bg-cool-grey-200"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  step.gate
                    ? 'bg-blue-500 text-white'
                    : 'bg-cool-grey-100 text-cool-grey-800 ring-1 ring-inset ring-cool-grey-200'
                )}
              >
                {step.gate ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-sm text-grey-900">{step.name}</span>
                <span className="mt-0.5 block text-xs text-cool-grey-600">
                  {step.subAgent}
                  {step.gate ? ' · a person approves this step' : ''}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
