import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Check, ChevronDown, MessageSquare, PenLine, Plus, Upload } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAries } from './AriesContext';
import { SKILL_SOURCES } from './ariesData';
import { ariesFocus } from './ariesUi';
import { Switch } from './settingsUi';

const ADD_ACTIONS = [
  {
    id: 'chat',
    label: 'Create with chat',
    hint: 'Describe the skill and ARIES drafts it',
    icon: MessageSquare,
    prompt: 'Help me create a new skill',
  },
  {
    id: 'instructions',
    label: 'Write skill instructions',
    hint: 'Start from the steps the skill should follow',
    icon: PenLine,
    prompt: 'Help me write instructions for a new skill',
  },
  {
    id: 'upload',
    label: 'Upload a skill',
    hint: 'Turn a document into a reusable skill',
    icon: Upload,
    prompt: 'Help me turn an uploaded document into a skill',
  },
];

export default function AriesSkills() {
  const { skills, toggleSkillHome, createChat } = useAries();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const start = (prompt) => {
    const id = createChat(prompt);
    navigate(`/aries/chat/${id}`);
  };

  const matches = (skill) => {
    if (filter === 'all') return true;
    if (filter === 'home') return skill.showOnHome;
    return skill.source === filter;
  };
  const visible = skills.filter(matches);
  const onHome = visible.filter((skill) => skill.showOnHome);
  const library = filter === 'home' ? [] : visible.filter((skill) => (filter === 'all' ? !skill.showOnHome : true));
  const libraryGroups =
    filter === 'all'
      ? SKILL_SOURCES.map((source) => ({
          ...source,
          items: library.filter((skill) => skill.source === source.id),
        })).filter((group) => group.items.length > 0)
      : filter === 'home'
        ? []
        : [{ id: filter, label: SKILL_SOURCES.find((source) => source.id === filter)?.label, items: visible }];

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] px-8 pb-12 pt-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-[22px] font-semibold tracking-[-0.01em] text-[#0f172a]">Skills</h1>
            <p className="m-0 mt-1 text-[13px] text-[#64748b]">
              Reusable instructions ARIES can run. Turn a skill on to suggest it on the new-chat home.
            </p>
          </div>
          <AddSkillMenu onPick={start} />
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter skills">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          <FilterChip active={filter === 'home'} onClick={() => setFilter('home')} label="On home" />
          {SKILL_SOURCES.map((source) => (
            <FilterChip
              key={source.id}
              active={filter === source.id}
              onClick={() => setFilter(source.id)}
              label={source.label}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="m-0 mt-8 rounded-xl border border-dashed border-[#e2e8f0] px-4 py-12 text-center text-[13px] text-[#64748b]">
            No skills in this view.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            {onHome.length > 0 && filter !== 'home' && filter === 'all' && (
              <SkillSection title="On home" marked>
                <SkillGrid skills={onHome} onToggle={toggleSkillHome} />
              </SkillSection>
            )}
            {filter === 'home' && (
              <SkillSection title="On home" marked>
                <SkillGrid skills={onHome} onToggle={toggleSkillHome} />
              </SkillSection>
            )}
            {filter === 'all'
              ? libraryGroups.map((group) => (
                  <SkillSection key={group.id} title={group.label}>
                    <SkillGrid skills={group.items} onToggle={toggleSkillHome} />
                  </SkillSection>
                ))
              : filter !== 'home' && (
                  <SkillSection title={libraryGroups[0]?.label}>
                    <SkillGrid skills={visible} onToggle={toggleSkillHome} />
                  </SkillSection>
                )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkillSection({ title, marked, children }) {
  return (
    <section>
      <h2 className="m-0 mb-3 flex items-center gap-1.5 text-[14px] font-medium text-[#0f172a]">
        {marked && <Check size={15} strokeWidth={2.25} className="text-[#64748b]" aria-hidden />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function SkillGrid({ skills, onToggle }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => {
        const sourceLabel = SKILL_SOURCES.find((source) => source.id === skill.source)?.label;
        return (
          <li key={skill.id}>
            <article className="flex h-full min-h-[156px] flex-col rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#334155]">
                  <Box size={16} strokeWidth={1.75} aria-hidden />
                </span>
                <Switch
                  checked={skill.showOnHome}
                  onChange={() => onToggle(skill.id)}
                  label={`Show ${skill.name} on home`}
                />
              </div>
              <h3 className="m-0 mt-3 text-[14px] font-semibold text-[#0f172a]">{skill.name}</h3>
              <p className="m-0 mt-1 line-clamp-2 text-[13px] leading-5 text-[#64748b]">{skill.description}</p>
              <p className="m-0 mt-auto pt-3 text-[12px] text-[#64748b]">{sourceLabel}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function AddSkillMenu({ onPick }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0067D2] px-3.5 text-[13px] font-medium text-white hover:bg-[#004D9E]',
          ariesFocus
        )}
      >
        <Plus size={15} strokeWidth={2} aria-hidden />
        Add skill
        <ChevronDown size={14} strokeWidth={2} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-[280px] rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
        >
          {ADD_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              onClick={() => onPick(action.prompt)}
              className={cn(
                'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#f8fafc]',
                ariesFocus
              )}
            >
              <action.icon size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#334155]" aria-hidden />
              <span>
                <span className="block text-[13px] font-medium text-[#0f172a]">{action.label}</span>
                <span className="block text-[12px] leading-4 text-[#64748b]">{action.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full border px-3 text-[13px] font-medium transition-colors',
        active
          ? 'border-[#e2e8f0] bg-[#f1f5f9] text-[#0f172a]'
          : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]',
        ariesFocus
      )}
    >
      {label}
    </button>
  );
}
