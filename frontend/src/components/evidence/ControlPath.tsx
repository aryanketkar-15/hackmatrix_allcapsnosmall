import { Info } from 'lucide-react';
import { Card, CardHeader, Chip, Table, Td, Th, Tooltip, Tr } from '../ui';
import { GradeBadge } from './GradeBadge';
import type { ControlRowT } from '../../types/contract';
import type { Selection } from '../../data/store';

export const GLOSSARY = '“Tainted” = an input set without customer-verified authorization. “Hollow” = a control that passed on a tainted input.';

/** Human-readable verdict for a control row (FAIL is a control that held; UNKNOWN abstains). */
export function controlVerdict(c: ControlRowT): { label: string; fg: string; bg: string } {
  if (c.integrity === 'UNKNOWN') return { label: 'PASS · integrity unknown', fg: '#374151', bg: '#e5e7eb' };
  if (c.outcome === 'FAIL') return { label: 'Control held', fg: '#166534', bg: '#dcfce7' };
  if (c.integrity === 'HOLLOW') return { label: 'PASS · HOLLOW', fg: '#9a3412', bg: '#ffedd5' };
  return { label: 'PASS · Genuine', fg: '#166534', bg: '#dcfce7' };
}

export function ControlPath({ controls, onSelectEvent }: { controls: ControlRowT[]; onSelectEvent: (s: Selection) => void }) {
  return (
    <Card>
      <CardHeader
        title="Control Path"
        action={<Tooltip text={GLOSSARY}><span className="flex items-center gap-1 text-[11px] text-muted"><Info size={12} aria-hidden /> What do Tainted and Hollow mean?</span></Tooltip>}
      />
      {controls.length === 0 ? <p className="px-4 pb-4 text-xs text-muted">No control evaluations recorded.</p> : (
        <Table label="Control path">
          <thead><tr><Th>Control</Th><Th>Result</Th><Th>Why</Th><Th>Writer’s authorization</Th></tr></thead>
          <tbody>
            {controls.map((c) => {
              const v = controlVerdict(c);
              return (
                <Tr key={c.id} data-testid={`ctl-${c.id}`}>
                  <Td className="font-medium">{c.name}</Td>
                  <Td><Chip fg={v.fg} bg={v.bg} className="!normal-case">{v.label}</Chip></Td>
                  <Td className="max-w-md">
                    {c.writerEventId ? (
                      <button type="button" className="text-left text-primary underline decoration-dotted hover:decoration-solid" onClick={() => onSelectEvent({ kind: 'event', id: c.writerEventId! })}>
                        {c.integrity === 'UNKNOWN' ? 'Authorization data unavailable (Grade U): ' : ''}{c.reason}
                      </button>
                    ) : c.reason}
                  </Td>
                  <Td><GradeBadge grade={c.writerGrade} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
