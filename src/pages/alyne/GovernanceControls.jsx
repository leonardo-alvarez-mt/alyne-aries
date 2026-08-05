import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pencil, Store, Bookmark, ListFilter } from 'lucide-react';
import { resolveNavPath } from '../../utils/shellNavigation';
import AlyneSectionLayout from './AlyneSectionLayout';
import {
  Button, IconAction, SearchInput, SearchToolbar, ListPageHeader,
  DataTableCard, TopicBadge, SubtopicBadge, ActionMenu, EmptyState,
} from './listPrimitives';
import { GOVERNANCE_SECTION, t } from './alyneTokens';
import { CONTROL_ROWS, CONTROL_COLUMNS, CONTROLS_TOTAL } from './governanceData';

const HEADER_MENU_ITEMS = [
  { label: 'Import' },
  { label: 'Export' },
  { label: 'Archive selected' },
];

const thBase = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider align-middle';

export default function GovernanceControls() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CONTROL_ROWS;
    return CONTROL_ROWS.filter((r) =>
      [r.id, r.title, r.statement, r.topic, r.subtopic].some((v) => v.toLowerCase().includes(q))
    );
  }, [search]);

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const detailTo = (id) => resolveNavPath(`/governance/controls/${id}`, pathname);
  const totalCols = CONTROL_COLUMNS.length + 1; // + actions column

  return (
    <AlyneSectionLayout section={GOVERNANCE_SECTION}>
      <div className="px-8 py-7">
        <ListPageHeader
          title="Controls"
          actions={(
            <>
              <ActionMenu label="Open page actions" items={HEADER_MENU_ITEMS} />
              <Button variant="default" icon={<Pencil size={15} />} disabled>Edit</Button>
              <Button variant="secondary" icon={<Store size={15} />}>Library Store</Button>
              <Button variant="primary">Create</Button>
            </>
          )}
        />

        <SearchToolbar>
          <SearchInput label="Search controls" value={search} onChange={setSearch} placeholder="Search Controls" />
          <IconAction label="Open saved views"><Bookmark size={16} aria-hidden /></IconAction>
          <IconAction label="Open filters"><ListFilter size={16} aria-hidden /></IconAction>
        </SearchToolbar>

        <DataTableCard countLabel={`${CONTROLS_TOTAL.toLocaleString()} Controls`}>
          <table className="w-full min-w-[1000px] border-collapse text-[13px]">
            <colgroup>
              {CONTROL_COLUMNS.map((c) => (
                <col
                  key={c.id}
                  style={c.id === 'statement'
                    ? { width: 400, minWidth: 400, maxWidth: 400 }
                    : { width: c.width }}
                />
              ))}
              <col style={{ width: 60 }} />
            </colgroup>
            <thead>
              <tr style={{ background: t.bgHeader, borderBottom: `1px solid ${t.borderSubtle}` }}>
                {CONTROL_COLUMNS.map((c) => (
                  <th key={c.id} scope="col" className={thBase} style={{ color: t.tableHeader }}>{c.label}</th>
                ))}
                <th scope="col" className={thBase}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  colSpan={totalCols}
                  title="No controls found"
                  description="Try adjusting your search or filters."
                />
              ) : (
                filtered.map((row) => {
                  const isSelected = selected.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors"
                      style={{
                        borderBottom: `1px solid ${t.borderSubtle}`,
                        background: isSelected ? t.bgSelected : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = t.bgHover; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ''; }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            aria-label={`Select ${row.id}`}
                            className="h-[15px] w-[15px] shrink-0 cursor-pointer"
                            style={{ accentColor: t.primary }}
                          />
                          <Link
                            to={detailTo(row.id)}
                            className="font-semibold tabular-nums hover:underline"
                            style={{ color: '#000000' }}
                          >
                            {row.id}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          to={detailTo(row.id)}
                          className="block truncate font-medium hover:underline"
                          style={{ color: t.textPrimary }}
                          title={row.title}
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="block max-w-[400px] truncate" style={{ color: t.tableBody }} title={row.statement}>
                          {row.statement}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><TopicBadge>{row.topic}</TopicBadge></td>
                      <td className="px-4 py-2.5"><SubtopicBadge>{row.subtopic}</SubtopicBadge></td>
                      <td className="px-4 py-2.5 text-right">
                        <ActionMenu
                          label={`Open actions for ${row.id}`}
                          items={[
                            { label: 'View' },
                            { label: 'Duplicate' },
                            { label: 'Archive', danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </DataTableCard>
      </div>
    </AlyneSectionLayout>
  );
}
