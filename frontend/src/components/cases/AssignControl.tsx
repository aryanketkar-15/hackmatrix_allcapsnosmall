import { useState } from 'react';
import { Button, Modal, Select, TextInput } from '../ui';
import { useReady } from '../../data/store';
import { useCaseActions } from './useCaseActions';
import { nextStatuses } from './caseMachine';
import { DECISION_LABEL, DECISION_TYPES, STATUS_LABEL, type AlertT, type DecisionTypeT } from '../../types/contract';

function AssignDialog({ alert, open, onClose }: { alert: AlertT; open: boolean; onClose: () => void }) {
  const { core } = useReady();
  const { assign } = useCaseActions();
  const [who, setWho] = useState(alert.assignedTo ?? core.users[0].name);
  return (
    <Modal open={open} title={alert.assignedTo ? 'Reassign alert' : 'Assign alert'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { if (assign(alert.id, who)) onClose(); }}>{alert.assignedTo ? 'Reassign' : 'Assign'}</Button></>}>
      <p className="mb-3 text-xs text-muted">{alert.id} – {alert.title}. {alert.assignedTo ? '' : 'Assigning opens a case for this alert.'}</p>
      <label className="mb-1 block text-xs font-medium" htmlFor="assignee">Investigator</label>
      <Select label="Investigator" id="assignee" value={who} onChange={(e) => setWho(e.target.value)} className="!h-9 w-full">
        {core.users.map((u) => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
      </Select>
    </Modal>
  );
}

function DecisionDialog({ alert, open, onClose }: { alert: AlertT; open: boolean; onClose: () => void }) {
  const { decide } = useCaseActions();
  const [type, setType] = useState<DecisionTypeT>('INCONCLUSIVE');
  const [why, setWhy] = useState('');
  const [err, setErr] = useState('');
  return (
    <Modal open={open} title="Record a decision" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { if (!why.trim()) { setErr('A rationale is required.'); return; } if (decide(alert.id, type, why)) { setWhy(''); setErr(''); onClose(); } }}>Record decision</Button></>}>
      <label className="mb-1 block text-xs font-medium" htmlFor="decision-type">Decision</label>
      <Select label="Decision" id="decision-type" value={type} onChange={(e) => setType(e.target.value as DecisionTypeT)} className="!h-9 mb-3 w-full">
        {DECISION_TYPES.map((d) => <option key={d} value={d}>{DECISION_LABEL[d]}</option>)}
      </Select>
      <TextInput label="Rationale" value={why} onChange={(e) => { setWhy(e.target.value); setErr(''); }} error={err} placeholder="Why this decision (required)" maxLength={500} />
      <p className="mt-2 text-[11px] text-muted">Decisions describe operational findings. They never assert intent.</p>
    </Modal>
  );
}

/** Assign / Reassign + status transitions (only the moves the workflow allows). */
export function AssignControl({ alert }: { alert: AlertT }) {
  const { setStatus } = useCaseActions();
  const [assignOpen, setAssignOpen] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);
  const closed = alert.status === 'CLOSED';
  const moves = nextStatuses(alert.status).filter((s) => !(alert.status === 'NEW' && s === 'ASSIGNED'));

  return (
    <div className="flex flex-col items-end gap-2">
      <Button disabled={closed} title={closed ? 'Closed cases cannot be reassigned' : undefined} onClick={() => setAssignOpen(true)}>Assign / Reassign</Button>
      {moves.length > 0 ? (
        <Select label="Change status" value="" onChange={(e) => {
          const to = e.target.value as typeof moves[number];
          if (!to) return;
          if (to === 'DECIDED') setDecideOpen(true); else setStatus(alert.id, to);
        }}>
          <option value="">Move to…</option>
          {moves.map((s) => <option key={s} value={s}>{s === 'DECIDED' ? 'Record decision…' : STATUS_LABEL[s]}</option>)}
        </Select>
      ) : null}
      <AssignDialog alert={alert} open={assignOpen} onClose={() => setAssignOpen(false)} />
      <DecisionDialog alert={alert} open={decideOpen} onClose={() => setDecideOpen(false)} />
    </div>
  );
}
