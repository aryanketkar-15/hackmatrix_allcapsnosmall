import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, EmptyState, LevelChip, Table, Td, Th, Tr } from '../ui';
import { formatInr, formatRelativeToAsOf } from '../../lib/format';
import { involvedEntitiesText } from '../../lib/metrics';
import { alertsNewestFirst } from '../../data/selectors';
import { stagger } from '../../lib/motion';
import type { AlertT } from '../../types/contract';

export function RecentAlerts({ alerts, asOf, count = 5 }: { alerts: AlertT[]; asOf: string; count?: number }) {
  const navigate = useNavigate();
  const rows = alertsNewestFirst(alerts).slice(0, count);
  return (
    <Card>
      <CardHeader title="Recent Alerts" action={<Link to="/alerts" className="text-xs font-medium text-primary hover:underline">View All Alerts</Link>} />
      {rows.length === 0 ? <EmptyState title="No alerts yet" /> : (
        <Table label="Recent alerts">
          <thead><tr><Th>Time</Th><Th>Risk</Th><Th>Alert Title</Th><Th>Amount</Th><Th>Involved Entities</Th></tr></thead>
          <tbody>
            {rows.map((a, i) => (
              <Tr key={a.id} className="animate-fade-in" style={stagger(i, 50)} onClick={() => navigate(`/alerts/${a.id}/overview`)}>
                <Td className="whitespace-nowrap">{formatRelativeToAsOf(a.createdAt, asOf)}</Td>
                <Td><LevelChip level={a.level} /></Td>
                <Td><Link to={`/alerts/${a.id}/overview`} className="font-medium text-ink hover:text-primary">{a.title}</Link></Td>
                <Td className="whitespace-nowrap">{formatInr(a.listFacts.amountAtRisk)}</Td>
                <Td className="whitespace-nowrap text-muted">{involvedEntitiesText(a.listFacts)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
