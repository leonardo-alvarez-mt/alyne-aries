import { RISK_SCALE } from './alyneTokens';

/**
 * Risk Management / Risks mock data.
 * @typedef {'Critical'|'Very High'|'High'|'Medium'|'Low'} RiskRating
 * @typedef {'In Draft'|'In Draft (initial)'|'In Review'|'Reviewed'} RiskLifecycleStatus
 * @typedef {Object} Risk
 * @property {string} id
 * @property {string} title
 * @property {RiskRating} rating
 * @property {number} ratingScore
 * @property {string} impact
 * @property {number} impactScore
 * @property {string} probability
 * @property {string} probabilityValue
 * @property {RiskLifecycleStatus} lifecycleStatus
 */

/** Full-dataset count shown in the table card (from the live app). */
export const RISKS_TOTAL = 308;

export const RISK_COLUMNS = [
  { id: 'id', label: '#', width: 90 },
  { id: 'title', label: 'Title', width: 340 },
  { id: 'rating', label: 'Rating (Residual)', width: 160 },
  { id: 'impact', label: 'Impact (Residual)', width: 160 },
  { id: 'probability', label: 'Probability (Residual)', width: 180 },
  { id: 'lifecycleStatus', label: 'Lifecycle Status', width: 170 },
];

/** 5×5 residual heatmap — value + canonical risk-scale color. */
export const HEATMAP = [
  [
    { value: 1, color: RISK_SCALE.high }, { value: 0, color: RISK_SCALE.high }, { value: 2, color: RISK_SCALE.veryHigh }, { value: 1, color: RISK_SCALE.veryHigh }, { value: 2, color: RISK_SCALE.critical },
  ],
  [
    { value: 1, color: RISK_SCALE.medium }, { value: 3, color: RISK_SCALE.high }, { value: 13, color: RISK_SCALE.high }, { value: 8, color: RISK_SCALE.veryHigh }, { value: 0, color: RISK_SCALE.veryHigh },
  ],
  [
    { value: 5, color: RISK_SCALE.medium }, { value: 13, color: RISK_SCALE.medium }, { value: 12, color: RISK_SCALE.high }, { value: 4, color: RISK_SCALE.high }, { value: 6, color: RISK_SCALE.veryHigh },
  ],
  [
    { value: 14, color: RISK_SCALE.low }, { value: 13, color: RISK_SCALE.medium }, { value: 10, color: RISK_SCALE.medium }, { value: 4, color: RISK_SCALE.high }, { value: 1, color: RISK_SCALE.high },
  ],
  [
    { value: 45, color: RISK_SCALE.low }, { value: 14, color: RISK_SCALE.low }, { value: 4, color: RISK_SCALE.medium }, { value: 3, color: RISK_SCALE.medium }, { value: 0, color: RISK_SCALE.high },
  ],
];

/** Risk Rating distribution — stacked bar segments (largest → smallest). */
export const RATING_DISTRIBUTION = [
  { key: 'Low', value: 73, color: RISK_SCALE.low },
  { key: 'Medium', value: 49, color: RISK_SCALE.medium },
  { key: 'High', value: 38, color: RISK_SCALE.high },
  { key: 'Very High', value: 17, color: RISK_SCALE.veryHigh },
  { key: 'Critical', value: 2, color: RISK_SCALE.critical },
];

/** Risk Exposure sparkline — two mostly-flat series. */
export const EXPOSURE_SERIES = {
  top: [95, 95, 95, 96, 95, 95, 96, 95, 96, 96, 95, 96, 95, 96, 96, 95, 95, 96, 96, 95, 95],
  bottom: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
};

/** Treatment Strategy horizontal bars. */
export const TREATMENT_STRATEGY = [
  { label: 'Avoidance', value: 59 },
  { label: 'Limitation', value: 59 },
  { label: 'Transfer', value: 2 },
  { label: 'Acceptance', value: 6 },
];

const r = (id, title, rating, ratingScore, impact, impactScore, probability, probabilityValue, lifecycleStatus) =>
  ({ id, title, rating, ratingScore, impact, impactScore, probability, probabilityValue, lifecycleStatus });

