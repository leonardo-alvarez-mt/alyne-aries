/** Seed data and scripted replies for the ARIES full-page prototype. */

export const ARIES_VERSION_KEY = 'aries-prototype-version';

export const ACCESS_LEVELS = [
  { id: 'none', label: 'No access' },
  { id: 'run', label: 'Can run' },
  { id: 'approval', label: 'Run with approval' },
  { id: 'edit', label: 'Run and edit' },
];

export const SKILL_SOURCES = [
  { id: 'personal', label: 'Personal' },
  { id: 'organisational', label: 'Organisational' },
  { id: 'aries', label: 'By ARIES' },
  { id: 'mitratech', label: 'By Mitratech' },
];

export const VISIBILITY_OPTIONS = [
  { id: 'me', label: 'Only me' },
  { id: 'team', label: 'My team' },
  { id: 'org', label: 'Organization' },
];

export const STARTER_PROMPTS = [
  {
    id: 'bcp',
    label: 'Business Continuity Plan',
    description: 'Prioritise recovery for services where residual risk stays elevated.',
    bullets: ['Map open risks to RTO / RPO', 'Cite frameworks in scope', 'Export a recovery table'],
    prompt: 'Analyse my risks portfolio and build a Business Continuity Plan',
  },
  {
    id: 'questionnaire',
    label: 'Questionnaire to risks',
    description: 'Turn questionnaire gaps into proposed risk records.',
    bullets: ['Scan recent responses', 'Flag material gaps', 'Draft risk titles with glossary terms'],
    prompt: 'Look into my questionnaire responses and create risks from gaps',
  },
  {
    id: 'glossary',
    label: 'Glossary rewrite',
    description: 'Rewrite control language using your organisation’s terms.',
    bullets: ['Apply residual risk wording', 'Keep control-owner language', 'Stay within risk appetite'],
    prompt: 'Rewrite the residual risk statement using our glossary terms',
  },
];

export const INITIAL_COMPANY_PROFILE = {
  name: 'Design Corp',
  industry: 'Financial services',
  regions: 'EMEA, North America',
  riskAppetite: 'Moderate — prefer controls that reduce residual risk below Medium',
  summary: 'Global design and technology services firm with regulated clients in banking and insurance.',
};

export const INITIAL_FRAMEWORKS = [
  { id: 'fw-iso', name: 'ISO 27001', inScope: true, type: 'framework' },
  { id: 'fw-soc2', name: 'SOC 2 Type II', inScope: true, type: 'framework' },
  { id: 'fw-gdpr', name: 'GDPR', inScope: true, type: 'framework' },
  { id: 'pol-isp', name: 'Information Security Policy', inScope: true, type: 'policy', uploaded: false },
  { id: 'pol-bcp', name: 'Business Continuity Policy', inScope: true, type: 'policy', uploaded: false },
];

export const INITIAL_GLOSSARY = [
  { id: 'g1', term: 'Residual risk', definition: 'Risk remaining after controls and mitigations are applied.' },
  { id: 'g2', term: 'Control owner', definition: 'Person accountable for operating and evidencing a control.' },
  { id: 'g3', term: 'Inherent risk', definition: 'Risk level before any control or mitigation is applied.' },
  { id: 'g4', term: 'Risk appetite', definition: 'The amount and type of risk the organisation is willing to retain.' },
];

export const INITIAL_SKILLS = [
  {
    id: 'sk-bcp',
    name: 'Business Continuity Plan builder',
    description: 'Turns a risk portfolio into a structured BCP with recovery priorities.',
    source: 'aries',
    showOnHome: true,
  },
  {
    id: 'sk-qrisk',
    name: 'Questionnaire to risks',
    description: 'Reads questionnaire responses and proposes new risk records.',
    source: 'mitratech',
    showOnHome: true,
  },
  {
    id: 'sk-glossary',
    name: 'Glossary rewriter',
    description: 'Rewrites content using the organisation glossary.',
    source: 'organisational',
    showOnHome: false,
  },
  {
    id: 'sk-evidence',
    name: 'Evidence matcher',
    description: 'Matches uploaded evidence to control requirements.',
    source: 'personal',
    showOnHome: false,
  },
];

