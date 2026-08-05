import { useState } from 'react';
import { Lock } from 'lucide-react';
import { publicPath } from '../lib/publicPath';
import {
  PROTOTYPE_PASSWORD,
  GATE_TITLE,
  GATE_SUBTITLE,
  GATE_STORAGE_KEY,
} from '../config/prototype';

/**
 * Courtesy gate for moderated/unmoderated usability sessions — see the warning
 * in `config/prototype.js`: this is friction, not security.
 *
 * Unlocking is remembered in sessionStorage, so a refresh or a deep link mid-
 * session doesn't ask again, but closing the tab ends it.
 */
export function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(GATE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim() !== PROTOTYPE_PASSWORD) {
      setError(true);
      setValue('');
      return;
    }
    try {
      sessionStorage.setItem(GATE_STORAGE_KEY, 'true');
    } catch {
      /* private browsing — unlock for this render only */
    }
    setUnlocked(true);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--shell-page-bg, #F9FBFF)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] rounded-xl bg-white px-7 py-8"
        style={{ border: '1px solid #E4E7EC', boxShadow: '0 4px 16px rgba(16,24,40,0.06)' }}
      >
        <img
          src={publicPath('/product-logos/alyne.svg')}
          alt="Alyne"
          className="mb-6 h-7"
          style={{ width: 'auto' }}
        />

        <h1 className="m-0 mb-1 text-[19px] font-bold leading-tight" style={{ color: '#1A2141' }}>
          {GATE_TITLE}
        </h1>
        <p className="m-0 mb-6 text-[13px]" style={{ color: '#667085' }}>
          {GATE_SUBTITLE}
        </p>

        <label htmlFor="prototype-password" className="mb-1.5 block text-[13px] font-medium" style={{ color: '#344054' }}>
          Access code
        </label>
        <div className="relative">
          <Lock
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#98A2B3' }}
          />
          <input
            id="prototype-password"
            type="password"
            value={value}
            autoFocus
            autoComplete="off"
            aria-invalid={error}
            aria-describedby={error ? 'prototype-password-error' : undefined}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            className="w-full rounded-md py-2 pl-9 pr-3 text-sm outline-none transition-colors"
            style={{
              border: `1px solid ${error ? '#CD2026' : '#D0D5DD'}`,
              color: '#1A2141',
            }}
          />
        </div>

        {error && (
          <p id="prototype-password-error" role="alert" className="m-0 mt-2 text-[13px]" style={{ color: '#CD2026' }}>
            That code isn’t right. Check with your session facilitator.
          </p>
        )}

        <button
          type="submit"
          className="mt-5 w-full cursor-pointer rounded-md py-2 text-sm font-semibold text-white transition-colors"
          style={{ background: '#0067D2', border: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0053A6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0067D2'; }}
        >
          Enter prototype
        </button>
      </form>
    </div>
  );
}
