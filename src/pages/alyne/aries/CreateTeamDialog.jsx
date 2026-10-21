import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Search, Users, X } from 'lucide-react';
import { ariesField, ariesFocus } from './ariesUi';
import { cn } from '../../../utils/cn';

const STEPS = ['Details', 'Members'];

const primaryPill = cn(
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#0067D2] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#004D9E] disabled:cursor-not-allowed disabled:bg-[#0067D2] disabled:opacity-40',
  ariesFocus
);

const ghostPill = cn(
  'inline-flex h-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1e293b] transition-colors hover:bg-[#f8fafc]',
  ariesFocus
);

export function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Stepper({ step }) {
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0 text-[12px]">
      {STEPS.map((label, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-6 bg-[#e2e8f0]" aria-hidden />}
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium',
                done && 'bg-[#0f172a] text-white',
                current && 'border border-[#0f172a] text-[#0f172a]',
                !done && !current && 'border border-[#cbd5e1] text-[#64748b]'
              )}
            >
              {done ? <Check size={12} strokeWidth={2.5} aria-hidden /> : index + 1}
            </span>
            <span className={current ? 'font-medium text-[#0f172a]' : 'text-[#64748b]'}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function CreateTeamDialog({ open, people, existingNames, currentUser, onClose, onCreate, onSetAccess }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([currentUser]);
  const [lead, setLead] = useState(currentUser);
  const [query, setQuery] = useState('');
  const [created, setCreated] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName('');
    setDescription('');
    setMembers([currentUser]);
    setLead(currentUser);
    setQuery('');
    setCreated(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  }, [open, currentUser]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const trimmed = name.trim();
  const duplicate = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const needle = query.trim().toLowerCase();
  const visiblePeople = useMemo(
    () => (needle ? people.filter((p) => p.name.toLowerCase().includes(needle) || p.email.includes(needle)) : people),
    [people, needle]
  );

  if (!open) return null;

  const toggleMember = (person) => {
    if (person === currentUser) return;
    setMembers((prev) => {
      const next = prev.includes(person) ? prev.filter((m) => m !== person) : [...prev, person];
      if (!next.includes(lead)) setLead(currentUser);
      return next;
    });
  };

  const submitDetails = (event) => {
    event.preventDefault();
    if (!trimmed || duplicate) return;
    setStep(1);
  };

  const create = () => {
    const team = onCreate({ name: trimmed, description: description.trim(), lead, members });
    setCreated(team);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/40 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[min(640px,88vh)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
      >
        {created ? (
          <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857]">
              <Check size={20} strokeWidth={2.25} aria-hidden />
            </span>
            <h2 id="create-team-title" className="m-0 mt-4 text-[18px] font-semibold text-[#0f172a]">
              {created.name} is ready
            </h2>
            <p className="m-0 mt-1.5 max-w-[340px] text-[13px] leading-5 text-[#64748b]">
              {created.members.length === 1
                ? 'You are the only member for now. You can add people at any time from Teams.'
                : `${created.members.length} members, led by ${created.lead}. Next, choose which agents and skills this team can use.`}
            </p>
            <div className="mt-6 flex gap-2">
              <button type="button" className={ghostPill} onClick={onClose}>
                Done
              </button>
              <button type="button" className={primaryPill} onClick={() => onSetAccess(created)}>
                Set workflow access
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              <div>
                <h2 id="create-team-title" className="m-0 text-[18px] font-semibold text-[#0f172a]">
                  Create team
                </h2>
                <p className="m-0 mt-1 text-[13px] text-[#64748b]">
                  Bring people together to share chats, agents, and skills.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={cn('-mr-2 rounded-full p-1.5 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]', ariesFocus)}
              >
                <X size={18} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="px-6 pt-4">
              <Stepper step={step} />
            </div>

            {step === 0 ? (
              <form onSubmit={submitDetails} className="flex flex-col">
                <div className="space-y-4 px-6 py-5">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[#1e293b]">Team name</span>
                    <input
                      ref={nameRef}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Third-party risk"
                      maxLength={60}
                      aria-invalid={duplicate || undefined}
                      aria-describedby={duplicate ? 'team-name-error' : undefined}
                      className={ariesField}
                    />
                    {duplicate && (
                      <span id="team-name-error" className="mt-1.5 block text-[12px] text-[#b42318]">
                        A team with this name already exists.
                      </span>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[#1e293b]">
                      Description <span className="font-normal text-[#64748b]">(optional)</span>
                    </span>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      placeholder="What this team works on"
                      className={cn(ariesField, 'resize-none')}
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-[#f1f5f9] px-6 py-4">
                  <button type="button" className={ghostPill} onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className={primaryPill} disabled={!trimmed || duplicate}>
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="px-6 pt-5">
                  <label className="relative block">
                    <Search
                      size={15}
                      strokeWidth={1.75}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                      aria-hidden
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search people by name or email"
                      aria-label="Search people"
                      className={cn(ariesField, 'pl-9')}
                    />
                  </label>
                  <p className="m-0 mt-3 text-[12px] text-[#64748b]">
                    {members.length} selected · pick a lead from the selected members
                  </p>
                </div>
                <ul className="m-0 mt-2 min-h-0 flex-1 list-none overflow-y-auto px-3 pb-2">
                  {visiblePeople.length === 0 && (
                    <li className="px-3 py-6 text-center text-[13px] text-[#64748b]">No people match “{query}”.</li>
                  )}
                  {visiblePeople.map((person) => {
                    const selected = members.includes(person.name);
                    const isYou = person.name === currentUser;
                    return (
                      <li key={person.name}>
                        <div
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2',
                            selected ? 'bg-[#f8fafc]' : 'hover:bg-[#f8fafc]'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={isYou}
                            onChange={() => toggleMember(person.name)}
                            aria-label={`Add ${person.name}`}
                            className="h-4 w-4 shrink-0 accent-[#0f172a]"
                          />
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[11px] font-semibold text-[#334155]">
                            {initials(person.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-[#0f172a]">
                              {person.name}
                              {isYou && <span className="font-normal text-[#64748b]"> (you)</span>}
                            </span>
                            <span className="block truncate text-[12px] text-[#64748b]">{person.email}</span>
                          </span>
                          {selected &&
                            (lead === person.name ? (
                              <span className="rounded-full bg-[#0f172a] px-2 py-0.5 text-[11px] font-medium text-white">
                                Lead
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setLead(person.name)}
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-[11px] font-medium text-[#475569] hover:bg-[#e2e8f0]',
                                  ariesFocus
                                )}
                              >
                                Make lead
                              </button>
                            ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center justify-between gap-2 border-t border-[#f1f5f9] px-6 py-4">
                  <button type="button" className={ghostPill} onClick={() => setStep(0)}>
                    Back
                  </button>
                  <button type="button" className={primaryPill} onClick={create}>
                    <Users size={15} strokeWidth={1.75} aria-hidden />
                    Create team
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export { primaryPill as createTeamPrimaryPill };
