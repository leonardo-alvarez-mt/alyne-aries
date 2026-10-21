import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Info, Lock, Plus, Search, Workflow, X } from 'lucide-react';
import { useAries } from './AriesContext';
import { ACCESS_LEVELS, CURRENT_USER, TEAM_KNOWLEDGE, WORKSPACE_PEOPLE } from './ariesData';
import { REGISTRY_AGENTS } from './agents/agentRegistryData';
import { GovernanceHeader, Initials, focusRing } from './agents/agentRegistryUi';
import { CreateTeamDialog, createTeamPrimaryPill, initials } from './CreateTeamDialog';
import { ariesFocus } from './ariesUi';
import { settingsInput, settingsTextarea } from './settingsUi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { selectChevronClass } from '../../../components/ui/selectField';
import { cn } from '../../../utils/cn';

const registryField =
  'h-9 rounded-full border border-cool-grey-200 bg-white text-sm text-[#212121] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const outlinePill = cn(
  'inline-flex h-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1e293b] transition-colors hover:bg-[#f8fafc]',
  ariesFocus
);

function MemberStack({ members }) {
  const shown = members.slice(0, 3);
  const extra = members.length - shown.length;
  return (
    <span className="flex items-center" aria-label={`${members.length} members`}>
      {shown.map((member) => (
        <span
          key={member}
          title={member}
          className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e2e8f0] text-[10px] font-semibold text-[#334155] first:ml-0"
        >
          {initials(member)}
        </span>
      ))}
      {extra > 0 && (
        <span className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#f1f5f9] text-[10px] font-semibold text-[#475569]">
          +{extra}
        </span>
      )}
    </span>
  );
}

