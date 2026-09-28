import { useState } from 'react';
import { Card, CardHeader, EmptyState, Table, Td, Th, Tr } from '../ui';
import { formatDateTimeIST } from '../../lib/format';
import type { EmployeeT } from '../../types/contract';

export function ActivityTable({ employee, initial = 5 }: { employee: EmployeeT; initial?: number }) {
  const [all, setAll] = useState(false);
  const rows = all ? employee.activities : employee.activities.slice(0, initial);
  return (
    <Card>
      <CardHeader
        title="Recent Activities (Last 30 Days)"
        action={employee.activities.length > initial ? (
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => setAll((a) => !a)}>
            {all ? 'Show fewer' : 'View All Activity'}
          </button>
        ) : null}
      />
      {rows.length === 0 ? <EmptyState title="No recorded activity" /> : (
        <Table label="Recent activities">
          <thead><tr><Th>Date &amp; Time</Th><Th>Action</Th><Th>Account</Th><Th>Channel</Th><Th>Location</Th></tr></thead>
          <tbody>
            {rows.map((a, i) => (
              <Tr key={`${a.at}-${i}`}>
                <Td className="whitespace-nowrap">{formatDateTimeIST(a.at)}</Td><Td>{a.action}</Td><Td>{a.account}</Td><Td>{a.channel}</Td><Td>{a.location}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
