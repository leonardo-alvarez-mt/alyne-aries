import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAries } from './AriesContext';
import { BCP_DOCUMENT, BCP_TABLE_ROWS, exportCsv } from './ariesData';

const V1_TABS = [
  { id: 'table', label: 'Table' },
  { id: 'context', label: 'Context' },
];

const V2_TABS = [
  { id: 'widget', label: 'Widget' },
  { id: 'table', label: 'Table' },
  { id: 'document', label: 'Document' },
  { id: 'context', label: 'Context' },
];

const HEAT = [
  { title: 'Data centre outage', impact: 5, prob: 3 },
  { title: 'SaaS disruption', impact: 4, prob: 4 },
  { title: 'Key person — CISO', impact: 3, prob: 3 },
  { title: 'Regional office', impact: 2, prob: 2 },
];

function HeatCell({ impact, prob }) {
  const score = impact * prob;
  const bg =
    score >= 16 ? '#F04438' : score >= 9 ? '#F79009' : score >= 4 ? '#FDB022' : '#32D583';
  return (
    <div
      className="flex h-10 items-center justify-center rounded text-[10px] font-semibold text-white"
      style={{ background: bg }}
      title={`Impact ${impact} × Probability ${prob}`}
    >
      {score}
    </div>
  );
}

export function WidgetTab() {
  return (
    <div className="space-y-3">
      <p className="m-0 text-[13px] font-semibold text-[#1A2141]">Risk heat map</p>
      <p className="m-0 text-[12px] text-[#667085]">
        Residual scores from the open portfolio (Impact × Probability).
      </p>
      <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
        <div className="grid grid-cols-[1fr_repeat(4,2.5rem)] gap-1 border-b border-[#E4E7EC] bg-[#F9FAFB] p-2 text-[10px] font-semibold uppercase tracking-wider text-[#667085]">
          <span>Risk</span>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="text-center">
              P{n}
            </span>
          ))}
        </div>
        {HEAT.map((row) => (
          <div key={row.title} className="grid grid-cols-[1fr_repeat(4,2.5rem)] gap-1 border-b border-[#F2F4F7] p-2 last:border-0">
            <span className="truncate pr-2 text-[12px] text-[#1A2141]">{row.title}</span>
            {[1, 2, 3, 4].map((p) =>
              p === row.prob ? (
                <HeatCell key={p} impact={row.impact} prob={row.prob} />
              ) : (
                <div key={p} className="h-10 rounded bg-[#F9FAFB]" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TableTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[13px] font-semibold text-[#1A2141]">Recovery priorities</p>
        <button
          type="button"
          onClick={() => exportCsv(BCP_TABLE_ROWS)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#1A2141] hover:bg-[#F9FAFB]"
        >
          <Download size={13} aria-hidden />
          Export CSV
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#E4E7EC]">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead className="bg-[#F9FAFB] text-[10px] font-semibold uppercase tracking-wider text-[#667085]">
            <tr>
              {['ID', 'Title', 'Rating', 'Recovery', 'Owner'].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BCP_TABLE_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-[#F2F4F7] text-[#242A30]">
                <td className="px-3 py-2 font-medium text-[#0067D2]">{row.id}</td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">{row.rating}</td>
                <td className="px-3 py-2">{row.recovery}</td>
                <td className="px-3 py-2">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentTab() {
  return (
    <div className="prose-sm space-y-2 rounded-lg border border-[#E4E7EC] bg-white p-4">
      {BCP_DOCUMENT.split('\n').map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="m-0 text-[16px] font-bold text-[#1A2141]">
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="mb-0 mt-3 text-[13px] font-semibold text-[#1A2141]">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith('|')) {
          return (
            <p key={i} className="m-0 font-mono text-[11px] text-[#475467]">
              {line}
            </p>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return (
          <p key={i} className="m-0 text-[13px] leading-relaxed text-[#475467]">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      })}
    </div>
  );
}

export function ContextTab() {
  const { companyProfile, frameworks, glossary } = useAries();
  const inScope = frameworks.filter((f) => f.inScope);

  return (
    <div className="space-y-4">
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Company profile
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          <li>
            <span className="font-medium text-[#1A2141]">Industry:</span> {companyProfile.industry}
          </li>
          <li>
            <span className="font-medium text-[#1A2141]">Regions:</span> {companyProfile.regions}
          </li>
          <li>
            <span className="font-medium text-[#1A2141]">Risk appetite:</span>{' '}
            {companyProfile.riskAppetite}
          </li>
        </ul>
      </section>
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Frameworks & policies
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          {inScope.map((f) => (
            <li key={f.id}>• {f.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Glossary used
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          {glossary.slice(0, 3).map((g) => (
            <li key={g.id}>
              <span className="font-medium text-[#1A2141]">{g.term}</span> — {g.definition}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function AriesOutputs() {
  const { version, outputsOpen, setOutputsOpen, activeOutputId } = useAries();
  const tabs = version === 'v2' ? V2_TABS : V1_TABS;
  const [tab, setTab] = useState(version === 'v2' ? 'widget' : 'table');
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  if (!outputsOpen || !activeOutputId) return null;

  return (
    <aside
      className="flex h-full w-[380px] shrink-0 flex-col border-l border-[#e2e8f0] bg-white"
      aria-label="ARIES outputs"
    >
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
        <div>
          <p className="m-0 text-[13px] font-semibold text-[#001a35]">Outputs</p>
          <p className="m-0 text-[11px] text-[#64748b]">Business Continuity Plan</p>
        </div>
        <button
          type="button"
          aria-label="Close outputs"
          onClick={() => setOutputsOpen(false)}
          className="flex size-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="flex gap-1 border-b border-[#e2e8f0] px-3 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-t-md px-3 py-2 text-[12px] font-semibold transition-colors',
              activeTab === t.id
                ? 'border-b-2 border-[#0067D2] text-[#0067D2]'
                : 'text-[#64748b] hover:text-[#001a35]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'widget' && <WidgetTab />}
        {activeTab === 'table' && <TableTab />}
        {activeTab === 'document' && <DocumentTab />}
        {activeTab === 'context' && <ContextTab />}
      </div>
    </aside>
  );
}