export const INITIAL_AGENTS = [
  {
    id: 'ag-weekly',
    name: 'Weekly questionnaire risk scan',
    instructions: 'Every week, look into questionnaire responses and create risks for material gaps.',
    visibility: 'org',
    schedule: 'Weekly',
    skillId: 'sk-qrisk',
  },
  {
    id: 'ag-bcp',
    name: 'BCP drafting agent',
    instructions: 'Analyse the open risk portfolio and draft a Business Continuity Plan.',
    visibility: 'team',
    schedule: null,
    skillId: 'sk-bcp',
  },
];

export const TEAM_KNOWLEDGE = [
  { id: 'company', label: 'Company profile' },
  { id: 'frameworks', label: 'Frameworks & policies' },
  { id: 'glossary', label: 'Glossary' },
];

export const INITIAL_TEAMS = [
  {
    id: 'tm-grc',
    name: 'GRC Core',
    description: 'Owns the risk register, control testing and board reporting.',
    lead: 'Alex Chen',
    members: ['Alex Chen', 'Sam Rivera', 'Jordan Lee'],
    origin: 'aries',
    knowledge: ['company', 'frameworks', 'glossary'],
    sharedAgentIds: ['urgent-risk', 'daily-review', 'incident-recovery', 'vendor-survey'],
  },
  {
    id: 'tm-risk',
    name: 'Risk Operations',
    description: 'Runs the daily risk review and vendor assessments.',
    lead: 'Priya Nair',
    members: ['Priya Nair', 'Chris Wong'],
    origin: 'alyne',
    knowledge: ['frameworks', 'glossary'],
    sharedAgentIds: ['daily-review', 'vendor-survey'],
  },
  {
    id: 'tm-owners',
    name: 'Control Owners',
    description: 'Accountable for operating and evidencing controls.',
    lead: 'Alex Chen',
    members: ['Alex Chen', 'Morgan Blake'],
    origin: 'alyne',
    isOwner: true,
    knowledge: ['company', 'frameworks', 'glossary'],
    sharedAgentIds: ['urgent-risk', 'daily-review', 'incident-recovery'],
  },
];

export const CURRENT_USER = 'Alex Chen';

export const WORKSPACE_PEOPLE = [
  { name: 'Alex Chen', email: 'alex.chen@designcorp.com' },
  { name: 'Sam Rivera', email: 'sam.rivera@designcorp.com' },
  { name: 'Jordan Lee', email: 'jordan.lee@designcorp.com' },
  { name: 'Priya Nair', email: 'priya.nair@designcorp.com' },
  { name: 'Chris Wong', email: 'chris.wong@designcorp.com' },
  { name: 'Morgan Blake', email: 'morgan.blake@designcorp.com' },
  { name: 'Elena Fischer', email: 'elena.fischer@designcorp.com' },
  { name: 'Tomás Ortega', email: 'tomas.ortega@designcorp.com' },
  { name: 'Hannah Weber', email: 'hannah.weber@designcorp.com' },
];

/** access[teamId][resourceId] -> level id */
export const INITIAL_ACCESS = {
  'tm-grc': {
    'ag-weekly': 'edit',
    'ag-bcp': 'edit',
    'sk-bcp': 'edit',
    'sk-qrisk': 'run',
    'sk-glossary': 'run',
    'sk-evidence': 'approval',
  },
  'tm-risk': {
    'ag-weekly': 'run',
    'ag-bcp': 'approval',
    'sk-bcp': 'run',
    'sk-qrisk': 'run',
    'sk-glossary': 'none',
    'sk-evidence': 'none',
  },
  'tm-owners': {
    'ag-weekly': 'edit',
    'ag-bcp': 'edit',
    'sk-bcp': 'edit',
    'sk-qrisk': 'edit',
    'sk-glossary': 'edit',
    'sk-evidence': 'edit',
  },
};

