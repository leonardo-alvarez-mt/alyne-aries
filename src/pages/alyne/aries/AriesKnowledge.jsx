import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Upload, Plus } from 'lucide-react';
import { useAries } from './AriesContext';
import AriesSkills from './AriesSkills';
import { ariesFocus } from './ariesUi';
import {
  PillSelect,
  SettingsCard,
  SettingsPage,
  SettingsRow,
  SettingsSection,
  Switch,
  pillButton,
  primaryPillButton,
  settingsInput,
  settingsTextarea,
} from './settingsUi';
import { cn } from '../../../utils/cn';

const INDUSTRIES = [
  'Financial services',
  'Insurance',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Public sector',
  'Retail',
  'Energy & utilities',
];

function CompanyProfile() {
  const { companyProfile, setCompanyProfile } = useAries();

  function update(key, value) {
    setCompanyProfile((p) => ({ ...p, [key]: value }));
  }

  const industries = INDUSTRIES.includes(companyProfile.industry)
    ? INDUSTRIES
    : [companyProfile.industry, ...INDUSTRIES].filter(Boolean);

  return (
    <SettingsPage
      title="Company profile"
      description="Facts ARIES uses so wording and survey questions fit your organisation."
    >
      <SettingsSection
        title="Organisation"
        description="Core details ARIES uses to tailor its language and recommendations."
      >
        <SettingsCard>
          <SettingsRow
            label="Organisation name"
            htmlFor="cp-name"
            description="Shown in generated documents and answers"
            control={
              <input
                id="cp-name"
                value={companyProfile.name || ''}
                onChange={(e) => update('name', e.target.value)}
                className={cn(settingsInput, 'w-[260px]')}
              />
            }
          />
          <SettingsRow
            label="Industry"
            htmlFor="cp-industry"
            description="Tunes examples, regulations, and risk language"
            control={
              <PillSelect
                id="cp-industry"
                value={companyProfile.industry || ''}
                onChange={(value) => update('industry', value)}
                options={industries}
              />
            }
          />
          <SettingsRow
            label="Regions"
            htmlFor="cp-regions"
            description="Where you operate, separated by commas"
            control={
              <input
                id="cp-regions"
                value={companyProfile.regions || ''}
                onChange={(e) => update('regions', e.target.value)}
                className={cn(settingsInput, 'w-[260px]')}
              />
            }
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Risk posture"
        description="ARIES keeps recommendations inside this appetite. One or two sentences are enough."
      >
        <textarea
          id="cp-appetite"
          aria-label="Risk appetite"
          rows={3}
          value={companyProfile.riskAppetite || ''}
          onChange={(e) => update('riskAppetite', e.target.value)}
          className={settingsTextarea}
        />
      </SettingsSection>

      <SettingsSection
        title="About"
        description="Background ARIES reads before every answer. What you do and who you serve."
      >
        <textarea
          id="cp-summary"
          aria-label="Summary"
          rows={4}
          value={companyProfile.summary || ''}
          onChange={(e) => update('summary', e.target.value)}
          className={settingsTextarea}
        />
      </SettingsSection>
    </SettingsPage>
  );
}

function Frameworks() {
  const { frameworks, toggleFramework, addPolicyFile } = useAries();
  const [adding, setAdding] = useState(false);
  const [fileName, setFileName] = useState('');
  const list = frameworks.filter((f) => f.type === 'framework');
  const policies = frameworks.filter((f) => f.type === 'policy');

  const addPolicy = (event) => {
    event.preventDefault();
    if (!fileName.trim()) return;
    addPolicyFile(fileName.trim());
    setFileName('');
    setAdding(false);
  };

  return (
    <SettingsPage
      title="Frameworks & policies"
      description="What is in scope for the program, and the policies ARIES can cite."
    >
      <SettingsSection title="Frameworks" description="Turn off a framework to keep it out of answers.">
        <SettingsCard>
          {list.map((f) => (
            <SettingsRow
              key={f.id}
              label={f.name}
              description={f.inScope ? 'In scope' : 'Out of scope'}
              control={<Switch checked={f.inScope} onChange={() => toggleFramework(f.id)} label={`${f.name} in scope`} />}
            />
          ))}
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Policies" description="ARIES quotes these when it explains a recommendation.">
        <SettingsCard>
          {policies.map((f) => (
            <SettingsRow
              key={f.id}
              label={f.name}
              description={f.uploaded ? 'File uploaded' : 'No file yet'}
              control={<Switch checked={f.inScope} onChange={() => toggleFramework(f.id)} label={`${f.name} in scope`} />}
            />
          ))}
          {adding ? (
            <form onSubmit={addPolicy} className="flex items-center gap-2 px-4 py-3">
              <input
                autoFocus
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Acceptable Use Policy.pdf"
                aria-label="Policy file name"
                className={cn(settingsInput, 'flex-1')}
              />
              <button type="button" className={pillButton} onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button type="submit" className={primaryPillButton} disabled={!fileName.trim()}>
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-[#f8fafc]',
                ariesFocus
              )}
            >
              <span>
                <span className="block text-[14px] font-medium text-[#0f172a]">Upload a policy</span>
                <span className="block text-[12.5px] text-[#64748b]">PDF or Word, up to 20 MB</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] text-[#475569]">
                <Upload size={14} strokeWidth={1.75} aria-hidden />
                Add
                <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
              </span>
            </button>
          )}
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}

