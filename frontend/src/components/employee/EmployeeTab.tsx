import { useState } from 'react';
import { Card, EmptyState, Tabs } from '../ui';
import { EmployeeCard } from './EmployeeCard';
import { ActivityTable } from './ActivityTable';
import { BehaviourCards } from './BehaviourCards';
import { AccessRightsPanel } from './AccessRightsPanel';
import { useReady } from '../../data/store';
import { employeeById } from '../../data/selectors';
import type { TabViewProps } from '../alerts/tabViews';

export function EmployeeTab({ scenario }: TabViewProps) {
  const { core } = useReady();
  const ids = scenario?.employeeIds ?? [];
  const [selected, setSelected] = useState(ids[0]);
  if (!scenario || ids.length === 0) {
    return <Card><EmptyState title="No employee is linked to this alert" hint="Employee activity appears when a staff credential is connected to the recorded path." /></Card>;
  }
  const employee = employeeById(core.employees, selected ?? ids[0]);
  if (!employee) return <Card><EmptyState title="Employee record not found" /></Card>;
  const insider = scenario.insiders.find((i) => i.employeeId === employee.id) ?? null;

  return (
    <div className="space-y-4">
      {ids.length > 1 ? (
        <Tabs variant="pill" label="Employees on this alert" value={employee.id} onChange={setSelected} items={ids.map((id) => ({ id, label: `${id} · ${employeeById(core.employees, id)?.name ?? ''}` }))} />
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[20rem_1fr]">
        <EmployeeCard employee={employee} />
        <ActivityTable employee={employee} />
      </div>
      <BehaviourCards employee={employee} />
      <AccessRightsPanel employee={employee} insider={insider} />
    </div>
  );
}
