export const REGISTRY_AGENTS = [
  {
    id: 'urgent-risk',
    name: 'Urgent Risk Report with Mitigation Gap Analysis',
    cadence: 'Manual',
    owner: 'Brian Wardell',
    ownerInitials: 'BW',
    status: 'active',
    subAgents: ['Risk Mitigation Agent', 'Compliance Agent'],
    steps: [
      { name: 'Collect high-severity risks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Map mitigation coverage', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Check control gaps', subAgent: 'Compliance Agent', gate: false },
      { name: 'Approve and send the report', subAgent: 'Compliance Agent', gate: true },
    ],
    lastRun: 'Sept 21, 13:21',
    lastRunOutcome: 'held',
    lastRunNote: 'Held at “Approve and send the report”',
    pending: [
      { step: 'Approve and send the report', requested: 'Sept 21', ageDays: 16, assignee: 'Brian Wardell' },
    ],
  },
  {
    id: 'daily-review',
    name: 'Daily review of critical risks',
    cadence: 'Scheduled, daily',
    owner: 'Brian Wardell',
    ownerInitials: 'BW',
    status: 'active',
    subAgents: ['Risk Mitigation Agent'],
    steps: [
      { name: 'Pull critical risks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Summarize changes since yesterday', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Post the digest', subAgent: 'Risk Mitigation Agent', gate: false },
    ],
    lastRun: 'Oct 7, 09:15',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed all 3 steps',
    pending: [],
  },
  {
    id: 'vendor-survey',
    name: 'Vendor Survey Assessment Agent',
    cadence: 'Manual',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    status: 'active',
    subAgents: ['Vendor Survey Agent'],
    steps: [
      { name: 'Send the vendor survey', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Score the responses', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Approve the vendor rating', subAgent: 'Vendor Survey Agent', gate: true },
    ],
    lastRun: 'Oct 6, 16:40',
    lastRunOutcome: 'failed',
    lastRunNote: 'Failed at “Score the responses”',
    pending: [],
  },
  {
    id: 'incident-recovery',
    name: 'Incident recovery summary',
    cadence: 'Scheduled, weekly',
    owner: 'Continuity Manager',
    ownerInitials: 'CM',
    ownerNote: 'Owner is a role',
    status: 'active',
    subAgents: ['Continuity Agent', 'Risk Mitigation Agent'],
    steps: [
      { name: 'Gather the incident timeline', subAgent: 'Continuity Agent', gate: false },
      { name: 'Approve the recovery summary', subAgent: 'Continuity Agent', gate: true },
      { name: 'Approve the residual risk update', subAgent: 'Risk Mitigation Agent', gate: true },
    ],
    lastRun: 'Oct 5, 08:00',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed, 2 approvals still open',
    pending: [
      { step: 'Approve the recovery summary', requested: 'Oct 5', ageDays: 3, assignee: 'Continuity Manager' },
      { step: 'Approve the residual risk update', requested: 'Oct 7', ageDays: 1, assignee: 'Continuity Manager' },
    ],
  },
  {
    id: 'e2e-test',
    name: 'E2E Scheduled Test Agent 2',
    cadence: 'Scheduled, monthly',
    owner: 'Platform QA',
    ownerInitials: 'QA',
    status: 'inactive',
    subAgents: ['Risk Mitigation Agent'],
    steps: [
      { name: 'Run the scheduled checks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Record the results', subAgent: 'Risk Mitigation Agent', gate: false },
    ],
    lastRun: 'Sept 30, 17:36',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed all 2 steps',
    pending: [],
  },
  {
    id: 'vendor-decision',
    name: 'Vendor decision routing',
    cadence: 'Event, vendor assessment completed',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    status: 'active',
    subAgents: ['Vendor Survey Agent', 'Risk Mitigation Agent'],
    steps: [
      { name: 'Read the assessment', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Residual rating', subAgent: 'Decision', gate: false },
      { name: 'Draft conditions', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Approve conditions', subAgent: 'Risk Mitigation Agent', gate: true },
      { name: 'Record the decision', subAgent: 'Vendor Survey Agent', gate: false },
    ],
    lastRun: 'Oct 8, 11:04',
    lastRunOutcome: 'ended',
    lastRunNote: 'Ended because residual rating was High. 3 steps skipped.',
    pending: [],
    graph: {
      trunk: ['trigger', 'read', 'decision'],
      branches: [
        {
          id: 'high',
          label: 'High',
          stopWorkflow: true,
          stopReason: 'Residual risk is High and requires remediation before approval.',
          nodes: [],
        },
        { id: 'medium', label: 'Medium', stopWorkflow: false, nodes: ['draft', 'approve'] },
        { id: 'low', label: 'Low', stopWorkflow: false, nodes: ['record'] },
      ],
      audit: ['trigger', 'read', 'decision', 'draft', 'approve', 'record'],
      nodes: {
        trigger: {
          type: 'trigger',
          title: 'Assessment completed',
          detail: 'Starts when a vendor assessment is completed.',
          produces: ['Vendor name', 'Inherent rating', 'Control gaps', 'Notice period', 'Full assessment text'],
          run: { outcome: 'ran', detail: 'Vendor assessment completed.' },
        },
        read: {
          type: 'prompt',
          title: 'Read the assessment',
          agent: 'Vendor Survey Agent',
          prompt:
            'Read the bound fields and list the control gaps a risk officer would act on. Do not use anything that was not passed in.',
          bindings: [
            { field: 'Vendor name', source: 'Assessment completed' },
            { field: 'Inherent rating', source: 'Assessment completed' },
            { field: 'Control gaps', source: 'Assessment completed' },
            { field: 'Notice period', source: 'Assessment completed' },
          ],
          withheld: ['Full assessment text'],
          outputs: ['Gap summary'],
          run: { outcome: 'ran', detail: 'Received the four bound fields.' },
        },
        decision: {
          type: 'decision',
          title: 'Residual rating',
          question: 'What is the residual risk rating?',
          responseType: 'options',
          detail: 'A small decision model picks one option and returns a confidence, in about a tenth of a second.',
          sample: { choice: 'High', confidence: '0.91' },
          run: {
            outcome: 'ended',
            detail:
              'Chose High with confidence 0.91. Stopped: Residual risk is High and requires remediation before approval.',
          },
        },
        draft: {
          type: 'prompt',
          title: 'Draft conditions',
          agent: 'Risk Mitigation Agent',
          prompt: 'Draft the conditions a risk officer would impose before this vendor goes live.',
          bindings: [
            { field: 'Residual rating', source: 'Residual rating' },
            { field: 'Control gaps', source: 'Read the assessment' },
          ],
          withheld: ['Full assessment text'],
          outputs: ['Conditions'],
          run: { outcome: 'skipped', detail: 'Not on the High route.' },
        },
        approve: {
          type: 'prompt',
          title: 'Approve conditions',
          agent: 'Risk Mitigation Agent',
          gate: true,
          prompt: 'Ask the owner to approve the conditions before they are recorded.',
          bindings: [{ field: 'Conditions', source: 'Draft conditions' }],
          withheld: ['Full assessment text'],
          outputs: ['Approval'],
          run: { outcome: 'skipped', detail: 'Not on the High route.' },
        },
        record: {
          type: 'prompt',
          title: 'Record the decision',
          agent: 'Vendor Survey Agent',
          prompt: 'Record the vendor decision on the assessment.',
          bindings: [{ field: 'Residual rating', source: 'Residual rating' }],
          withheld: ['Full assessment text', 'Conditions'],
          outputs: ['Decision record'],
          run: { outcome: 'skipped', detail: 'Not on the High route.' },
        },
      },
    },
  },
];

export function agentHealth(agent) {
  if (agent.status === 'inactive') return 'inactive';
  if (agent.lastRunOutcome === 'failed') return 'failed';
  if (agent.pending.length > 0) return 'waiting';
  return 'healthy';
}

export function oldestPendingDays(agent) {
  return agent.pending.reduce((oldest, item) => Math.max(oldest, item.ageDays), 0);
}

export const REGISTRY_OWNERS = [...new Set(REGISTRY_AGENTS.map((agent) => agent.owner))];

export const REGISTRY_SUMMARY = (() => {
  const active = REGISTRY_AGENTS.filter((agent) => agent.status === 'active').length;
  const waitingAgents = REGISTRY_AGENTS.filter((agent) => agent.pending.length > 0);
  const oldest = REGISTRY_AGENTS.reduce((best, agent) =>
    oldestPendingDays(agent) > oldestPendingDays(best) ? agent : best
  );
  const failed = REGISTRY_AGENTS.filter((agent) => agent.lastRunOutcome === 'failed');
  return {
    total: REGISTRY_AGENTS.length,
    active,
    inactive: REGISTRY_AGENTS.length - active,
    pending: waitingAgents.reduce((sum, agent) => sum + agent.pending.length, 0),
    waitingAgents: waitingAgents.length,
    oldest,
    oldestDays: oldestPendingDays(oldest),
    failed,
  };
})();
