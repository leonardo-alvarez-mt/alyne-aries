const SHARED_SURFACES = {
  headerBg: '#FFFFFF',
  sidebarBg: '#FFFFFF',
};

export const DEFAULT_SHELL_APPEARANCE = {
  presetId: 'minimal',
  pageBg: '#F9FBFF',
  navLayout: 'sidebar', // 'sidebar' | 'topbar'
  ...SHARED_SURFACES,
};

export const SHELL_APPEARANCE_PRESETS = [
  {
    id: 'minimal',
    label: 'Minimal · almost white',
    pageBg: '#F9FBFF',
    ...SHARED_SURFACES,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    pageBg: '#F3F5F9',
    ...SHARED_SURFACES,
  },
];

const STORAGE_KEY = 'shell-appearance';

export function loadShellAppearance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHELL_APPEARANCE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SHELL_APPEARANCE, ...parsed };
  } catch {
    return DEFAULT_SHELL_APPEARANCE;
  }
}

export function saveShellAppearance(appearance) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    /* ignore */
  }
}

/** Page content wrapper — background comes from shell main area. */
export const shellPageContentClass = 'min-h-full';

export function applyShellAppearance(appearance) {
  const root = document.documentElement;
  root.style.setProperty('--shell-page-bg', appearance.pageBg);
  root.style.setProperty('--shell-header-bg', appearance.headerBg);
  root.style.setProperty('--shell-sidebar-bg', appearance.sidebarBg);
}
