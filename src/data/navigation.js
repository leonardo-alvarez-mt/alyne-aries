/**
 * Navigation model for the Alyne prototype.
 *
 * Extracted from the Chrome Shell navigation model, reduced to the Alyne tree.
 * This is the single source of truth for both the sidebar and the breadcrumb
 * trail (see `lib/shellBreadcrumbs`) — a nav item's ancestors here are its
 * breadcrumb ancestors, and its `path` is its route.
 *
 * Only a subset of these paths has a page behind it in this prototype
 * (Home, Governance > Controls / Control Sets, Compliance > Questionnaires,
 * Risk). The rest are kept so the sidebar reads like the real product; they
 * fall through to the catch-all route and return to Home.
 */

import { ShellNavIcon } from '../components/shell/shellNavIcons';

const I = ShellNavIcon;

export const alyneNavSections = [
  {
    id: 'main',
    label: '',
    items: [
      { id: 'home', label: 'Home', icon: I.home, activeIcon: I.home, path: '/' },
      {
        id: 'governance',
        label: 'Governance',
        icon: I.organization,
        activeIcon: I.organization,
        path: '/governance',
        children: [
          { id: 'governance-controls',      label: 'Controls',          path: '/governance/controls' },
          { id: 'governance-control-sets',  label: 'Control Sets',      path: '/governance/control-sets' },
          { id: 'governance-documents',     label: 'Documents',         path: '/governance/documents' },
          { id: 'governance-doc-mappings',  label: 'Document mappings', path: '/governance/document-mappings' },
          { id: 'governance-topics',        label: 'Topics',            path: '/governance/topics' },
        ],
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: I.compliance,
        activeIcon: I.compliance,
        path: '/compliance',
        children: [
          { id: 'compliance-questionnaires',     label: 'Questionnaires',         path: '/compliance/questionnaires' },
          { id: 'compliance-questionnaire-reqs', label: 'Questionnaire Requests', path: '/compliance/questionnaire-requests' },
          { id: 'compliance-reports',            label: 'Reports',                path: '/compliance/reports' },
          { id: 'compliance-issues',             label: 'Issues',                 path: '/compliance/issues' },
        ],
      },
      {
        id: 'risks',
        label: 'Risk',
        icon: I.risk,
        activeIcon: I.risk,
        path: '/risks',
        children: [
          { id: 'risks-risks',       label: 'Risks',       path: '/risks/risks' },
          { id: 'risks-mitigations', label: 'Mitigations', path: '/risks/mitigations' },
          { id: 'risks-tasks',       label: 'Tasks',       path: '/risks/tasks' },
          { id: 'risks-incidents',   label: 'Incidents',   path: '/risks/incidents' },
          { id: 'risks-simulations', label: 'Simulations', path: '/risks/simulations' },
          { id: 'risks-tags',        label: 'Tags',        path: '/risks/tags' },
        ],
      },
      { id: 'tasks',     label: 'Tasks',     icon: I.tasks,     activeIcon: I.tasks,     path: '/tasks' },
      { id: 'analytics', label: 'Analytics', icon: I.analytics, activeIcon: I.analytics, path: '/analytics' },
      {
        id: 'more',
        label: 'More',
        icon: I.more,
        activeIcon: I.more,
        path: '#',
        flyout: true,
        children: [
          { id: 'objects', label: 'Objects', path: '/objects' },
          // Moved out of the old bottom section, where NavItem special-cased the
          // `settings` id into a Shell appearance toggle. As a flyout child it is
          // an ordinary destination; Shell appearance now lives in the user menu.
          { id: 'org-settings', label: 'Organisation Settings', path: '/settings' },
        ],
      },
    ],
  },
];

export const productNavSections = {
  alyne: alyneNavSections,
};

/**
 * Alyne is the only product here, so its tree is also the fallback the shell
 * reaches for when no product-specific tree matches (and the tree the mobile
 * drawer renders).
 */
export const primaryNavSections = alyneNavSections;