function Teams() {
  const { teams, setTeams } = useAries();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [newTeamId, setNewTeamId] = useState(null);
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState('all');
  const [lead, setLead] = useState('all');
  const closeDialog = useCallback(() => setCreating(false), []);

  const selectedId = searchParams.get('team');
  const selected = teams.find((team) => team.id === selectedId) ?? null;

  const selectTeam = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('team', id);
    else next.delete('team');
    setSearchParams(next, { replace: true });
  };

  const createTeam = ({ name, description, lead: teamLead, members }) => {
    const team = {
      id: `tm-${Date.now()}`,
      name,
      description,
      lead: teamLead,
      members,
      origin: 'aries',
      knowledge: TEAM_KNOWLEDGE.map((item) => item.id),
      sharedAgentIds: [],
    };
    setTeams((prev) => [team, ...prev]);
    setNewTeamId(team.id);
    return team;
  };

  const updateTeam = (id, patch) => {
    setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, ...patch } : team)));
  };

  const leads = useMemo(() => [...new Set(teams.map((team) => team.lead))], [teams]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return teams.filter((team) => {
      if (origin !== 'all' && team.origin !== origin) return false;
      if (lead !== 'all' && team.lead !== lead) return false;
      if (!needle) return true;
      return [team.name, team.description, team.lead, ...team.members].join(' ').toLowerCase().includes(needle);
    });
  }, [lead, origin, query, teams]);

  const filtered = origin !== 'all' || lead !== 'all' || query.trim() !== '';
  const clearFilters = () => {
    setOrigin('all');
    setLead('all');
    setQuery('');
  };

  const tabs = [
    { id: 'all', label: 'All', count: teams.length },
    { id: 'aries', label: 'Created in ARIES', count: teams.filter((team) => team.origin === 'aries').length },
    { id: 'alyne', label: 'Synced from Alyne', count: teams.filter((team) => team.origin === 'alyne').length },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] px-8 pb-10 pt-16">
      <div className="mx-auto flex w-full max-w-8xl flex-col">
        <GovernanceHeader
          title="Teams"
          description="Each team with its lead, members, and whether it was created in ARIES or synced from an Alyne group."
          action={
            <button
              type="button"
              onClick={() => setCreating(true)}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-500 px-3.5 text-sm font-medium text-white hover:bg-[#005bb8]',
                focusRing
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create team
            </button>
          }
        />

        <div className="mt-4 flex items-end gap-6 border-b border-[#e3e9ef]" role="tablist" aria-label="Filter teams">
          {tabs.map((tab) => (
            <FilterTab
              key={tab.id}
              label={tab.label}
              count={tab.count}
              selected={origin === tab.id}
              onClick={() => setOrigin(tab.id)}
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
              aria-label="Search teams"
              className={cn(registryField, 'w-full pl-9 pr-3')}
            />
          </label>
          <label className="sr-only" htmlFor="teams-lead">
            Lead
          </label>
          <select
            id="teams-lead"
            value={lead}
            onChange={(event) => setLead(event.target.value)}
            className={cn(registryField, 'px-3', selectChevronClass)}
          >
            <option value="all">All leads</option>
            {leads.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="text-xs text-cool-grey-600 sm:ml-auto" aria-live="polite">
            {filtered
              ? `${visible.length} of ${teams.length} teams`
              : `${visible.length} ${visible.length === 1 ? 'team' : 'teams'}`}
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
                    <TableHead className="w-[60%]">Team</TableHead>
                    <TableHead className="w-[40%]">Members</TableHead>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableHead className="w-[36%]">Team</TableHead>
                    <TableHead className="w-[20%]">Lead</TableHead>
                    <TableHead className="w-[18%]">Members</TableHead>
                    <TableHead className="w-[13%]">Agents</TableHead>
                    <TableHead className="w-[13%]">Knowledge</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selected ? 2 : 5} className="py-10 text-center text-sm text-cool-grey-700">
                      {teams.length === 0 ? 'No teams yet. Create one to share agents and knowledge.' : 'No teams match these filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((team) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      isNew={team.id === newTeamId}
                      selected={team.id === selected?.id}
                      compact={selected !== null}
                      onSelect={() => selectTeam(team.id === selected?.id ? null : team.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selected ? (
            <TeamInspector
              team={selected}
              existingNames={teams.filter((team) => team.id !== selected.id).map((team) => team.name)}
              onClose={() => selectTeam(null)}
              onUpdate={(patch) => updateTeam(selected.id, patch)}
              onManageAccess={() => navigate('/aries/admin/workflow')}
            />
          ) : null}
        </div>
      </div>

      <CreateTeamDialog
        open={creating}
        people={WORKSPACE_PEOPLE}
        existingNames={teams.map((t) => t.name)}
        currentUser={CURRENT_USER}
        onClose={closeDialog}
        onCreate={createTeam}
        onSetAccess={() => {
          setCreating(false);
          navigate('/aries/admin/workflow');
        }}
      />
    </div>
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
        className={cn('absolute inset-x-0 -bottom-px h-0.5 rounded-full', selected ? 'bg-[#0067D2]' : 'bg-transparent')}
      />
    </button>
  );
}

function TeamRow({ team, isNew, selected, compact, onSelect }) {
  const agentCount = (team.sharedAgentIds || []).length;
  const knowledgeCount = (team.knowledge || []).length;
  return (
    <TableRow
      aria-selected={selected}
      onClick={onSelect}
      className={cn('cursor-pointer transition-colors', selected ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-cool-grey-50')}
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
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium leading-5 text-[#212121]">{team.name}</span>
            {isNew && (
              <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-medium text-[#166534]">New</span>
            )}
            {team.isOwner && (
              <span className="rounded-full bg-[#E8F1FB] px-2 py-0.5 text-[11px] font-medium text-[#0067D2]">
                Owners / admins
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-cool-grey-600">
            {team.origin === 'alyne' ? 'Synced from Alyne' : 'Created in ARIES'}
            {team.description ? ` · ${team.description}` : ''}
          </span>
        </button>
      </TableCell>
      {compact ? null : (
        <TableCell>
          <span className="flex items-center gap-2">
            <Initials value={initials(team.lead)} />
            <span className="truncate text-sm text-[#212121]">{team.lead}</span>
          </span>
        </TableCell>
      )}
      <TableCell>
        <span className="flex items-center gap-2">
          <MemberStack members={team.members} />
          <span className="text-xs text-cool-grey-600">{team.members.length}</span>
        </span>
      </TableCell>
      {compact ? null : (
        <>
          <TableCell>
            <span className="text-sm text-[#212121]">{agentCount === 0 ? 'None' : agentCount}</span>
          </TableCell>
          <TableCell>
            <span className="text-sm text-[#212121]">
              {knowledgeCount === TEAM_KNOWLEDGE.length ? 'All' : knowledgeCount === 0 ? 'None' : `${knowledgeCount} of ${TEAM_KNOWLEDGE.length}`}
            </span>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

function TeamInspector({ team, existingNames, onClose, onUpdate, onManageAccess }) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [changingKnowledge, setChangingKnowledge] = useState(false);
  const members = [team.lead, ...team.members.filter((member) => member !== team.lead)];
  const knowledge = TEAM_KNOWLEDGE.filter((item) => (team.knowledge || []).includes(item.id));
  const agents = (team.sharedAgentIds || [])
    .map((id) => REGISTRY_AGENTS.find((agent) => agent.id === id))
    .filter(Boolean);

  const removeMember = (member) => {
    const nextMembers = team.members.filter((item) => item !== member);
    if (nextMembers.length === 0) return;
    onUpdate({
      members: nextMembers,
      lead: member === team.lead ? nextMembers[0] : team.lead,
    });
  };

  return (
    <aside aria-label={`${team.name} details`} className="rounded-xl border border-cool-grey-200 bg-white lg:sticky lg:top-0">
      <div className="flex items-start justify-between gap-3 border-b border-cool-grey-200 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-6 text-[#212121]">{team.name}</h2>
          <p className="mt-0.5 text-xs text-cool-grey-600">{team.description || 'No description yet.'}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close team details"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md text-cool-grey-700 hover:bg-cool-grey-50 hover:text-[#212121]',
            focusRing
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex gap-2 px-5 py-4">
        <button type="button" className={outlinePill} onClick={() => setEditing(true)}>
          Edit team
        </button>
        <button type="button" className={createTeamPrimaryPill} onClick={() => setAdding(true)}>
          <Plus size={15} strokeWidth={2} aria-hidden />
          Add members
        </button>
      </div>

      <InspectorSection id={`${team.id}-members`} title="Members">
        <ul className="mt-2 flex flex-col gap-1">
          {members.map((member) => {
            const onlyMember = members.length === 1;
            return (
              <li key={member} className="group flex items-center gap-2.5 rounded-lg py-1">
                <Initials value={initials(member)} className="size-7 text-[10px]" />
                <span className="min-w-0 flex-1 truncate text-sm text-[#212121]">{member}</span>
                <span className="text-xs text-cool-grey-600">{member === team.lead ? 'Team lead' : 'Member'}</span>
                <button
                  type="button"
                  onClick={() => removeMember(member)}
                  disabled={onlyMember}
                  aria-label={`Remove ${member}`}
                  title={onlyMember ? 'A team needs at least one member' : `Remove ${member}`}
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md text-cool-grey-600 hover:bg-cool-grey-50 hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-40',
                    focusRing
                  )}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </InspectorSection>

      <InspectorSection
        id={`${team.id}-knowledge`}
        title="Knowledge this team can use"
        action={
          <button
            type="button"
            onClick={() => setChangingKnowledge(true)}
            className={cn('rounded text-xs font-medium text-blue-600 hover:underline', focusRing)}
          >
            Change
          </button>
        }
      >
        {knowledge.length === 0 ? (
          <p className="mt-2 text-sm text-cool-grey-700">No knowledge shared yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {knowledge.map((item) => (
              <li
                key={item.id}
                className="inline-flex items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[13px] text-[#0f172a]"
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </InspectorSection>

      <InspectorSection
        id={`${team.id}-agents`}
        title="Agents shared with this team"
        action={
          <button
            type="button"
            onClick={onManageAccess}
            className={cn('inline-flex items-center gap-0.5 rounded text-xs font-medium text-blue-600 hover:underline', focusRing)}
          >
            Manage access
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        }
      >
        {agents.length === 0 ? (
          <p className="mt-2 text-sm text-cool-grey-700">No agents shared yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {agents.map((agent) => (
              <li
                key={agent.id}
                title={agent.name}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[13px] text-[#0f172a]"
              >
                <Workflow className="size-3.5 shrink-0 text-[#64748b]" aria-hidden="true" />
                <span className="truncate">{agent.name}</span>
              </li>
            ))}
          </ul>
        )}
      </InspectorSection>

      <EditTeamDialog
        open={editing}
        team={team}
        existingNames={existingNames}
        onClose={() => setEditing(false)}
        onSave={(patch) => {
          onUpdate(patch);
          setEditing(false);
        }}
      />
      <AddMembersDialog
        open={adding}
        members={team.members}
        onClose={() => setAdding(false)}
        onAdd={(people) => {
          onUpdate({ members: [...team.members, ...people] });
          setAdding(false);
        }}
      />
      <KnowledgeDialog
        open={changingKnowledge}
        selected={team.knowledge || []}
        onClose={() => setChangingKnowledge(false)}
        onSave={(next) => {
          onUpdate({ knowledge: next });
          setChangingKnowledge(false);
        }}
      />
    </aside>
  );
}

function InspectorSection({ id, title, action, children }) {
  return (
    <section className="border-t border-cool-grey-200 px-5 py-4" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3">
        <h3 id={id} className="text-xs font-semibold uppercase tracking-wide text-cool-grey-600">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Overlay({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/40 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function DialogActions({ onClose, submitLabel, disabled, form }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" className={outlinePill} onClick={onClose}>
        Cancel
      </button>
      <button type="submit" form={form} className={createTeamPrimaryPill} disabled={disabled}>
        {submitLabel}
      </button>
    </div>
  );
}

function EditTeamDialog({ open, team, existingNames, onClose, onSave }) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');

  useEffect(() => {
    if (!open) return;
    setName(team.name);
    setDescription(team.description || '');
  }, [open, team.name, team.description]);

  const trimmed = name.trim();
  const duplicate = existingNames.some((existing) => existing.toLowerCase() === trimmed.toLowerCase());

  return (
    <Overlay open={open} onClose={onClose}>
      <h2 className="m-0 text-[16px] font-semibold text-[#0f172a]">Edit team</h2>
      <form
        id="edit-team"
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed || duplicate) return;
          onSave({ name: trimmed, description: description.trim() });
        }}
      >
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-[#334155]">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={settingsInput} />
          {duplicate && <span className="mt-1 block text-[12px] text-[#b91c1c]">A team with this name already exists.</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-[#334155]">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={settingsTextarea}
          />
        </label>
      </form>
      <DialogActions onClose={onClose} submitLabel="Save" form="edit-team" disabled={!trimmed || duplicate} />
    </Overlay>
  );
}

function AddMembersDialog({ open, members, onClose, onAdd }) {
  const [picked, setPicked] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setPicked([]);
    setQuery('');
  }, [open]);

  const available = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return WORKSPACE_PEOPLE.filter((person) => !members.includes(person.name)).filter(
      (person) => !needle || person.name.toLowerCase().includes(needle) || person.email.includes(needle)
    );
  }, [members, query]);

  const toggle = (name) => {
    setPicked((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  return (
    <Overlay open={open} onClose={onClose}>
      <h2 className="m-0 text-[16px] font-semibold text-[#0f172a]">Add members</h2>
      <form
        id="add-members"
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (picked.length === 0) return;
          onAdd(picked);
        }}
      >
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people"
            aria-label="Search people"
            className={cn(settingsInput, 'pl-8')}
          />
        </div>
        <ul className="m-0 mt-3 max-h-64 list-none overflow-y-auto p-0">
          {available.length === 0 ? (
            <li className="px-1 py-6 text-center text-[13px] text-[#64748b]">
              {WORKSPACE_PEOPLE.every((person) => members.includes(person.name))
                ? 'Everyone in the workspace is already on this team.'
                : 'No people match that search.'}
            </li>
          ) : (
            available.map((person) => {
              const checked = picked.includes(person.name);
              return (
                <li key={person.email}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f8fafc]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(person.name)}
                      className="h-4 w-4 accent-[#0067D2]"
                    />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e2e8f0] text-[11px] font-semibold text-[#334155]">
                      {initials(person.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium text-[#0f172a]">{person.name}</span>
                      <span className="block truncate text-[12px] text-[#64748b]">{person.email}</span>
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </form>
      <DialogActions onClose={onClose} submitLabel="Add" form="add-members" disabled={picked.length === 0} />
    </Overlay>
  );
}

function KnowledgeDialog({ open, selected, onClose, onSave }) {
  const [picked, setPicked] = useState(selected);

  useEffect(() => {
    if (!open) return;
    setPicked(selected);
  }, [open, selected]);

  const toggle = (id) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <Overlay open={open} onClose={onClose}>
      <h2 className="m-0 text-[16px] font-semibold text-[#0f172a]">Knowledge this team can use</h2>
      <p className="m-0 mt-1 text-[13px] text-[#64748b]">ARIES uses these sources when answering for this team.</p>
      <form
        id="team-knowledge"
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(picked);
        }}
      >
        <ul className="m-0 list-none p-0">
          {TEAM_KNOWLEDGE.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[#f8fafc]">
                <input
                  type="checkbox"
                  checked={picked.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 accent-[#0067D2]"
                />
                <span className="text-[14px] text-[#0f172a]">{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </form>
      <DialogActions onClose={onClose} submitLabel="Save" form="team-knowledge" />
    </Overlay>
  );
}

function HoverTip({ tip, children }) {
  const [pos, setPos] = useState(null);
  return (
    <span
      className="inline-flex cursor-help"
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
      }}
      onMouseLeave={() => setPos(null)}
      onFocus={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
      }}
      onBlur={() => setPos(null)}
      tabIndex={0}
    >
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ left: pos.x, top: pos.y }}
            className="pointer-events-none fixed z-[70] -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0f172a] px-2.5 py-1 text-[12px] font-normal text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
          >
            {tip}
          </span>,
          document.body
        )}
    </span>
  );
}

function AccessSelect({ value, onChange, label }) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className={cn(
        'h-9 w-full min-w-[11rem] rounded-lg border border-[#e2e8f0] bg-white pl-3 text-[13px] text-[#1e293b] outline-none focus:border-[#0067D2] focus:ring-1 focus:ring-[#0067D2]',
        selectChevronClass
      )}
    >
      {ACCESS_LEVELS.map((level) => (
        <option key={level.id} value={level.id}>
          {level.label}
        </option>
      ))}
    </select>
  );
}

function WorkflowAccess() {
  const { teams, agents, skills, access, setAccessCell } = useAries();
  const groups = [
    { label: 'Agents', items: agents.map((agent) => ({ id: agent.id, label: agent.name })) },
    { label: 'Skills', items: skills.map((skill) => ({ id: skill.id, label: skill.name })) },
  ];

  return (
    <AdminPanel
      title="Workflow access"
      subtitle="Choose what each team can do with an agent or skill. Owner teams can always edit."
    >
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              <th className="sticky left-0 z-10 min-w-[16rem] bg-white px-4 py-3 text-[13px] font-medium text-[#64748b]">
                Resource
              </th>
              {teams.map((team) => (
                <th key={team.id} className="min-w-[12.5rem] whitespace-nowrap px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0f172a]">
                    {team.name}
                    {team.isOwner && (
                      <HoverTip tip="Always can edit">
                        <Info size={14} strokeWidth={1.75} className="text-[#64748b]" aria-label="Always can edit" />
                      </HoverTip>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  <td className="sticky left-0 bg-[#f8fafc] px-4 py-2 text-[12px] font-semibold text-[#475569]">
                    {group.label}
                  </td>
                  {teams.map((team) => (
                    <td key={team.id} className="bg-[#f8fafc]" />
                  ))}
                </tr>
                {group.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#f1f5f9] last:border-b-0">
                    <td className="sticky left-0 bg-white px-4 py-3 text-[14px] font-medium text-[#0f172a]">
                      {item.label}
                    </td>
                    {teams.map((team) => {
                      const locked = Boolean(team.isOwner);
                      const value = locked ? 'edit' : access[team.id]?.[item.id] || 'none';
                      return (
                        <td key={team.id} className="px-3 py-2.5">
                          {locked ? (
                            <span className="inline-flex h-9 items-center gap-1.5 text-[13px] text-[#64748b]">
                              <Lock size={13} strokeWidth={1.75} aria-hidden />
                              Can edit
                            </span>
                          ) : (
                            <AccessSelect
                              value={value}
                              label={`${item.label} for ${team.name}`}
                              onChange={(event) => setAccessCell(team.id, item.id, event.target.value)}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
}

function SettingsStub({ title, subtitle, rows }) {
  return (
    <AdminPanel title={title} subtitle={subtitle}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#E4E7EC] bg-white px-4 py-3"
          >
            <div>
              <p className="m-0 text-[13px] font-semibold text-[#1A2141]">{row.label}</p>
              <p className="m-0 text-[12px] text-[#667085]">{row.hint}</p>
            </div>
            <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] font-medium text-[#475467]">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

function AdminPanel({ title, subtitle, action, children }) {
  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] p-6 px-8 pb-10 pt-7">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-[Poppins,sans-serif] text-[28px] font-semibold tracking-[-0.02em] text-[#001a35]">
              {title}
            </h1>
            <p className="m-0 mt-1 text-sm text-[#64748b]">{subtitle}</p>
          </div>
          {action && <div className="shrink-0 pt-1.5">{action}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AriesAdmin() {
  const { section } = useParams();
  const { version } = useAries();

  if (!section) return <Navigate to="/aries/admin/teams" replace />;

  if (version === 'v1' && ['general', 'data-access', 'roles', 'retention'].includes(section)) {
    return <Navigate to="/aries/admin/teams" replace />;
  }

  switch (section) {
    case 'teams':
      return <Teams />;
    case 'workflow':
      return <WorkflowAccess />;
    case 'general':
      return (
        <SettingsStub
          title="General"
          subtitle="Organisation-wide ARIES preferences."
          rows={[
            { label: 'Display name', hint: 'Shown in the ARIES workspace', value: 'ARIES™' },
            { label: 'Default language', hint: 'Used for generated outputs', value: 'English' },
            { label: 'Allow personal skills', hint: 'Users can create skills for themselves', value: 'On' },
          ]}
        />
      );
    case 'data-access':
      return (
        <SettingsStub
          title="Data access"
          subtitle="What product data ARIES may read when answering."
          rows={[
            { label: 'Risks', hint: 'Open and closed risk records', value: 'Read' },
            { label: 'Controls & control sets', hint: 'Governance catalogue', value: 'Read' },
            { label: 'Questionnaires', hint: 'Responses and requests', value: 'Read' },
            { label: 'Documents', hint: 'Uploaded policies and evidence', value: 'Read' },
          ]}
        />
      );
    case 'roles':
      return (
        <SettingsStub
          title="Roles & permissions"
          subtitle="Who can administer ARIES for the organisation."
          rows={[
            { label: 'ARIES Admin', hint: 'Manage teams, access, and retention', value: '2 users' },
            { label: 'Agent builder', hint: 'Create and edit organisation agents', value: '5 users' },
            { label: 'Viewer', hint: 'Run skills with granted access', value: 'Everyone' },
          ]}
        />
      );
    case 'retention':
      return (
        <SettingsStub
          title="Retention & audit"
          subtitle="How long chats and outputs are kept, and what is logged."
          rows={[
            { label: 'Chat retention', hint: 'Delete inactive chats after', value: '365 days' },
            { label: 'Output retention', hint: 'Keep exported tables and documents', value: '2 years' },
            { label: 'Audit log', hint: 'Agent runs, access changes, exports', value: 'Enabled' },
          ]}
        />
      );
    default:
      return <Navigate to="/aries/admin/teams" replace />;
  }
}