export const INITIAL_TEMPLATES = [
  {
    id: 'tpl-qblock',
    name: 'Questionnaire block builder',
    fields: ['blockTitle', 'questions[]', 'responseType', 'evidenceRequired'],
    previewKind: 'questionnaire',
  },
  {
    id: 'tpl-evidence',
    name: 'Automated evidence matching',
    fields: ['controlId', 'evidenceItems[]', 'matchScore', 'gaps[]'],
    previewKind: 'evidence',
  },
  {
    id: 'tpl-heatmap',
    name: 'Risk heat map',
    fields: ['risks[]', 'impact', 'probability', 'residualRating'],
    previewKind: 'heatmap',
  },
  {
    id: 'tpl-findings',
    name: 'Findings table',
    fields: ['findingId', 'severity', 'control', 'owner', 'dueDate'],
    previewKind: 'findings',
  },
  {
    id: 'tpl-control',
    name: 'Control test result',
    fields: ['controlId', 'testDate', 'result', 'exceptions', 'tester'],
    previewKind: 'control',
  },
  {
    id: 'tpl-approval',
    name: 'Approval request',
    fields: ['requestTitle', 'requester', 'approvers[]', 'decision', 'rationale'],
    previewKind: 'approval',
  },
  {
    id: 'tpl-mitigation',
    name: 'Mitigation plan',
    fields: ['riskId', 'actions[]', 'owner', 'targetDate', 'status'],
    previewKind: 'mitigation',
  },
  {
    id: 'tpl-slides',
    name: 'Management report slides',
    fields: ['title', 'slides[]', 'keyMetrics[]', 'recommendations[]'],
    previewKind: 'slides',
  },
];

export const BCP_TABLE_ROWS = [
  { id: 'R-101', title: 'Data centre outage', rating: 'High', recovery: '4h RTO', owner: 'Risk Operations' },
  { id: 'R-118', title: 'Key person dependency — CISO', rating: 'Medium', recovery: '48h RTO', owner: 'GRC Core' },
  { id: 'R-142', title: 'Third-party SaaS disruption', rating: 'High', recovery: '8h RTO', owner: 'Control Owners' },
  { id: 'R-155', title: 'Regional office unavailability', rating: 'Low', recovery: '72h RTO', owner: 'Risk Operations' },
];

export const BCP_DOCUMENT = `# Business Continuity Plan — Design Corp

## 1. Purpose
This plan prioritises recovery for services where **residual risk** remains High after controls, aligned with Design Corp's moderate **risk appetite**.

## 2. Scope
Frameworks in scope: ISO 27001, SOC 2 Type II, GDPR. Policies cited: Information Security Policy, Business Continuity Policy.

## 3. Critical services
| Service | RTO | RPO | Owner |
| --- | --- | --- | --- |
| Customer portal | 4h | 1h | Risk Operations |
| Identity provider | 2h | 15m | Control Owners |
| GRC platform | 8h | 4h | GRC Core |

## 4. Recommendations
1. Exercise the data-centre failover quarterly.
2. Document CISO succession and cross-train deputies.
3. Add contractual RTO clauses for tier-1 SaaS vendors.
`;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d.toISOString();
}

