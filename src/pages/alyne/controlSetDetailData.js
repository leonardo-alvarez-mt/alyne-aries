import { useEffect, useState } from 'react';
import { CONTROL_SET_ROWS } from './controlSetsData';
import { CONTROL_ROWS } from './governanceData';

/**
 * Governance / Control Set DETAIL data layer.
 *
 * Temporary MOCK provider mirroring the expected detail API shape. It is
 * isolated behind `fetchControlSetDetail(id)` + the `useControlSetDetail(id)`
 * hook so a real backend endpoint can replace it later without touching the
 * page — swap the body of `fetchControlSetDetail` for a `fetch(...)` that
 * returns the same `ControlSetDetail` shape.
 *
 * @typedef {Object} Control
 * @property {string} id
 * @property {string} title
 * @property {string} statement
 *
 * @typedef {Object} Subtopic
 * @property {string} name
 * @property {Control[]} controls
 *
 * @typedef {Object} Topic
 * @property {string} name
 * @property {Subtopic[]} subtopics
 *
 * @typedef {Object} ControlSetDetail
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {{ name: string }} owner
 * @property {Topic[]} topics
 */

const OWNER = { name: 'Jared Howe' };

/** Reference-accurate content for the primary demo control set (CS0274). */
const CS0274_TOPICS = [
  {
    name: 'Corporate Governance',
    subtopics: [
      {
        name: 'General Principles',
        controls: [
          { id: 'C0124', title: 'Board Independence', statement: 'The Board of Directors shall ensure a sufficient number of its members are independent from Management.' },
        ],
      },
      {
        name: 'Board Remuneration',
        controls: [
          { id: 'C0007', title: 'Board Remuneration Committee Composition', statement: 'The Remuneration Committee shall comprise at least 3 directors, the majority of whom are independent directors and all of whom are non-executive, to minimize the risk of any potential conflicts of interest.' },
          { id: 'C0011', title: 'Board Remuneration Committee Exclusion', statement: 'A member of the Remuneration Committee shall not be present when their own remuneration is being determined.' },
        ],
      },
    ],
  },
  {
    name: 'Fraud Prevention',
    subtopics: [
      {
        name: 'Roles and Responsibilities',
        controls: [
          { id: 'C0130', title: 'Anti-Fraud Responsibility', statement: 'Management shall be responsible for establishing and maintaining an effective anti-fraud control environment.' },
        ],
      },
      {
        name: 'General Principles',
        controls: [
          { id: 'C0131', title: 'Fraud Risk Assessment', statement: 'A fraud risk assessment shall be performed at least annually across all business units.' },
        ],
      },
      {
        name: 'Third Party Benefits',
        controls: [
          { id: 'C0132', title: 'Gifts and Hospitality', statement: 'Employees shall not offer or accept gifts or hospitality that could improperly influence a business decision.' },
        ],
      },
      {
        name: 'Whistleblowing',
        controls: [
          { id: 'C0133', title: 'Whistleblowing Channel', statement: 'A confidential whistleblowing channel shall be available to all employees and third parties to report suspected misconduct.' },
        ],
      },
    ],
  },
  {
    name: 'Governance Risk',
    subtopics: [
      {
        name: 'Ethical Standards',
        controls: [
          { id: 'C0140', title: 'Code of Conduct', statement: "All employees shall acknowledge the organization's Code of Conduct on hire and annually thereafter." },
        ],
      },
      {
        name: 'Board Diversity and Governance',
        controls: [
          { id: 'C0141', title: 'Board Diversity Policy', statement: 'The Board shall maintain and review a diversity policy covering skills, experience and background.' },
        ],
      },
    ],
  },
];

/** Group flat governance control rows into Topic → Subtopic → Control[] order. */
function groupControls(controls) {
  const topics = [];
  const topicIndex = new Map();
  for (const c of controls) {
    let topic = topicIndex.get(c.topic);
    if (!topic) {
      topic = { name: c.topic, _subIndex: new Map(), subtopics: [] };
      topicIndex.set(c.topic, topic);
      topics.push(topic);
    }
    let sub = topic._subIndex.get(c.subtopic);
    if (!sub) {
      sub = { name: c.subtopic, controls: [] };
      topic._subIndex.set(c.subtopic, sub);
      topic.subtopics.push(sub);
    }
    sub.controls.push({ id: c.id, title: c.title, statement: c.statement });
  }
  return topics.map(({ name, subtopics }) => ({ name, subtopics }));
}

/** Assemble a detail object for a list row. */
function buildDetail(row) {
  const topics = row.id === 'CS0274' ? CS0274_TOPICS : groupControls(CONTROL_ROWS);
  return { id: row.id, title: row.title, description: row.description, owner: OWNER, topics };
}

/**
 * Replaceable data seam. Resolves a single Control Set detail by ID.
 * Swap the body for a real `fetch('/api/control-sets/' + id)`.
 * @returns {Promise<ControlSetDetail>}
 */
export function fetchControlSetDetail(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const row = CONTROL_SET_ROWS.find((r) => r.id === id);
      if (!row) {
        reject(new Error(`Control Set "${id}" not found`));
        return;
      }
      resolve(buildDetail(row));
    }, 300);
  });
}

/** Synchronous name lookup for breadcrumbs (falls back to the raw id). */
export function getControlSetName(id) {
  return CONTROL_SET_ROWS.find((r) => r.id === id)?.title ?? id;
}

/**
 * Detail data hook with loading / error / success states.
 * @returns {{ status: 'loading' | 'error' | 'success', detail: ControlSetDetail | null, error: Error | null, reload: () => void }}
 */
export function useControlSetDetail(id) {
  const [state, setState] = useState({ status: 'loading', detail: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', detail: null, error: null });
    fetchControlSetDetail(id)
      .then((detail) => {
        if (!cancelled) setState({ status: 'success', detail, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', detail: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return { ...state, reload: () => setReloadKey((k) => k + 1) };
}
