import { Link } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { Button, LevelChip, StatusChip, Tooltip } from '../ui';
import { formatDateTimeIST, formatInr } from '../../lib/format';
import type { AlertT } from '../../types/contract';
import { AssignControl } from '../cases/AssignControl';

export function AlertHeader({ alert }: { alert: AlertT }) {
  return (
    <div className="space-y-3">
      <Link to="/alerts" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ChevronLeft size={13} aria-hidden /> Back to Alerts
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{alert.id} – {alert.title}</span>
            <LevelChip level={alert.level} />
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold">
            {formatInr(alert.listFacts.amountAtRisk)}
            <Tooltip text="Amount at risk: value of outbound transfers (executed or attempted) from the affected customer's accounts.">
              <Info size={13} className="text-muted" aria-hidden />
            </Tooltip>
          </p>
        </div>
        <div className="flex items-start gap-6 text-xs">
          <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1">
            <dt className="text-muted">Status:</dt><dd><StatusChip status={alert.status} /></dd>
            <dt className="text-muted">Assigned to:</dt><dd className="font-medium" data-testid="assigned-to">{alert.assignedTo ?? 'Unassigned'}</dd>
            <dt className="text-muted">Created:</dt><dd>{formatDateTimeIST(alert.createdAt)}</dd>
          </dl>
          <AssignControl alert={alert} fallback={<Button disabled>Assign / Reassign</Button>} />
        </div>
      </div>
    </div>
  );
}
