import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, ListFilter } from 'lucide-react';
import { resolveNavPath } from '../../utils/shellNavigation';
import AlyneSectionLayout from './AlyneSectionLayout';
import { RiskAnalyticsStrip } from './riskCharts';
import {
  Button, IconAction, SearchInput, SearchToolbar, ListPageHeader,
  DataTableCard, RiskRatingBadge, LifecycleStatusBadge, InfoAlert, ActionMenu, EmptyState,
} from './listPrimitives';
import { RISK_MANAGEMENT_SECTION, t } from './alyneTokens';
import { RISK_ROWS, RISK_COLUMNS, RISKS_TOTAL } from './riskData';

const HEADER_MENU_ITEMS = [
  { label: 'Import risks' },
  { label: 'Export risks' },
  { label: 'Configure view' },
];

const FILTER_COUNT = 1;
const thBase = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider align-middle';

export default function RiskManagement() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return RISK_ROWS;
    return RISK_ROWS.filter((row) =>
      [row.id, row.title, row.rating, row.impact, row.probability, row.lifecycleStatus]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [search]);

  const detailTo = (id) => resolveNavPath(`/risks/${id}`, pathname);
  const totalCols = RISK_COLUMNS.length + 1; // + actions column

  return (
    <AlyneSectionLayout section={RISK_MANAGEMENT_SECTION}>
      <div className="px-8 py-7">
        <RiskAnalyticsStrip />

        <ListPageHeader
          title="Risks"
          actions={(
            <>
              <ActionMenu label="Open risk page actions" items={HEADER_MENU_ITEMS} />
              <Button variant="secondary">Simulate</Button>
              <Button variant="primary">Create</Button>
            </>
          )}
        />

        <SearchToolbar>
          <SearchInput label="Search risks" value={search} onChange={setSearch} placeholder="Search Risks" />
          <IconAction label="Open saved risk views"><Bookmark size={16} aria-hidden /></IconAction>
          <Button variant="default" size="sm">My Risks</Button>
          <IconAction label="Open risk filters" badge={FILTER_COUNT}><ListFilter size={16} aria-hidden /></IconAction>
        </SearchToolbar>

        <InfoAlert>
          <button
            type="button"
            className="font-semibold hover:underline"
            style={{ color: t.textLink }}
          >
            1 risk
          </button>{' '}
          can be approved by you in this risk view.
        </InfoAlert>

        <DataTableCard countLabel={`${RISKS_TOTAL.toLocaleString()} Risks`}>
          <table className="w-full min-w-[1040px] border-collapse text-[13px]">
            <colgroup>
              {RISK_COLUMNS.map((c) => (
                <col
                  key={c.id}
                  style={c.id === 'title'
                    ? { width: 100, minWidth: 100, maxWidth: 100 }
                    : { width: c.width }}
                />
              ))}
              <col style={{ width: 60 }} />
            </colgroup>
            <thead>
              <tr style={{ background: t.bgHeader, borderBottom: `1px solid ${t.borderSubtle}` }}>
                {RISK_COLUMNS.map((c) => (
                  <th key={c.id} scope="col" className={thBase} style={{ color: t.tableHeader }}>{c.label}</th>
                ))}
                <th scope="col" className={thBase}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  colSpan={totalCols}
                  title="No risks found"
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
                        className="block max-w-[100px] truncate font-medium hover:underline"
                        style={{ color: t.textPrimary }}
                        title={row.title}
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5"><RiskRatingBadge rating={row.rating} score={row.ratingScore} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5" style={{ color: t.tableBody }}>
                      {row.impact} ({row.impactScore})
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5" style={{ color: t.tableBody }}>
                      {row.probability} ({row.probabilityValue})
                    </td>
                    <td className="px-4 py-2.5"><LifecycleStatusBadge status={row.lifecycleStatus} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <ActionMenu
                        label={`Open actions for ${row.id}`}
                        items={[
                          { label: 'View risk' },
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
