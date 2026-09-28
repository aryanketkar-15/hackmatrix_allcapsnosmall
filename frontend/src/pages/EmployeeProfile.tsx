import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import NotFound from './NotFound';
import { useReady, useStore } from '../data/store';
import { employeeById } from '../data/selectors';
import { Card, CardHeader, EmptyState, LevelChip, StatusChip } from '../components/ui';
import { EmployeeCard } from '../components/employee/EmployeeCard';
import { ActivityTable } from '../components/employee/ActivityTable';
import { BehaviourCards } from '../components/employee/BehaviourCards';
import { AccessRightsPanel } from '../components/employee/AccessRightsPanel';

export default function EmployeeProfile() {
  const { id } = useParams();
  const { core, alerts } = useReady();
  const { state, ensureScenario } = useStore();
  const employee = employeeById(core.employees, id);

  useEffect(() => { core.scenarios.forEach((s) => { if (!state.scenarios[s.id]) ensureScenario(s.id).catch(() => {}); }); }, [core.scenarios, state.scenarios, ensureScenario]);

  const linked = useMemo(() => alerts.filter((a) => a.entityRefs.employeeIds.includes(id ?? '')), [alerts, id]);
  // the first recorded scenario that involves this credential supplies the access-rights context
  const insider = useMemo(
    () => Object.values(state.scenarios).flatMap((s) => s.insiders).find((i) => i.employeeId === id) ?? null,
    [state.scenarios, id],
  );

  if (!employee) return <NotFound what="employee" />;
  return (
    <div className="space-y-5">
      <Link to="/employees" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ChevronLeft size={13} aria-hidden /> Back to Employees</Link>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[20rem_1fr]">
        <EmployeeCard employee={employee} />
        <ActivityTable employee={employee} />
      </div>
      <BehaviourCards employee={employee} />
      <AccessRightsPanel employee={employee} insider={insider} />
      <Card>
        <CardHeader title="Linked alerts" />
        {linked.length === 0 ? <EmptyState title="No linked alerts" /> : (
          <ul className="divide-y divide-line px-4 pb-2" aria-label="Linked alerts">
            {linked.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                <Link to={`/alerts/${a.id}/overview`} className="font-medium text-primary hover:underline">{a.id} – {a.title}</Link>
                <span className="flex items-center gap-2"><LevelChip level={a.level} /><StatusChip status={a.status} /></span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
