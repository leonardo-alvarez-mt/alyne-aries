/**
 * Usability-test configuration.
 *
 * ── Changing the password ──────────────────────────────────────────────
 * Either edit PASSWORD below and commit, or set VITE_PROTOTYPE_PASSWORD at
 * build time (locally in a `.env.local`, or as a repository secret wired
 * into .github/workflows/deploy.yml) — the env var wins when present.
 *
 * ⚠️  This gate is a *courtesy screen*, not access control. The whole app is
 * a static bundle: the browser downloads it before the check runs, and the
 * password below ends up in that bundle in plain text. Anyone who opens
 * devtools can read it. Treat the deployed URL as readable by anyone who
 * has it, and don't put confidential data in this prototype.
 */

export const PROTOTYPE_PASSWORD =
  import.meta.env.VITE_PROTOTYPE_PASSWORD || 'alyne-ux-2026';

/** Shown on the gate screen above the password field. */
export const GATE_TITLE = 'Alyne prototype';
export const GATE_SUBTITLE = 'Enter the access code to start the session.';

/** sessionStorage key holding the "unlocked" flag (cleared when the tab closes). */
export const GATE_STORAGE_KEY = 'alyne-prototype-unlocked';
