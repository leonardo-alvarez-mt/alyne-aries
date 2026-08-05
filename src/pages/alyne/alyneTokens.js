export const ACCENT = '#4FC5DE';

/** Design-system type families: Noto Sans for headings, Inter for body/UI. */
export const FONT_HEADING = "'Noto Sans', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";

import { shellPageContentClass } from '../../components/shell/shellAppearance';
import { IconBuildingBank, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';

export const pageShellClass = `${shellPageContentClass} px-8 py-7 font-[Poppins,sans-serif]`;

export const DASHBOARD_OPTIONS = ['Personal Dashboard', 'Team Dashboard'];

export const DEMO_USER = { firstName: 'Alex', orgName: 'Design' };

/**
 * Shared Alyne list-page palette. Kept here (not inline in JSX) so colors,
 * radii and surface treatments stay tokenised across the prototype's pages.
 */
export const t = {
  textPrimary: '#1A2141',
  textSecondary: '#475467',
  textMuted: '#667085',
  tableHeader: '#000000',
  tableBody: '#242A30',
  textLink: '#0067D2',
  bgSurface: '#FFFFFF',
  bgHeader: '#F9FAFB',
  bgHover: '#FAFAFA',
  bgSelected: '#F0FAFD',
  borderSubtle: '#E4E7EC',
  borderDefault: '#D0D5DD',
  accent: ACCENT,
  primary: '#0067D2',
  primaryHover: '#0053A6',
  focusRing: 'rgba(79,197,222,0.45)',
};

/** Soft blue tag — used for Topic badges. */
export const TOPIC_BADGE = { bg: '#bfd9f4', text: '#003368', border: '#bfd9f4' };
/** Neutral/secondary tag — used for Subtopic badges. */
export const SUBTOPIC_BADGE = { bg: '#e3e9ef', text: '#39434c', border: '#e3e9ef' };

/** Questionnaire state badges. Text + icon differentiate; shared amber fill. */
export const STATE_BADGE = {
  Published: { label: 'Published', bg: '#ffe5c7', text: '#7f4c0f', border: '#ffe5c7', icon: 'clock' },
  Completed: { label: 'Completed', bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', icon: 'check' },
  Draft: { label: 'Draft', bg: '#F2F4F7', text: '#475467', border: '#E4E7EC', icon: 'file' },
};

/** In-page section navigation. Paths are app routes (see shellNavigation). */
export const GOVERNANCE_SECTION = {
  title: 'Governance',
  icon: IconBuildingBank,
  items: [
    { id: 'controls', label: 'Controls', path: '/governance/controls' },
    { id: 'controlsets', label: 'Control Sets', path: '/governance/control-sets' },
    { id: 'documents', label: 'Documents', path: '/governance/documents' },
    { id: 'mappings', label: 'Document mappings', path: '/governance/mappings' },
    { id: 'topics', label: 'Topics', path: '/governance/topics' },
  ],
};

export const COMPLIANCE_SECTION = {
  title: 'Compliance',
  icon: IconShieldCheck,
  items: [
    { id: 'questionnaires', label: 'Questionnaires', path: '/compliance/questionnaires' },
    { id: 'questionnaire-requests', label: 'Questionnaire Requests', path: '/compliance/questionnaire-requests' },
    { id: 'reports', label: 'Reports', path: '/compliance/reports' },
    { id: 'issues', label: 'Issues', path: '/compliance/issues' },
  ],
};

/**
 * Risk Management section. Hosted under `/risks` so the global sidebar "Risks"
 * item (nav path `/risks`) stays active. Legacy refs are `/risk-management/*`.
 */
export const RISK_MANAGEMENT_SECTION = {
  title: 'Risk Management',
  icon: IconAlertCircle,
  items: [
    { id: 'risks', label: 'Risks', path: '/risks' },
    { id: 'mitigations', label: 'Mitigations', path: '/risks/mitigations' },
    { id: 'tasks', label: 'Tasks', path: '/risks/tasks' },
    { id: 'incidents', label: 'Incidents', path: '/risks/incidents' },
    { id: 'simulations', label: 'Simulations', path: '/risks/simulations' },
    { id: 'tags', label: 'Tags', path: '/risks/tags' },
  ],
};

/**
 * Domain-specific risk-scale colors supplied by product. These are NOT generic
 * design-system tokens — they are the canonical risk visualization palette and
 * are the one sanctioned exception to the "no hard-coded colors" rule.
 */
export const RISK_SCALE = {
  critical: '#cd2b47',
  veryHigh: '#f1832c',
  high: '#fecb40',
  medium: '#7CC9CE',
  low: '#9E9F9B',
};

/** Rating label → risk-scale color. */
export const RISK_RATING_COLOR = {
  Critical: RISK_SCALE.critical,
  'Very High': RISK_SCALE.veryHigh,
  High: RISK_SCALE.high,
  Medium: RISK_SCALE.medium,
  Low: RISK_SCALE.low,
};

/** Supplementary chart colors (blues) for the analytics strip. */
export const RISK_CHART = {
  exposureTop: '#0067D2',
  exposureBottom: '#8FA7BF',
  treatmentBar: '#8FA7BF',
  gridLine: '#E4E7EC',
};

/** Lifecycle status → soft badge treatment + leading icon key. */
export const LIFECYCLE_BADGE = {
  'In Draft': { label: 'In Draft', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', icon: 'draft' },
  'In Draft (initial)': { label: 'In Draft (initial)', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', icon: 'draft' },
  'In Review': { label: 'In Review', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', icon: 'review' },
  Reviewed: { label: 'Reviewed', bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', icon: 'done' },
};
