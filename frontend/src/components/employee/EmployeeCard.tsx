import { Avatar, Card } from '../ui';
import type { EmployeeT } from '../../types/contract';

export function EmployeeCard({ employee }: { employee: EmployeeT }) {
  const rows: [string, string][] = [
    ['Employee ID', employee.id], ['Role', employee.role], ['Branch', employee.branch], ['Department', employee.department], ['Status', employee.status],
  ];
  return (
    <Card className="p-4" aria-label={`Employee ${employee.id}`}>
      <div className="mb-3 flex items-center gap-3">
        <Avatar initials={employee.initials} size={54} seed={employee.id} />
        <div>
          <p className="text-[11px] text-muted">{employee.id}</p>
          <p className="text-base font-semibold">{employee.name}</p>
          <p className="text-xs text-muted">{employee.role}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-xs">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>))}
      </dl>
    </Card>
  );
}
