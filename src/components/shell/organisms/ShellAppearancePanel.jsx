import { Palette, RotateCcw, PanelLeft, PanelTop } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useShell } from '../ShellContext';
import {
  DEFAULT_SHELL_APPEARANCE,
  SHELL_APPEARANCE_PRESETS,
} from '../shellAppearance';

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-md border border-neutral-200 bg-white p-0.5"
          aria-label={`${label} color`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-neutral-200 px-2.5 py-1.5 font-mono text-xs text-neutral-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

export function ShellAppearancePanel() {
  const { shellAppearance, setShellAppearance, resetShellAppearance, setSettingsPanelOpen } = useShell();

  function applyPreset(preset) {
    setShellAppearance({
      presetId: preset.id,
      pageBg: preset.pageBg,
      headerBg: preset.headerBg,
      sidebarBg: preset.sidebarBg,
    });
  }

  function updateColor(key, value) {
    setShellAppearance({ [key]: value, presetId: 'custom' });
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10 font-[Inter,system-ui,sans-serif]">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-neutral-500">
            <Palette size={18} aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">Shell theming</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Appearance</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Customize page, header, and sidebar backgrounds across all products at once.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsPanelOpen(false)}
          className="shrink-0 rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Close
        </button>
      </div>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-neutral-900">Navigation layout</h2>
        <p className="mb-3 text-xs text-neutral-500">Choose where the product navigation lives.</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'sidebar', label: 'Left sidebar', hint: 'Vertical rail', Icon: PanelLeft },
            { id: 'topbar',  label: 'Top bar',      hint: 'Horizontal, below header', Icon: PanelTop },
          ].map(({ id, label, hint, Icon }) => {
            const active = (shellAppearance.navLayout ?? 'sidebar') === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setShellAppearance({ navLayout: id })}
                aria-pressed={active}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                  active
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <Icon size={18} className={active ? 'text-blue-600' : 'text-neutral-500'} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-neutral-800">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-neutral-400">{hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Presets</h2>
        <div className="grid grid-cols-2 gap-2">
          {SHELL_APPEARANCE_PRESETS.map((preset) => {
            const active = shellAppearance.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all',
                  active
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <div className="mb-2 flex h-8 overflow-hidden rounded-md border border-neutral-200">
                  <span className="flex-1" style={{ background: preset.sidebarBg }} aria-hidden />
                  <span className="flex-[2]" style={{ background: preset.pageBg }} aria-hidden />
                </div>
                <span className="text-xs font-medium text-neutral-700">{preset.label}</span>
                <span className="mt-0.5 block text-[10px] text-neutral-400">
                  Page {preset.pageBg}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Custom colors</h2>
          <button
            type="button"
            onClick={resetShellAppearance}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
          >
            <RotateCcw size={13} aria-hidden />
            Reset defaults
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <ColorField
            label="Page background"
            value={shellAppearance.pageBg}
            onChange={(v) => updateColor('pageBg', v)}
          />
          <ColorField
            label="Header background"
            value={shellAppearance.headerBg}
            onChange={(v) => updateColor('headerBg', v)}
          />
          <ColorField
            label="Sidebar background"
            value={shellAppearance.sidebarBg}
            onChange={(v) => updateColor('sidebarBg', v)}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="flex h-28">
            <div className="w-16 shrink-0 border-r border-neutral-200" style={{ background: shellAppearance.sidebarBg }} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="h-8 border-b border-neutral-200" style={{ background: shellAppearance.headerBg }} />
              <div className="flex-1" style={{ background: shellAppearance.pageBg }} />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Preview of sidebar, header, and main content areas. Dark sidebar theme keeps its own palette.
        </p>
      </section>

      <p className="mt-6 text-center text-xs text-neutral-400">
        Default: Minimal — {DEFAULT_SHELL_APPEARANCE.pageBg} page / white header / {DEFAULT_SHELL_APPEARANCE.sidebarBg} sidebar
      </p>
    </div>
  );
}
