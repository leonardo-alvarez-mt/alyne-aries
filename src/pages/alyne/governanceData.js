/**
 * Governance / Controls mock data.
 * @typedef {Object} Control
 * @property {string} id
 * @property {string} title
 * @property {string} statement
 * @property {string} topic
 * @property {string} subtopic
 */

/** Full-dataset count shown in the table card (from the live app). */
export const CONTROLS_TOTAL = 2860;

export const CONTROL_COLUMNS = [
  { id: 'id', label: '#', width: 100 },
  { id: 'title', label: 'Title', width: 200 },
  { id: 'statement', label: 'Control Statement', width: 400 },
  { id: 'topic', label: 'Topic', width: 200 },
  { id: 'subtopic', label: 'Subtopic', width: 200 },
];

/** @type {Control[]} */
export const CONTROL_ROWS = [
  { id: 'C0001', title: 'Application Governance Tasks', statement: 'The Service Owner shall be responsible for operating applications according to defined performance indicators.', topic: 'Application Governance', subtopic: 'Roles and Responsibilities' },
  { id: 'C0049', title: 'Access Control', statement: 'All archived physical data shall have sufficient access control implemented and inventorization to prevent unauthorized access to the data.', topic: 'Archiving and Data Retention', subtopic: 'Physical Data Archiving' },
  { id: 'C0055', title: 'IT Asset Movement', statement: 'The register shall include location of the IT asset. Changes to the IT asset shall require approval.', topic: 'IT Asset Management', subtopic: 'Roles and Responsibilities' },
  { id: 'C0063', title: 'Independence of Internal Audit and Business', statement: 'Internal Audit shall remain independent and shall be separated in its activities and resources from operational business up to board level.', topic: 'Audit', subtopic: 'General Principles' },
  { id: 'C0069', title: 'Audit Subject Notification', statement: 'The audit subjects shall be notified of the planned audit activities through submission of the audit planning memorandum and a kick-off meeting if applicable.', topic: 'Audit', subtopic: 'Process' },
  { id: 'C0073', title: 'Specialized Skills', statement: 'External skilled resources shall be used for auditing specialized topics that are not covered by the skillset of the internal team.', topic: 'Audit', subtopic: 'Process' },
  { id: 'C0081', title: 'Notification of Regulators', statement: "The Head of Business Continuity shall ensure responsible regulators are notified within 24 hours of a disruptive event with material impact to the organization's business. The regulator shall also be notified as soon as regular business operations have been restored.", topic: 'Business Continuity Management', subtopic: 'Roles and Responsibilities' },
  { id: 'C0099', title: 'Maximum Tolerable Period of Disruption', statement: 'A minimum recovery time and a maximum tolerable period of disruption shall be defined for each business process.', topic: 'Business Continuity Management', subtopic: 'Business Continuity Plans' },
  { id: 'C0119', title: 'Strategy Options', statement: 'For sites and assets, continuity strategies shall include replacement procurement, off-site recovery, dual site recovery, hot site recovery, and working from home depending on task.', topic: 'Business Continuity Management', subtopic: 'Continuity Strategies' },
  { id: 'C0123', title: 'Supplier Continuity Strategies', statement: 'For critical suppliers, continuity strategies shall involve identifying alternate suppliers, building supply stockpiles, obtaining alternate supply, and deferring production or service.', topic: 'Business Continuity Management', subtopic: 'Continuity Strategies' },
  { id: 'C0126', title: 'Head of Communications', statement: 'The authorized person invoking a Business Continuity Plan shall nominate a head of communications responsible for all internal and external communication relating to disruptive events and the response.', topic: 'Business Continuity Management', subtopic: 'Communication' },
  { id: 'C0019', title: 'Production Environment Segregation', statement: 'Access to production environments must be segregated from access to test and development environments.', topic: 'Application Governance', subtopic: 'Change Management' },
  { id: 'C0025', title: 'Issue Tracking Solution', statement: 'An Issue Management Tool shall be maintained to track production issues for each application.', topic: 'Application Governance', subtopic: 'Issue Management' },
  { id: 'C0031', title: 'Support Response Times', statement: "The Service Owner shall define response times for user support according to the criticality of the application functionality to the organization's key processes.", topic: 'Application Governance', subtopic: 'User Support' },
  { id: 'C0064', title: 'Moving from Business Unit', statement: 'Resources transferring from operational business to internal audit shall be managed to preserve independence.', topic: 'Audit', subtopic: 'General Principles' },
  { id: 'C0080', title: 'Decentral Continuity Plans', statement: 'All organizational units shall define Business Continuity Plans for relevant processes and assets.', topic: 'Business Continuity Management', subtopic: 'Roles and Responsibilities' },
  { id: 'C0005', title: 'Automated Controls', statement: 'Business controls shall be implemented as automated controls where practical.', topic: 'Application Governance', subtopic: 'General Principles' },
  { id: 'C0027', title: 'Software Decommissioning', statement: 'A Software Decommissioning Plan shall be documented for retired systems.', topic: 'Application Governance', subtopic: 'User Support' },
  { id: 'C0122', title: 'People Continuity Strategies', statement: 'People continuity strategies shall include splitting critical knowledge and duties.', topic: 'Business Continuity Management', subtopic: 'Continuity Strategies' },
];