export const INITIAL_CHATS = [
  {
    id: 'ch-today',
    title: 'Business Continuity Plan draft',
    skillId: 'sk-bcp',
    updatedAt: daysAgo(0),
    messages: [
      { id: 'm1', role: 'user', content: 'Analyse my risks portfolio and build a Business Continuity Plan' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'I reviewed your open risk portfolio against Design Corp’s company profile (Financial services, EMEA and North America) and your glossary. Four services need recovery priorities. The identity provider has the shortest target at 2h RTO; the regional office has the longest at 72h RTO.\n\nThe full recovery table is below.',
        outputId: 'out-bcp',
        sources: ['Company profile', 'Glossary', 'Open risks'],
        related: [
          'Which service should we recover first?',
          'What residual risk stays above appetite?',
          'Draft the board summary for this plan',
        ],
      },
    ],
  },
  {
    id: 'ch-week',
    title: 'Questionnaire gaps to risks',
    skillId: 'sk-qrisk',
    updatedAt: daysAgo(2),
    messages: [
      { id: 'm1', role: 'user', content: 'Look into my questionnaire responses and create risks from gaps' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Three questionnaire responses show material gaps. I proposed risks for vendor access reviews, encryption at rest, and incident escalation SLAs.',
        sources: ['Company profile', 'Glossary'],
        related: [
          'Turn the vendor access gap into a risk record',
          'Which gap is the most material?',
        ],
      },
    ],
  },
  {
    id: 'ch-older',
    title: 'Glossary rewrite for residual risk',
    skillId: 'sk-glossary',
    updatedAt: daysAgo(12),
    messages: [
      { id: 'm1', role: 'user', content: 'Rewrite the residual risk statement using our glossary terms' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Updated wording: “Residual risk remains Medium after the control owner applies compensating monitoring.”',
        sources: ['Glossary'],
        related: ['Rewrite this for the board pack', 'Which glossary terms did you apply?'],
      },
    ],
  },
];

export function titleFromPrompt(prompt) {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}

export function scriptedReply(prompt, profile, glossary) {
  const lower = prompt.toLowerCase();
  const terms = glossary.slice(0, 2).map((g) => g.term).join(' and ');
  const industry = profile.industry || 'your industry';

  if (lower.includes('business continuity') || lower.includes('risks portfolio') || lower.includes('bcp')) {
    return {
      content: `I analysed the open risk portfolio for a ${industry} organisation operating in ${profile.regions || 'your regions'}. Using your glossary (${terms}), four services still need a recovery priority. The identity provider has the shortest target at 2h RTO; the regional office has the longest at 72h RTO.\n\nThe full recovery table is below.`,
      outputId: 'out-bcp',
      skillId: 'sk-bcp',
      sources: ['Company profile', 'Glossary', 'Open risks'],
      related: [
        'Which service should we recover first?',
        'What residual risk stays above appetite?',
        'Draft the board summary for this plan',
      ],
    };
  }
  if (lower.includes('questionnaire')) {
    return {
      content: `I scanned recent questionnaire responses against your company profile. Three gaps look material for ${industry}. Proposed risk titles use your glossary terms (${terms}).\n\nSchedule the Weekly questionnaire risk scan agent to repeat this every week.`,
      skillId: 'sk-qrisk',
      sources: ['Company profile', 'Glossary'],
      related: ['Which gap is the most material?', 'Draft the vendor access risk'],
    };
  }
  if (lower.includes('glossary') || lower.includes('residual risk') || lower.includes('rewrite')) {
    return {
      content: `Rewritten with your glossary: “Residual risk remains within appetite after the control owner applies monitoring.”\n\nTerms applied: ${terms}.`,
      skillId: 'sk-glossary',
      sources: ['Glossary', 'Company profile'],
      related: ['Rewrite this for the board pack', 'Which glossary terms did you apply?'],
    };
  }
  return {
    content: `Here’s a tailored answer for ${profile.name || 'your organisation'} (${industry}). I used your company profile and glossary (${terms || 'available terms'}) so wording stays consistent with how your teams talk about risk.`,
    sources: ['Company profile', 'Glossary'],
    related: ['What should I look at next?', 'Summarize this for the risk committee'],
  };
}

export function exportCsv(rows) {
  const headers = Object.keys(rows[0] || { id: '', title: '', rating: '', recovery: '', owner: '' });
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aries-output.csv';
  a.click();
  URL.revokeObjectURL(url);
}
