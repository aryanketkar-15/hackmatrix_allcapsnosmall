import { Link } from 'react-router-dom';
import { useReady } from '../data/store';
import { useAuth } from '../auth/AuthContext';
import { Card, CardHeader } from '../components/ui';
import { dataSource } from '../data/loader';
import { formatDateTimeIST } from '../lib/format';

/** Read-only. Never renders environment values, credentials or tokens. */
export default function Settings() {
  const { core, alerts, cases } = useReady();
  const { user } = useAuth();
  const source = dataSource();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Prototype disclosure" />
          <ul className="list-disc space-y-1 px-8 pb-4 text-xs">
            <li>All data is scripted scenario and seed data. It is not real bank data.</li>
            <li>Replay (Remove) and exposure (Reach) results are precomputed.</li>
            <li>Evaluation is pending: no accuracy or false-positive figures exist yet.</li>
            <li>Sign-in is a UI gate for the demo only. It is not security. Real authentication and roles come later.</li>
            <li>Case workflow state lives in memory; a reload resets it.</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Data" />
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 px-4 pb-4 text-xs">
            <dt className="text-muted">Data source</dt><dd data-testid="data-source">{source === 'api' ? 'Fixture API (with offline fallback)' : 'Bundled fixtures'}</dd>
            <dt className="text-muted">As-of time</dt><dd>{formatDateTimeIST(core.meta.asOf)}</dd>
            <dt className="text-muted">Seed</dt><dd>{core.meta.seed}</dd>
            <dt className="text-muted">Alerts / cases</dt><dd>{alerts.length} / {cases.length}</dd>
            <dt className="text-muted">Employees / customers</dt><dd>{core.employees.length} / {core.customers.length}</dd>
          </dl>
        </Card>
        <Card>
          <CardHeader title="Scripted demo" />
          <p className="px-4 pb-4 text-xs">Keyboard-driven walkthrough for recording: Space play/pause, ←/→ previous/next, R restart, Esc exit. <Link to="/demo" className="text-primary underline">Start the demo</Link> (add <code>?hide=1</code> to hide the controller).</p>
        </Card>
        <Card>
          <CardHeader title="Signed in as" />
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 px-4 pb-4 text-xs">
            <dt className="text-muted">Name</dt><dd>{user?.name}</dd>
            <dt className="text-muted">Role</dt><dd>{user?.role}</dd>
          </dl>
        </Card>
      </div>
    </div>
  );
}
