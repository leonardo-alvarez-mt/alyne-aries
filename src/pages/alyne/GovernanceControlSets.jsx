import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ListFilter, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { resolveNavPath } from '../../utils/shellNavigation';
import AlyneSectionLayout from './AlyneSectionLayout';
import {
  Button, IconAction, SearchInput, SearchToolbar, ListPageHeader,
  DataTableCard, EmptyState,
} from './listPrimitives';
import { GOVERNANCE_SECTION, t } from './alyneTokens';
import { CONTROL_SET_COLUMNS, CONTROL_SETS_TOTAL, useControlSets } from './controlSetsData';

const thBase = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider align-middle';

/** Sortable column header — clickable th with a direction caret. */
function SortableTh({ column, sort, onSort }) {
  const isActive = sort.key === column.id;
  const Caret = !isActive ? ChevronsUpDown : sort.dir === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th scope="col" className={thBase} style={{ color: t.tableHeader }} aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(column.id)}
        className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0067D2] focus-visible:ring-offset-1"
        style={{ color: 'inherit', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}
      >
        {column.label}
        <Caret size={13} aria-hidden style={{ color: isActive ? t.textSecondary : t.textMuted }} />
      </button>
    </th>
  );
}

/** Loading skeleton rows shown while the data layer resolves. */
function LoadingRows({ colSpan, rows = 8 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ borderBottom: `1px solid ${t.borderSubtle}` }}>
      <td colSpan={colSpan} className="px-4 py-3">
        <div className="h-3.5 w-full animate-pulse rounded" style={{ background: '#EEF1F4' }} />
      </td>
    </tr>
  ));
}

/** Error state row with a retry affordance. */
function ErrorRow({ colSpan, onRetry }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <AlertCircle size={36} aria-hidden style={{ color: '#F97066' }} strokeWidth={1.5} />
          <p className="m-0 text-sm font-semibold" style={{ color: t.textPrimary }}>Couldn’t load control sets</p>
          <p className="m-0 text-[13px]" style={{ color: t.textMuted }}>Something went wrong while fetching the list.</p>
          <div className="mt-2"><Button variant="default" size="sm" onClick={onRetry}>Try again</Button></div>
        </div>
      </td>
    </tr>
  );
}

export default function GovernanceControlSets() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { status, rows, reload } = useControlSets();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'title', dir: 'asc' });

  const detailTo = (id) => resolveNavPath(`/governance/control-sets/${id}`, pathname);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = !q
      ? rows
      : rows.filter((r) =>
          [r.id, r.title, r.description].some((v) => v.toLowerCase().includes(q))
        );
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) =>
      dir * String(a[sort.key]).localeCompare(String(b[sort.key]), undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [rows, search, sort]);

  function onSort(key) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  const totalCols = CONTROL_SET_COLUMNS.length;

  return (
    <AlyneSectionLayout section={GOVERNANCE_SECTION}>
      <div className="px-8 py-7">
        <ListPageHeader
          title="Control Sets"
          actions={<Button variant="primary">Create</Button>}
        />

        <SearchToolbar>
          <SearchInput label="Search control sets" value={search} onChange={setSearch} placeholder="Search Control Sets" />
          <IconAction label="Open filters"><ListFilter size={16} aria-hidden /></IconAction>
        </SearchToolbar>

        <DataTableCard countLabel={`${CONTROL_SETS_TOTAL.toLocaleString()} Control Sets`}>
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <colgroup>
              {CONTROL_SET_COLUMNS.map((c) => (
                <col key={c.id} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: t.bgHeader, borderBottom: `1px solid ${t.borderSubtle}` }}>
                {CONTROL_SET_COLUMNS.map((c) => (
                  <SortableTh key={c.id} column={c} sort={sort} onSort={onSort} />
                ))}
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && <LoadingRows colSpan={totalCols} />}
              {status === 'error' && <ErrorRow colSpan={totalCols} onRetry={reload} />}
              {status === 'success' && visible.length === 0 && (
                <EmptyState
                  colSpan={totalCols}
                  title="No control sets found"
                  description="Try adjusting your search."
                />
              )}
              {status === 'success' &&
                visible.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(detailTo(row.id))}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.bgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to={detailTo(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold tabular-nums hover:underline"
                        style={{ color: '#000000' }}
                      >
                        {row.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block truncate font-medium" style={{ color: t.textPrimary }} title={row.title}>
                        {row.title}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block truncate" style={{ color: t.tableBody }} title={row.description}>
                        {row.description}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>
    </AlyneSectionLayout>
  );
}
