import { useEffect, useState } from 'react';

/**
 * Governance / Control Sets data layer.
 *
 * This is a temporary MOCK provider that mirrors the real Control Set schema
 * ({ id, title, description }). It is intentionally isolated behind
 * `fetchControlSets()` + the `useControlSets()` hook so the data source can be
 * swapped for a real backend endpoint later without touching the page:
 * replace the body of `fetchControlSets` with a `fetch(...)` call that returns
 * the same shape.
 *
 * @typedef {Object} ControlSet
 * @property {string} id           Control Set ID (e.g. "CS0274")
 * @property {string} title
 * @property {string} description
 */

export const CONTROL_SET_COLUMNS = [
  { id: 'id', label: '#', width: 160, sortable: true },
  { id: 'title', label: 'Title', width: 320, sortable: true },
  { id: 'description', label: 'Description', width: 600, sortable: true },
];

/** @type {ControlSet[]} */
export const CONTROL_SET_ROWS = [
  { id: 'CS0274', title: 'Anti-Bribery & Corruption', description: 'These are the controls that should be in place to avoid bribery and corruption.' },
  { id: 'CS0352', title: 'BCM - Business Continuity Management Basics', description: 'This control set defines a basic capability for managing business continuity and disaster recovery.' },
  { id: 'CS0218', title: 'BCM - Important Business Continuity Management Basics', description: 'This control set defines a basic capability for managing business continuity and disaster recovery.' },
  { id: 'CS0250', title: 'BSA/AML Control Requirements', description: 'BSA/AML Control Requirements' },
  { id: 'CS0231', title: 'Data Privacy', description: 'These controls are required for whenever PII is being managed.' },
  { id: 'CS0350', title: 'Demo', description: '' },
  { id: 'CS0346', title: 'HIPAA: Part 164—Security and Privacy', description: 'This control set covers the requirements of the U.S. Health Insurance Portability and Accountability Act.' },
  { id: 'CS0317', title: 'ICFR: IT Controls over Financial Reporting (SOX, SOC 1)', description: 'This control set covers the internal control over financial reporting (ICFR) requirements.' },
  { id: 'CS0353', title: 'ISO 22301', description: '' },
  { id: 'CS0358', title: 'ISO Sample', description: '' },
  { id: 'CS0354', title: 'ISO/IEC 27001:2022 Information Security Management System', description: 'This control set defines control objectives aligned with the scope and domains as defined in ISO/IEC 27001:2022.' },
  { id: 'CS0327', title: 'Library - Business Continuity Management', description: 'Library set of controls to establish a mature business continuity framework, managing disruption end to end.' },
  { id: 'CS0357', title: 'NIST 800-30 Control Assessment', description: '' },
  { id: 'CS0340', title: 'NIST AI RMF 1.0 Playbook', description: 'This control set contains the original core requirements Govern, Map, Measure, and Manage.' },
  { id: 'CS0246', title: 'NIST CSF', description: 'Controls suggested for compliance with NIST CSF 2.0.' },
  { id: 'CS0356', title: 'Original NIST AI RMF 1.0 Playbook', description: 'This control set contains the original core requirements Govern, Map, Measure, and Manage.' },
  { id: 'CS0339', title: 'Sample Compliance Controls', description: 'Collection of controls needed for compliance with various regulations.' },
  { id: 'CS0337', title: 'Sample Controls', description: 'Sample collection of controls implemented to drive compliance and reduce risk.' },
  { id: 'CS0360', title: 'PCI DSS v4.0', description: 'Controls required to protect cardholder data in line with PCI DSS v4.0.' },
  { id: 'CS0361', title: 'GDPR Essentials', description: 'Controls supporting compliance with the EU General Data Protection Regulation.' },
  { id: 'CS0362', title: 'SOC 2 Trust Services Criteria', description: 'Controls mapped to the AICPA SOC 2 Trust Services Criteria.' },
  { id: 'CS0363', title: 'Vendor Risk Baseline', description: 'Baseline controls expected of third-party vendors handling sensitive data.' },
];

/** Full-dataset count shown in the table card. */
export const CONTROL_SETS_TOTAL = CONTROL_SET_ROWS.length;

/**
 * Replaceable data seam. Returns the full Control Set list.
 * Swap the body for a real `fetch('/api/...')` returning `ControlSet[]`.
 */
export function fetchControlSets() {
  return new Promise((resolve) => {
    // Simulate a short network round-trip so the loading state is exercised.
    setTimeout(() => resolve(CONTROL_SET_ROWS), 350);
  });
}

/**
 * Data hook exposing loading / error / success states for the list page.
 * @returns {{ status: 'loading' | 'error' | 'success', rows: ControlSet[], error: Error | null, reload: () => void }}
 */
export function useControlSets() {
  const [state, setState] = useState({ status: 'loading', rows: [], error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', rows: [], error: null });
    fetchControlSets()
      .then((rows) => {
        if (!cancelled) setState({ status: 'success', rows, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', rows: [], error });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { ...state, reload: () => setReloadKey((k) => k + 1) };
}
