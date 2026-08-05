import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  DEFAULT_SHELL_APPEARANCE,
  loadShellAppearance,
  saveShellAppearance,
  applyShellAppearance,
} from './shellAppearance';

const ShellContext = createContext(null);

export function ShellProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Alyne is the only product in this prototype; the switcher never changes it.
  const [activeProductId, setActiveProductId] = useState('alyne');
  const [sidebarTheme, setSidebarThemeState] = useState(() => {
    try { return localStorage.getItem('shell-sidebar-theme') || 'light'; } catch { return 'light'; }
  });
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [settingsPanelOpen, setSettingsPanelOpenState] = useState(false);
  const [headerBreadcrumbs, setHeaderBreadcrumbs] = useState([]);
  const [shellAppearance, setShellAppearanceState] = useState(loadShellAppearance);
  const prePanelCollapsed = useRef(true);

  useEffect(() => {
    applyShellAppearance(shellAppearance);
    saveShellAppearance(shellAppearance);
  }, [shellAppearance]);

  const setShellAppearance = useCallback((partial) => {
    setShellAppearanceState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetShellAppearance = useCallback(() => {
    setShellAppearanceState(DEFAULT_SHELL_APPEARANCE);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => {
      if (!v) setOpenAccordionId(null);
      return !v;
    });
  }, []);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const setSidebarTheme = useCallback((theme) => {
    setSidebarThemeState(theme);
    try { localStorage.setItem('shell-sidebar-theme', theme); } catch {}
  }, []);

  const setSettingsPanelOpen = useCallback((open) => {
    setSettingsPanelOpenState(open);
    if (open) {
      setSidebarCollapsed((current) => { prePanelCollapsed.current = current; return true; });
    } else {
      setSidebarCollapsed(prePanelCollapsed.current);
    }
  }, []);

  const toggleSettingsPanel = useCallback(
    () => setSettingsPanelOpen(!settingsPanelOpen),
    [settingsPanelOpen, setSettingsPanelOpen]
  );

  return (
    <ShellContext.Provider value={{
      sidebarCollapsed, toggleSidebar,
      mobileSidebarOpen, openMobileSidebar, closeMobileSidebar,
      currentUser: { name: 'Alex Chen', email: 'alex.chen@example.com' },
      sidebarTheme, setSidebarTheme,
      openAccordionId, setOpenAccordionId,
      settingsPanelOpen, setSettingsPanelOpen, toggleSettingsPanel,
      activeProductId, setActiveProductId,
      headerBreadcrumbs, setHeaderBreadcrumbs,
      shellAppearance, setShellAppearance, resetShellAppearance,
    }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside ShellProvider');
  return ctx;
}