function Glossary() {
  const { glossary, addGlossaryTerm } = useAries();
  const [adding, setAdding] = useState(false);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  const add = (event) => {
    event.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    addGlossaryTerm(term.trim(), definition.trim());
    setTerm('');
    setDefinition('');
    setAdding(false);
  };

  return (
    <SettingsPage
      title="Glossary"
      description="Your organisation’s terms, so ARIES uses the same language as your teams."
    >
      <SettingsSection
        title="Terms"
        description={`${glossary.length} terms ARIES will use in answers and documents.`}
        action={
          !adding && (
            <button type="button" className={pillButton} onClick={() => setAdding(true)}>
              <Plus size={14} strokeWidth={2} aria-hidden />
              Add term
            </button>
          )
        }
      >
        <SettingsCard>
          {adding && (
            <form onSubmit={add} className="space-y-2 bg-[#f8fafc] px-4 py-3.5">
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Term"
                aria-label="Term"
                className={settingsInput}
              />
              <textarea
                rows={2}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Definition"
                aria-label="Definition"
                className={settingsTextarea}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className={pillButton} onClick={() => setAdding(false)}>
                  Cancel
                </button>
                <button type="submit" className={primaryPillButton} disabled={!term.trim() || !definition.trim()}>
                  Save term
                </button>
              </div>
            </form>
          )}
          {glossary.map((g) => (
            <SettingsRow key={g.id} label={g.term} description={g.definition} />
          ))}
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}

function Templates() {
  const { templates, version } = useAries();
  const [selected, setSelected] = useState(templates[0]?.id);

  if (version !== 'v2') {
    return <Navigate to="/aries/knowledge/company-profile" replace />;
  }

  const tpl = templates.find((t) => t.id === selected);

  return (
    <SettingsPage
      title="Templates"
      description="Structured outputs with a fixed schema, so results look and export the same way every time."
    >
      <SettingsSection title="Library" description="Open a template to preview the fields ARIES must return.">
        <SettingsCard>
          {templates.map((t) => {
            const active = t.id === tpl?.id;
            return (
              <div key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelected(active ? null : t.id)}
                  aria-expanded={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[#f8fafc]',
                    ariesFocus
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-[#0f172a]">{t.name}</span>
                    <span className="block truncate text-[12.5px] text-[#64748b]">{t.fields.join(', ')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className={cn('shrink-0 text-[#64748b] transition-transform', active && 'rotate-180')}
                    aria-hidden
                  />
                </button>
                {active && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl bg-[#f8fafc] p-3">
                      <TemplatePreview kind={t.previewKind} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}

function TemplatePreview({ kind }) {
  if (kind === 'heatmap') {
    return (
      <div className="grid grid-cols-4 gap-1">
        {['Low', 'Med', 'High', 'Crit'].map((label, i) => (
          <div
            key={label}
            className="rounded-md p-3 text-center text-[11px] font-semibold text-white"
            style={{ background: ['#32D583', '#FDB022', '#F79009', '#F04438'][i] }}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'slides') {
    return (
      <div className="space-y-2">
        {['Executive summary', 'Top residual risks', 'Recommendations'].map((slide, i) => (
          <div
            key={slide}
            className="rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-6 text-center"
          >
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[#98A2B3]">
              Slide {i + 1}
            </p>
            <p className="m-0 mt-1 text-[14px] font-semibold text-[#1A2141]">{slide}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'findings' || kind === 'questionnaire' || kind === 'evidence' || kind === 'control' || kind === 'approval' || kind === 'mitigation') {
    const rows = {
      findings: [['F-01', 'High', 'Access review lag'], ['F-02', 'Medium', 'Missing encryption evidence']],
      questionnaire: [['Q1', 'Yes/No', 'Is MFA enforced?'], ['Q2', 'Text', 'Describe backup RPO']],
      evidence: [['C0001', 'Policy.pdf', '92%'], ['C0019', 'Screenshot.png', '61%']],
      control: [['C0005', 'Pass', 'No exceptions'], ['C0025', 'Fail', '2 exceptions']],
      approval: [['REQ-12', 'Pending', 'BCP update'], ['REQ-09', 'Approved', 'Risk acceptance']],
      mitigation: [['R-101', 'In progress', 'Failover drill'], ['R-142', 'Open', 'Vendor RTO clause']],
    }[kind];
    return (
      <table className="w-full border-collapse text-left text-[12px]">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#F2F4F7]">
              {row.map((cell) => (
                <td key={cell} className="px-2 py-2 text-[#475467]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return <p className="m-0 text-[13px] text-[#667085]">Live preview</p>;
}

export default function AriesKnowledge() {
  const { section } = useParams();
  const { version } = useAries();

  if (!section) {
    return (
      <Navigate
        to={version === 'v2' ? '/aries/knowledge/templates' : '/aries/knowledge/company-profile'}
        replace
      />
    );
  }

  switch (section) {
    case 'company-profile':
      return <CompanyProfile />;
    case 'frameworks':
      return <Frameworks />;
    case 'glossary':
      return <Glossary />;
    case 'skills':
      if (version === 'v2') return <Navigate to="/aries/skills" replace />;
      return <AriesSkills />;
    case 'templates':
      return <Templates />;
    default:
      return <Navigate to="/aries/knowledge/company-profile" replace />;
  }
}
