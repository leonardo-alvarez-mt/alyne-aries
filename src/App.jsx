import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { PasswordGate } from './components/PasswordGate';
import { ShellProvider, useShell } from './components/shell/ShellContext';
import { ShellLayout } from './components/shell/organisms/ShellLayout';
import AlyneHome from './pages/alyne/AlyneHome';
import AriesLayout from './pages/alyne/aries/AriesLayout';
import AriesChat from './pages/alyne/aries/AriesChat';
import AriesAgents from './pages/alyne/aries/AriesAgents';
import AriesSkills from './pages/alyne/aries/AriesSkills';
import AriesKnowledge from './pages/alyne/aries/AriesKnowledge';
import AriesAdmin from './pages/alyne/aries/AriesAdmin';
import AriesHistory from './pages/alyne/aries/AriesHistory';
import GovernanceControls from './pages/alyne/GovernanceControls';
import GovernanceControlSets from './pages/alyne/GovernanceControlSets';
import GovernanceControlSetDetails from './pages/alyne/GovernanceControlSetDetails';
import { getControlSetName } from './pages/alyne/controlSetDetailData';
import ComplianceQuestionnaires from './pages/alyne/ComplianceQuestionnaires';
import RiskManagement from './pages/alyne/RiskManagement';

/** Vite serves the app from a subpath on GitHub Pages; the router mirrors it. */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Breadcrumbs are derived from the navigation model (see `lib/shellBreadcrumbs`).
 * Pages only pass `trailing` when the leaf isn't a nav entry — a record detail
 * page whose label comes from the record itself.
 */
function ShellFrame({ trailing, breadcrumbs, children }) {
  return (
    <ShellLayout trailing={trailing} breadcrumbs={breadcrumbs}>
      {children}
    </ShellLayout>
  );
}

const ARIES_BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'ARIES™' },
];

/**
 * The appearance panel replaces the page content instead of floating over it, so
 * any navigation — sidebar, top nav, flyout, breadcrumb, browser back — should
 * leave it rather than stranding the panel over a page the user navigated to.
 * Sits outside <Routes> so a route change never remounts it, and keys off
 * `location.key` so re-picking the current module counts as navigation too.
 */
function CloseAppearancePanelOnNavigate() {
  const { key } = useLocation();
  const { settingsPanelOpen, setSettingsPanelOpen } = useShell();
  const lastKey = useRef(key);

  useEffect(() => {
    if (key === lastKey.current) return;
    lastKey.current = key;
    // Guarded: setSettingsPanelOpen(false) also restores the pre-panel sidebar
    // width, which would clobber the sidebar if called on an unrelated nav.
    if (settingsPanelOpen) setSettingsPanelOpen(false);
  }, [key, settingsPanelOpen, setSettingsPanelOpen]);

  return null;
}

/** Control Set detail route — resolves the set name for the trailing breadcrumb. */
function ControlSetDetailRoute() {
  const { id } = useParams();
  return (
    <ShellFrame trailing={[{ label: getControlSetName(id) }]}>
      <GovernanceControlSetDetails />
    </ShellFrame>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <ShellProvider>
        <BrowserRouter basename={routerBasename || undefined}>
          <CloseAppearancePanelOnNavigate />
          <Routes>
            <Route
              index
              element={
                <ShellFrame>
                  <AlyneHome />
                </ShellFrame>
              }
            />

            <Route
              path="aries"
              element={
                <ShellFrame breadcrumbs={ARIES_BREADCRUMBS}>
                  <AriesLayout />
                </ShellFrame>
              }
            >
              <Route index element={<AriesChat />} />
              <Route path="chat/:chatId" element={<AriesChat />} />
              <Route path="agents" element={<AriesAgents />} />
              <Route path="skills" element={<AriesSkills />} />
              <Route path="knowledge" element={<AriesKnowledge />} />
              <Route path="knowledge/:section" element={<AriesKnowledge />} />
              <Route path="admin" element={<AriesAdmin />} />
              <Route path="admin/:section" element={<AriesAdmin />} />
              <Route path="history" element={<AriesHistory />} />
            </Route>

            {/* Governance */}
            <Route path="governance" element={<Navigate to="/governance/controls" replace />} />
            <Route
              path="governance/controls"
              element={
                <ShellFrame>
                  <GovernanceControls />
                </ShellFrame>
              }
            />
            <Route
              path="governance/control-sets"
              element={
                <ShellFrame>
                  <GovernanceControlSets />
                </ShellFrame>
              }
            />
            <Route path="governance/control-sets/:id" element={<ControlSetDetailRoute />} />

            {/* Compliance */}
            <Route path="compliance" element={<Navigate to="/compliance/questionnaires" replace />} />
            <Route
              path="compliance/questionnaires"
              element={
                <ShellFrame>
                  <ComplianceQuestionnaires />
                </ShellFrame>
              }
            />

            {/* Risk Management */}
            <Route path="risk-management" element={<Navigate to="/risks" replace />} />
            <Route
              path="risks"
              element={
                <ShellFrame>
                  <RiskManagement />
                </ShellFrame>
              }
            />

            {/* Nav entries without a page in this prototype fall back to Home. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ShellProvider>
    </PasswordGate>
  );
}
