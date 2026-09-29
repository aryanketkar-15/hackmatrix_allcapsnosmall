import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { EmptyState, LoadingState, Tabs } from '../components/ui';
import NotFound from './NotFound';
import { useReady, useScenario } from '../data/store';
import { alertById } from '../data/selectors';
import { AlertHeader } from '../components/alerts/AlertHeader';
import { OverviewTab } from '../components/alerts/OverviewTab';
import { ALERT_TABS, SUMMARY_ONLY_NOTE, isTabId, tabEnabled, type AlertTabId } from '../components/alerts/tabs';
import { TAB_VIEWS } from '../components/alerts/tabViews';

export default function AlertDetail() {
  const { id, tab } = useParams();
  const navigate = useNavigate();
  const { alerts } = useReady();
  const alert = alertById(alerts, id);
  const scenario = useScenario(alert?.detailLevel === 'FULL' ? alert.scenarioId : undefined);

  if (!alert) return <NotFound what="alert" />;
  if (!isTabId(tab)) return <Navigate to={`/alerts/${alert.id}/overview`} replace />;

  const current: AlertTabId = tab;
  const def = ALERT_TABS.find((t) => t.id === current)!;
  const enabled = tabEnabled(def, alert);
  const View = current === 'overview' ? null : TAB_VIEWS[current];

  return (
    <div className="space-y-5">
      <AlertHeader alert={alert} />
      <Tabs
        label="Alert sections"
        value={current}
        onChange={(t) => navigate(`/alerts/${alert.id}/${t}`)}
        items={ALERT_TABS.map((t) => ({ id: t.id, label: t.label, disabled: !tabEnabled(t, alert), title: tabEnabled(t, alert) ? undefined : SUMMARY_ONLY_NOTE }))}
      />
      <div key={current} className="animate-fade-up">
      {!enabled ? (
        <div className="rounded-lg border border-line bg-surface"><EmptyState title="Not available for this alert" hint={SUMMARY_ONLY_NOTE} /></div>
      ) : alert.detailLevel === 'FULL' && scenario === undefined && current !== 'overview' && current !== 'notes' ? (
        <LoadingState label="Loading reconstruction…" />
      ) : current === 'overview' ? (
        <OverviewTab alert={alert} scenario={scenario} />
      ) : View ? (
        <View alert={alert} scenario={scenario ?? null} />
      ) : null}
      </div>
    </div>
  );
}
