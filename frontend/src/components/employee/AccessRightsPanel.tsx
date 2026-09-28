import { Check, X } from 'lucide-react';
import { Card, CardHeader, Chip, Table, Td, Th, Tooltip, Tr } from '../ui';
import { formatDateTimeIST } from '../../lib/format';
import type { EmployeeT, InsiderProfileT } from '../../types/contract';
import { SIGNALS, SIGNAL_DISCLAIMER } from './signalDefinitions';

const ATTR_TONE = { HIGH: ['#166534', '#dcfce7'], MEDIUM: ['#854d0e', '#fef9c3'], LOW: ['#b91c1c', '#fee2e2'] } as const;

/** Access rights + privilege-misuse panel: shows misuse of VALID access without asserting intent. */
export function AccessRightsPanel({ employee, insider }: { employee: EmployeeT; insider: InsiderProfileT | null }) {
  const [afg, abg] = insider ? ATTR_TONE[insider.attribution] : ATTR_TONE.MEDIUM;
  return (
    <Card>
      <CardHeader title="Access Rights & Privilege Misuse" />
      <div className="grid grid-cols-1 gap-5 px-4 pb-4 xl:grid-cols-[14rem_1fr]">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Permissions held</p>
          <ul className="space-y-1 text-xs" aria-label="Permissions">
            {employee.permissions.map((p) => (
              <li key={p.name} className="flex items-center gap-1.5">
                {p.held ? <Check size={13} className="text-risk-explained" aria-label="held" /> : <X size={13} className="text-muted" aria-label="not held" />}
                <span className={p.held ? '' : 'text-muted'}>{p.name}</span>
              </li>
            ))}
          </ul>
          <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Assigned portfolio</p>
          <p className="text-xs">{employee.portfolio}</p>
        </div>

        <div className="space-y-4">
          {!insider ? (
            <p className="text-xs text-muted">This credential is not linked to this alert’s recorded path.</p>
          ) : (
            <>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Actions in this case</p>
                <Table label="Actions in this case">
                  <thead><tr><Th>Time</Th><Th>Action</Th><Th>Account</Th><Th>Permitted</Th><Th>In portfolio</Th><Th>Customer evidence</Th></tr></thead>
                  <tbody>
                    {insider.actions.map((a) => (
                      <Tr key={`${a.at}-${a.action}`}>
                        <Td className="whitespace-nowrap">{formatDateTimeIST(a.at)}</Td><Td>{a.action}</Td><Td>{a.account}</Td>
                        <Td>{a.permitted ? '✓ Yes' : '✗ No'}</Td><Td>{a.inPortfolio ? '✓ Yes' : '✗ No'}</Td><Td>Grade {a.evidenceGrade}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Misuse signals <span className="normal-case tracking-normal font-normal">— {SIGNAL_DISCLAIMER}</span>
                </p>
                {insider.signals.length === 0 ? <p className="text-xs text-muted">No signals raised.</p> : (
                  <ul className="flex flex-wrap gap-2" aria-label="Misuse signals">
                    {insider.signals.map((s) => (
                      <li key={s}>
                        <Tooltip text={SIGNALS[s].definition}>
                          <Chip fg="#9a3412" bg="#ffedd5" className="!normal-case cursor-help">{s} · {SIGNALS[s].short}</Chip>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="flex flex-wrap items-center gap-2">
                  {insider.credentialMisuseIndicators ? 'Credential misuse indicators present. Attribution to a person:' : 'Attribution consistency:'}
                  <Chip fg={afg} bg={abg}>{insider.attribution}</Chip>
                </p>
                <p className="text-muted">{insider.attributionNote}</p>
                {insider.credentialMisuseIndicators ? (
                  <p className="rounded bg-amber-50 px-2 py-1 text-amber-900">Session, device or attendance data suggest the credential may not have been used by its owner.</p>
                ) : null}
                {!insider.attendanceAvailable ? <p className="text-amber-800">Attendance data unavailable, so shift consistency could not be checked.</p> : null}
                <p data-testid="who-else"><span className="font-medium">Who else could have done this:</span> {insider.staffWithSamePermission} staff hold the same permission.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