/** @type {Risk[]} */
export const RISK_ROWS = [
  r('R4248', 'Design Vendor Use Customer data to Train the model1211', 'Critical', 10, 'Extreme', 5, 'Certain', '95%', 'In Draft'),
  r('R4311', 'Prohibition on Use of Customer Data for Model Training', 'Critical', 10, 'Extreme', 5, 'Certain', '95%', 'In Draft'),
  r('R3556', 'Copy of Test Risk Critical', 'Very High', 9, 'Extreme', 5, 'Almost certain', '85%', 'In Draft'),
  r('R4365', 'Risk of classified information being disclosed to unauthorized parties.', 'Very High', 9, 'Critically', 4, 'Certain', '96%', 'In Draft (initial)'),
  r('R4366', 'Risk of classified information being disclosed to unauthorized parties.', 'Very High', 9, 'Critically', 4, 'Certain', '96%', 'In Draft (initial)'),
  r('R0082', 'Risk of one person obtaining conflicting permissions to circumvent established controls (Segregation of Duties)', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R0162', 'CCPA Risk', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Review'),
  r('R0201', 'risk 2 App A', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R0203', 'risk 2 App B', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R0226', 'Risk of directors lacking the required skills or competency', 'Very High', 8, 'High', 3, 'Certain', '95%', 'In Draft'),
  r('R0228', 'Risk of legal and regulatory requirements not being met', 'Very High', 8, 'High', 3, 'Certain', '95%', 'In Draft'),
  r('R0233', 'Risk of increased unit costs', 'Very High', 8, 'High', 3, 'Certain', '95%', 'In Draft'),
  r('R0238', 'Risk Relating to Vendor AA', 'Very High', 8, 'Extreme', 5, 'Very Likely', '50%', 'In Review'),
  r('R0244', 'Risk of systems or applications and underlying data being accessed by unauthorized parties', 'Very High', 8, 'High', 3, 'Certain', '95%', 'In Review'),
  r('R0266', 'Risk of reduced revenue', 'Very High', 8, 'Critically', 4, 'Almost certain', '84%', 'Reviewed'),
  r('R0409', 'Risk of the organization violating data privacy legal requirements', 'Very High', 8, 'High', 3, 'Certain', '95%', 'In Draft'),
  r('R2360', 'Fire Hazard Risk 1', 'Very High', 8, 'Extreme', 5, 'Very Likely', '50%', 'In Review'),
  r('R2368', 'b test 1', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R2369', 'b test 2', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R2370', 'b test 3', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft'),
  r('R3755', 'Risk of customers reducing business with the organisation.', 'Very High', 8, 'High', 3, 'Certain', '100%', 'In Draft'),
  r('R4353', 'qs', 'Very High', 8, 'Critically', 4, 'Almost certain', '80%', 'In Draft (initial)'),
  r('R0039', 'Services and Pricing Risk', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R0046', 'Risk of the organization being fined', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R0165', "Risk of people's health and safety being affected through the effects of the disruptive or emergency event", 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R0210', 'Privacy Risk', 'High', 7, 'High', 3, 'Almost certain', '80%', 'Reviewed'),
  r('R0225', 'Risk of directors lacking the required skills or competency', 'High', 7, 'Critically', 4, 'Very Likely', '65%', 'In Draft'),
  r('R0229', 'Risk of customers reducing business with the organization', 'High', 7, 'High', 3, 'Almost certain', '85%', 'Reviewed'),
  r('R0232', 'Risk of lack of coordination across business functions', 'High', 7, 'Medium', 2, 'Certain', '95%', 'In Draft'),
  r('R0418', 'Risk of parts of the organization being no longer operational', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'Reviewed'),
  r('R2353', "Risk of people's health and safety being affected through the effects of catastrophic event.", 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'Reviewed'),
  r('R3340', "The bank's consideration of all relevant safeguarding customer information implications and insuring for them in the event of a breach", 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R3341', 'The existence of a contingency plan that estimates the potential frequency and severity of each insurable exposure situation', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'Reviewed'),
  r('R3545', 'Risk of classified information of customers being disclosed to unauthorised parties.', 'High', 7, 'Critically', 4, 'Very Likely', '64%', 'In Draft'),
  r('R3577', 'Risk of gift from Vendor', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R3584', 'Copy of Risk of the organization being fined', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'Reviewed'),
  r('R3585', 'Copy of Risk of the organization being fined', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Review'),
  r('R3591', 'Copy of Risk of the organization being fined', 'High', 7, 'Critically', 4, 'Very Likely', '50%', 'In Draft'),
  r('R4249', 'AI data privacy', 'High', 7, 'High', 3, 'Almost certain', '80%', 'In Draft'),
  r('R4334', 'Test Workflow', 'High', 7, 'High', 3, 'Almost certain', '80%', 'In Draft'),
];
