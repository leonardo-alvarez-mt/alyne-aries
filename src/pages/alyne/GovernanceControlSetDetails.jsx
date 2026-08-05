import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, ChevronDown, AlertCircle } from 'lucide-react';
import { IconBuildingBank } from '@tabler/icons-react';
import { Button, IconAction, SearchInput, ActionMenu } from './listPrimitives';
import { t, FONT_HEADING } from './alyneTokens';
import { useControlSetDetail, getControlSetName } from './controlSetDetailData';
import ControlSetDetailLayout from './ControlSetDetailLayout';
import ControlSetToc from './ControlSetToc';

const ALL_TOPICS = '__all__';

const HEADER_MENU_ITEMS = [
  { label: 'Duplicate' },
  { label: 'Export' },
  { label: 'Archive', danger: true },
];

/* ─────────────────────────── Presentational pieces ─────────────────────────── */

/** Styled topic dropdown — reuses the Alyne native-select pattern, tokenised. */
function TopicFilter({ topics, value, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by topic"
        className="w-[240px] cursor-pointer appearance-none rounded-md bg-white py-2 pl-3 pr-9 text-[13px] font-medium outline-none focus:ring-2"
        style={{
          border: `1px solid ${t.borderDefault}`,
          color: t.textPrimary,
          ['--tw-ring-color']: t.focusRing,
        }}
      >
        <option value={ALL_TOPICS}>Topic</option>
        {topics.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
    </div>
  );
}

/** A single control: title + ID + view affordance, with the control statement. */
function ControlItem({ control }) {
  return (
    <div className="mb-5 pl-4" style={{ borderLeft: `2px solid ${t.borderDefault}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-semibold" style={{ color: t.textPrimary }}>{control.title}</span>
        <span className="text-[14px] font-medium tabular-nums" style={{ color: t.textLink }}>({control.id})</span>
        <IconAction label={`View control ${control.id}`}><Eye size={15} aria-hidden /></IconAction>
      </div>
      {control.statement && (
        <p className="m-0 mt-1 text-[14px] leading-relaxed" style={{ color: t.tableBody }}>{control.statement}</p>
      )}
    </div>
  );
}

/** Full-panel state (loading / error / empty) shown in the content column. */
function StatePanel({ children }) {
  return <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">{children}</div>;
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function GovernanceControlSetDetails() {
  const { id } = useParams();
  const { status, detail, reload } = useControlSetDetail(id);
  const [activeTab, setActiveTab] = useState('Content');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState(ALL_TOPICS);

  // Route reuse keeps this component mounted across :id changes — clear filters.
  useEffect(() => {
    setSearch('');
    setTopic(ALL_TOPICS);
    setActiveTab('Content');
  }, [id]);

  const name = detail?.title ?? getControlSetName(id);

  const topicNames = useMemo(() => (detail ? detail.topics.map((tp) => tp.name) : []), [detail]);

  // Apply topic filter + control search, dropping empty subtopics / topics.
  const filteredTopics = useMemo(() => {
    if (!detail) return [];
    const q = search.trim().toLowerCase();
    return detail.topics
      .filter((tp) => topic === ALL_TOPICS || tp.name === topic)
      .map((tp) => ({
        ...tp,
        subtopics: tp.subtopics
          .map((sub) => ({
            ...sub,
            controls: q
              ? sub.controls.filter((c) =>
                  [c.id, c.title, c.statement].some((v) => v.toLowerCase().includes(q))
                )
              : sub.controls,
          }))
          .filter((sub) => sub.controls.length > 0),
      }))
      .filter((tp) => tp.subtopics.length > 0);
  }, [detail, search, topic]);

  // Flat, in-document-order anchor list that both the sections and ToC use.
  const sections = useMemo(() => {
    const out = [];
    filteredTopics.forEach((tp, ti) => {
      out.push({ id: `topic-${ti}`, label: tp.name, level: 'topic' });
      tp.subtopics.forEach((sub, si) => {
        out.push({ id: `sub-${ti}-${si}`, label: sub.name, level: 'sub' });
      });
    });
    return out;
  }, [filteredTopics]);

  return (
    <ControlSetDetailLayout
      name={name}
      id={id}
      owner={detail?.owner}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="px-8 py-7">
        {activeTab !== 'Content' ? (
          <StatePanel>
            <p className="m-0 text-sm font-semibold" style={{ color: t.textPrimary }}>{activeTab}</p>
            <p className="m-0 text-[13px]" style={{ color: t.textMuted }}>This section will be available soon.</p>
          </StatePanel>
        ) : status === 'loading' ? (
          <div className="animate-pulse">
            <div className="mb-6 h-40 w-full rounded-2xl" style={{ background: '#EEF1F4' }} />
            <div className="mb-3 h-8 w-72 rounded" style={{ background: '#EEF1F4' }} />
            <div className="mb-8 h-4 w-96 rounded" style={{ background: '#EEF1F4' }} />
            <div className="h-64 w-full rounded" style={{ background: '#F3F5F7' }} />
          </div>
        ) : status === 'error' ? (
          <StatePanel>
            <AlertCircle size={36} aria-hidden style={{ color: '#F97066' }} strokeWidth={1.5} />
            <p className="m-0 text-sm font-semibold" style={{ color: t.textPrimary }}>Couldn’t load this control set</p>
            <p className="m-0 text-[13px]" style={{ color: t.textMuted }}>Something went wrong while fetching the details.</p>
            <div className="mt-2"><Button variant="default" size="sm" onClick={reload}>Try again</Button></div>
          </StatePanel>
        ) : (
          <>
            {/* Hero banner */}
            <div
              className="mb-6 flex h-40 items-center justify-center rounded-2xl"
              style={{ background: t.bgSelected, border: `1px solid ${t.borderSubtle}` }}
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70">
                <IconBuildingBank size={44} stroke={1.5} color={t.primary} aria-hidden />
              </span>
            </div>

            {/* Title + description + page actions */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="m-0 text-[30px] font-bold leading-tight" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
                  {detail.title}
                </h1>
                {detail.description && (
                  <p className="m-0 mt-2 text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                    {detail.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ActionMenu label="More actions" items={HEADER_MENU_ITEMS} />
                <Button variant="default">Edit</Button>
              </div>
            </div>

            {/* Search + topic filter */}
            <div className="mb-8 flex flex-wrap items-center gap-3" style={{ borderTop: `1px solid ${t.borderSubtle}`, paddingTop: 24 }}>
              <SearchInput label="Search controls" value={search} onChange={setSearch} placeholder="Search Controls" />
              <TopicFilter topics={topicNames} value={topic} onChange={setTopic} />
            </div>

            {/* Content + Table of contents */}
            <div className="flex gap-8">
              <div className="min-w-0 flex-1">
                {filteredTopics.length === 0 ? (
                  <StatePanel>
                    <p className="m-0 text-sm font-semibold" style={{ color: t.textPrimary }}>No controls found</p>
                    <p className="m-0 text-[13px]" style={{ color: t.textMuted }}>Try adjusting your search or topic filter.</p>
                  </StatePanel>
                ) : (
                  filteredTopics.map((tp, ti) => (
                    <section key={ti} className="mb-6">
                      <h2 id={`topic-${ti}`} className="m-0 mb-4 text-[24px] font-bold leading-tight" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
                        {tp.name}
                      </h2>
                      {tp.subtopics.map((sub, si) => (
                        <div key={si} className="mb-6">
                          <h3 id={`sub-${ti}-${si}`} className="m-0 mb-3 text-[17px] font-semibold" style={{ color: t.textPrimary }}>
                            {sub.name}
                          </h3>
                          {sub.controls.map((c) => (
                            <ControlItem key={c.id} control={c} />
                          ))}
                        </div>
                      ))}
                    </section>
                  ))
                )}
              </div>

              <aside className="hidden w-[248px] shrink-0 xl:block">
                <ControlSetToc sections={sections} />
              </aside>
            </div>
          </>
        )}
      </div>
    </ControlSetDetailLayout>
  );
}
