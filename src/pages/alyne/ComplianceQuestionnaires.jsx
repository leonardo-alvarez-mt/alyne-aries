import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListFilter } from 'lucide-react';
import { resolveNavPath } from '../../utils/shellNavigation';
import AlyneSectionLayout from './AlyneSectionLayout';
import {
  Button, IconAction, SearchInput, SearchToolbar, ListPageHeader,
  DataTableCard, StateBadge, UserCell, ActionMenu, EmptyState,
} from './listPrimitives';
import { COMPLIANCE_SECTION, t } from './alyneTokens';
import { QUESTIONNAIRE_ROWS, QUESTIONNAIRE_COLUMNS, QUESTIONNAIRES_TOTAL } from './complianceData';

const FILTER_COUNT = 2;
const thBase = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider align-middle';

export default function ComplianceQuestionnaires() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return QUESTIONNAIRE_ROWS;
    return QUESTIONNAIRE_ROWS.filter((r) =>
      [r.id, r.title, r.createdBy.name, r.createdBy.email ?? '', r.state]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [search]);

  const detailTo = (id) => resolveNavPath(`/compliance/questionnaire/${id}`, pathname);
  const totalCols = QUESTIONNAIRE_COLUMNS.length + 1; // + actions column

  return (
    <AlyneSectionLayout section={COMPLIANCE_SECTION}>
      <div className="px-8 py-7">
        <ListPageHeader
          title="Questionnaires"
          actions={<Button variant="primary">Create</Button>}
        />

        <SearchToolbar>
          <SearchInput label="Search questionnaires" value={search} onChange={setSearch} placeholder="Search Questionnaires" />
          <IconAction label="Open filters" badge={FILTER_COUNT}><ListFilter size={16} aria-hidden /></IconAction>
        </SearchToolbar>

        <DataTableCard countLabel={`${QUESTIONNAIRES_TOTAL.toLocaleString()} Questionnaires`}>
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <colgroup>
              {QUESTIONNAIRE_COLUMNS.map((c) => <col key={c.id} style={{ width: c.width }} />)}
              <col style={{ width: 60 }} />
            </colgroup>
            <thead>
              <tr style={{ background: t.bgHeader, borderBottom: `1px solid ${t.borderSubtle}` }}>
                {QUESTIONNAIRE_COLUMNS.map((c) => (
                  <th key={c.id} scope="col" className={thBase} style={{ color: t.tableHeader }}>{c.label}</th>
                ))}
                <th scope="col" className={thBase}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  colSpan={totalCols}
                  title="No questionnaires found"
                  description="Try adjusting your search or filters."
                />
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.bgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to={detailTo(row.id)}
                        className="font-semibold tabular-nums hover:underline"
                        style={{ color: '#000000' }}
                      >
                        {row.id}
                      </Link>
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
                    <td className="px-4 py-2.5"><UserCell user={row.createdBy} /></td>
                    <td className="px-4 py-2.5"><StateBadge state={row.state} /></td>
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
                ))
              )}
            </tbody>
          </table>
        </DataTableCard>
      </div>
    </AlyneSectionLayout>
  );
}
