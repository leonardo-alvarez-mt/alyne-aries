import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PasswordGate } from './components/PasswordGate';
import { ShellProvider } from './components/shell/ShellContext';
import { ShellLayout } from './components/shell/organisms/ShellLayout';
import AlyneHome from './pages/alyne/AlyneHome';
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
function ShellFrame({ trailing, children }) {
  return <ShellLayout trailing={trailing}>{children}</ShellLayout>;
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
          <Routes>
            <Route
              index
              element={
                <ShellFrame>
                  <AlyneHome />
                </ShellFrame>
              }
            />

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
