import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import { useAries } from './AriesContext';
import { SKILL_SOURCES } from './ariesData';

function groupLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 7);
  if (d >= startToday) return 'Today';
  if (d >= startWeek) return 'This week';
  return 'Older';
}

export default function AriesHistory() {
  const { version, chats, skills } = useAries();
  const [query, setQuery] = useState('');
  const [skillId, setSkillId] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startWeek.getDate() - 7);

    return chats.filter((chat) => {
      if (skillId !== 'all' && chat.skillId !== skillId) return false;
      const updated = new Date(chat.updatedAt);
      if (dateFilter === 'today' && updated < startToday) return false;
      if (dateFilter === 'week' && updated < startWeek) return false;
      if (dateFilter === 'older' && updated >= startWeek) return false;
      if (!q) return true;
      const hay = `${chat.title} ${chat.messages.map((m) => m.content).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [chats, query, skillId, dateFilter]);

  const groups = useMemo(
    () =>
      ['Today', 'This week', 'Older']
        .map((label) => ({
          label,
          items: filtered
            .filter((c) => groupLabel(c.updatedAt) === label)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
        }))
        .filter((g) => g.items.length > 0),
    [filtered]
  );

  if (version !== 'v2') {
    return <Navigate to="/aries" replace />;
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-6 px-8 pb-10 pt-7">
      <div className="mx-auto max-w-3xl">
        <h1 className="m-0 font-[Poppins,sans-serif] text-[28px] font-semibold tracking-[-0.02em] text-[#001a35]">
          Chat history
        </h1>
        <p className="mt-1 mb-5 text-sm text-[#64748b]">
          Search and filter conversations. Titles are taken from chat content.
        </p>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg border border-[#D0D5DD] bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#0067D2]"
            />
          </label>
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0067D2]"
          >
            <option value="all">All skills</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0067D2]"
          >
            <option value="all">Any date</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="older">Older</option>
          </select>
        </div>

        {groups.length === 0 ? (
          <p className="text-[13px] text-[#667085]">No chats match these filters.</p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-6">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
                {group.label}
              </h2>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {group.items.map((chat) => {
                  const skill = skills.find((s) => s.id === chat.skillId);
                  const source = SKILL_SOURCES.find((s) => s.id === skill?.source)?.label;
                  return (
                    <li key={chat.id}>
                      <Link
                        to={`/aries/chat/${chat.id}`}
                        className="flex items-start gap-3 rounded-xl border border-[#E4E7EC] bg-white px-4 py-3 transition-colors hover:border-[#0067D2]"
                      >
                        <MessageSquare size={16} className="mt-0.5 shrink-0 text-[#98A2B3]" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold text-[#1A2141]">
                            {chat.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-[#667085]">
                            {chat.messages.find((m) => m.role === 'assistant')?.content || '—'}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-[#98A2B3]">
                            {skill && <span>{skill.name}{source ? ` · ${source}` : ''}</span>}
                            <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
