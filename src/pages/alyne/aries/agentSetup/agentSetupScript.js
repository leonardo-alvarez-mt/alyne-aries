import { CURRENT_USER, VISIBILITY_OPTIONS } from '../ariesData';

export const MORE_INFO_MESSAGE =
  'This agent gathers questionnaire responses and compliance context, analyzes risk signals against your criteria, and creates draft records plus an assessment report — pausing for your approval before anything is published.';

export const DECLINED_MESSAGE = 'No problem. You can start again anytime from New agent.';

export const CANCELLED_MESSAGE = 'Agent creation cancelled. You can start again anytime from New agent.';

export const SUMMARY_INTRO_MESSAGE =
  "Here's a summary of your agent. Review the configuration below and approve when you're ready to create it.";

export const SETUP_TURNS = [
  {
    id: 'confirm',
    assistantMessage:
      'I can set up an agent that gathers vendor data, analyzes risk signals, and drafts a report for your approval. Sound right?',
    input: 'options',
    options: [
      { label: 'Yes, set it up', value: 'yes' },
      { label: 'Tell me more', value: 'more' },
    ],
    thinkingMs: 600,
  },
  {
    id: 'name',
    assistantMessage: 'What should we call this agent?',
    input: 'text',
    placeholder: 'Quarterly vendor risk pipeline',
    thinkingMs: 400,
  },
  {
    id: 'visibility',
    assistantMessage: 'Who can use this agent?',
    input: 'options',
    options: VISIBILITY_OPTIONS.map((option) => ({ label: option.label, value: option.id })),
    thinkingMs: 400,
  },
  {
    id: 'trigger',
    assistantMessage: 'When should this agent run?',
    input: 'options',
    options: [
      { label: 'When a vendor assessment is completed', value: 'event' },
      { label: 'On a schedule', value: 'weekly' },
    ],
    thinkingMs: 500,
  },
  {
    id: 'schedule',
    assistantMessage: 'How often should it run? Describe the schedule in your own words.',
    input: 'text',
    placeholder: 'e.g. Once per week, every Monday at 9AM',
    thinkingMs: 400,
    visibleWhen: (responses) => isScheduledTrigger(responses.trigger),
  },
  {
    id: 'approval',
    assistantMessage: 'Require your approval before the final report is sent?',
    input: 'options',
    options: [
      { label: 'Yes, require approval', value: 'yes' },
      { label: 'No, run automatically', value: 'no' },
    ],
    thinkingMs: 400,
  },
];

const PLAYBOOK = [
  {
    title: 'Gather vendor context',
    description: 'Collect questionnaire responses and compliance details for selected vendors.',
    subAgent: 'Compliance Agent',
  },
  {
    title: 'Analyze risk signals',
    description: 'Identify gaps and risk indicators against your assessment criteria.',
    subAgent: 'Risk Agent',
  },
  {
    title: 'Draft records and report',
    description: 'Create draft risk records and an assessment report for your approval.',
    subAgent: 'Reporting Agent',
  },
];

export const DATA_SCOPE =
  'Completed vendor assessments and supporting compliance documents in Vendor Risk Management (12 vendors, 34 documents). Data stays in your tenant.';

const FREQUENCY_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

export function visibleTurns(responses) {
  return SETUP_TURNS.filter((turn) => !turn.visibleWhen || turn.visibleWhen(responses));
}

export function isScheduledTrigger(trigger) {
  return trigger === 'weekly' || trigger === 'scheduled';
}

export function optionLabel(turn, value) {
  return turn.options?.find((option) => option.value === value)?.label ?? value;
}

export function parseScheduleFromText(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  let frequency = 'weekly';
  if (/\b(daily|every day|each day)\b/.test(lower)) frequency = 'daily';
  else if (/\b(month|monthly)\b/.test(lower)) frequency = 'monthly';

  let time = '09:00';
  const match = trimmed.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (match) {
    let hours = Number.parseInt(match[1], 10);
    const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return { frequency, time, displayLabel: trimmed || 'Weekly schedule' };
}

export function agentName(responses) {
  return responses.name?.trim() || 'Vendor risk report agent';
}

export function requiresApproval(responses) {
  return responses.approval !== 'no';
}

function scheduleLabel(responses) {
  if (isScheduledTrigger(responses.trigger)) {
    return responses.schedule?.trim() || 'Once per week, every Monday at 9AM';
  }
  return 'When a vendor assessment is completed';
}

function cadence(responses) {
  if (isScheduledTrigger(responses.trigger)) {
    const parsed = parseScheduleFromText(responses.schedule ?? '');
    return `Scheduled, ${FREQUENCY_LABELS[parsed.frequency].toLowerCase()} at ${parsed.time}`;
  }
  return 'Event, vendor assessment completed';
}

function visibilityLabel(value) {
  return VISIBILITY_OPTIONS.find((option) => option.id === value)?.label || 'Only me';
}

export function summarySections(responses) {
  return [
    { label: 'Agent name', value: agentName(responses) },
    { label: 'Who can use it', value: visibilityLabel(responses.visibility) },
    { label: 'Schedule', value: scheduleLabel(responses) },
    {
      label: 'Workflow',
      value: PLAYBOOK.map((step, index) => `${index + 1}. ${step.title}`).join('\n'),
    },
    {
      label: 'Step approval',
      value: requiresApproval(responses)
        ? 'Required before final outputs are published'
        : 'Not required — runs automatically',
    },
  ];
}

export function creationTasks(responses) {
  return [
    `Saving ${PLAYBOOK.length} workflow steps for ${agentName(responses)}`,
    'Connecting to Vendor Risk Management · 12 vendors in scope',
    'Starting the first run',
  ];
}

export function creationBullets(responses) {
  return [
    `Named "${agentName(responses)}" and added to your agent list`,
    `Scheduled to run: ${scheduleLabel(responses)}`,
    `Workflow configured with ${PLAYBOOK.length} steps`,
    requiresApproval(responses)
      ? 'Required before final outputs are published'
      : 'Not required — runs automatically',
    'Agent is enabled and ready to run',
  ];
}

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function buildRegistryAgent(id, responses) {
  const approval = requiresApproval(responses);
  const steps = PLAYBOOK.map((step, index) => ({
    name: step.title,
    subAgent: step.subAgent,
    gate: approval && index === PLAYBOOK.length - 1,
  }));
  return {
    id,
    name: agentName(responses),
    cadence: cadence(responses),
    owner: CURRENT_USER,
    ownerInitials: initialsOf(CURRENT_USER),
    status: 'active',
    subAgents: [...new Set(PLAYBOOK.map((step) => step.subAgent))],
    steps,
    lastRun: 'Just now',
    lastRunOutcome: 'running',
    lastRunNote: 'First run started after setup',
    pending: [],
    visibility: responses.visibility || 'me',
  };
}
